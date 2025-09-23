import { debounce, initializeProfileDropdown } from '../ui.js';

function setupInputMasks() {
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
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
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
    const shipping = 15.00;
    const total = subtotal + shipping;
    subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
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

    const checkFormValidity = () => {
        const isAddressValid = Object.entries(addressInputs)
            .every(([key, input]) => input.placeholder.includes('Opcional') || input.value.trim() !== '');

        const isPaymentValid = Object.values(paymentInputs)
            .every(input => input.value.trim() !== '');

        return isAddressValid && isPaymentValid;
    };

    const toggleConfirmButton = () => {
        if (checkFormValidity()) {
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
            input.addEventListener('input', debounce(() => {
                toggleConfirmButton();
                if (Object.values(addressInputs).includes(input)) {
                    updateAddressSummary();
                }
            }, 300));
        }
    });

    confirmBtn.addEventListener('click', () => {
        if(checkFormValidity()) {
            alert('Pedido confirmado com sucesso! Obrigado por comprar na COMPIA.');
            localStorage.removeItem('cart');
            window.location.href = './index.html';
        }
    });
    updateAddressSummary();
    toggleConfirmButton();
    initializeProfileDropdown();
});