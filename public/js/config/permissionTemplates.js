document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const templatesTableBody = document.getElementById('templates-table-body');
    const templatesLoading = document.getElementById('templates-loading');
    const templatesEmpty = document.getElementById('templates-empty');
    const newTemplatePage = document.getElementById('new-template-page');
    const templateFormTitle = document.getElementById('template-form-title');
    const templateForm = document.getElementById('template-form');
    const templateNameInput = document.getElementById('template-name');
    const templateAreaSelect = document.getElementById('template-area');
    const templateDescriptionInput = document.getElementById('template-description');
    const templateStatusSelect = document.getElementById('template-status');
    const pagesContainer = document.getElementById('pages-container');
    const btnNewTemplate = document.getElementById('btn-new-template');
    const btnCancelTemplate = document.getElementById('btn-cancel-template');
    const btnSaveTemplate = document.getElementById('btn-save-template');
    const btnAddPage = document.getElementById('btn-add-page');
    const filterArea = document.getElementById('filter-area');
    const filterStatus = document.getElementById('filter-status');
    const searchTemplate = document.getElementById('search-template');
    
    // Templates
    const pageTemplate = document.getElementById('page-template');
    const sectionTemplate = document.getElementById('section-template');
    
    // Variáveis de estado
    let templates = [];
    let areas = [];
    let systemPages = [];
    let currentTemplateId = null;
    let isEditing = false;
    
    // Inicialização
    init();
    
    // Função de inicialização
    function init() {
        loadAreas();
        loadTemplates();
        loadSystemPages();
        setupEventListeners();
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Botões principais
        btnNewTemplate.addEventListener('click', openNewTemplatePage);
        btnCancelTemplate.addEventListener('click', closeTemplatePage);
        btnSaveTemplate.addEventListener('click', handleFormSubmit);
        btnAddPage.addEventListener('click', addNewPage);
        
        // Filtros
        filterArea.addEventListener('change', applyFilters);
        filterStatus.addEventListener('change', applyFilters);
        searchTemplate.addEventListener('input', applyFilters);
        
        // Delegação de eventos para botões dinâmicos
        document.addEventListener('click', function(e) {
            // Botão de editar template
            if (e.target.closest('.btn-edit-template')) {
                const templateId = e.target.closest('.btn-edit-template').dataset.id;
                openEditTemplatePage(templateId);
            }
            
            // Botão de excluir template
            if (e.target.closest('.btn-delete-template')) {
                const templateId = e.target.closest('.btn-delete-template').dataset.id;
                confirmDeleteTemplate(templateId);
            }
            
            // Botão de remover página
            if (e.target.closest('.btn-remove-page')) {
                e.target.closest('.page-item').remove();
            }
            
            // Botão de selecionar página
            if (e.target.closest('.btn-select-page')) {
                const pageItem = e.target.closest('.page-item');
                showSystemPagesSelector(pageItem);
            }
            
            // Botão de adicionar seção
            if (e.target.closest('.btn-add-section')) {
                const pageItem = e.target.closest('.page-item');
                const sectionsContainer = pageItem.querySelector('.sections-container');
                addNewSection(sectionsContainer);
            }
            
            // Botão de remover seção
            if (e.target.closest('.btn-remove-section')) {
                e.target.closest('.section-item').remove();
            }
        });
    }
    
    // Carregar áreas disponíveis
    async function loadAreas() {
        try {
            console.log('Carregando áreas...');
            const response = await fetch('/api/permission-templates/areas');
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                areas = data.data;
                console.log('Áreas carregadas:', areas);
                
                // Preencher selects de área
                populateAreaSelects();
            } else {
                throw new Error(data.message || 'Erro desconhecido ao carregar áreas');
            }
        } catch (error) {
            console.error('Erro ao carregar áreas:', error);
            showToast('Erro ao carregar áreas: ' + error.message, 'error');
            
            // Usar áreas padrão em caso de erro
            areas = ['RH', 'Financeiro', 'Operacional', 'Administrativo', 'TI'];
            populateAreaSelects();
        }
    }
    
    // Preencher selects de área
    function populateAreaSelects() {
        // Select de filtro
        filterArea.innerHTML = '<option value="">Todas as áreas</option>';
        
        // Select do formulário
        templateAreaSelect.innerHTML = '<option value="">Selecione uma área</option>';
        
        // Adicionar opções
        areas.forEach(area => {
            const filterOption = document.createElement('option');
            filterOption.value = area;
            filterOption.textContent = area;
            filterArea.appendChild(filterOption);
            
            const formOption = document.createElement('option');
            formOption.value = area;
            formOption.textContent = area;
            templateAreaSelect.appendChild(formOption);
        });
    }
    
    // Carregar templates
    async function loadTemplates() {
        try {
            showLoading(true);
            console.log('Carregando templates...');
            
            const response = await fetch('/api/permission-templates');
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                templates = data.data || [];
                console.log('Templates carregados:', templates.length);
                renderTemplates(templates);
            } else {
                throw new Error(data.message || 'Erro desconhecido ao carregar templates');
            }
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
            showToast('Erro ao carregar templates: ' + error.message, 'error');
            templates = [];
            renderTemplates(templates);
        } finally {
            showLoading(false);
        }
    }
    
    // Renderizar templates na tabela
    function renderTemplates(templatesData) {
        templatesTableBody.innerHTML = '';
        
        if (templatesData.length === 0) {
            showEmpty(true);
            return;
        }
        
        showEmpty(false);
        
        templatesData.forEach(template => {
            const row = document.createElement('tr');
            
            // Formatar data de criação
            const createdAt = new Date(template.createdAt);
            const formattedDate = createdAt.toLocaleDateString('pt-BR') + ' ' + 
                                 createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${template.templateName}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${template.templateId}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        ${template.area}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">${template.pages.length} páginas</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        template.status === 'Ativo' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }">
                        ${template.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">${template.createdBy?.preferredName || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${formattedDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="btn-edit-template text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3" data-id="${template._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete-template text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" data-id="${template._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            templatesTableBody.appendChild(row);
        });
    }
    
    // Aplicar filtros
    function applyFilters() {
        const areaFilter = filterArea.value;
        const statusFilter = filterStatus.value;
        const searchFilter = searchTemplate.value.toLowerCase();
        
        const filteredTemplates = templates.filter(template => {
            // Filtro de área
            if (areaFilter && template.area !== areaFilter) {
                return false;
            }
            
            // Filtro de status
            if (statusFilter && template.status !== statusFilter) {
                return false;
            }
            
            // Filtro de busca
            if (searchFilter && !template.templateName.toLowerCase().includes(searchFilter)) {
                return false;
            }
            
            return true;
        });
        
        renderTemplates(filteredTemplates);
    }
    
    /**
     * Abre a página de novo template
     */
    function openNewTemplatePage() {
        // Redirecionar para a página separada de novo template
        window.location.href = '/pages/config/new-permission-template.html';
    }
    
    // Abrir página para editar template
    function openEditTemplatePage(templateId) {
        // Redirecionar para a página de edição com o ID do template
        window.location.href = `/pages/config/new-permission-template.html?id=${templateId}`;
    }
    
    // Fechar página de template
    function closeTemplatePage() {
        newTemplatePage.classList.add('hidden');
    }
    
    // Adicionar nova página
    function addNewPage() {
        const pageClone = document.importNode(pageTemplate.content, true);
        pagesContainer.appendChild(pageClone);
    }
    
    // Adicionar página com dados
    function addPageWithData(pageData) {
        const pageClone = document.importNode(pageTemplate.content, true);
        const pageItem = pageClone.querySelector('.page-item');
        
        // Preencher dados básicos
        pageItem.querySelector('input[name="pageId"]').value = pageData.pageId;
        pageItem.querySelector('input[name="pageName"]').value = pageData.pageName;
        pageItem.querySelector('input[name="path"]').value = pageData.path;
        
        // Preencher ações
        if (pageData.defaultActions && pageData.defaultActions.length > 0) {
            pageData.defaultActions.forEach(action => {
                const checkbox = pageItem.querySelector(`input[name="action-${action.actionType}"]`);
                if (checkbox) {
                    checkbox.checked = action.allowed;
                }
            });
        }
        
        // Preencher seções
        const sectionsContainer = pageItem.querySelector('.sections-container');
        if (pageData.sections && pageData.sections.length > 0) {
            pageData.sections.forEach(section => {
                addSectionWithData(sectionsContainer, section);
            });
        }
        
        pagesContainer.appendChild(pageClone);
    }
    
    // Adicionar nova seção
    function addNewSection(sectionsContainer) {
        const sectionClone = document.importNode(sectionTemplate.content, true);
        sectionsContainer.appendChild(sectionClone);
    }
    
    // Adicionar seção com dados
    function addSectionWithData(sectionsContainer, sectionData) {
        const sectionClone = document.importNode(sectionTemplate.content, true);
        const sectionItem = sectionClone.querySelector('.section-item');
        
        // Preencher dados básicos
        sectionItem.querySelector('input[name="sectionId"]').value = sectionData.sectionId;
        sectionItem.querySelector('input[name="sectionName"]').value = sectionData.sectionName;
        
        // Preencher ações
        if (sectionData.defaultActions && sectionData.defaultActions.length > 0) {
            sectionData.defaultActions.forEach(action => {
                const checkbox = sectionItem.querySelector(`input[name="section-action-${action.actionType}"]`);
                if (checkbox) {
                    checkbox.checked = action.allowed;
                }
            });
        }
        
        sectionsContainer.appendChild(sectionClone);
    }
    
    // Manipular envio do formulário
    async function handleFormSubmit(e) {
        if (e) e.preventDefault();
        
        try {
            // Validar formulário
            if (!validateForm()) {
                return;
            }
            
            // Construir dados do template
            const templateData = buildTemplateData();
            
            // Enviar dados
            let response;
            
            if (isEditing) {
                response = await fetch(`/api/permission-templates/${currentTemplateId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(templateData)
                });
            } else {
                response = await fetch('/api/permission-templates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(templateData)
                });
            }
            
            const data = await response.json();
            
            if (data.success) {
                showToast(isEditing ? 'Template atualizado com sucesso' : 'Template criado com sucesso', 'success');
                closeTemplatePage();
                loadTemplates();
            } else {
                showToast(data.message || 'Erro ao salvar template', 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar template:', error);
            showToast('Erro ao salvar template', 'error');
        }
    }
    
    // Validar formulário
    function validateForm() {
        // Validar campos básicos
        if (!templateNameInput.value.trim()) {
            showToast('Nome do template é obrigatório', 'error');
            templateNameInput.focus();
            return false;
        }
        
        if (!templateAreaSelect.value) {
            showToast('Área é obrigatória', 'error');
            templateAreaSelect.focus();
            return false;
        }
        
        // Validar páginas
        const pageItems = pagesContainer.querySelectorAll('.page-item');
        
        if (pageItems.length === 0) {
            showToast('Adicione pelo menos uma página', 'error');
            return false;
        }
        
        for (const pageItem of pageItems) {
            const pageId = pageItem.querySelector('input[name="pageId"]').value.trim();
            const pageName = pageItem.querySelector('input[name="pageName"]').value.trim();
            const path = pageItem.querySelector('input[name="path"]').value.trim();
            
            if (!pageId || !pageName || !path) {
                showToast('Preencha todos os campos obrigatórios da página', 'error');
                return false;
            }
            
            // Validar seções
            const sectionItems = pageItem.querySelectorAll('.section-item');
            
            for (const sectionItem of sectionItems) {
                const sectionId = sectionItem.querySelector('input[name="sectionId"]').value.trim();
                const sectionName = sectionItem.querySelector('input[name="sectionName"]').value.trim();
                
                if (!sectionId || !sectionName) {
                    showToast('Preencha todos os campos obrigatórios da seção', 'error');
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Construir dados do template
    function buildTemplateData() {
        const templateData = {
            templateName: templateNameInput.value.trim(),
            area: templateAreaSelect.value,
            templateDescription: templateDescriptionInput.value.trim(),
            status: templateStatusSelect.value,
            pages: []
        };
        
        // Adicionar páginas
        const pageItems = pagesContainer.querySelectorAll('.page-item');
        
        pageItems.forEach(pageItem => {
            const page = {
                pageId: pageItem.querySelector('input[name="pageId"]').value.trim(),
                pageName: pageItem.querySelector('input[name="pageName"]').value.trim(),
                path: pageItem.querySelector('input[name="path"]').value.trim(),
                defaultActions: [],
                sections: []
            };
            
            // Adicionar ações
            const actionTypes = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
            
            actionTypes.forEach(actionType => {
                const checkbox = pageItem.querySelector(`input[name="action-${actionType}"]`);
                
                if (checkbox) {
                    page.defaultActions.push({
                        actionType,
                        allowed: checkbox.checked
                    });
                }
            });
            
            // Adicionar seções
            const sectionItems = pageItem.querySelectorAll('.section-item');
            
            sectionItems.forEach(sectionItem => {
                const section = {
                    sectionId: sectionItem.querySelector('input[name="sectionId"]').value.trim(),
                    sectionName: sectionItem.querySelector('input[name="sectionName"]').value.trim(),
                    defaultActions: []
                };
                
                // Adicionar ações da seção
                actionTypes.forEach(actionType => {
                    const checkbox = sectionItem.querySelector(`input[name="section-action-${actionType}"]`);
                    
                    if (checkbox) {
                        section.defaultActions.push({
                            actionType,
                            allowed: checkbox.checked
                        });
                    }
                });
                
                page.sections.push(section);
            });
            
            templateData.pages.push(page);
        });
        
        return templateData;
    }
    
    // Confirmar exclusão de template
    function confirmDeleteTemplate(templateId) {
        if (confirm('Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.')) {
            deleteTemplate(templateId);
        }
    }
    
    // Excluir template
    async function deleteTemplate(templateId) {
        try {
            const response = await fetch(`/api/permission-templates/${templateId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast('Template excluído com sucesso', 'success');
                loadTemplates();
            } else {
                showToast(data.message || 'Erro ao excluir template', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir template:', error);
            showToast('Erro ao excluir template', 'error');
        }
    }
    
    // Mostrar/ocultar loading
    function showLoading(show) {
        templatesLoading.classList.toggle('hidden', !show);
    }
    
    // Mostrar/ocultar mensagem de vazio
    function showEmpty(show) {
        templatesEmpty.classList.toggle('hidden', !show);
    }
    
    // Mostrar toast
    function showToast(message, type = 'info') {
        // Verificar se a função existe (implementada em outro arquivo)
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            alert(message);
        }
    }
    
    // Carregar páginas do sistema
    async function loadSystemPages() {
        try {
            console.log('Carregando páginas do sistema...');
            const response = await fetch('/api/permission-templates/system-pages');
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                systemPages = data.data || [];
                console.log('Páginas do sistema carregadas:', systemPages.length);
            } else {
                throw new Error(data.message || 'Erro desconhecido ao carregar páginas do sistema');
            }
        } catch (error) {
            console.error('Erro ao carregar páginas do sistema:', error);
            showToast('Erro ao carregar páginas do sistema: ' + error.message, 'error');
            
            // Criar algumas páginas de exemplo em caso de erro
            systemPages = [
                { pageId: 'dashboard', pageName: 'Dashboard', path: '/pages/dashboard.html' },
                { pageId: 'users', pageName: 'Usuários', path: '/pages/account/users/user-management.html' },
                { pageId: 'timesheet', pageName: 'Registro de Ponto', path: '/pages/hr/timesheet/timesheet.html' }
            ];
        }
    }
    
    // Mostrar seletor de páginas do sistema
    function showSystemPagesSelector(pageItem) {
        // Criar modal de seleção
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'system-pages-modal';
        
        // Conteúdo do modal
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold text-gray-800 dark:text-white">Selecionar Página do Sistema</h2>
                        <button id="btn-close-pages-modal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="mb-4">
                        <input type="text" id="search-system-page" placeholder="Buscar página..." class="w-full p-2 rounded form-input">
                    </div>
                    
                    <div class="overflow-y-auto max-h-96">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Caminho</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ação</th>
                                </tr>
                            </thead>
                            <tbody id="system-pages-list" class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                <!-- Páginas serão carregadas aqui -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Preencher lista de páginas
        const pagesList = document.getElementById('system-pages-list');
        renderSystemPages(pagesList, pageItem);
        
        // Configurar busca
        const searchInput = document.getElementById('search-system-page');
        searchInput.addEventListener('input', () => {
            renderSystemPages(pagesList, pageItem, searchInput.value.toLowerCase());
        });
        
        // Configurar fechamento do modal
        document.getElementById('btn-close-pages-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
    
    // Renderizar páginas do sistema
    function renderSystemPages(container, pageItem, searchTerm = '') {
        container.innerHTML = '';
        
        const filteredPages = systemPages.filter(page => {
            if (searchTerm) {
                return page.pageName.toLowerCase().includes(searchTerm) || 
                       page.path.toLowerCase().includes(searchTerm);
            }
            return true;
        });
        
        filteredPages.forEach(page => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${page.pageName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500 dark:text-gray-400">${page.path}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="btn-select text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        Selecionar
                    </button>
                </td>
            `;
            
            // Adicionar evento de seleção
            row.querySelector('.btn-select').addEventListener('click', () => {
                selectSystemPage(page, pageItem);
                document.body.removeChild(document.getElementById('system-pages-modal'));
            });
            
            container.appendChild(row);
        });
    }
    
    // Selecionar página do sistema
    function selectSystemPage(page, pageItem) {
        // Preencher campos da página
        pageItem.querySelector('input[name="pageId"]').value = page.pageId;
        pageItem.querySelector('input[name="pageName"]').value = page.pageName;
        pageItem.querySelector('input[name="path"]').value = page.path;
    }
}); 