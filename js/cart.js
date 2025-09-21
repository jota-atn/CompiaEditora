import { booksData } from './data.js';

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCartToLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

export function updateCartUI() {
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!cartCountElement || !cartItemsContainer || !cartTotalElement || !checkoutBtn) return;

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    cartCountElement.textContent = cartCount;
    cartTotalElement.textContent = `R$ ${cartTotal.toFixed(2).replace('.', ',')}`;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Seu carrinho está vazio</p>';
        checkoutBtn.disabled = true;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <img src="${item.coverImage}" alt="${item.title}" class="w-16 h-24 object-cover rounded-md mr-4">
                <div class="flex-grow">
                    <h4 class="font-semibold text-gray-800">${item.title}</h4>
                    <p class="text-sm text-gray-500">${item.format}</p> 
                    <div class="flex items-center gap-3 mt-2">
                        <button class="quantity-btn quantity-minus" data-item-id="${item.itemId}">-</button>
                        <span class="font-medium">${item.quantity}</span>
                        <button class="quantity-btn quantity-plus" data-item-id="${item.itemId}">+</button>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-blue-800">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                    <button class="text-red-500 text-sm hover:text-red-700 remove-from-cart-btn mt-2" data-item-id="${item.itemId}">Remover</button>
                </div>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
    }
}

export function addToCart(bookId, format) {
    const bookToAdd = booksData.find(book => book.id === bookId);
    if (!bookToAdd) return;

    const edition = bookToAdd.editions.find(e => e.format === format);
    if (!edition) return;

    const itemId = `${bookId}-${format}`;
    const existingItem = cart.find(item => item.itemId === itemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            itemId,
            id: bookToAdd.id,
            title: bookToAdd.title,
            price: edition.price,
            format: edition.format,
            quantity: 1,
            coverImage: bookToAdd.coverImage
        });
    }

    updateCartUI();
    saveCartToLocalStorage();
}

function changeQuantity(itemId, change) {
    const item = cart.find(i => i.itemId === itemId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        updateCartUI();
        saveCartToLocalStorage();
    }
}

export function removeFromCart(itemId) {
    cart = cart.filter(item => item.itemId !== itemId);
    updateCartUI();
    saveCartToLocalStorage();
}

function clearCart() {
    cart = [];
    updateCartUI();
    saveCartToLocalStorage();
}

export function initializeCartListeners() {
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartModal = document.getElementById('cart-modal');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartItemsContainer = document.getElementById('cart-items');

    if (!cartBtn || !closeCartBtn || !cartModal || !cartItemsContainer) {
        console.error("Um ou mais elementos do carrinho não foram encontrados no DOM.");
        return;
    }

    const openCartModal = () => {
        cartModal.classList.remove('hidden');
        cartModal.classList.add('flex'); 
    }

    const closeCartModal = () => {
        cartModal.classList.add('hidden');
        cartModal.classList.remove('flex');
    }

    cartBtn.addEventListener('click', openCartModal);
    closeCartBtn.addEventListener('click', closeCartModal);

    cartModal.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            closeCartModal();
        }
    });

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = './checkout.html';
        });
    }

    cartItemsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return; 

        const itemId = button.dataset.itemId;
        if (!itemId) return; 

        if (button.classList.contains('remove-from-cart-btn')) {
            removeFromCart(itemId);
        } else if (button.classList.contains('quantity-plus')) {
            changeQuantity(itemId, 1);
        } else if (button.classList.contains('quantity-minus')) {
            changeQuantity(itemId, -1);
        }
    });
}