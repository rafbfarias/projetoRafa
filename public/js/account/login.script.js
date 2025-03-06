document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const submitButton = document.getElementById('submitButton');
    const toggleButton = document.getElementById('toggleButton');
    let isRegistering = false;

    const showMessage = (text, isError = true) => {
        messageDiv.textContent = text;
        messageDiv.className = `mb-4 p-3 rounded ${
            isError ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
        }`;
        messageDiv.classList.remove('hidden');
    };

    const toggleMode = () => {
        isRegistering = !isRegistering;
        submitButton.textContent = isRegistering ? 'Criar Conta' : 'Entrar';
        toggleButton.textContent = isRegistering ? 'Voltar para Login' : 'Criar Conta';
        messageDiv.classList.add('hidden');
    };

    toggleButton.addEventListener('click', toggleMode);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('Resposta:', data); // Debug

            if (data.success) {
                console.log('Redirecionando...');
                showMessage('Login bem-sucedido! Redirecionando...', false);
                setTimeout(() => {
                    window.location.replace('/dashboard.html');
                }, 1000);
            } else {
                showMessage(data.message || 'Erro no login');
            }
        } catch (error) {
            console.error('Erro:', error); // Debug
            showMessage('Erro ao tentar fazer login');
        }
    });
}); 