document.addEventListener('DOMContentLoaded', function() {
    // Inicializar botões de ação
    initActionButtons();
    
    // Inicializar modal de confirmação
    initConfirmationModal();
    
    // Carregar dados do convite
    loadInvitationData();
});

/**
 * Inicializa os botões de ação
 */
function initActionButtons() {
    const acceptBtn = document.getElementById('acceptInvitationBtn');
    const rejectBtn = document.getElementById('rejectInvitationBtn');
    
    acceptBtn.addEventListener('click', function() {
        showConfirmation(
            'Aceitar Convite',
            'Tem certeza que deseja aceitar este convite? Você terá acesso à unidade e às permissões listadas.',
            'accept'
        );
    });
    
    rejectBtn.addEventListener('click', function() {
        showConfirmation(
            'Recusar Convite',
            'Tem certeza que deseja recusar este convite? Esta ação não pode ser desfeita.',
            'reject'
        );
    });
}

/**
 * Inicializa o modal de confirmação
 */
function initConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    const cancelBtn = document.getElementById('cancelConfirmationBtn');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    // Fechar modal
    cancelBtn.addEventListener('click', function() {
        modal.classList.add('hidden');
    });
    
    // Fechar modal ao clicar fora dele
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
    
    // Confirmar ação
    confirmBtn.addEventListener('click', function() {
        const action = confirmBtn.getAttribute('data-action');
        
        if (action === 'accept') {
            acceptInvitation();
        } else if (action === 'reject') {
            rejectInvitation();
        }
        
        modal.classList.add('hidden');
    });
}

/**
 * Exibe o modal de confirmação
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem do modal
 * @param {string} action - Ação a ser confirmada (accept, reject)
 */
function showConfirmation(title, message, action) {
    const modal = document.getElementById('confirmationModal');
    const titleEl = document.getElementById('confirmationTitle');
    const messageEl = document.getElementById('confirmationMessage');
    const iconEl = document.getElementById('confirmationIcon');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    confirmBtn.setAttribute('data-action', action);
    
    // Definir ícone e cor do botão com base na ação
    if (action === 'accept') {
        iconEl.innerHTML = '<i class="fas fa-check-circle text-green-500 text-2xl"></i>';
        confirmBtn.className = 'btn btn-primary';
        confirmBtn.textContent = 'Aceitar';
    } else if (action === 'reject') {
        iconEl.innerHTML = '<i class="fas fa-times-circle text-red-500 text-2xl"></i>';
        confirmBtn.className = 'btn btn-secondary';
        confirmBtn.textContent = 'Recusar';
    }
    
    modal.classList.remove('hidden');
}

/**
 * Aceita o convite
 */
function acceptInvitation() {
    // Obter mensagem de resposta (opcional)
    const message = document.getElementById('responseMessage').value;
    
    // Obter ID do convite da URL
    const urlParams = new URLSearchParams(window.location.search);
    const invitationId = urlParams.get('id') || '1'; // Fallback para ID 1 se não especificado
    
    // Simulação de aceitação de convite
    console.log('Aceitando convite:', invitationId, 'com mensagem:', message);
    
    // Em produção, isso seria uma chamada à API
    // fetch(`/api/invitations/${invitationId}/accept`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ message })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log('Convite aceito:', data);
    //     window.location.href = '/pages/account/invitations.html?accepted=true';
    // })
    // .catch(error => {
    //     console.error('Erro ao aceitar convite:', error);
    //     showNotification('Erro ao aceitar convite. Tente novamente.', 'error');
    // });
    
    // Simulação de sucesso
    showNotification('Convite aceito com sucesso!', 'success');
    
    // Redirecionar após 2 segundos
    setTimeout(() => {
        window.location.href = '/pages/account/invitations.html?accepted=true';
    }, 2000);
}

/**
 * Recusa o convite
 */
function rejectInvitation() {
    // Obter mensagem de resposta (opcional)
    const message = document.getElementById('responseMessage').value;
    
    // Obter ID do convite da URL
    const urlParams = new URLSearchParams(window.location.search);
    const invitationId = urlParams.get('id') || '1'; // Fallback para ID 1 se não especificado
    
    // Simulação de recusa de convite
    console.log('Recusando convite:', invitationId, 'com mensagem:', message);
    
    // Em produção, isso seria uma chamada à API
    // fetch(`/api/invitations/${invitationId}/reject`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ message })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log('Convite recusado:', data);
    //     window.location.href = '/pages/account/invitations.html?rejected=true';
    // })
    // .catch(error => {
    //     console.error('Erro ao recusar convite:', error);
    //     showNotification('Erro ao recusar convite. Tente novamente.', 'error');
    // });
    
    // Simulação de sucesso
    showNotification('Convite recusado.', 'info');
    
    // Redirecionar após 2 segundos
    setTimeout(() => {
        window.location.href = '/pages/account/invitations.html?rejected=true';
    }, 2000);
}

/**
 * Carrega os dados do convite
 */
function loadInvitationData() {
    // Obter ID do convite da URL
    const urlParams = new URLSearchParams(window.location.search);
    const invitationId = urlParams.get('id') || '1'; // Fallback para ID 1 se não especificado
    
    // Simulação de carregamento de dados
    console.log('Carregando dados do convite:', invitationId);
    
    // Em produção, isso seria uma chamada à API
    // fetch(`/api/invitations/${invitationId}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log('Dados do convite:', data);
    //         populateInvitationData(data);
    //     })
    //     .catch(error => {
    //         console.error('Erro ao carregar dados do convite:', error);
    //         showNotification('Erro ao carregar dados do convite. Tente novamente.', 'error');
    //     });
    
    // Simulação de dados
    const invitationData = {
        id: invitationId,
        sender: {
            name: 'João Silva',
            email: 'joao.silva@email.com'
        },
        company: 'Plateiapositiva, Lda',
        unit: 'Porto',
        role: 'Gerente',
        message: 'Olá, gostaria de convidá-lo para se juntar à nossa equipe na unidade Porto como Gerente. Teremos prazer em contar com sua experiência e conhecimento em nossa equipe.',
        createdAt: '2023-05-12T10:30:00Z',
        status: 'pending',
        permissions: [
            {
                module: 'Finanças',
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            {
                module: 'RH',
                view: true,
                create: true,
                edit: false,
                delete: false
            },
            {
                module: 'Administração',
                view: true,
                create: false,
                edit: false,
                delete: false
            }
        ]
    };
    
    // Preencher dados na página
    populateInvitationData(invitationData);
}

/**
 * Preenche os dados do convite na página
 * @param {Object} data - Dados do convite
 */
function populateInvitationData(data) {
    // Preencher título e data
    document.querySelector('h2').textContent = `Convite para Unidade ${data.unit}`;
    document.querySelector('p.text-muted').textContent = `Convite pendente desde ${formatDate(data.createdAt)}`;
    
    // Preencher detalhes do convite
    document.querySelector('p.font-medium:nth-of-type(1)').textContent = `${data.sender.name} (${data.sender.email})`;
    document.querySelector('p.font-medium:nth-of-type(2)').textContent = data.company;
    document.querySelector('p.font-medium:nth-of-type(3)').textContent = data.unit;
    document.querySelector('p.font-medium:nth-of-type(4)').textContent = data.role;
    
    // Preencher mensagem
    document.querySelector('p.bg-gray-100.dark\\:bg-gray-700').textContent = data.message;
    
    // Preencher permissões
    const permissionsTable = document.querySelector('table.component-table tbody');
    permissionsTable.innerHTML = '';
    
    data.permissions.forEach(permission => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-3">${permission.module}</td>
            <td class="px-4 py-3 text-center">
                ${permission.view 
                    ? '<i class="fas fa-check text-green-600 dark:text-green-400"></i>' 
                    : '<i class="fas fa-times text-red-600 dark:text-red-400"></i>'}
            </td>
            <td class="px-4 py-3 text-center">
                ${permission.create 
                    ? '<i class="fas fa-check text-green-600 dark:text-green-400"></i>' 
                    : '<i class="fas fa-times text-red-600 dark:text-red-400"></i>'}
            </td>
            <td class="px-4 py-3 text-center">
                ${permission.edit 
                    ? '<i class="fas fa-check text-green-600 dark:text-green-400"></i>' 
                    : '<i class="fas fa-times text-red-600 dark:text-red-400"></i>'}
            </td>
            <td class="px-4 py-3 text-center">
                ${permission.delete 
                    ? '<i class="fas fa-check text-green-600 dark:text-green-400"></i>' 
                    : '<i class="fas fa-times text-red-600 dark:text-red-400"></i>'}
            </td>
        `;
        permissionsTable.appendChild(row);
    });
    
    // Verificar status do convite e ajustar botões
    if (data.status !== 'pending') {
        const responseForm = document.getElementById('invitationResponseForm');
        const statusText = data.status === 'accepted' ? 'Aceito' : 'Recusado';
        const statusClass = data.status === 'accepted' 
            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
            : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200';
        
        responseForm.innerHTML = `
            <div class="flex items-center justify-between">
                <p class="text-muted">Este convite já foi respondido.</p>
                <span class="px-3 py-1 rounded-full text-sm font-medium ${statusClass}">
                    ${statusText}
                </span>
            </div>
        `;
    }
}

/**
 * Formata uma data para exibição
 * @param {string} dateString - String de data no formato ISO
 * @returns {string} Data formatada
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
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