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

    // Configuração do modal de status
    const statusModal = document.getElementById('statusModal');
    const closeModal = document.getElementById('closeModal');
    const modalCloseButton = document.getElementById('modalCloseButton');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');
    
    // Funções para controlar o modal
    const showStatusModal = (message, type = 'error') => {
        // Remover classes de tipo anteriores
        statusModal.classList.remove('error', 'warning', 'info', 'success');
        
        // Configurar tipo e ícone
        switch (type) {
            case 'error':
                statusModal.classList.add('error');
                modalTitle.textContent = 'Erro';
                modalIcon.className = 'fas fa-exclamation-circle text-red-500 text-xl';
                break;
            case 'warning':
                statusModal.classList.add('warning');
                modalTitle.textContent = 'Aviso';
                modalIcon.className = 'fas fa-exclamation-triangle text-yellow-500 text-xl';
                break;
            case 'info':
                statusModal.classList.add('info');
                modalTitle.textContent = 'Informação';
                modalIcon.className = 'fas fa-info-circle text-blue-500 text-xl';
                break;
            case 'success':
                statusModal.classList.add('success');
                modalTitle.textContent = 'Sucesso';
                modalIcon.className = 'fas fa-check-circle text-green-500 text-xl';
                break;
        }
        
        // Definir a mensagem
        modalMessage.textContent = message;
        
        // Exibir o modal
        statusModal.style.display = 'block';
    };
    
    const hideStatusModal = () => {
        statusModal.style.display = 'none';
    };
    
    // Adicionar event listeners para fechar o modal
    if (closeModal) closeModal.addEventListener('click', hideStatusModal);
    if (modalCloseButton) modalCloseButton.addEventListener('click', hideStatusModal);
    
    // Fechar o modal clicando fora dele
    window.addEventListener('click', (event) => {
        if (event.target === statusModal) {
            hideStatusModal();
        }
    });

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

            if (data.success || data.status === 'success') {
                console.log('Login bem-sucedido, redirecionando...');
                
                // Verificar se o usuário precisa completar o onboarding
                if (data.user && data.user.onboardingCompleted === false) {
                    // Redirecionar para a página de boas-vindas
                    showMessage('Login bem-sucedido! Redirecionando para página de boas-vindas...', false);
                    setTimeout(() => {
                        window.location.href = '/pages/welcome/welcome.html';
                    }, 1000);
                } else {
                    // Redirecionar para o dashboard
                    showMessage('Login bem-sucedido! Redirecionando...', false);
                    setTimeout(() => {
                        window.location.replace('/dashboard.html');
                    }, 1000);
                }
            } else {
                // Usar o modal para erros, especialmente "Usuário desativado"
                showStatusModal(data.message || 'Erro no login', 'error');
            }
        } catch (error) {
            console.error('Erro:', error); // Debug
            showStatusModal('Erro ao tentar fazer login. Verifique sua conexão.', 'error');
        }
    });
}); 