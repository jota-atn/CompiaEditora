document.addEventListener('DOMContentLoaded', () => {
    // Procura pelos formulários de login e de registro na página
    const loginForm = document.getElementById('login-form');
    const registrationForm = document.getElementById('registration-form');

    // LÓGICA DE REGISTRO 
  if (registrationForm) {
    // console.log('DEBUG: Formulário de registro encontrado. Iniciando validação.');

    const submitBtn = document.getElementById('submit-btn');
    const nameInput = document.getElementById('fullname'); // Pega o campo de nome
    const emailInput = document.getElementById('email');   // Pega o campo de email
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('password-confirm');

    if (!submitBtn || !passwordInput || !confirmPasswordInput || !nameInput || !emailInput) {
        console.error('DEBUG: ERRO! Um ou mais elementos do formulário não foram encontrados. Verifique os IDs no seu cadastro.html.');
    }

    const validateRegistrationForm = () => {
        // Agora a validação inclui todos os campos
        const isNameValid = nameInput.value.trim() !== '';
        const isEmailValid = emailInput.value.includes('@'); // Validação simples de email
        const isPasswordValid = passwordInput.value.length >= 8;
        const doPasswordsMatch = passwordInput.value === confirmPasswordInput.value;
        
        const shouldBeEnabled = isNameValid && isEmailValid && isPasswordValid && doPasswordsMatch;
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

        // Pega os valores no momento do submit
        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        
        try {
            // Chama a nossa API de registro
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Se a API retornar um erro (ex: email duplicado), mostra o alerta
                throw new Error(data.message || 'Falha ao registrar.');
            }

            alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
            window.location.href = './login.html'; // Redireciona para o login

        } catch (error) {
            console.error('Erro no registro:', error);
            alert(`Erro no registro: ${error.message}`);
        }
    });
    
    // Valida o formulário uma vez no início para definir o estado inicial do botão
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
    window.location.href = './login.html';
}