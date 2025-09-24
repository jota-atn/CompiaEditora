import { userData } from '../profileData.js';
import { initializeProfileDropdown } from '../ui.js';

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    toast.className = `p-4 rounded-lg shadow-lg text-white font-semibold transform transition-all duration-300 ease-out ${bgColor} translate-y-4 opacity-0`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-4', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 4000);
}

function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('modal-active'), 10);
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('modal-active');
    modal.addEventListener('transitionend', () => modal.classList.add('hidden'), { once: true });
}

function renderAddressesModal() {
    const container = document.getElementById('address-list');
    if (!container) return;
    container.innerHTML = userData.addresses.map(addr => `
        <div class="p-4 border rounded-lg ${addr.default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-semibold text-gray-800">${addr.street}</p>
                    <p class="text-sm text-gray-600">${addr.city}</p>
                    <p class="text-sm text-gray-500">${addr.cep}</p>
                </div>
                <div class="flex items-center gap-4 text-sm font-medium">
                    <button class="text-blue-600 hover:underline edit-address-btn" data-address-id="${addr.id}">Editar</button>
                    <button class="text-red-500 hover:underline delete-address-btn" data-address-id="${addr.id}">Remover</button>
                </div>
            </div>
            ${addr.default ? '<div class="mt-2 pt-2 border-t"><span class="text-xs font-bold text-blue-600">Endereço Padrão</span></div>' : ''}
        </div>
    `).join('');
}

function renderPaymentsModal() {
    const container = document.getElementById('payment-list');
    if (!container) return;
    container.innerHTML = userData.paymentMethods.map(card => `
        <div class="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
            <div class="flex items-center gap-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                <div>
                    <p class="font-semibold text-gray-800">${card.type} terminado em •••• ${card.last4}</p>
                    <p class="text-sm text-gray-500">Validade: ${card.expiry}</p>
                </div>
            </div>
            <div class="flex items-center gap-4 text-sm font-medium">
                <button class="text-blue-600 hover:underline edit-payment-btn" data-payment-id="${card.id}">Editar</button>
                <button class="text-red-500 hover:underline delete-payment-btn" data-payment-id="${card.id}">Remover</button>
            </div>
        </div>
    `).join('');
}

function renderOrdersModal() {
    const container = document.getElementById('orders-list');
    if (!container) return;
    container.innerHTML = userData.orders.map(order => `
        <div class="p-4 border border-gray-200 rounded-lg shadow-sm">
            <div class="flex flex-wrap justify-between items-center border-b pb-3 mb-3 gap-2">
                <div>
                    <p class="font-bold text-lg text-gray-800">Pedido #${order.id}</p>
                    <p class="text-sm text-gray-500">Realizado em: ${order.date}</p>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-gray-700">Total: ${order.total}</p>
                    <span class="text-sm font-medium ${order.status === 'Entregue' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} px-2 py-1 rounded-full">${order.status}</span>
                </div>
            </div>
            <div class="flex gap-4 overflow-x-auto py-2">
                ${order.items.map(item => `
                    <div class="flex-shrink-0 w-28 text-center">
                        <img src="${item.coverImage}" alt="${item.title}" class="w-20 h-28 object-cover rounded-md mx-auto">
                        <p class="text-xs mt-2 text-gray-600 line-clamp-2" title="${item.title}">${item.title}</p>
                        <p class="text-xs text-gray-500">Qtd: ${item.quantity}</p>
                    </div>
                `).join('')}
            </div>
            <div class="mt-3 pt-3 border-t text-sm">
                <p class="font-semibold text-gray-700">Código de Rastreamento:</p>
                <p class="text-blue-600 font-mono">${order.trackingCode}</p>
            </div>
        </div>
    `).join('');
}

function renderDataModal() {
    document.getElementById('edit-name').value = userData.name;
    document.getElementById('edit-email').value = userData.email;
    document.getElementById('edit-phone').value = userData.phone;
    document.getElementById('edit-birthdate').value = userData.birthDate;
    document.getElementById('edit-cpf').value = userData.cpf;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('profile-pic').src = userData.profilePicture;
    document.getElementById('profile-name').textContent = userData.name;
    document.getElementById('profile-email').textContent = userData.email;
    document.getElementById('profile-phone').textContent = userData.phone;
    document.getElementById('profile-birthdate').textContent = userData.birthDate;
    document.getElementById('profile-cpf').textContent = userData.cpf;

    const profilePicContainer = document.getElementById('profile-pic-container');
    const profilePicInput = document.getElementById('profile-pic-input');
    if (profilePicContainer && profilePicInput) {
        profilePicContainer.addEventListener('click', () => profilePicInput.click());
        profilePicInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('profile-pic').src = e.target.result;
                userData.profilePicture = e.target.result;
                showToast('Foto de perfil atualizada!', 'success');
            };
            reader.readAsDataURL(file);
        });
    }

    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.getElementById(button.dataset.modal);
            if (!modal) return;
            if (!modal.dataset.rendered) {
                if (modal.id === 'address-modal') renderAddressesModal();
                if (modal.id === 'payment-modal') renderPaymentsModal();
                if (modal.id === 'orders-modal') renderOrdersModal();
                if (modal.id === 'data-modal') renderDataModal();
                modal.dataset.rendered = 'true';
            }
            openModal(modal);
        });
    });

    document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
        element.addEventListener('click', (event) => {
            if (event.target === element) closeModal(element.closest('.modal-overlay'));
        });
    });

    document.body.addEventListener('click', (event) => {
        const target = event.target;

        if (target.matches('.delete-address-btn')) {
            if (confirm('Tem certeza que deseja remover este endereço?')) {
                const addressId = target.dataset.addressId;
                userData.addresses = userData.addresses.filter(addr => addr.id != addressId);
                renderAddressesModal();
                showToast('Endereço removido com sucesso!', 'success');
            }
        }
        if (target.matches('.edit-address-btn')) {
            const addressId = target.dataset.addressId;
            const address = userData.addresses.find(addr => addr.id == addressId);
            if (address) {
                document.getElementById('edit-address-id').value = address.id;
                document.getElementById('edit-street').value = address.street;
                document.getElementById('edit-city').value = address.city;
                document.getElementById('edit-cep').value = address.cep;
                document.getElementById('edit-default-address').checked = address.default;
                openModal(document.getElementById('edit-address-modal'));
            }
        }
        if (target.matches('#add-new-address-btn')) {
            document.getElementById('add-address-form').reset();
            openModal(document.getElementById('add-address-modal'));
        }

        if (target.matches('.delete-payment-btn')) {
            if (confirm('Tem certeza que deseja remover este cartão?')) {
                const paymentId = target.dataset.paymentId;
                userData.paymentMethods = userData.paymentMethods.filter(p => p.id != paymentId);
                renderPaymentsModal();
                showToast('Cartão removido com sucesso!', 'success');
            }
        }
        if (target.matches('.edit-payment-btn')) {
            const paymentId = target.dataset.paymentId;
            const payment = userData.paymentMethods.find(p => p.id == paymentId);
            if (payment) {
                document.getElementById('edit-payment-id').value = payment.id;
                document.getElementById('edit-card-type').value = payment.type;
                document.getElementById('edit-card-last4').value = payment.last4;
                document.getElementById('edit-card-expiry').value = payment.expiry;
                openModal(document.getElementById('edit-payment-modal'));
            }
        }
        if (target.matches('#add-new-payment-btn')) {
            document.getElementById('add-payment-form').reset();
            openModal(document.getElementById('add-payment-modal'));
        }
    });

    document.getElementById('edit-profile-form').addEventListener('submit', (e) => { e.preventDefault(); /* ...código inalterado... */ });

    document.getElementById('add-address-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const isDefault = document.getElementById('add-default-address').checked;
        if (isDefault) userData.addresses.forEach(addr => addr.default = false);
        
        const newAddress = {
            id: Date.now(), //CORRIGIR IMEDIATAMENTE NAO DEIXEM ISSO ADIEL NEM TONY
            street: document.getElementById('add-street').value,
            city: document.getElementById('add-city').value,
            cep: document.getElementById('add-cep').value,
            default: isDefault
        };
        userData.addresses.push(newAddress);
        renderAddressesModal();
        closeModal(document.getElementById('add-address-modal'));
        showToast('Endereço adicionado com sucesso!', 'success');
    });

    document.getElementById('edit-address-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const addressId = document.getElementById('edit-address-id').value;
        const addressIndex = userData.addresses.findIndex(addr => addr.id == addressId);
        if (addressIndex !== -1) {
            const isDefault = document.getElementById('edit-default-address').checked;
            if (isDefault) userData.addresses.forEach(addr => addr.default = false);
            
            userData.addresses[addressIndex] = {
                id: addressId,
                street: document.getElementById('edit-street').value,
                city: document.getElementById('edit-city').value,
                cep: document.getElementById('edit-cep').value,
                default: isDefault
            };
        }
        renderAddressesModal();
        closeModal(document.getElementById('edit-address-modal'));
        showToast('Endereço atualizado com sucesso!', 'success');
    });

    document.getElementById('add-payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newPayment = {
            id: Date.now(),
            type: document.getElementById('add-card-type').value,
            last4: document.getElementById('add-card-last4').value,
            expiry: document.getElementById('add-card-expiry').value
        };
        userData.paymentMethods.push(newPayment);
        renderPaymentsModal();
        closeModal(document.getElementById('add-payment-modal'));
        showToast('Cartão adicionado com sucesso!', 'success');
    });

    document.getElementById('edit-payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const paymentId = document.getElementById('edit-payment-id').value;
        const paymentIndex = userData.paymentMethods.findIndex(p => p.id == paymentId);
        if (paymentIndex !== -1) {
            userData.paymentMethods[paymentIndex] = {
                id: paymentId,
                type: document.getElementById('edit-card-type').value,
                last4: document.getElementById('edit-card-last4').value,
                expiry: document.getElementById('edit-card-expiry').value
            };
        }
        renderPaymentsModal();
        closeModal(document.getElementById('edit-payment-modal'));
        showToast('Cartão atualizado com sucesso!', 'success');
    });

    initializeProfileDropdown();
});