import { initializeGlobalUI} from '../ui.js';
import { logout } from '../auth.js'; 

// --- FUNÇÕES DE VALIDAÇÃO E FORMATAÇÃO ---
function formatCPF(cpf) {
    const cleaned = ('' + cpf).replace(/\D/g, '');
    if (cleaned.length !== 11) { return cpf; }
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata uma string de telefone (apenas números) para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
 */
function formatPhone(phone) {
    const cleaned = ('' + phone).replace(/\D/g, '');
    
    // Checa se é um celular (11 dígitos)
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    // Checa se é um telefone fixo (10 dígitos)
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    // Se não for nenhum dos dois, retorna o valor original
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


document.addEventListener('DOMContentLoaded', () => {
    
    // --- VERIFICAÇÃO DE LOGIN E BUSCA DE DADOS ---
    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = './login.html';
        return; 
    }

    async function loadUserProfile() {
        try {
            const response = await fetch('/api/users/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) {
                localStorage.removeItem('authToken'); 
                throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
            }

            const userData = await response.json();
            renderProfileData(userData); 

        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            alert(error.message);
            window.location.href = './login.html';
        }
    }

    // --- RENDERIZAÇÃO ---
    function renderProfileData(user) {
        document.getElementById('profile-pic').src = user.profilePicture || 'https://i.stack.imgur.com/34AD2.jpg';
        document.getElementById('profile-name').textContent = user.name || 'Não informado';
        document.getElementById('profile-email').textContent = user.email || 'Não informado';
        document.getElementById('profile-phone').textContent = user.phone ? formatPhone(user.phone) : 'Não informado';
        document.getElementById('profile-birthdate').textContent = user.birthDate || 'Não informado';
        document.getElementById('profile-cpf').textContent = user.cpf ? formatCPF(user.cpf) : 'Não informado';

        // Preenche o formulário de edição no modal, incluindo a foto
        document.getElementById('edit-name').value = user.name || '';
        document.getElementById('edit-profilePicture').value = user.profilePicture || '';
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
    }

    // --- LÓGICA DE MODAIS ---
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modal;
            if (['payment-modal', 'address-modal', 'orders-modal'].includes(modalId)) {
                alert('Funcionalidade ainda não implementada.');
                return;
            }
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.remove('hidden');
        });
    });

    document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
        element.addEventListener('click', (event) => {
            if (event.target === element) {
                element.closest('.modal-overlay').classList.add('hidden');
            }
        });
    });

    // --- MÁSCARAS E VALIDAÇÕES DE INPUT ---
    const editPhoneInput = document.getElementById('edit-phone');
    if (editPhoneInput) {
        new Cleave(editPhoneInput, {
            delimiters: ['(', ') ', '-'],
            blocks: [0, 2, 5, 4],
            numericOnly: true
        });
    }

    const editBirthdateInput = document.getElementById('edit-birthdate');
    if (editBirthdateInput) {
        new Cleave(editBirthdateInput, {
            date: true,
            datePattern: ['d', 'm', 'Y']
        });
    }

    const editCpfInput = document.getElementById('edit-cpf');
    if (editCpfInput) {
        editCpfInput.addEventListener('input', () => {
            let value = editCpfInput.value.replace(/\D/g, '');
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            editCpfInput.value = value;
        }); 
    }

    // --- LÓGICA DE ATUALIZAR E DELETAR PERFIL ---
    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const emailValue = document.getElementById('edit-email').value;
            const cpfInput = document.getElementById('edit-cpf');
            const cpfValue = cpfInput.value;
            const birthdateValue = document.getElementById('edit-birthdate').value; 

            // Validação no momento do submit
            if (!isValidEmail(emailValue)) {
                alert('Por favor, insira um endereço de email válido.');
                return;
            }
            if (!cpfInput.disabled && cpfValue.length > 0 && !isValidCPF(cpfValue)) {
                alert('O CPF inserido não é válido.');
                return; 
            }
            if (!cpfInput.disabled && cpfValue.length > 0 && cpfValue.length !== 11) {
                alert('O CPF precisa ter exatamente 11 dígitos.');
                return;
            }
            if (birthdateValue.trim() !== '' && !isValidBirthdate(birthdateValue)) {
                alert('Por favor, insira uma data de nascimento válida e certifique-se de que você tem mais de 18 anos.');
                return;
            }
            
            const updatedData = {
                name: document.getElementById('edit-name').value,
                profilePicture: document.getElementById('edit-profilePicture').value,
                email: emailValue,
                phone: document.getElementById('edit-phone').value.replace(/\D/g, ''),
                birthDate: birthdateValue,
                cpf: cpfValue
            };
            
            try {
                const response = await fetch('/api/users/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Falha ao atualizar o perfil.');
                }

                alert('Perfil atualizado com sucesso!');
                document.getElementById('data-modal').classList.add('hidden');
                loadUserProfile(); 

            } catch (error) {
                console.error('Erro ao atualizar perfil:', error);
                alert(`Erro: ${error.message}`);
            }
        });
    }

    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('ATENÇÃO: Esta ação é irreversível. Você tem certeza que deseja deletar sua conta?')) {
                return;
            }
            try {
                const response = await fetch('/api/users/profile', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Falha ao deletar a conta.');
                }
                logout();
            } catch (error) {
                console.error('Erro ao deletar conta:', error);
                alert(`Erro: ${error.message}`);
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    initializeGlobalUI();
    loadUserProfile(); 
});