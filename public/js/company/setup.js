document.addEventListener('DOMContentLoaded', async function() {
    // Elementos da página
    const invitesList = document.getElementById('invitesList');
    const inviteCodeInput = document.getElementById('inviteCode');
    const validateInviteBtn = document.getElementById('validateInviteBtn');
    const createCompanyBtn = document.getElementById('createCompanyBtn');
    const logoffBtn = document.getElementById('logoffBtn');
    const existingCompaniesSection = document.getElementById('existingCompaniesSection');
    const companiesList = document.getElementById('companiesList');
    const createCompanySection = document.getElementById('createCompanySection');
    const inviteCodeSection = document.getElementById('inviteCodeSection');
    const showInviteCodeBtn = document.getElementById('showInviteCodeBtn');
    const inviteCodeForm = document.getElementById('inviteCodeForm');

    // Função para mostrar mensagens de erro
    function showError(message) {
        alert(message);
    }

    // Função para mostrar mensagens de sucesso
    function showSuccess(message) {
        alert(message);
    }

    // Função para buscar empresas do usuário
    async function fetchUserCompanies() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch('/api/companies/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Erro ao buscar empresas:', error);
                return [];
            }

            const data = await response.json();
            console.log('Empresas do usuário:', data);
            
            if (data.success && data.data && data.data.length > 0) {
                return data.data;
            }
            
            return [];
        } catch (error) {
            console.error('Erro ao buscar empresas do usuário:', error);
            return [];
        }
    }

    // Função para renderizar lista de empresas existentes
    function renderCompaniesList(companies) {
        if (!companies || companies.length === 0 || !Array.isArray(companies)) {
            existingCompaniesSection.classList.add('hidden');
            createCompanySection.classList.remove('hidden');
            return;
        }

        // Filtrar empresas nulas e validar dados
        const validCompanies = companies.filter(company => company && company.companyName);

        if (validCompanies.length === 0) {
            existingCompaniesSection.classList.add('hidden');
            createCompanySection.classList.remove('hidden');
            return;
        }

        existingCompaniesSection.classList.remove('hidden');

        companiesList.innerHTML = validCompanies.map(company => `
            <div class="dashboard-card p-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                    <h4 class="font-medium">${company.companyName}</h4>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs text-muted">${company.businessType || 'N/A'}</span>
                        <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span class="text-xs company-status status-${company.companyStatus.toLowerCase()}">${getStatusTranslation(company.companyStatus)}</span>
                    </div>
                </div>
                <button 
                    class="btn btn-primary btn-sm"
                    onclick="selectCompany('${company._id}')"
                >
                    Selecionar
                </button>
            </div>
        `).join('');
    }

    // Função para traduzir status
    function getStatusTranslation(status) {
        const translations = {
            'Draft': 'Rascunho',
            'Pendente': 'Pendente',
            'Ativa': 'Ativa',
            'Inativa': 'Inativa'
        };
        return translations[status] || status;
    }

    // Função para selecionar uma empresa
    function selectCompany(companyId) {
        // Redirecionar para a página de planos com o ID da empresa
        window.location.href = `/pages/company/plans.html?companyId=${companyId}`;
    }

    // Função para buscar convites pendentes
    async function fetchPendingInvites() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            console.log('Buscando convites pendentes...');

            const response = await fetch('/api/invitations/pending', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();
            console.log('Resposta dos convites:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao buscar convites');
            }

            if (!data.invitations) {
                console.log('Nenhum convite encontrado');
                return [];
            }

            return data.invitations;
        } catch (error) {
            console.error('Erro ao buscar convites:', error);
            return [];
        }
    }

    // Função para renderizar lista de convites
    function renderInvitesList(invites) {
        const invitesList = document.getElementById('invitesList');

        if (!invites || invites.length === 0) {
            invitesList.innerHTML = `
                <div class="text-center text-sm text-muted py-4">
                    Nenhum convite pendente encontrado
                </div>
            `;
            return;
        }

        invitesList.innerHTML = invites.map(invite => `
            <div class="dashboard-card p-4 space-y-2">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-medium">${invite.companyName}</h3>
                        <p class="text-sm text-muted">Enviado por: ${invite.senderName}</p>
                    </div>
                    <button 
                        class="btn btn-primary btn-sm"
                        onclick="acceptInvite('${invite.code}')"
                    >
                        Aceitar
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Função para validar código do convite
    async function validateInvite(code) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch(`/api/invites/validate/${code}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Código de convite inválido');
            }

            return data.invite;
        } catch (error) {
            console.error('Erro ao validar convite:', error);
            throw error;
        }
    }

    // Função para aceitar convite
    async function acceptInvite(code) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch(`/api/invites/accept/${code}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao aceitar convite');
            }

            showSuccess('Convite aceito com sucesso!');
            window.location.href = '/pages/dashboard.html';
        } catch (error) {
            console.error('Erro ao aceitar convite:', error);
            showError(error.message || 'Erro ao aceitar convite');
        }
    }

    // Carregar convites pendentes
    async function loadPendingInvites() {
        try {
            const invites = await fetchPendingInvites();
            renderInvitesList(invites);
        } catch (error) {
            console.error('Erro ao carregar convites:', error);
            invitesList.innerHTML = `
                <div class="text-center text-sm text-muted py-4">
                    Erro ao carregar convites
                </div>
            `;
        }
    }

    // Carregar empresas do usuário
    async function loadUserCompanies() {
        try {
            const companies = await fetchUserCompanies();
            renderCompaniesList(companies);
        } catch (error) {
            console.error('Erro ao carregar empresas do usuário:', error);
        }
    }

    // Inicializar página
    async function initializePage() {
        await Promise.all([
            loadPendingInvites(),
            loadUserCompanies()
        ]);
    }

    // Inicializar página
    await initializePage();

    // Event Listeners
    if (validateInviteBtn) {
        validateInviteBtn.addEventListener('click', async () => {
            const code = inviteCodeInput.value.trim();
            if (!code) {
                showError('Por favor, digite o código do convite');
                return;
            }

            try {
                const invite = await validateInvite(code);
                if (confirm(`Deseja aceitar o convite para a empresa ${invite.companyName}?`)) {
                    await acceptInvite(code);
                }
            } catch (error) {
                showError(error.message || 'Código de convite inválido');
            }
        });
    }

    if (createCompanyBtn) {
        createCompanyBtn.addEventListener('click', () => {
            window.location.href = '/pages/company/create.html';
        });
    }

    // Função para fazer logoff
    async function handleLogoff() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            // Mesmo se der erro, vamos limpar o token e redirecionar
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Erro ao fazer logoff:', error);
            // Mesmo com erro, redirecionar para login
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
    }

    // Adicionar evento de click no botão de logoff
    if (logoffBtn) {
        logoffBtn.addEventListener('click', handleLogoff);
    }

    // Expor funções globalmente
    window.acceptInvite = acceptInvite;
    window.selectCompany = selectCompany;
}); 