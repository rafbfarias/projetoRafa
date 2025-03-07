document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tabs
    initTabs();
    
    // Inicializar modal de convite
    initInvitationModal();
    
    // Inicializar botões de ação
    initActionButtons();
    
    // Carregar usuários do banco de dados
    loadUsers();
    
    // Verificar parâmetros da URL para exibir notificações
    checkUrlParams();
});

/**
 * Carrega os usuários do banco de dados
 */
async function loadUsers() {
    try {
        // Mostrar indicador de carregamento
        const usersTab = document.getElementById('users-tab');
        usersTab.innerHTML = '<div class="flex justify-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-brand-500"></i></div>';
        
        // Buscar usuários da API
        const response = await fetch('/api/users');
        
        if (response.status === 401) {
            // Sessão expirada ou não autenticado
            showNotification('Sua sessão expirou. Redirecionando para o login...', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const users = await response.json();
        
        // Renderizar a tabela de usuários
        renderUsersTable(users);
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        
        // Mostrar mensagem de erro e usar dados de exemplo
        showNotification('Erro ao carregar usuários do servidor. Mostrando dados de exemplo.', 'warning');
        
        // Dados de exemplo para quando a API falhar
        const sampleUsers = [
            {
                _id: '1',
                preferredName: 'Ana Silva',
                fullName: 'Ana Maria Silva',
                email: 'ana.silva@exemplo.com',
                currentUnit: 'Matriz',
                userStatus: 'Ativa',
                createdAt: new Date().toISOString(),
                photo: '/images/users/default-avatar.svg'
            }
            // ... outros usuários de exemplo se necessário
        ];
        
        // Renderizar com dados de exemplo
        renderUsersTable(sampleUsers);
    }
}

/**
 * Renderiza a tabela de usuários com os dados do banco
 * @param {Array} users - Lista de usuários
 */
function renderUsersTable(users) {
    const usersTab = document.getElementById('users-tab');
    
    // Criar o HTML da tabela
    let html = `
        <!-- Filtros e Pesquisa -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div class="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                <div class="relative">
                    <input type="text" id="searchUser" placeholder="Buscar usuário..." class="form-input pl-10 pr-4 py-2 w-full md:w-64">
                    <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
                <select id="filterStatus" class="form-select py-2 w-full md:w-40">
                    <option value="">Todos Status</option>
                    <option value="Ativa">Ativo</option>
                    <option value="Inativa">Inativo</option>
                    <option value="Pendente">Pendente</option>
                </select>
            </div>
            <div class="mt-4 md:mt-0">
                <button id="applyFilters" class="btn btn-secondary">
                    <i class="fas fa-filter mr-2"></i>Filtrar
                </button>
            </div>
        </div>

        <!-- Tabela de Usuários -->
        <div class="overflow-x-auto">
            <table class="w-full component-table">
                <thead>
                    <tr>
                        <th class="px-4 py-3 text-left">Usuário</th>
                        <th class="px-4 py-3 text-left">Email</th>
                        <th class="px-4 py-3 text-left">Unidade</th>
                        <th class="px-4 py-3 text-center">Status</th>
                        <th class="px-4 py-3 text-left">Data de Criação</th>
                        <th class="px-4 py-3 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Verificar se há usuários
    if (users.length === 0) {
        html += `
            <tr>
                <td colspan="6" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhum usuário encontrado
                </td>
            </tr>
        `;
    } else {
        // Adicionar cada usuário à tabela
        users.forEach(user => {
            // Determinar a classe do badge de status
            let statusBadgeClass = 'badge-yellow'; // Pendente
            if (user.userStatus === 'Ativa') statusBadgeClass = 'badge-green';
            else if (user.userStatus === 'Inativa') statusBadgeClass = 'badge-red';
            
            // Determinar o texto do status
            const statusText = user.userStatus || 'Pendente';
            
            html += `
                <tr data-user-id="${user._id}">
                    <td class="px-4 py-3">
                        <div class="flex items-center">
                            <div class="w-8 h-8 rounded-full overflow-hidden mr-3">
                                <img src="${user.photo || '../../../images/users/default-avatar.svg'}" alt="Avatar" class="w-full h-full object-cover" onerror="this.src='../../../images/users/default-avatar.svg'; this.onerror=null;">
                            </div>
                            <span>${user.preferredName || user.fullName}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3">${user.email}</td>
                    <td class="px-4 py-3">${user.currentUnit || 'Não definida'}</td>
                    <td class="px-4 py-3 text-center">
                        <span class="badge ${statusBadgeClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td class="px-4 py-3">${new Date(user.createdAt).toLocaleString('pt-BR')}</td>
                    <td class="px-4 py-3 text-center">
                        <button class="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 mr-2 edit-user-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 delete-user-btn">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    // Adicionar paginação se necessário
    if (users.length > 0) {
        html += `
            <div class="mt-6 flex justify-between items-center">
                <div>
                    <span>Mostrando ${users.length} usuários</span>
                </div>
                
                <div class="flex space-x-2">
                    <button class="btn btn-secondary" disabled>Anterior</button>
                    <button class="btn btn-primary">1</button>
                    <button class="btn btn-secondary" disabled>Próximo</button>
                </div>
            </div>
        `;
    }
    
    // Atualizar o conteúdo da tab
    usersTab.innerHTML = html;
    
    // Adicionar event listeners para os botões de ação
    initUserActionButtons();
    
    // Adicionar event listeners para os filtros
    initFilters();
}

/**
 * Inicializa os botões de ação para cada usuário
 */
function initUserActionButtons() {
    // Botões de editar usuário
    const editButtons = document.querySelectorAll('.edit-user-btn');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const userId = row.getAttribute('data-user-id');
            const name = row.querySelector('td:first-child span').textContent;
            
            showNotification(`Editando usuário: ${name}`, 'info');
            // Aqui você redirecionaria para a página de edição
            // window.location.href = `edit-user.html?id=${userId}`;
        });
    });
    
    // Botões de excluir usuário
    const deleteButtons = document.querySelectorAll('.delete-user-btn');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const row = this.closest('tr');
            const userId = row.getAttribute('data-user-id');
            const name = row.querySelector('td:first-child span').textContent;
            
            if (confirm(`Tem certeza que deseja excluir o usuário ${name}?`)) {
                try {
                    // Chamar a API para excluir o usuário
                    const response = await fetch(`/api/users/${userId}`, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) {
                        throw new Error('Erro ao excluir usuário');
                    }
                    
                    // Remover a linha da tabela
                    row.remove();
                    showNotification(`Usuário ${name} excluído com sucesso.`, 'success');
                } catch (error) {
                    console.error('Erro ao excluir usuário:', error);
                    showNotification(`Erro ao excluir usuário: ${error.message}`, 'error');
                }
            }
        });
    });
}

/**
 * Inicializa os filtros da tabela de usuários
 */
function initFilters() {
    const searchInput = document.getElementById('searchUser');
    const statusFilter = document.getElementById('filterStatus');
    const applyFiltersBtn = document.getElementById('applyFilters');
    
    // Aplicar filtros ao clicar no botão
    applyFiltersBtn.addEventListener('click', async function() {
        try {
            // Construir a URL com os filtros
            let url = '/api/users?';
            
            if (searchInput.value) {
                url += `search=${encodeURIComponent(searchInput.value)}&`;
            }
            
            if (statusFilter.value) {
                url += `status=${encodeURIComponent(statusFilter.value)}&`;
            }
            
            // Remover o último & se existir
            url = url.endsWith('&') ? url.slice(0, -1) : url;
            
            // Mostrar indicador de carregamento
            const usersTab = document.getElementById('users-tab');
            usersTab.innerHTML = '<div class="flex justify-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-brand-500"></i></div>';
            
            // Buscar usuários filtrados
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Erro ao filtrar usuários');
            }
            
            const users = await response.json();
            
            // Renderizar a tabela com os usuários filtrados
            renderUsersTable(users);
        } catch (error) {
            console.error('Erro ao filtrar usuários:', error);
            showNotification('Erro ao filtrar usuários: ' + error.message, 'error');
        }
    });
    
    // Aplicar filtros ao pressionar Enter no campo de busca
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFiltersBtn.click();
        }
    });
}

/**
 * Verifica parâmetros da URL para exibir notificações
 */
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Verificar se o usuário foi criado com sucesso
    if (urlParams.has('userCreated')) {
        showNotification('Usuário criado com sucesso!', 'success');
        
        // Remover parâmetro da URL sem recarregar a página
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        // Ativar a tab de usuários
        document.querySelector('[data-tab="users"]').click();
    }
}

/**
 * Inicializa as tabs da página
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
            
            // Adicionar classe active ao botão e painel clicados
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        });
    });
}

/**
 * Inicializa o modal de convite
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
    
    // Enviar convite
    invitationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('invitationEmail').value;
        const company = document.getElementById('invitationCompany').value;
        const unit = document.getElementById('invitationUnit').value;
        const role = document.getElementById('invitationRole').value;
        
        // Validar campos
        if (!email || !company || !unit || !role) {
            showNotification('Por favor, preencha todos os campos.', 'warning');
            return;
        }
        
        // Simulação de envio de convite
        console.log('Enviando convite para:', email, 'Empresa:', company, 'Unidade:', unit, 'Função:', role);
        
        // Em produção, isso seria uma chamada à API
        // fetch('/api/invitations', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ email, company, unit, role })
        // })
        // .then(response => response.json())
        // .then(data => {
        //     console.log('Convite enviado:', data);
        //     showNotification('Convite enviado com sucesso!', 'success');
        //     invitationModal.classList.add('hidden');
        //     invitationForm.reset();
        // })
        // .catch(error => {
        //     console.error('Erro ao enviar convite:', error);
        //     showNotification('Erro ao enviar convite. Tente novamente.', 'error');
        // });
        
        // Simulação de sucesso
        showNotification('Convite enviado com sucesso!', 'success');
        invitationModal.classList.add('hidden');
        invitationForm.reset();
        
        // Atualizar tabela de convites (simulação)
        setTimeout(() => {
            if (document.getElementById('invitations-tab').classList.contains('hidden')) {
                document.querySelector('[data-tab="invitations"]').click();
            }
            
            const tbody = document.querySelector('#invitations-tab table tbody');
            const newRow = document.createElement('tr');
            
            // Obter texto da opção selecionada
            const unitText = document.querySelector(`#invitationUnit option[value="${unit}"]`).textContent;
            const roleText = document.querySelector(`#invitationRole option[value="${role}"]`).textContent;
            
            newRow.innerHTML = `
                <td class="px-4 py-3">${email}</td>
                <td class="px-4 py-3">${unitText}</td>
                <td class="px-4 py-3">${roleText}</td>
                <td class="px-4 py-3">${formatDate(new Date())}</td>
                <td class="px-4 py-3 text-center">
                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                        Pendente
                    </span>
                </td>
                <td class="px-4 py-3 text-center">
                    <button class="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 mr-2">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                    <button class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            tbody.insertBefore(newRow, tbody.firstChild);
        }, 500);
    });
}

/**
 * Inicializa os botões de ação
 */
function initActionButtons() {
    // Botões de editar usuário
    const editButtons = document.querySelectorAll('#users-tab .fa-edit');
    
    editButtons.forEach(button => {
        button.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const name = row.querySelector('td:first-child span').textContent;
            
            showNotification(`Editando usuário: ${name}`, 'info');
            // Aqui seria redirecionado para a página de edição ou aberto um modal
        });
    });
    
    // Botões de excluir usuário
    const deleteButtons = document.querySelectorAll('#users-tab .fa-trash-alt');
    
    deleteButtons.forEach(button => {
        button.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const name = row.querySelector('td:first-child span').textContent;
            
            if (confirm(`Tem certeza que deseja excluir o usuário ${name}?`)) {
                // Simulação de exclusão
                row.classList.add('opacity-50');
                setTimeout(() => {
                    row.remove();
                    showNotification(`Usuário ${name} excluído com sucesso.`, 'success');
                }, 500);
            }
        });
    });
    
    // Botões de reenviar convite
    const resendButtons = document.querySelectorAll('#invitations-tab .fa-paper-plane');
    
    resendButtons.forEach(button => {
        button.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const email = row.querySelector('td:first-child').textContent;
            
            // Simulação de reenvio
            showNotification(`Convite reenviado para ${email}.`, 'success');
        });
    });
    
    // Botões de excluir convite
    const deleteInvitationButtons = document.querySelectorAll('#invitations-tab .fa-trash-alt');
    
    deleteInvitationButtons.forEach(button => {
        if (button.parentElement.classList.contains('cursor-not-allowed')) {
            return;
        }
        
        button.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const email = row.querySelector('td:first-child').textContent;
            
            if (confirm(`Tem certeza que deseja excluir o convite para ${email}?`)) {
                // Simulação de exclusão
                row.classList.add('opacity-50');
                setTimeout(() => {
                    row.remove();
                    showNotification(`Convite para ${email} excluído com sucesso.`, 'success');
                }, 500);
            }
        });
    });
    
    // Botões de visualizar convite
    const viewButtons = document.querySelectorAll('#invitations-tab .fa-eye');
    
    viewButtons.forEach(button => {
        button.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const email = row.querySelector('td:first-child').textContent;
            
            // Simulação de redirecionamento
            showNotification(`Visualizando convite para ${email}.`, 'info');
            // window.location.href = `/pages/account/invitation-view.html?email=${encodeURIComponent(email)}`;
        });
    });
    
    // Botões de reenviar convite (ícone de refresh)
    const refreshButtons = document.querySelectorAll('#invitations-tab .fa-redo-alt');
    
    refreshButtons.forEach(button => {
        button.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const email = row.querySelector('td:first-child').textContent;
            
            // Simulação de reenvio
            showNotification(`Convite reenviado para ${email}.`, 'success');
        });
    });
    
    // Botões de editar permissão
    const editPermissionButtons = document.querySelectorAll('#permissions-tab .fa-edit');
    
    editPermissionButtons.forEach(button => {
        button.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const role = row.querySelector('td:first-child').textContent;
            const module = row.querySelector('td:nth-child(2)').textContent;
            
            showNotification(`Editando permissões de ${role} para o módulo ${module}.`, 'info');
            // Aqui seria redirecionado para a página de edição ou aberto um modal
        });
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

/**
 * Formata uma data para exibição
 * @param {Date} date - Objeto de data
 * @returns {string} Data formatada
 */
function formatDate(date) {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Função para carregar usuários pendentes
async function loadPendingUsers() {
    try {
        const response = await fetch('/api/users?status=Pendente');
        const users = await response.json();
        
        const tbody = document.querySelector('#invitations-tab table tbody');
        tbody.innerHTML = ''; // Limpar tabela
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-3 text-center text-gray-500">
                        Nenhum usuário pendente encontrado.
                    </td>
                </tr>
            `;
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full overflow-hidden mr-3">
                            <img src="${user.photo || '../../../images/users/default-avatar.svg'}" alt="Avatar" class="w-full h-full object-cover" onerror="this.src='../../../images/users/default-avatar.svg'; this.onerror=null;">
                        </div>
                        <span>${user.preferredName || 'Usuário Pendente'}</span>
                    </div>
                </td>
                <td class="px-4 py-3">${user.email}</td>
                <td class="px-4 py-3">${user.currentUnit || 'Não definida'}</td>
                <td class="px-4 py-3 text-center">
                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                        Pendente
                    </span>
                </td>
                <td class="px-4 py-3">${new Date(user.createdAt).toLocaleString('pt-BR')}</td>
                <td class="px-4 py-3 text-center">
                    <button class="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 mr-2 resend-access-btn" data-user-id="${user._id}">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Adicionar event listeners para os botões de reenvio
        document.querySelectorAll('.resend-access-btn').forEach(button => {
            button.addEventListener('click', async function() {
                const userId = this.getAttribute('data-user-id');
                try {
                    const response = await fetch(`/api/users/${userId}/resend-access-email`, {
                        method: 'POST'
                    });
                    
                    if (response.ok) {
                        showNotification('Email de acesso reenviado com sucesso!', 'success');
                    } else {
                        const error = await response.json();
                        showNotification(error.message || 'Erro ao reenviar email de acesso.', 'error');
                    }
                } catch (error) {
                    console.error('Erro ao reenviar email:', error);
                    showNotification('Erro ao reenviar email de acesso.', 'error');
                }
            });
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showNotification('Erro ao carregar usuários pendentes.', 'error');
    }
}

// Adicionar chamada da função quando a aba de convites for selecionada
document.querySelector('[data-tab="invitations"]').addEventListener('click', loadPendingUsers);

// Carregar usuários pendentes na inicialização se a aba de convites estiver ativa
if (!document.getElementById('invitations-tab').classList.contains('hidden')) {
    loadPendingUsers();
} 