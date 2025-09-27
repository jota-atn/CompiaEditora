import { debounce, initializeProfileDropdown, initializePixModal } from '../ui.js';
import { calcularFrete } from '../services/freteService.js';
 import { criarCobrancaPix } from '../services/pagamentoService.js'

const PACKAGE_DEFAULTS = {
    BOOK_WEIGHT_KG: 0.5,
    BOOK_THICKNESS_CM: 3,
    MIN_WEIGHT_KG: 0.3,
    MIN_HEIGHT_CM: 2,
    PACKAGE_WIDTH_CM: 16,
    PACKAGE_LENGTH_CM: 23,
};

/**
 * Converte uma string de moeda BRL (ex: "R$ 123,45") para um número inteiro de centavos.
 * @param {string} brlString - A string de moeda a ser convertida.
 * @returns {number} O valor em centavos (ex: 12345).
 */
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

const setupInputMasks = () => {
    const cardNumberEl = document.getElementById('card-number');
    const cardExpiryEl = document.getElementById('card-expiry');
    const cardCvcEl = document.getElementById('card-cvc');

    if (typeof Cleave === 'undefined') {
        console.error('A biblioteca Cleave.js não foi carregada.');
        return;
    }

    if (cardNumberEl) {
        new Cleave(cardNumberEl, {
            blocks: [4, 4, 4, 4],
            delimiter: ' ',
            numericOnly: true
        });
    }

    if (cardExpiryEl) {
        new Cleave(cardExpiryEl, {
            date: true,
            datePattern: ['m', 'y']
        });
    }

    if (cardCvcEl) {
        new Cleave(cardCvcEl, {
            blocks: [3],
            numericOnly: true
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const openPixModal = initializePixModal();

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

    const paymentInputs = {
        number: document.getElementById('card-number'),
        name: document.getElementById('card-name'),
        expiry: document.getElementById('card-expiry'),
        cvc: document.getElementById('card-cvc'),
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

    setupInputMasks();

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

        const isPaymentValid = Object.values(paymentInputs)
            .every(input => input.value.trim() !== '');

        return isAddressValid && isPaymentValid;
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
    
    const allInputs = [...Object.values(addressInputs), ...Object.values(paymentInputs)];

    allInputs.forEach(input => {
        if (input) {
            const isAddressField = Object.values(addressInputs).includes(input);
            const debounceTime = isAddressField ? 500 : 300; 

            input.addEventListener('input', debounce(() => {
                toggleConfirmButton();
                if (isAddressField) {
                    updateAddressSummary();
                    handleShippingCalculation(); 
                }
            }, debounceTime));
        }
    });

    confirmBtn.addEventListener('click', async () => {
        if(checkFormValidity()) {
            // Troque o alert antigo por esta nova lógica
            try {
                const totalText = totalEl.textContent;
                const totalInCents = parseBRLToCents(totalText);
                
                if (totalInCents <= 0) {
                    alert("O valor total do pedido não pode ser zero.");
                    return;
                }
                // Coleta os dados necessários para a cobrança PIX
                // Adapte os IDs se os campos do seu formulário forem diferentes
                console.log(total);
                const dadosParaCobranca = {
                    amount: totalInCents, // ATENÇÃO: Pegue o valor total real do pedido
                    expiresIn: 300, // 5 minutos
                    description: "Compra na COMPIA Editora",
                    name: document.querySelector('input[placeholder="Nome Completo"]').value, // Tá pegando do formulário de cartão de crédito (PRECISA CRIAR/TROCAS DE CRÉDITO PARA INFORMAÇÕES DE PAGAMENTO)
                    cellphone: '83999999999', // Adicionar campo de telefone
                    email: 'cliente@email.com', // adicionar campo de e-mail
                    taxId: '52998224725' // Adicionar campo de cpf (TEM QUE VER ISSO SE PODE OU NÃO :())
                };

                console.log("Gerando PIX...");
                // Chama a API para criar a cobrança
                const resultadoPix = await criarCobrancaPix(dadosParaCobranca);

                console.log("PIX gerado:", resultadoPix);
                // Abre o modal com os dados recebidos
                openPixModal(resultadoPix.data.brCodeBase64, resultadoPix.data.brCode);

            } catch (error) {
                console.error("Erro ao gerar a cobrança PIX:", error);
                alert(`Não foi possível gerar o PIX: ${error.message}`);
            }
        }   
    });
    updateAddressSummary();
    toggleConfirmButton();
    initializeGlobalUI()
});