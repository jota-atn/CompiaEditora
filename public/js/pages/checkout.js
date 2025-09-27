import { debounce, initializePixModal, initializeGlobalUI } from '../ui.js';
import { updateCartUI } from '../cart.js';
import { calcularFrete } from '../services/freteService.js';
import { criarCobrancaPix } from '../services/pagamentoService.js';
import { getUserProfile } from '../services/userService.js';

const PACKAGE_DEFAULTS = {
    BOOK_WEIGHT_KG: 0.5,
    BOOK_THICKNESS_CM: 3,
    MIN_WEIGHT_KG: 0.3,
    MIN_HEIGHT_CM: 2,
    PACKAGE_WIDTH_CM: 16,
    PACKAGE_LENGTH_CM: 23,
};

const parseBRLToCents = (brlString) => {
    if (typeof brlString !== 'string') return 0;
    const cleanedString = brlString.replace('R$ ', '').replace(/\./g, '');
    const dotDecimalString = cleanedString.replace(',', '.');
    const valueInReais = parseFloat(dotDecimalString);
    if (isNaN(valueInReais)) {
        return 0;
    }
    return Math.round(valueInReais * 100);
}

document.addEventListener('DOMContentLoaded', async () => {
    const openPixModal = initializePixModal();

    let currentUser = null;
    try {
        currentUser = await getUserProfile();
    } catch (error) {
        console.error(error.message);
        alert(error.message);
        window.location.href = './login.html';
        return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const realBooks = cart.filter(book => book.format !== 'E-book');
    
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const shippingEl = document.getElementById('summary-shipping');
    const summaryAddressEl = document.getElementById('summary-address');

    const addressInputs = {
        cep: document.querySelector('input[placeholder="CEP"]'),
        rua: document.querySelector('input[placeholder="Rua / Avenida"]'),
        numero: document.querySelector('input[placeholder="Número"]'),
        bairro: document.querySelector('input[placeholder="Bairro"]'),
        cidade: document.querySelector('input[placeholder="Cidade"]'),
        estado: document.querySelector('input[placeholder="Estado"]'),
    };

    const confirmBtn = document.getElementById('confirm-order-btn');

    if (cart.length === 0) {
        window.location.href = './catalogo.html';
        return;
    }

    const carouselContainer = document.getElementById('checkout-items-carousel');
    carouselContainer.innerHTML = cart.map(item => {
        return `
            <div class="swiper-slide">
                <div class="flex flex-col items-center text-center space-y-2 h-full">
                    <img src="${item.coverImage}" alt="${item.title}" class="w-24 h-36 object-cover rounded-md">
                    
                    <div class="flex flex-col justify-center flex-grow">
                        <h4 class="text-sm font-semibold text-gray-800 leading-tight line-clamp-2" title="${item.title}">
                            ${item.title}
                        </h4>
                        <p class="text-xs text-gray-500">${item.format}</p>
                        <p class="text-xs text-gray-500 font-medium">Qtd: ${item.quantity}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = 0.00;
    const total = subtotal + shipping;
    subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    shippingEl.textContent = realBooks.length === 0 ? `R$ ${shipping.toFixed(2).replace('.', ',')}` : 'A calcular...';
    totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    new Swiper('.checkout-swiper', {
        slidesPerView: 2,
        spaceBetween: 16,
        navigation: {
            nextEl: '.swiper-button-next-checkout',
            prevEl: '.swiper-button-prev-checkout',
        },
        breakpoints: {
            640: {
                slidesPerView: 3,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 4,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 5,
                spaceBetween: 24,
            }
        }
    });

    const updateFinancialSummary = (shippingCost) => {
        const freteValido = typeof shippingCost === 'number' && shippingCost >= 0;
        const custoFrete = freteValido ? shippingCost : 0;

        shippingEl.textContent = freteValido || realBooks.length === 0 ? `R$ ${custoFrete.toFixed(2).replace('.', ',')}` : 'Indisponível';
        
        const total = subtotal + custoFrete;
        totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    const isAddressComplete = () => {
        return Object.entries(addressInputs)
            .every(([key, input]) => input.placeholder.includes('Opcional') || input.value.trim() !== '');
    };

    const isShippingValid = () => {
        const shipping = shippingEl.textContent;
        return shipping !== 'A calcular...' && shipping !== 'Calculando...' && shipping !== 'Indisponível';
    };

    function getPackageDetails(physicalItems) {
        const totalWeight = physicalItems.reduce((acc, item) => acc + (item.quantity * PACKAGE_DEFAULTS.BOOK_WEIGHT_KG), 0);
        const stackedHeight = physicalItems.reduce((acc, item) => acc + (item.quantity * PACKAGE_DEFAULTS.BOOK_THICKNESS_CM), 0);
        
        return {
            to_postal_code: addressInputs.cep.value.replace(/\D/g, ''),
            weight: Math.max(totalWeight, PACKAGE_DEFAULTS.MIN_WEIGHT_KG),
            width: PACKAGE_DEFAULTS.PACKAGE_WIDTH_CM,
            length: PACKAGE_DEFAULTS.PACKAGE_LENGTH_CM,
            height: Math.max(stackedHeight, PACKAGE_DEFAULTS.MIN_HEIGHT_CM),
        };
    }

    const handleShippingCalculation = async () => {
        if (realBooks == 0) {
            shippingEl.textContent = 'R$ 0,00';
            updateFinancialSummary(0);
            return;
        }

        if (!isAddressComplete()) {
            shippingEl.textContent = 'A calcular...';
            updateFinancialSummary(null);
            return;
        }
        
        shippingEl.textContent = 'Calculando...';

        try {
            const freteOptions = await calcularFrete(getPackageDetails(realBooks));

            if (freteOptions && freteOptions.length > 0) {
                const freteOptionsValid = freteOptions.filter(option => Object.hasOwn(option, "price"));
                const cheapestOption = freteOptionsValid.reduce((min, current) => 
                    parseFloat(current.price) < parseFloat(min.price) ? current : min
                );
                updateFinancialSummary(parseFloat(cheapestOption.price));
            } else {
                updateFinancialSummary(null);
            }
        } catch (error) {
            console.error("Erro ao calcular frete:", error);
            shippingEl.textContent = 'Erro ao calcular';
            updateFinancialSummary(null);
        }
    };

    const checkFormValidity = () => {
        const isAddressValid = isAddressComplete() || realBooks.length === 0;
        return isAddressValid;
    };
    
    const toggleConfirmButton = () => {
        if (checkFormValidity() && isShippingValid()) {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            confirmBtn.disabled = true;
            confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    };

    const updateAddressSummary = () => {
        const { cep, rua, numero, bairro, cidade, estado } = addressInputs;
        
        const addressParts = [
            rua.value && numero.value ? `${rua.value}, ${numero.value}` : null,
            bairro.value,
            cidade.value && estado.value ? `${cidade.value} - ${estado.value}` : null,
            cep.value ? `CEP: ${cep.value}` : null
        ].filter(part => part);

        if (addressParts.length > 0) {
            summaryAddressEl.innerHTML = addressParts.join('<br>');
        } else {
            summaryAddressEl.textContent = 'Por favor, preencha seu endereço.';
        }
    };

    Object.values(addressInputs).forEach(input => {
        if (input) {
            input.addEventListener('input', debounce(async () => {
                updateAddressSummary();
                await handleShippingCalculation();
                toggleConfirmButton();
            }, 500));
        }
    });

    confirmBtn.addEventListener('click', async () => {
        if(checkFormValidity()) {
            try {
                if (!currentUser) {
                    alert('Erro ao carregar dados do usuário. Por favor, tente recarregar a página.');
                    return;
                }

                const totalText = totalEl.textContent;
                const totalInCents = parseBRLToCents(totalText);
                
                if (totalInCents <= 0) {
                    alert("O valor total do pedido não pode ser zero.");
                    return;
                }
                
                const dadosParaCobranca = {
                    amount: totalInCents,
                    expiresIn: 300,
                    description: "Compra na COMPIA Editora",
                    name: currentUser.name,
                    cellphone: currentUser.phone,
                    email: currentUser.email,
                    taxId: currentUser.cpf
                };

                if (!dadosParaCobranca.name || !dadosParaCobranca.taxId || !dadosParaCobranca.cellphone) {
                    alert('Seu perfil está incompleto. Por favor, preencha seu nome, CPF e telefone na página de perfil antes de continuar.');
                    window.location.href = './perfil.html';
                    return;
                }

                const resultadoPix = await criarCobrancaPix(dadosParaCobranca);
                openPixModal(resultadoPix.data.brCodeBase64, resultadoPix.data.brCode);

            } catch (error) {
                console.error("Erro ao gerar a cobrança PIX:", error);
                alert(`Não foi possível gerar o PIX: ${error.message}`);
            }
        }   
    });
    updateAddressSummary();
    toggleConfirmButton();
    initializeGlobalUI();
    updateCartUI();
});

