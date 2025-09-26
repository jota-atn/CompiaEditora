document.addEventListener('DOMContentLoaded', () => {
    // Procura pelos formulários de login e de registro na página
    const loginForm = document.getElementById('login-form');
    const registrationForm = document.getElementById('registration-form');

    // LÓGICA DE REGISTRO 
 if (registrationForm) {
    const submitBtn = document.getElementById('submit-btn');
    const nameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('password-confirm');

    // Mapeia os elementos de requisitos da senha
    const reqs = {
        length: document.getElementById('req-length'),
        uppercase: document.getElementById('req-uppercase'),
        lowercase: document.getElementById('req-lowercase'),
        number: document.getElementById('req-number'),
        special: document.getElementById('req-special'),
    };

    /**
     * Valida um email usando uma expressão regular (Regex).
     */
    function isValidEmail(email) {
        if (typeof email !== 'string' || email.trim() === '') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    const validateRegistrationForm = () => {
        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        //Validação de Senha Forte em tempo real
        const validations = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>\-_~`'+=]/.test(password),
        };

        // Atualiza a cor de cada requisito
        for (const req in reqs) {
            if (reqs[req]) { // Garante que o elemento existe
                const isValid = validations[req];
                reqs[req].classList.toggle('text-green-500', isValid);
                reqs[req].classList.toggle('text-gray-500', !isValid);
            }
        }

        // Validação final para habilitar o botão
        const isNameValid = name.trim() !== '';
        const isEmailValid = isValidEmail(email);
        const isPasswordStrong = Object.values(validations).every(Boolean); // Checa se todas as validações de senha são 'true'
        const doPasswordsMatch = password === confirmPassword && password !== '';

        const shouldBeEnabled = isNameValid && isEmailValid && isPasswordStrong && doPasswordsMatch;
        submitBtn.disabled = !shouldBeEnabled;
    };

    // Adiciona os "escutadores" a todos os campos
    nameInput.addEventListener('input', validateRegistrationForm);
    emailInput.addEventListener('input', validateRegistrationForm);
    passwordInput.addEventListener('input', validateRegistrationForm);
    confirmPasswordInput.addEventListener('input', validateRegistrationForm);
    
    //LÓGICA DE ENVIO (SUBMIT)
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        
        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Falha ao registrar.');
            }
            alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
            window.location.href = './login.html';
        } catch (error) {
            console.error('Erro no registro:', error);
            alert(`Erro no registro: ${error.message}`);
        }
    });
    
    // Valida o formulário uma vez no início
    validateRegistrationForm();
}

    // LÓGICA DE LOGIN
      if (loginForm) {

        const submitBtn = document.getElementById('submit-btn');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');


        const validateLoginForm = () => {
            
            const emailValue = emailInput.value;
            const passwordValue = passwordInput.value;

            // Validação mais específica: email precisa ter '@' e senha não pode ser vazia
            const isEmailValid = emailValue.includes('@');
            const isPasswordValid = passwordValue.trim() !== '';

            const shouldBeEnabled = isEmailValid && isPasswordValid;
            submitBtn.disabled = !shouldBeEnabled;
            
        };

        emailInput.addEventListener('input', validateLoginForm);
        passwordInput.addEventListener('input', validateLoginForm);

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                // Chama a nossa API de login
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Falha ao fazer login.');
                }
               
                // Guarda o token e as informações do usuário no localStorage do navegador
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data.user));

                alert(`Bem-vindo de volta, ${data.user.name}!`);
                window.location.href = './perfil.html'; // Redireciona para a página de perfil

            } catch (error) {
                console.error('Erro no login:', error);
                alert(`Erro no login: ${error.message}`);
            }
        });

        // Chama a validação uma vez no início para garantir o estado correto do botão
        validateLoginForm();
    }

});

export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    alert('Você foi desconectado.');
    window.location.href = '/login.html';
}