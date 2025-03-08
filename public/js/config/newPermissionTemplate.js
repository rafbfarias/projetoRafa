document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const templateForm = document.getElementById('template-form');
    const btnAddPage = document.getElementById('btn-add-page');
    const btnSaveTemplate = document.getElementById('btn-save-template');
    const pagesContainer = document.getElementById('pages-container');
    const templateArea = document.getElementById('template-area');
    const pageTitle = document.querySelector('h1');
    const pageSubtitle = document.querySelector('p.text-muted');
    
    // Modal de páginas do sistema
    const systemPagesModal = document.getElementById('system-pages-modal');
    const systemPagesContainer = document.getElementById('system-pages-container');
    const searchSystemPages = document.getElementById('search-system-pages');
    const closeSystemPagesModal = document.getElementById('close-system-pages-modal');
    const cancelSystemPagesModal = document.getElementById('cancel-system-pages-modal');
    
    // Templates
    const pageTemplate = document.getElementById('page-template');
    const sectionTemplate = document.getElementById('section-template');
    
    // Variáveis de estado
    let pageCounter = 0;
    let sectionCounter = 0;
    let isEditing = false;
    let currentTemplateId = null;
    let systemPages = [];
    let currentPageItem = null; // Para rastrear qual página está sendo editada no modal
    
    // Verificar se estamos editando um template existente
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
        currentTemplateId = urlParams.get('id');
        isEditing = true;
        pageTitle.textContent = 'Editar Template de Permissão';
        pageSubtitle.textContent = 'Atualize as páginas e permissões deste template';
        
        // Carregar dados do template
        loadTemplateData(currentTemplateId);
    }
    
    // Carregar áreas disponíveis e páginas do sistema
    loadAreas();
    loadSystemPages();
    
    // Se não estiver editando, adicionar primeira página por padrão
    if (!isEditing) {
        addNewPage();
    }
    
    // Event Listeners
    btnAddPage.addEventListener('click', addNewPage);
    btnSaveTemplate.addEventListener('click', saveTemplate);
    closeSystemPagesModal.addEventListener('click', closeModal);
    cancelSystemPagesModal.addEventListener('click', closeModal);
    searchSystemPages.addEventListener('input', filterSystemPages);
    
    /**
     * Carrega as páginas do sistema
     */
    async function loadSystemPages() {
        try {
            const response = await fetch('/api/permission-templates/system-pages');
            if (!response.ok) {
                throw new Error('Erro ao carregar páginas do sistema');
            }
            
            systemPages = await response.json();
        } catch (error) {
            console.error('Erro ao carregar páginas do sistema:', error);
            showToast('Erro ao carregar páginas do sistema', 'error');
        }
    }
    
    /**
     * Abre o modal de seleção de páginas do sistema
     * @param {HTMLElement} pageItem - O elemento da página que está sendo editada
     */
    function openSystemPagesModal(pageItem) {
        currentPageItem = pageItem;
        renderSystemPages();
        systemPagesModal.classList.remove('hidden');
    }
    
    /**
     * Fecha o modal de seleção de páginas
     */
    function closeModal() {
        systemPagesModal.classList.add('hidden');
        currentPageItem = null;
    }
    
    /**
     * Filtra as páginas do sistema com base no termo de busca
     */
    function filterSystemPages() {
        const searchTerm = searchSystemPages.value.toLowerCase();
        renderSystemPages(searchTerm);
    }
    
    /**
     * Renderiza as páginas do sistema no modal
     * @param {string} searchTerm - Termo de busca opcional
     */
    function renderSystemPages(searchTerm = '') {
        systemPagesContainer.innerHTML = '';
        
        if (!systemPages || systemPages.length === 0) {
            systemPagesContainer.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 py-4">
                    Nenhuma página encontrada
                </div>
            `;
            return;
        }
        
        // Filtrar páginas se houver termo de busca
        const filteredPages = searchTerm 
            ? systemPages.filter(page => 
                page.pageName.toLowerCase().includes(searchTerm) || 
                page.path.toLowerCase().includes(searchTerm))
            : systemPages;
        
        if (filteredPages.length === 0) {
            systemPagesContainer.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 py-4">
                    Nenhuma página encontrada para "${searchTerm}"
                </div>
            `;
            return;
        }
        
        // Agrupar páginas por diretório
        const pagesByDirectory = {};
        filteredPages.forEach(page => {
            const pathParts = page.path.split('/');
            const directory = pathParts.length > 2 ? pathParts[2] : 'Outros';
            
            if (!pagesByDirectory[directory]) {
                pagesByDirectory[directory] = [];
            }
            
            pagesByDirectory[directory].push(page);
        });
        
        // Renderizar páginas agrupadas
        Object.keys(pagesByDirectory).sort().forEach(directory => {
            const directoryElement = document.createElement('div');
            directoryElement.className = 'mb-4';
            directoryElement.innerHTML = `
                <h4 class="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">${directory.charAt(0).toUpperCase() + directory.slice(1)}</h4>
                <div class="space-y-1 pl-2"></div>
            `;
            
            const pagesContainer = directoryElement.querySelector('div');
            
            pagesByDirectory[directory].forEach(page => {
                const pageElement = document.createElement('div');
                pageElement.className = 'p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center';
                pageElement.innerHTML = `
                    <i class="fas fa-file-alt text-blue-500 mr-2"></i>
                    <div>
                        <div class="font-medium">${page.pageName}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">${page.path}</div>
                    </div>
                `;
                
                pageElement.addEventListener('click', () => {
                    selectSystemPage(page);
                });
                
                pagesContainer.appendChild(pageElement);
            });
            
            systemPagesContainer.appendChild(directoryElement);
        });
    }
    
    /**
     * Seleciona uma página do sistema e preenche os campos da página
     * @param {Object} page - Dados da página selecionada
     */
    function selectSystemPage(page) {
        if (!currentPageItem) return;
        
        // Preencher campos da página
        currentPageItem.querySelector('input[name="pageId"]').value = page.pageId;
        currentPageItem.querySelector('input[name="pageName"]').value = page.pageName;
        currentPageItem.querySelector('input[name="path"]').value = page.path;
        
        // Fechar modal
        closeModal();
        
        // Mostrar mensagem de sucesso
        showToast('Página selecionada com sucesso', 'success');
    }
    
    /**
     * Carrega os dados do template para edição
     * @param {string} templateId - ID do template a ser editado
     */
    async function loadTemplateData(templateId) {
        try {
            const response = await fetch(`/api/permission-templates/${templateId}`);
            if (!response.ok) {
                throw new Error('Erro ao carregar template');
            }
            
            const template = await response.json();
            
            // Preencher campos do formulário
            document.getElementById('template-name').value = template.templateName;
            document.getElementById('template-description').value = template.templateDescription || '';
            document.getElementById('template-status').value = template.status || 'Ativo';
            
            // Aguardar o carregamento das áreas para selecionar a correta
            setTimeout(() => {
                document.getElementById('template-area').value = template.area;
            }, 500);
            
            // Limpar e adicionar páginas
            pagesContainer.innerHTML = '';
            
            if (template.pages && template.pages.length > 0) {
                template.pages.forEach(page => {
                    addPageWithData(page);
                });
            } else {
                addNewPage();
            }
        } catch (error) {
            console.error('Erro ao carregar template:', error);
            showToast('Erro ao carregar template. Por favor, tente novamente.', 'error');
        }
    }
    
    /**
     * Adiciona uma página com dados pré-preenchidos
     * @param {Object} pageData - Dados da página
     */
    function addPageWithData(pageData) {
        pageCounter++;
        
        // Clonar o template
        const pageNode = document.importNode(pageTemplate.content, true);
        const pageItem = pageNode.querySelector('.page-item');
        
        // Adicionar ID único
        pageItem.dataset.pageId = `page-${pageCounter}`;
        
        // Preencher dados
        pageItem.querySelector('input[name="pageId"]').value = pageData.pageId;
        pageItem.querySelector('input[name="pageName"]').value = pageData.pageName;
        pageItem.querySelector('input[name="path"]').value = pageData.path;
        
        // Configurar checkboxes de ações
        if (pageData.defaultActions && pageData.defaultActions.length > 0) {
            const actionMap = {};
            pageData.defaultActions.forEach(action => {
                actionMap[action.actionType] = action.allowed;
            });
            
            pageItem.querySelector('input[name="action-view"]').checked = actionMap.view !== false;
            pageItem.querySelector('input[name="action-create"]').checked = actionMap.create === true;
            pageItem.querySelector('input[name="action-edit"]').checked = actionMap.edit === true;
            pageItem.querySelector('input[name="action-delete"]').checked = actionMap.delete === true;
            pageItem.querySelector('input[name="action-approve"]').checked = actionMap.approve === true;
            pageItem.querySelector('input[name="action-export"]').checked = actionMap.export === true;
        }
        
        // Configurar botões
        const btnRemovePage = pageItem.querySelector('.btn-remove-page');
        const btnAddSection = pageItem.querySelector('.btn-add-section');
        const btnSelectPage = pageItem.querySelector('.btn-select-page');
        
        btnRemovePage.addEventListener('click', function() {
            if (document.querySelectorAll('.page-item').length > 1) {
                pageItem.remove();
            } else {
                showToast('Você deve ter pelo menos uma página no template', 'warning');
            }
        });
        
        btnAddSection.addEventListener('click', function() {
            addNewSection(pageItem);
        });
        
        btnSelectPage.addEventListener('click', function() {
            openSystemPagesModal(pageItem);
        });
        
        // Adicionar seções, se existirem
        if (pageData.sections && pageData.sections.length > 0) {
            const sectionsContainer = pageItem.querySelector('.sections-container');
            pageData.sections.forEach(section => {
                addSectionWithData(sectionsContainer, section);
            });
        }
        
        // Adicionar ao container
        pagesContainer.appendChild(pageItem);
    }
    
    /**
     * Adiciona uma seção com dados pré-preenchidos
     * @param {HTMLElement} sectionsContainer - Container de seções
     * @param {Object} sectionData - Dados da seção
     */
    function addSectionWithData(sectionsContainer, sectionData) {
        sectionCounter++;
        
        // Clonar o template
        const sectionNode = document.importNode(sectionTemplate.content, true);
        const sectionItem = sectionNode.querySelector('.section-item');
        
        // Adicionar ID único
        sectionItem.dataset.sectionId = `section-${sectionCounter}`;
        
        // Preencher dados
        sectionItem.querySelector('input[name="sectionId"]').value = sectionData.sectionId;
        sectionItem.querySelector('input[name="sectionName"]').value = sectionData.sectionName;
        
        // Configurar checkboxes de ações
        if (sectionData.defaultActions && sectionData.defaultActions.length > 0) {
            const actionMap = {};
            sectionData.defaultActions.forEach(action => {
                actionMap[action.actionType] = action.allowed;
            });
            
            sectionItem.querySelector('input[name="section-action-view"]').checked = actionMap.view === true;
            sectionItem.querySelector('input[name="section-action-create"]').checked = actionMap.create === true;
            sectionItem.querySelector('input[name="section-action-edit"]').checked = actionMap.edit === true;
            sectionItem.querySelector('input[name="section-action-delete"]').checked = actionMap.delete === true;
            sectionItem.querySelector('input[name="section-action-approve"]').checked = actionMap.approve === true;
            sectionItem.querySelector('input[name="section-action-export"]').checked = actionMap.export === true;
        }
        
        // Configurar botão de remover
        const btnRemoveSection = sectionItem.querySelector('.btn-remove-section');
        btnRemoveSection.addEventListener('click', function() {
            sectionItem.remove();
        });
        
        // Adicionar à página
        sectionsContainer.appendChild(sectionItem);
    }
    
    /**
     * Carrega as áreas disponíveis para o select
     */
    function loadAreas() {
        fetch('/api/permission-templates/areas')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar áreas');
                }
                return response.json();
            })
            .then(data => {
                // Limpar opções existentes, exceto a primeira
                while (templateArea.options.length > 1) {
                    templateArea.remove(1);
                }
                
                // Adicionar novas opções
                data.forEach(area => {
                    const option = document.createElement('option');
                    option.value = area;
                    option.textContent = area;
                    templateArea.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar áreas:', error);
                showToast('Erro ao carregar áreas. Por favor, tente novamente.', 'error');
            });
    }
    
    /**
     * Adiciona uma nova página ao formulário
     */
    function addNewPage() {
        pageCounter++;
        
        // Clonar o template
        const pageNode = document.importNode(pageTemplate.content, true);
        const pageItem = pageNode.querySelector('.page-item');
        
        // Adicionar ID único
        pageItem.dataset.pageId = `page-${pageCounter}`;
        
        // Configurar botões
        const btnRemovePage = pageItem.querySelector('.btn-remove-page');
        const btnAddSection = pageItem.querySelector('.btn-add-section');
        const btnSelectPage = pageItem.querySelector('.btn-select-page');
        
        btnRemovePage.addEventListener('click', function() {
            if (document.querySelectorAll('.page-item').length > 1) {
                pageItem.remove();
            } else {
                showToast('Você deve ter pelo menos uma página no template', 'warning');
            }
        });
        
        btnAddSection.addEventListener('click', function() {
            addNewSection(pageItem);
        });
        
        btnSelectPage.addEventListener('click', function() {
            openSystemPagesModal(pageItem);
        });
        
        // Adicionar ao container
        pagesContainer.appendChild(pageItem);
    }
    
    /**
     * Adiciona uma nova seção a uma página
     * @param {HTMLElement} pageItem - O elemento da página
     */
    function addNewSection(pageItem) {
        sectionCounter++;
        
        // Clonar o template
        const sectionNode = document.importNode(sectionTemplate.content, true);
        const sectionItem = sectionNode.querySelector('.section-item');
        
        // Adicionar ID único
        sectionItem.dataset.sectionId = `section-${sectionCounter}`;
        
        // Configurar botão de remover
        const btnRemoveSection = sectionItem.querySelector('.btn-remove-section');
        btnRemoveSection.addEventListener('click', function() {
            sectionItem.remove();
        });
        
        // Adicionar à página
        const sectionsContainer = pageItem.querySelector('.sections-container');
        sectionsContainer.appendChild(sectionItem);
    }
    
    /**
     * Salva o template de permissão
     */
    function saveTemplate() {
        // Validar formulário
        if (!validateForm()) {
            return;
        }
        
        // Coletar dados do formulário
        const templateData = collectFormData();
        
        // Definir método e URL com base em se estamos editando ou criando
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `/api/permission-templates/${currentTemplateId}` : '/api/permission-templates';
        
        // Enviar para o servidor
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(templateData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao salvar template');
            }
            return response.json();
        })
        .then(data => {
            showToast(`Template de permissão ${isEditing ? 'atualizado' : 'salvo'} com sucesso!`, 'success');
            
            // Redirecionar após 1 segundo
            setTimeout(() => {
                window.location.href = '/pages/config/permission-templates.html';
            }, 1000);
        })
        .catch(error => {
            console.error('Erro ao salvar template:', error);
            showToast('Erro ao salvar template. Por favor, tente novamente.', 'error');
        });
    }
    
    /**
     * Valida o formulário antes de enviar
     * @returns {boolean} - Indica se o formulário é válido
     */
    function validateForm() {
        // Validar campos obrigatórios do template
        const templateName = document.getElementById('template-name').value.trim();
        const area = templateArea.value;
        
        if (!templateName) {
            showToast('Por favor, informe o nome do template', 'warning');
            return false;
        }
        
        if (!area) {
            showToast('Por favor, selecione uma área', 'warning');
            return false;
        }
        
        // Validar páginas
        const pages = document.querySelectorAll('.page-item');
        if (pages.length === 0) {
            showToast('Adicione pelo menos uma página ao template', 'warning');
            return false;
        }
        
        // Validar campos obrigatórios de cada página
        let isValid = true;
        pages.forEach(page => {
            const pageId = page.querySelector('input[name="pageId"]').value.trim();
            const pageName = page.querySelector('input[name="pageName"]').value.trim();
            const path = page.querySelector('input[name="path"]').value.trim();
            
            if (!pageId || !pageName || !path) {
                showToast('Preencha todos os campos obrigatórios das páginas', 'warning');
                isValid = false;
            }
            
            // Validar campos obrigatórios de cada seção
            const sections = page.querySelectorAll('.section-item');
            sections.forEach(section => {
                const sectionId = section.querySelector('input[name="sectionId"]').value.trim();
                const sectionName = section.querySelector('input[name="sectionName"]').value.trim();
                
                if (!sectionId || !sectionName) {
                    showToast('Preencha todos os campos obrigatórios das seções', 'warning');
                    isValid = false;
                }
            });
        });
        
        return isValid;
    }
    
    /**
     * Coleta os dados do formulário
     * @returns {Object} - Objeto com os dados do template
     */
    function collectFormData() {
        // Dados básicos do template
        const templateData = {
            name: document.getElementById('template-name').value.trim(),
            area: templateArea.value,
            description: document.getElementById('template-description').value.trim(),
            status: document.getElementById('template-status').value,
            pages: []
        };
        
        // Coletar dados das páginas
        const pageItems = document.querySelectorAll('.page-item');
        pageItems.forEach(pageItem => {
            const pageData = {
                id: pageItem.querySelector('input[name="pageId"]').value.trim(),
                name: pageItem.querySelector('input[name="pageName"]').value.trim(),
                path: pageItem.querySelector('input[name="path"]').value.trim(),
                actions: {
                    view: pageItem.querySelector('input[name="action-view"]').checked,
                    create: pageItem.querySelector('input[name="action-create"]').checked,
                    edit: pageItem.querySelector('input[name="action-edit"]').checked,
                    delete: pageItem.querySelector('input[name="action-delete"]').checked,
                    approve: pageItem.querySelector('input[name="action-approve"]').checked,
                    export: pageItem.querySelector('input[name="action-export"]').checked
                },
                sections: []
            };
            
            // Coletar dados das seções
            const sectionItems = pageItem.querySelectorAll('.section-item');
            sectionItems.forEach(sectionItem => {
                const sectionData = {
                    id: sectionItem.querySelector('input[name="sectionId"]').value.trim(),
                    name: sectionItem.querySelector('input[name="sectionName"]').value.trim(),
                    actions: {
                        view: sectionItem.querySelector('input[name="section-action-view"]').checked,
                        create: sectionItem.querySelector('input[name="section-action-create"]').checked,
                        edit: sectionItem.querySelector('input[name="section-action-edit"]').checked,
                        delete: sectionItem.querySelector('input[name="section-action-delete"]').checked,
                        approve: sectionItem.querySelector('input[name="section-action-approve"]').checked,
                        export: sectionItem.querySelector('input[name="section-action-export"]').checked
                    }
                };
                
                pageData.sections.push(sectionData);
            });
            
            templateData.pages.push(pageData);
        });
        
        return templateData;
    }
}); 