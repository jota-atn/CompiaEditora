import { userData } from '../profileData.js';
import { initializeProfileDropdown } from '../ui.js';


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
    
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modal;
            const modal = document.getElementById(modalId);
            if (!modal) return;

            if (!modal.dataset.rendered) {
                if (modalId === 'address-modal') renderAddressesModal();
                if (modalId === 'payment-modal') renderPaymentsModal();
                if (modalId === 'orders-modal') renderOrdersModal();
                if (modalId === 'data-modal') renderDataModal();
                modal.dataset.rendered = 'true';
            }
            
            modal.classList.remove('hidden');
        });
    });

    document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
        element.addEventListener('click', (event) => {
            if (event.target === element) {
                element.closest('.modal-overlay').classList.add('hidden');
            }
        });
    });

    const addressModal = document.getElementById('address-modal');
    if (addressModal) {
        addressModal.addEventListener('click', (event) => {
            const target = event.target;
            
            if (target.matches('.delete-address-btn')) {
                const addressId = target.dataset.addressId;
                if (confirm('Tem certeza que deseja remover este endereço?')) {
                    alert(`Endereço com ID ${addressId} removido! (Simulado)`);
                }
            }
            if (target.matches('.edit-address-btn')) {
                const addressId = target.dataset.addressId;
                alert(`Editar endereço com ID ${addressId}! (Simulado)`);
            }
        });
    }

    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.addEventListener('click', (event) => {
            const target = event.target;
            
            if (target.matches('.delete-payment-btn')) {
                const paymentId = target.dataset.paymentId;
                if (confirm('Tem certeza que deseja remover esta forma de pagamento?')) {
                    alert(`Cartão com ID ${paymentId} removido! (Simulado)`);
                }
            }
            if (target.matches('.edit-payment-btn')) {
                const paymentId = target.dataset.paymentId;
                alert(`Editar cartão com ID ${paymentId}! (Simulado)`);
            }
        });
    }

    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const newName = document.getElementById('edit-name').value;
            const newEmail = document.getElementById('edit-email').value;
            const newPhone = document.getElementById('edit-phone').value;
            const newBirthdate = document.getElementById('edit-birthdate').value;

            userData.name = newName;
            userData.email = newEmail;
            userData.phone = newPhone;
            userData.birthDate = newBirthdate;
            
            alert('Dados atualizados com sucesso! (Simulado)');
            document.getElementById('data-modal').classList.add('hidden');

            document.getElementById('profile-name').textContent = newName;
            document.getElementById('profile-email').textContent = newEmail;
            document.getElementById('profile-phone').textContent = newPhone;
            document.getElementById('profile-birthdate').textContent = newBirthdate;
        });
    }
    initializeProfileDropdown();
});