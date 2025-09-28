import { initializeGlobalUI, showToast, openModal, closeModal } from '../ui.js';
import { updateCartUI } from '../cart.js';
import { logout } from '../auth.js';
import { getMyAddresses, addMyAddress, updateMyAddress, deleteMyAddress } from '../services/addressService.js';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '../services/userService.js';
import { getMyOrders } from '../services/orderService.js';

// --- FUNÇÕES DE VALIDAÇÃO E FORMATAÇÃO ---
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

/**
 * Função para configurar o autopreenchimento de CEP em um formulário.
 * @param {string} prefix - O prefixo dos IDs do formulário ('add' ou 'edit').
 */
function setupCepAutocomplete(prefix) {
    const cepInput = document.getElementById(`${prefix}-cep`);
    const streetInput = document.getElementById(`${prefix}-street`);
    const cityInput = document.getElementById(`${prefix}-city`);

    if (!cepInput || !streetInput || !cityInput) return;

    // Desabilita os campos no início
    streetInput.disabled = true;
    cityInput.disabled = true;

    cepInput.addEventListener('input', async () => {
        const cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length < 8) {
            streetInput.value = '';
            cityInput.value = '';
            streetInput.disabled = true;
            cityInput.disabled = true;
            return;
        }

        try {
            const response = await fetch(`/api/cep/${cep}`);
            const data = await response.json();
            
            if (response.ok) {
                streetInput.value = data.logradouro || '';
                cityInput.value = (data.localidade && data.uf) ? `${data.localidade} - ${data.uf}` : '';
                
                streetInput.disabled = false;
                cityInput.disabled = false;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error(error.message);
            showToast(`CEP não encontrado ou inválido.`, 'error');
            streetInput.disabled = false;
            cityInput.disabled = false;
        }
    });
}

/**
 * Aplica as máscaras de formatação em todos os campos de formulário relevantes.
 */
function setupInputMasks() {
    const phoneInput = document.getElementById('edit-phone');
    if (phoneInput) {
        new Cleave(phoneInput, {
            delimiters: ['(', ') ', '-'],
            blocks: [0, 2, 5, 4],
            numericOnly: true
        });
    }

    const birthdateInput = document.getElementById('edit-birthdate');
    if (birthdateInput) {
        new Cleave(birthdateInput, {
            date: true,
            datePattern: ['d', 'm', 'Y']
        });
    }

    const cpfInput = document.getElementById('edit-cpf');
    if (cpfInput) {
        new Cleave(cpfInput, {
            delimiters: ['.', '.', '-'],
            blocks: [3, 3, 3, 2],
            numericOnly: true
        });
    }
    
    const addCepInput = document.getElementById('add-cep');
    if (addCepInput) {
        new Cleave(addCepInput, {
            delimiter: '-',
            blocks: [5, 3],
            numericOnly: true
        });
    }
    
    const editCepInput = document.getElementById('edit-cep');
    if (editCepInput) {
        new Cleave(editCepInput, {
            delimiter: '-',
            blocks: [5, 3],
            numericOnly: true
        });
    }
}


// --- LÓGICA PRINCIPAL DA PÁGINA ---
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
            currentUserData = await getUserProfile();
            renderProfileData(currentUserData);
            document.querySelectorAll('.modal-overlay[data-rendered]').forEach(modal => modal.removeAttribute('data-rendered'));
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            if (error.message.includes('Sessão expirada')) {
                alert(error.message);
            }
            logout();
        }
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderProfileData(user) {
        document.getElementById('profile-pic').src = user.profilePicture || '/images/default-profile.png';
        document.getElementById('profile-name').textContent = user.name || 'Não informado';
        document.getElementById('profile-email').textContent = user.email || 'Não informado';
        document.getElementById('profile-phone').textContent = user.phone ? formatPhone(user.phone) : 'Não informado';
        document.getElementById('profile-birthdate').textContent = user.birthDate || 'Não informado';
        document.getElementById('profile-cpf').textContent = user.cpf ? formatCPF(user.cpf) : 'Não informado';

        document.getElementById('edit-name').value = user.name || '';
        document.getElementById('edit-email').value = user.email || '';
        document.getElementById('edit-phone').value = user.phone || '';
        document.getElementById('edit-birthdate').value = user.birthDate || '';
        
        const cpfInput = document.getElementById('edit-cpf');
        if (user.cpf) {
            cpfInput.value = user.cpf;
            cpfInput.disabled = true;
            cpfInput.classList.add('bg-gray-100', 'cursor-not-allowed');
        } else {
            cpfInput.value = '';
            cpfInput.disabled = false;
            cpfInput.classList.remove('bg-gray-100', 'cursor-not-allowed');
        }
        const adminBtn = document.getElementById('admin-panel-btn');
        // Se o botão existir e o usuário for admin (user.isAdmin === 1)
        if (adminBtn && user.isAdmin) {
            // Remove a classe 'hidden' para mostrar o botão
            adminBtn.classList.remove('hidden');
        }
    }
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('ATENÇÃO: Esta ação é irreversível. Você tem certeza que deseja deletar sua conta?')) {
                return;
            }
            try {
                await deleteUserProfile();
                logout(); 
            } catch (error) {
                console.error('Erro ao deletar conta:', error);
                showToast(error.message, 'error');
            }
        });
    }
    const logoutBtn = document.getElementById('logout-btn')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            logout(); 
        });
    }


    async function renderAddressesModal(addresses) {
        const container = document.getElementById('address-list');
        if (!container) return;
        
        if (addresses.length === 0) {
            container.innerHTML = `<p class="text-center text-gray-500 py-4">Nenhum endereço cadastrado.</p>`;
            return;
        }

        container.innerHTML = addresses.map(addr => `
            <div class="p-4 border rounded-lg ${addr.default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-semibold text-gray-800">${addr.street}</p>
                        <p class="text-sm text-gray-600">${addr.city}</p>
                        <p class="text-sm text-gray-500">CEP: ${addr.cep}</p>
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
    
        if (orders.length === 0) {
            container.innerHTML = `<p class="text-center text-gray-500 py-4">Você ainda não fez nenhum pedido.</p>`;
            return;
        }
    
        container.innerHTML = orders.map(order => `
            <div class="p-4 border rounded-lg bg-gray-50">
                <div class="flex justify-between items-center border-b pb-2 mb-2">
                    <div>
                        <p class="font-bold text-gray-800">Pedido #${order.id}</p>
                        <p class="text-sm text-gray-500">${new Date(order.order_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-lg text-blue-700">R$ ${order.total_price.toFixed(2).replace('.', ',')}</p>
                        <span class="text-xs font-medium px-2 py-1 rounded-full ${order.status === 'Processando' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}">${order.status}</span>
                    </div>
                </div>
                <div class="space-y-2">
                    ${order.items.map(item => `
                        <div class="flex items-center text-sm">
                            <img src="${item.cover_image}" class="w-10 h-14 object-cover rounded mr-3">
                            <div class="flex-grow">
                                <p class="text-gray-700 font-semibold">${item.book_title}</p>
                                <p class="text-gray-500">${item.format} (Qtd: ${item.quantity})</p>
                            </div>
                            <p class="text-gray-600">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // --- LÓGICA DOS MODAIS (carrega conteúdo sob demanda) ---
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', async () => {
            const modalId = button.dataset.modal;
            const modal = document.getElementById(modalId);
            
            if (!modal) {
                console.error(`DEBUG: Modal com ID "${modalId}" não encontrado no DOM!`);
                return;
            }
            
            if (!modal.dataset.rendered) {
                try {
                    if (modal.id === 'address-modal') {
                        const addresses = await getMyAddresses();
                        currentUserData.addresses = addresses;
                        await renderAddressesModal(addresses);
                    }
                    if (modal.id === 'orders-modal') {
                        const orders = await getMyOrders();
                        currentUserData.orders = orders;
                        await renderOrdersModal(orders);
                    }
                     modal.dataset.rendered = 'true';
                } catch(error) {
                    console.error(`Erro ao carregar conteúdo para o modal ${modalId}:`, error);
                    showToast('Erro ao carregar dados.', 'error');
                    return; 
                }
            }
            openModal(modal);
        });
    });

    document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
        element.addEventListener('click', (event) => {
            if (event.target === element) closeModal(element.closest('.modal-overlay'));
        });
    });
    
    // --- LÓGICA DE CLIQUES (delegação de eventos) ---
    document.body.addEventListener('click', async (event) => {
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
                try {
                    await deleteMyAddress(addressId);
                    showToast('Endereço removido com sucesso!', 'success');
                    const updatedAddresses = await getMyAddresses();
                    await renderAddressesModal(updatedAddresses);
                } catch (error) {
                    showToast(error.message, 'error');
                }
            }
        }
    });

    // --- LÓGICA DOS FORMULÁRIOS ---

    document.getElementById('add-address-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newAddress = {
            street: document.getElementById('add-street').value,
            city: document.getElementById('add-city').value,
            cep: document.getElementById('add-cep').value.replace(/\D/g, ''),
            default: document.getElementById('add-default-address').checked
        };
        try {
            await addMyAddress(newAddress);
            showToast('Endereço adicionado com sucesso!', 'success');
            closeModal(document.getElementById('add-address-modal'));
            const updatedAddresses = await getMyAddresses();
            await renderAddressesModal(updatedAddresses);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    document.getElementById('edit-address-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const addressId = document.getElementById('edit-address-id').value;
        const updatedAddress = {
            street: document.getElementById('edit-street').value,
            city: document.getElementById('edit-city').value,
            cep: document.getElementById('edit-cep').value.replace(/\D/g, ''),
            default: document.getElementById('edit-default-address').checked
        };
        try {
            await updateMyAddress(addressId, updatedAddress);
            showToast('Endereço atualizado com sucesso!', 'success');
            closeModal(document.getElementById('edit-address-modal'));
            const updatedAddresses = await getMyAddresses();
            await renderAddressesModal(updatedAddresses);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    document.getElementById('edit-profile-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const emailValue = document.getElementById('edit-email').value;
        const cpfInput = document.getElementById('edit-cpf');
        const birthdateValue = document.getElementById('edit-birthdate').value;
        const cpfLimpo = cpfInput.value.replace(/\D/g, '');

        if (!isValidEmail(emailValue)) return showToast('Por favor, insira um endereço de email válido.', 'error');
        if (!cpfInput.disabled && cpfLimpo.length > 0 && cpfLimpo.length !== 11) return showToast('O CPF precisa ter exatamente 11 dígitos.', 'error');
        if (!cpfInput.disabled && cpfLimpo.length > 0 && !isValidCPF(cpfLimpo)) return showToast('O CPF inserido não é válido.', 'error'); 
        if (birthdateValue.trim() !== '' && !isValidBirthdate(birthdateValue)) return showToast('Data de nascimento inválida ou idade menor que 18 anos.', 'error');

        const updatedData = {
            name: document.getElementById('edit-name').value,
            phone: document.getElementById('edit-phone').value.replace(/\D/g, ''),
            birthDate: birthdateValue,
            cpf: cpfLimpo,
        };
        
        try {
            await updateUserProfile(updatedData);
            showToast('Perfil atualizado com sucesso!', 'success');
            closeModal(document.getElementById('data-modal'));
            await loadUserProfile();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    // --- LÓGICA DE UPLOAD DE FOTO ---
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
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                showToast('Foto de perfil atualizada com sucesso!', 'success');
                document.getElementById('profile-pic').src = result.profilePictureUrl;
            } else {
                throw new Error(result.message || 'Erro ao fazer upload da foto.');
            }
        } catch (error) {
            console.error('Erro de upload:', error);
            showToast(error.message, 'error');
        }
    });

    // --- INICIALIZAÇÃO ---
    initializeGlobalUI();
    updateCartUI();
    loadUserProfile();
    setupCepAutocomplete('add');
    setupCepAutocomplete('edit');
    setupInputMasks();
});