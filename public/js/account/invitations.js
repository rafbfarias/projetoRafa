document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tabs
    initTabs();
    
    // Inicializar modal de convite
    initInvitationModal();
    
    // Adicionar event listeners para ações
    initActionButtons();
});

/**
 * Inicializa o sistema de tabs
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remover classe active de todos os botões e painéis
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.add('hidden'));
            
            // Adicionar classe active ao botão clicado e painel correspondente
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        });
    });
}

/**
 * Inicializa o modal de novo convite
 */
function initInvitationModal() {
    const newInvitationBtn = document.getElementById('newInvitationBtn');
    const invitationModal = document.getElementById('invitationModal');
    const closeInvitationModal = document.getElementById('closeInvitationModal');
    const invitationForm = document.getElementById('invitationForm');
    
    // Abrir modal
    newInvitationBtn.addEventListener('click', function() {
        invitationModal.classList.remove('hidden');
    });
    
    // Fechar modal
    closeInvitationModal.addEventListener('click', function() {
        invitationModal.classList.add('hidden');
    });
    
    // Fechar modal ao clicar fora dele
    invitationModal.addEventListener('click', function(e) {
        if (e.target === invitationModal) {
            invitationModal.classList.add('hidden');
        }
    });
    
    // Enviar formulário
    invitationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obter dados do formulário
        const email = document.getElementById('invitationEmail').value;
        const company = document.getElementById('invitationCompany').value;
        const unit = document.getElementById('invitationUnit').value;
        const role = document.getElementById('invitationRole').value;
        
        // Validar dados
        if (!email || !company || !unit || !role) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        // Enviar convite (simulação)
        sendInvitation({
            email,
            company,
            unit,
            role
        });
        
        // Fechar modal
        invitationModal.classList.add('hidden');
        
        // Limpar formulário
        invitationForm.reset();
        
        // Mostrar mensagem de sucesso
        showNotification('Convite enviado com sucesso!', 'success');
    });
}

/**
 * Inicializa os botões de ação
 */
function initActionButtons() {
    // Botões de ação na tabela de convites enviados
    document.querySelectorAll('#sent-tab .fa-paper-plane').forEach(button => {
        button.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const email = row.querySelector('td:first-child').textContent;
            
            if (confirm(`Deseja reenviar o convite para ${email}?`)) {
                // Aqui você pode chamar uma API para reenviar o convite
                console.log(`Reenviar convite para: ${email}`);
                showNotification('Convite reenviado com sucesso!', 'success');
            }
        });
    });
    
    document.querySelectorAll('#sent-tab .fa-trash-alt').forEach(button => {
        button.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const email = row.querySelector('td:first-child').textContent;
            
            if (confirm(`Tem certeza que deseja excluir o convite para ${email}?`)) {
                // Aqui você pode chamar uma API para excluir o convite
                console.log(`Excluir convite para: ${email}`);
                row.remove();
            }
        });
    });
    
    document.querySelectorAll('#sent-tab .fa-eye').forEach(button => {
        button.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const email = row.querySelector('td:first-child').textContent;
            
            // Redirecionar para a página de detalhes do convite
            window.location.href = `invitation-view.html?email=${encodeURIComponent(email)}`;
        });
    });
    
    document.querySelectorAll('#sent-tab .fa-redo-alt').forEach(button => {
        button.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const email = row.querySelector('td:first-child').textContent;
            
            if (confirm(`Deseja recriar o convite para ${email}?`)) {
                // Aqui você pode chamar uma API para recriar o convite
                console.log(`Recriar convite para: ${email}`);
                showNotification('Convite recriado com sucesso!', 'success');
            }
        });
    });
    
    // Botões de aceitar/recusar convites recebidos
    document.querySelectorAll('#received-tab .btn-primary').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.dashboard-card');
            const title = card.querySelector('h3').textContent;
            
            if (confirm(`Deseja aceitar o convite para ${title}?`)) {
                // Aqui você pode chamar uma API para aceitar o convite
                console.log(`Aceitar convite: ${title}`);
                
                // Atualizar UI
                const buttonsContainer = this.closest('.flex');
                buttonsContainer.innerHTML = `
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                        Aceito
                    </span>
                `;
                
                showNotification('Convite aceito com sucesso!', 'success');
            }
        });
    });
    
    document.querySelectorAll('#received-tab .btn-secondary').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.dashboard-card');
            const title = card.querySelector('h3').textContent;
            
            if (confirm(`Deseja recusar o convite para ${title}?`)) {
                // Aqui você pode chamar uma API para recusar o convite
                console.log(`Recusar convite: ${title}`);
                
                // Atualizar UI
                const buttonsContainer = this.closest('.flex');
                buttonsContainer.innerHTML = `
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200">
                        Recusado
                    </span>
                `;
                
                showNotification('Convite recusado.', 'info');
            }
        });
    });
}

/**
 * Envia um convite para o usuário
 * @param {Object} data - Dados do convite
 */
function sendInvitation(data) {
    // Simulação de envio de convite
    console.log('Enviando convite:', data);
    
    // Em produção, isso seria uma chamada à API
    // fetch('/api/invitations', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(data)
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log('Convite enviado:', data);
    // })
    // .catch(error => {
    //     console.error('Erro ao enviar convite:', error);
    // });
}

/**
 * Exibe uma notificação na tela
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de notificação (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${getNotificationClass(type)}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${getNotificationIcon(type)} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Adicionar à página
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.add('opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Retorna a classe CSS para o tipo de notificação
 * @param {string} type - Tipo de notificação
 * @returns {string} Classe CSS
 */
function getNotificationClass(type) {
    switch (type) {
        case 'success':
            return 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200';
        case 'error':
            return 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200';
        case 'warning':
            return 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200';
        case 'info':
        default:
            return 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200';
    }
}

/**
 * Retorna o ícone para o tipo de notificação
 * @param {string} type - Tipo de notificação
 * @returns {string} Classe do ícone
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-times-circle';
        case 'warning':
            return 'fa-exclamation-circle';
        case 'info':
        default:
            return 'fa-info-circle';
    }
} 