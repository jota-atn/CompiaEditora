import { initializeGlobalUI } from '../ui.js';
import { updateCartUI } from '../cart.js';
import { logout } from '../auth.js';

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
        toast.classList.add('opacity-0', '-translate-x-full');
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

function formatCPF(cpf) {
    const cleaned = ('' + cpf).replace(/\D/g, '');
    if (cleaned.length !== 11) { return cpf; }
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatPhone(phone) {
    const cleaned = ('' + phone).replace(/\D/g, '');
    if (cleaned.length === 11) return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (cleaned.length === 10) return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return phone;
}

function isValidEmail(email) {
    if (typeof email !== 'string' || email.trim() === '') { return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

function isValidCPF(cpf) {
    cpf = ('' + cpf).replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0, rest;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

function isValidBirthdate(dateString) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const parts = dateString.match(regex);
    if (!parts) return false;
    const [, day, month, year] = parts.map(Number);
    const birthDate = new Date(year, month - 1, day);
    if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) return false;
    if (year < 1900) return false;
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return birthDate <= eighteenYearsAgo;
}

function renderProfileData(user) {
    document.getElementById('profile-pic').src = user.profilePicture || '/public/images/default-profile.png';
    document.getElementById('profile-name').textContent = user.name || 'Não informado';
    document.getElementById('profile-email').textContent = user.email || 'Não informado';
    document.getElementById('profile-phone').textContent = user.phone ? formatPhone(user.phone) : 'Não informado';
    document.getElementById('profile-birthdate').textContent = user.birthDate || 'Não informado';
    document.getElementById('profile-cpf').textContent = user.cpf ? formatCPF(user.cpf) : 'Não informado';
}

function renderAddressesModal(addresses = []) {
    const container = document.getElementById('address-list');
    if (!container) return;
    container.innerHTML = addresses.map(addr => `
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

function renderOrdersModal(orders = []) {
    const container = document.getElementById('orders-list');
    if (!container) return;
    container.innerHTML = orders.map(order => `
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

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    let currentUserData = null; 

    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = './login.html';
        return;
    }

    async function loadUserProfile() {
        try {
            const response = await fetch('/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                logout();
                throw new Error('Sessão expirada. Faça login novamente.');
            }
            currentUserData = await response.json();
            renderProfileData(currentUserData);
            document.querySelectorAll('.modal-overlay[data-rendered]').forEach(modal => modal.removeAttribute('data-rendered'));
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            if (error.message.includes('Sessão expirada')) {
                alert(error.message);
            }
            window.location.href = './login.html';
        }
    }

    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modal;
            const modal = document.getElementById(modalId);
            if (!modal) return;
            
            if (!modal.dataset.rendered && currentUserData) {
                if (modal.id === 'address-modal') renderAddressesModal(currentUserData.addresses);
                if (modal.id === 'orders-modal') renderOrdersModal(currentUserData.orders);
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

        if (target.matches('#add-new-address-btn')) {
            document.getElementById('add-address-form').reset();
            openModal(document.getElementById('add-address-modal'));
        }

        if (target.matches('.edit-address-btn')) {
            const addressId = target.dataset.addressId;
            const address = currentUserData.addresses.find(addr => addr.id == addressId);
            if (address) {
                document.getElementById('edit-address-id').value = address.id;
                document.getElementById('edit-street').value = address.street;
                document.getElementById('edit-city').value = address.city;
                document.getElementById('edit-cep').value = address.cep;
                document.getElementById('edit-default-address').checked = address.default;
                openModal(document.getElementById('edit-address-modal'));
            }
        }
        if (target.matches('.delete-address-btn')) {
            const addressId = target.dataset.addressId;
            if (confirm('Tem certeza que deseja remover este endereço?')) {
                // await fetch(`/api/addresses/${addressId}`, { method: 'DELETE', ... })
                showToast('API de remoção de endereço não implementada', 'error');
            }
        }
    });

    document.getElementById('add-address-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        // TEM QUE FAZER A LÓGICA DE MANDAR PRA API AINDA VEJA ISSO TONY
        showToast('Endereço adicionado com sucesso! (Simulação)', 'success');
        closeModal(document.getElementById('add-address-modal'));
        // loadUserProfile(); 
    });

    document.getElementById('edit-address-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const addressId = document.getElementById('edit-address-id').value;
        const updatedAddress = {
            street: document.getElementById('edit-street').value,
            city: document.getElementById('edit-city').value,
            cep: document.getElementById('edit-cep').value,
            default: document.getElementById('edit-default-address').checked
        };
        showToast('Endereço atualizado com sucesso! (Simulação)', 'success');
        closeModal(document.getElementById('edit-address-modal'));
        // loadUserProfile(); // Ativar quando a API estiver pronta
    });
    
    document.getElementById('profile-pic-container').addEventListener('click', () => {
        document.getElementById('profile-pic-input').click();
    });

    document.getElementById('profile-pic-input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await fetch('/api/users/upload-profile-pic', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                showToast('Foto de perfil atualizada com sucesso!', 'success');
                document.getElementById('profile-pic').src = result.profilePictureUrl;
                // await loadUserProfile();
            } else {
                throw new Error(result.message || 'Erro ao fazer upload da foto.');
            }
        } catch (error) {
            console.error('Erro de upload:', error);
            showToast(error.message, 'error');
        }
    });

    initializeGlobalUI();
    updateCartUI();
    loadUserProfile();
});