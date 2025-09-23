document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');

    if (registrationForm) {
        const fullNameInput = document.getElementById('fullname');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const passwordConfirmInput = document.getElementById('password-confirm');
        const submitBtn = document.getElementById('submit-btn');

        const fields = {
            fullname: { input: fullNameInput, error: document.getElementById('fullname-error'), valid: false },
            email: { input: emailInput, error: document.getElementById('email-error'), valid: false },
            password: { input: passwordInput, error: document.getElementById('password-error'), valid: false },
            passwordConfirm: { input: passwordConfirmInput, error: document.getElementById('password-confirm-error'), valid: false },
        };

        const validateField = (fieldName, field) => {
            const { input, error } = field;
            let message = '';
            field.valid = false;

            switch (fieldName) {
                case 'fullname':
                    if (input.value.trim() === '') {
                        message = 'Nome completo é obrigatório.';
                    } else {
                        field.valid = true;
                    }
                    break;
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        message = 'Por favor, insira um email válido.';
                    } else {
                        field.valid = true;
                    }
                    break;
                case 'password':
                    if (input.value.length < 8) {
                        message = 'A senha deve ter no mínimo 8 caracteres.';
                    } else {
                        field.valid = true;
                    }
                    break;
                case 'passwordConfirm':
                    if (input.value !== fields.password.input.value) {
                        message = 'As senhas não conferem.';
                    } else if (input.value === '') {
                        message = 'Confirmação de senha é obrigatória.';
                    } else {
                        field.valid = true;
                    }
                    break;
            }

            error.textContent = message;
            input.classList.toggle('border-red-500', !field.valid && input.value.length > 0);
            input.classList.toggle('border-green-500', field.valid);
        };

        const checkFormValidity = () => {
            const isFormValid = Object.values(fields).every(field => field.valid);
            submitBtn.disabled = !isFormValid;
        };
        
        for (const fieldName in fields) {
            fields[fieldName].input.addEventListener('input', () => {
                validateField(fieldName, fields[fieldName]);
                if (fieldName === 'password') {
                    validateField('passwordConfirm', fields.passwordConfirm);
                }
                checkFormValidity();
            });
        }

        registrationForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!submitBtn.disabled) {
                sessionStorage.setItem('registrationSuccess', 'true');
                window.location.href = 'index.html';
            }
        });
    }

    if (loginForm) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitBtn = document.getElementById('submit-btn');

        const fields = {
            email: { input: emailInput, error: document.getElementById('email-error'), valid: false },
            password: { input: passwordInput, error: document.getElementById('password-error'), valid: false },
        };

        const validateField = (fieldName, field) => {
            const { input, error } = field;
            let message = '';
            field.valid = false;

            switch (fieldName) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        message = 'Por favor, insira um email válido.';
                    } else {
                        field.valid = true;
                    }
                    break;
                case 'password':
                    if (input.value.trim() === '') {
                        message = 'A senha é obrigatória.';
                    } else {
                        field.valid = true;
                    }
                    break;
            }
            error.textContent = message;
        };

        const checkFormValidity = () => {
            const isFormValid = Object.values(fields).every(field => field.valid);
            submitBtn.disabled = !isFormValid;
        };

        for (const fieldName in fields) {
            fields[fieldName].input.addEventListener('input', () => {
                validateField(fieldName, fields[fieldName]);
                checkFormValidity();
            });
        }

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!submitBtn.disabled) {
                sessionStorage.setItem('loginSuccess', 'true');
                window.location.href = 'index.html';
            }
        });
    }
});