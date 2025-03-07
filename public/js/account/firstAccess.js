document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const elements = {
        form: document.getElementById('firstAccessForm'),
        token: document.getElementById('token'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirmPassword'),
        togglePassword: document.getElementById('togglePassword'),
        toggleConfirmPassword: document.getElementById('toggleConfirmPassword'),
        submitButton: document.getElementById('submitButton'),
        userName: document.getElementById('userName'),
        userEmail: document.getElementById('userEmail'),
        checks: {
            length: document.getElementById('lengthCheck'),
            upper: document.getElementById('upperCheck'),
            lower: document.getElementById('lowerCheck'),
            number: document.getElementById('numberCheck'),
            special: document.getElementById('specialCheck'),
            match: document.getElementById('matchCheck')
        }
    };

    // Inicialização
    initializeForm();
    initializePasswordToggles();
    initializePasswordValidation();

    function initializeForm() {
        // Obter token da URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            showError('Token de acesso não encontrado.');
            return;
        }

        elements.token.value = token;
        validateToken(token);
    }

    function initializePasswordToggles() {
        // Toggle senha
        elements.togglePassword.addEventListener('click', () => {
            togglePasswordVisibility(elements.password, elements.togglePassword);
        });

        // Toggle confirmar senha
        elements.toggleConfirmPassword.addEventListener('click', () => {
            togglePasswordVisibility(elements.confirmPassword, elements.toggleConfirmPassword);
        });
    }

    function initializePasswordValidation() {
        // Validar senha em tempo real
        elements.password.addEventListener('input', validatePassword);
        elements.confirmPassword.addEventListener('input', validatePassword);

        // Submit do formulário
        elements.form.addEventListener('submit', handleSubmit);
    }

    function togglePasswordVisibility(input, button) {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        button.innerHTML = `<i class="fas fa-${type === 'password' ? 'eye' : 'eye-slash'}"></i>`;
    }

    async function validateToken(token) {
        try {
            const response = await fetch(`/api/users/validate-token/${token}`);
            
            if (!response.ok) {
                throw new Error('Token inválido ou expirado');
            }

            const data = await response.json();
            elements.userName.textContent = data.preferredName;
            elements.userEmail.textContent = data.email;

        } catch (error) {
            showError('Token inválido ou expirado. Por favor, solicite um novo link de acesso.');
            elements.form.style.display = 'none';
        }
    }

    function validatePassword() {
        const password = elements.password.value;
        const confirmPassword = elements.confirmPassword.value;

        // Validar comprimento
        updateCheck('length', password.length >= 8);

        // Validar letra maiúscula
        updateCheck('upper', /[A-Z]/.test(password));

        // Validar letra minúscula
        updateCheck('lower', /[a-z]/.test(password));

        // Validar número
        updateCheck('number', /\d/.test(password));

        // Validar caractere especial
        updateCheck('special', /[@$!%*?&]/.test(password));

        // Validar se senhas coincidem
        updateCheck('match', password === confirmPassword && password !== '');

        // Verificar se todos os requisitos foram atendidos
        const allValid = Object.values(elements.checks).every(
            check => check.classList.contains('text-green-500')
        );

        elements.submitButton.disabled = !allValid;
        return allValid;
    }

    function updateCheck(checkId, isValid) {
        const element = elements.checks[checkId];
        element.className = `flex items-center ${isValid ? 'text-green-500' : 'text-gray-500'}`;
        element.querySelector('i').className = `fas ${isValid ? 'fa-check-circle' : 'fa-circle'} text-xs mr-2`;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!validatePassword()) {
            showNotification('Por favor, atenda a todos os requisitos da senha.', 'error');
            return;
        }

        elements.submitButton.disabled = true;
        elements.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';

        try {
            const response = await fetch('/api/users/first-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: elements.token.value,
                    password: elements.password.value
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao definir senha');
            }

            showNotification('Senha definida com sucesso! Redirecionando...', 'success');
            
            // Redirecionar para o login após 2 segundos
            setTimeout(() => {
                window.location.href = '/login?firstAccess=true';
            }, 2000);

        } catch (error) {
            showNotification(error.message, 'error');
            elements.submitButton.disabled = false;
            elements.submitButton.textContent = 'Definir Senha e Acessar';
        }
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-3"></i>
                <span>${message}</span>
            </div>
        `;
        elements.form.parentNode.insertBefore(errorDiv, elements.form);
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${getNotificationClass(type)}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${getNotificationIcon(type)} mr-3"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('opacity-0');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    function getNotificationClass(type) {
        switch (type) {
            case 'success':
                return 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200';
            case 'error':
                return 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200';
            case 'warning':
                return 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200';
            default:
                return 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200';
        }
    }

    function getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return 'fa-check-circle';
            case 'error':
                return 'fa-times-circle';
            case 'warning':
                return 'fa-exclamation-circle';
            default:
                return 'fa-info-circle';
        }
    }
}); 