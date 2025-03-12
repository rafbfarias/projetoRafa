document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('companyForm');
    const backBtn = document.getElementById('backBtn');
    const logoffBtn = document.getElementById('logoffBtn');
    const taxIdInput = document.getElementById('taxId');
    const phoneInput = document.getElementById('phone');
    const businessTypeCards = document.querySelectorAll('input[name="businessType"]');
    const otherBusinessTypeContainer = document.getElementById('otherBusinessTypeContainer');
    const otherBusinessTypeInput = document.getElementById('otherBusinessType');

    // Áreas da página
    const companyFormSection = document.getElementById('companyFormSection');
    const existingCompaniesSection = document.getElementById('existingCompaniesSection');
    const pageTitle = document.getElementById('pageTitle');
    const companiesList = document.getElementById('companiesList');
    const companyTemplate = document.getElementById('companyTemplate');
    
    // Estado da página
    let hasExistingCompanies = false;

    // Função para mostrar mensagens
    function showMessage(message, isError = false) {
        alert(message);
    }

    // Função para formatar números (remove tudo que não é dígito)
    function formatNumbers(value) {
        return value.replace(/\D/g, '');
    }

    // Função para verificar se existem empresas associadas ao usuário
    async function checkExistingCompanies() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('Token não encontrado, usuário não autenticado');
                return;
            }

            const response = await fetch('/api/companies/user', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.data && data.data.length > 0) {
                    // Usuário já tem empresas
                    hasExistingCompanies = true;
                    renderExistingCompanies(data.data);
                    
                    // Atualizar UI
                    existingCompaniesSection.classList.remove('hidden');
                    companyFormSection.classList.add('hidden');
                    pageTitle.textContent = 'Selecionar Empresa';
                    console.log('Usuário já possui empresas:', data.data);
                } else {
                    console.log('Usuário não tem empresas existentes');
                }
            } else {
                console.error('Erro ao verificar empresas existentes:', response.status);
            }
        } catch (error) {
            console.error('Erro ao verificar empresas existentes:', error);
        }
    }

    // Função para renderizar empresas existentes
    function renderExistingCompanies(companies) {
        // Limpar a lista
        companiesList.innerHTML = '';
        
        // Adicionar cada empresa à lista
        companies.forEach(company => {
            const clone = companyTemplate.content.cloneNode(true);
            
            // Preencher dados
            clone.querySelector('.company-name').textContent = company.companyName;
            clone.querySelector('.company-business-type').textContent = company.businessType;
            
            // Status
            const statusElement = clone.querySelector('.company-status');
            statusElement.textContent = getStatusTranslation(company.companyStatus);
            statusElement.className = `company-status status-${company.companyStatus.toLowerCase()}`;
            
            // Adicionar ID à empresa
            const companyItem = clone.querySelector('.company-item');
            companyItem.dataset.id = company._id;
            
            // Adicionar evento de clique no botão
            const selectBtn = clone.querySelector('.select-company-btn');
            selectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                selectCompany(company._id);
            });
            
            companiesList.appendChild(clone);
        });
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
        // Redirecionar para a página de planos ou dashboard dependendo do status
        window.location.href = '/pages/company/plans.html?companyId=' + companyId;
    }

    // Verificar empresas existentes ao carregar a página
    checkExistingCompanies();

    // Setup event listeners
    if (taxIdInput) {
        taxIdInput.addEventListener('input', function() {
            this.value = formatNumbers(this.value);
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = formatNumbers(this.value);
        });
    }

    // Gestão do tipo de negócio "Outro"
    businessTypeCards.forEach(card => {
        // Estilizar o card selecionado
        card.addEventListener('change', function() {
            // Remover estilo de todos os cards
            businessTypeCards.forEach(c => {
                const parentCard = c.closest('.dashboard-card');
                parentCard.classList.remove('border-brand-600');
                parentCard.classList.add('border-transparent');
            });
            
            // Adicionar estilo ao card selecionado
            const parentCard = this.closest('.dashboard-card');
            parentCard.classList.remove('border-transparent');
            parentCard.classList.add('border-brand-600');
            
            // Mostrar/esconder o campo de outro tipo de negócio
            if (this.value === 'other') {
                otherBusinessTypeContainer.classList.remove('hidden');
            } else {
                otherBusinessTypeContainer.classList.add('hidden');
            }
        });
        
        // Inicialmente, estilizar o card selecionado (normalmente o primeiro)
        if (card.checked) {
            const parentCard = card.closest('.dashboard-card');
            parentCard.classList.remove('border-transparent');
            parentCard.classList.add('border-brand-600');
            
            // Mostrar/esconder o campo de outro tipo de negócio
            if (card.value === 'other') {
                otherBusinessTypeContainer.classList.remove('hidden');
            }
        }
    });

    // Função para obter dados do formulário
    function getFormData() {
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        return data;
    }

    // Função para obter o tipo de negócio selecionado
    function getSelectedBusinessType() {
        for (const card of businessTypeCards) {
            if (card.checked) {
                return card.value;
            }
        }
        return null;
    }

    // Função para lidar com o envio do formulário
    async function handleSubmit(event) {
        event.preventDefault();
        try {
            // Obter dados do formulário
            const rawData = getFormData();
            const businessType = getSelectedBusinessType();
            console.log('Dados do formulário (raw):', rawData);
            
            // Validar tipo de negócio "outro"
            if (businessType === 'other') {
                if (!rawData.otherBusinessType) {
                    throw new Error('Por favor, especifique o tipo de negócio');
                }
                rawData.businessType = rawData.otherBusinessType;
            }
            delete rawData.otherBusinessType;

            // Construir endereço completo
            const fullAddress = [
                rawData.street,
                rawData.number,
                rawData.complement
            ].filter(Boolean).join(', ');
            console.log('Endereço completo construído:', fullAddress);
            
            // Mapear campos do formulário para o modelo
            const companyData = {
                companyName: rawData.companyName,
                businessType: rawData.businessType,
                companyVATNumber: rawData.taxId,
                companyFullAddress: fullAddress,
                companyPostalCode: rawData.postalCode,
                companyCity: rawData.city,
                companyCountry: rawData.country || 'Portugal'
                // Status será definido como 'Draft' pelo backend
            };
            console.log('Dados a serem enviados:', companyData);

            // Enviar dados para a API
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token não encontrado');
                }
            console.log('Token encontrado:', token);

                const response = await fetch('/api/companies', {
                    method: 'POST',
                    headers: {
                    'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                body: JSON.stringify(companyData),
                    credentials: 'include'
                });

            console.log('Status da resposta:', response.status);

                if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.text(); // Usar text primeiro para debugar
                    console.log('Resposta raw:', errorData);
                    errorData = errorData ? JSON.parse(errorData) : {};
                } catch (e) {
                    console.error('Erro ao parsear resposta:', e);
                    errorData = {
                        error: 'Erro desconhecido',
                        message: response.statusText
                    };
                }
                
                console.error('Resposta da API:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });

                // Se usuário já tem empresas, mostrar seção de seleção
                if (errorData.shouldSelectExisting) {
                    showMessage('Você já possui empresas registradas. Redirecionando para seleção...');
                    if (errorData.companies && errorData.companies.length > 0) {
                        renderExistingCompanies(errorData.companies);
                        existingCompaniesSection.classList.remove('hidden');
                        companyFormSection.classList.add('hidden');
                        pageTitle.textContent = 'Selecionar Empresa';
                        return;
                    }
                }
                
                // Outro erro qualquer
                let errorMessage = 'Erro ao criar empresa: ';
                if (errorData.error) {
                    errorMessage += errorData.error;
                    if (errorData.details) {
                        errorMessage += ` - ${JSON.stringify(errorData.details)}`;
                    }
                } else if (errorData.message) {
                    errorMessage += errorData.message;
                } else {
                    errorMessage += 'Erro desconhecido';
                }
                
                throw new Error(errorMessage);
            }

            const responseData = await response.json();
            console.log('Resposta de sucesso:', responseData);
            
            showMessage('Empresa criada com sucesso! Redirecionando para a página de planos...');
            
            // Redirecionar para a página de planos com o ID da empresa
            if (responseData.data && responseData.data._id) {
                window.location.href = `/pages/company/plans.html?companyId=${responseData.data._id}`;
            } else {
                window.location.href = '/pages/company/plans.html';
            }
        } catch (error) {
            console.error('Erro detalhado:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            showMessage(`Erro ao criar empresa: ${error.message}`, true);
        }
    }

    // Adicionar event listener ao formulário
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }

    // Event Listener para o botão voltar
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/pages/company/setup.html';
        });
    }

    // Função para fazer logoff
    async function handleLogoff() {
        try {
            // Remover token
            localStorage.removeItem('token');
            
            // Fazer logout na API
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            // Redirecionar para a página de login
            window.location.href = '/login.html';
        }
    }

    // Event Listener para o botão de logoff
    if (logoffBtn) {
        logoffBtn.addEventListener('click', handleLogoff);
    }
}); 