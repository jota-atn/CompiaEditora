import { debounce, initializePixModal, initializeGlobalUI, showToast } from '../ui.js';
import { updateCartUI } from '../cart.js';
import { calcularFrete } from '../services/freteService.js';
import { criarCobrancaPix } from '../services/pagamentoService.js';
import { getUserProfile } from '../services/userService.js';
import { getMyAddresses } from '../services/addressService.js';
import { createOrder } from '../services/orderService.js';

const PACKAGE_DEFAULTS = {
    BOOK_WEIGHT_KG: 0.5, BOOK_THICKNESS_CM: 3, MIN_WEIGHT_KG: 0.3,
    MIN_HEIGHT_CM: 2, PACKAGE_WIDTH_CM: 16, PACKAGE_LENGTH_CM: 23,
};

const parseBRLToCents = (brlString) => {
    if (typeof brlString !== 'string') return 0;
    const cleanedString = brlString.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    return Math.round(parseFloat(cleanedString) * 100);
};

document.addEventListener('DOMContentLoaded', async () => {
    const openPixModal = initializePixModal();
    let currentUser = null;
    let savedAddresses = [];
    // Variável para guardar os dados do pedido atual antes de salvar
    let currentOrderData = null;

    try {
        currentUser = await getUserProfile();
        savedAddresses = await getMyAddresses();
    } catch (error) {
        alert(error.message);
        window.location.href = './login.html';
        return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        window.location.href = './catalogo.html';
        return;
    }

    const realBooks = cart.filter(book => book.format !== 'E-book');

    const carouselContainer = document.getElementById('checkout-items-carousel');
    if (carouselContainer) {
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
        
        new Swiper('.checkout-swiper', {
            slidesPerView: 2,
            spaceBetween: 16,
            navigation: {
                nextEl: '.swiper-button-next-checkout',
                prevEl: '.swiper-button-prev-checkout',
            },
            breakpoints: {
                640: { slidesPerView: 3, spaceBetween: 20 },
                768: { slidesPerView: 4, spaceBetween: 20 },
                1024: { slidesPerView: 5, spaceBetween: 24 }
            }
        });
    }
    
    // Mapeamento dos elementos do DOM
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const shippingEl = document.getElementById('summary-shipping');
    const summaryAddressEl = document.getElementById('summary-address');
    const confirmBtn = document.getElementById('confirm-order-btn');
    const pixConfirmedBtn = document.getElementById('pix-confirmed-btn');
    const savedAddressesContainer = document.getElementById('saved-addresses-container');
    const addressInputs = {
        cep: document.getElementById('checkout-cep'),
        rua: document.getElementById('checkout-rua'),
        numero: document.getElementById('checkout-numero'),
        complemento: document.getElementById('checkout-complemento'),
        bairro: document.getElementById('checkout-bairro'),
        cidade: document.getElementById('checkout-cidade'),
    };

    // --- LÓGICA DE ENDEREÇO ---
    const populateAddressForm = (address) => {
        if (!address) return;
        addressInputs.cep.value = address.cep;
        addressInputs.rua.value = address.street;
        addressInputs.cidade.value = address.city;
        addressInputs.numero.value = '';
        addressInputs.complemento.value = '';
        addressInputs.bairro.value = '';
    };

    const renderAddressOptions = () => {
        if (savedAddresses.length === 0) {
            savedAddressesContainer.innerHTML = `<p class="text-center text-gray-500">Nenhum endereço salvo. Preencha abaixo para continuar.</p>`;
            return;
        }
        savedAddressesContainer.innerHTML = savedAddresses.map((addr, index) => `
            <label for="addr-${index}" class="block p-4 border rounded-lg cursor-pointer ${addr.default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}">
                <div class="flex items-start"><input type="radio" name="selected_address" id="addr-${index}" value="${addr.id}" class="mt-1" ${addr.default ? 'checked' : ''}>
                    <div class="ml-3"><p class="font-semibold text-gray-800">${addr.street}</p><p class="text-sm text-gray-600">${addr.city}</p><p class="text-sm text-gray-500">CEP: ${addr.cep}</p></div>
                </div>
            </label>
        `).join('') + `<button id="clear-address-btn" class="text-sm text-blue-600 hover:underline mt-2">+ Usar um novo endereço</button>`;
    };
    
    // --- CÁLCULO DE FRETE E ATUALIZAÇÕES DE UI ---
    const updateFinancialSummary = (shippingCost) => {
        const freteValido = typeof shippingCost === 'number' && shippingCost >= 0;
        const custoFrete = freteValido ? shippingCost : 0;
        shippingEl.textContent = freteValido || realBooks.length === 0 ? `R$ ${custoFrete.toFixed(2).replace('.', ',')}` : 'Indisponível';
        const total = subtotal + custoFrete;
        totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        toggleConfirmButton();
    };

    const isAddressComplete = () => Object.values(addressInputs).every(input => input.placeholder.includes('Opcional') || input.value.trim() !== '');
    const isShippingValid = () => !['A calcular...', 'Calculando...', 'Indisponível'].includes(shippingEl.textContent);
    const toggleConfirmButton = () => confirmBtn.disabled = !( (isAddressComplete() || realBooks.length === 0) && isShippingValid() );

    const handleShippingCalculation = debounce(async () => {
        if (realBooks.length === 0) return updateFinancialSummary(0);
        if (!addressInputs.cep.value.replace(/\D/g,'').length === 8) return;

        shippingEl.textContent = 'Calculando...';
        try {
            const packageDetails = {
                to_postal_code: addressInputs.cep.value.replace(/\D/g, ''),
                weight: Math.max(realBooks.reduce((acc, item) => acc + (item.quantity * PACKAGE_DEFAULTS.BOOK_WEIGHT_KG), 0), PACKAGE_DEFAULTS.MIN_WEIGHT_KG),
                width: PACKAGE_DEFAULTS.PACKAGE_WIDTH_CM,
                length: PACKAGE_DEFAULTS.PACKAGE_LENGTH_CM,
                height: Math.max(realBooks.reduce((acc, item) => acc + (item.quantity * PACKAGE_DEFAULTS.BOOK_THICKNESS_CM), 0), PACKAGE_DEFAULTS.MIN_HEIGHT_CM),
            };
            const freteOptions = await calcularFrete(packageDetails);
            const cheapestOption = freteOptions.filter(opt => opt.price).reduce((min, cur) => parseFloat(cur.price) < parseFloat(min.price) ? cur : min);
            updateFinancialSummary(parseFloat(cheapestOption.price));
        } catch (error) {
            console.error("Erro ao calcular frete:", error);
            updateFinancialSummary(null);
        }
    }, 500);

    // --- INICIALIZAÇÃO E LISTENERS ---
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    updateFinancialSummary(0);
    renderAddressOptions();

    const defaultAddress = savedAddresses.find(addr => addr.default);
    if (defaultAddress) {
        populateAddressForm(defaultAddress);
        if(realBooks.length > 0) handleShippingCalculation();
    }

    savedAddressesContainer.addEventListener('change', (e) => {
        if (e.target.name === 'selected_address') {
            const selectedAddress = savedAddresses.find(addr => addr.id == e.target.value);
            populateAddressForm(selectedAddress);
            if(realBooks.length > 0) handleShippingCalculation();
        }
    });

    savedAddressesContainer.addEventListener('click', (e) => {
        if (e.target.id === 'clear-address-btn') {
            document.querySelectorAll('input[name="selected_address"]').forEach(radio => radio.checked = false);
            Object.values(addressInputs).forEach(input => input.value = '');
            updateFinancialSummary(0);
        }
    });
    
    Object.values(addressInputs).forEach(input => input.addEventListener('input', handleShippingCalculation));

    confirmBtn.addEventListener('click', async () => {
        if (confirmBtn.disabled) return;
        try {
            const totalInCents = parseBRLToCents(totalEl.textContent);
            if (totalInCents <= 0) return alert("O valor total do pedido não pode ser zero.");
            
            const selectedAddressRadio = document.querySelector('input[name="selected_address"]:checked');

            const addressId = selectedAddressRadio ? selectedAddressRadio.value : null;

            const orderData = {
                addressId: addressId,
                totalPrice: totalInCents / 100,
                items: cart.map(item => ({
                    title: item.title,
                    format: item.format,
                    quantity: item.quantity,
                    price: item.price,
                    coverImage: item.coverImage
                }))
            };
            
            // Guarda os dados do pedido na variável para uso posterior
            currentOrderData = orderData;

            const dadosParaCobranca = {
                amount: totalInCents,
                expiresIn: 300,
                description: `Compra na COMPIA Editora - Pedido #${Date.now()}`,
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
            // Abre o modal do PIX sem passar os dados do pedido, pois eles já estão salvos na variável 'currentOrderData'
            openPixModal(resultadoPix.data.brCodeBase64, resultadoPix.data.brCode);

        } catch (error) {
            alert(`Não foi possível gerar o PIX: ${error.message}`);
        }
    });

    // Novo listener para o botão de confirmação do pagamento PIX
    pixConfirmedBtn.addEventListener('click', async () => {
        if (!currentOrderData) {
            alert("Erro: Não foi possível encontrar os dados do pedido para salvar.");
            return;
        }

        try {
            pixConfirmedBtn.disabled = true;
            pixConfirmedBtn.textContent = 'Processando...';

            // Chama a função para criar o pedido no banco de dados
            await createOrder(currentOrderData);

            // Limpa o carrinho do localStorage
            localStorage.removeItem('cart');
            // Atualiza o contador do carrinho na UI
            updateCartUI();
            
            // Opcional: Redireciona para uma página de sucesso ou histórico de pedidos
            alert('Pedido realizado com sucesso!');
            window.location.href = './perfil.html'; // ou uma página de "meus-pedidos.html"

        } catch (error) {
            alert(`Não foi possível salvar seu pedido: ${error.message}`);
            pixConfirmedBtn.disabled = false;
            pixConfirmedBtn.textContent = 'Já paguei, concluir pedido!';
        }
    });

    initializeGlobalUI();
    updateCartUI();
});