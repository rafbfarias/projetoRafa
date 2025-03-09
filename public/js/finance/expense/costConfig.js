document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const newModalityBtn = document.getElementById('newModalityBtn');
    const emptyStateNewBtn = document.getElementById('emptyStateNewBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const emptyState = document.getElementById('emptyState');
    const modalitiesTable = document.getElementById('modalitiesTable');
    const modalitiesTableBody = document.getElementById('modalitiesTableBody');
    
    // Modais
    const modalityModal = document.getElementById('modalityModal');
    const modalityModalTitle = document.getElementById('modalityModalTitle');
    const closeModalityModal = document.getElementById('closeModalityModal');
    const cancelModalityBtn = document.getElementById('cancelModalityBtn');
    const saveModalityBtn = document.getElementById('saveModalityBtn');
    
    const categoryModal = document.getElementById('categoryModal');
    const categoryModalTitle = document.getElementById('categoryModalTitle');
    const closeCategoryModal = document.getElementById('closeCategoryModal');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');
    
    const subcategoryModal = document.getElementById('subcategoryModal');
    const subcategoryModalTitle = document.getElementById('subcategoryModalTitle');
    const closeSubcategoryModal = document.getElementById('closeSubcategoryModal');
    const cancelSubcategoryBtn = document.getElementById('cancelSubcategoryBtn');
    const saveSubcategoryBtn = document.getElementById('saveSubcategoryBtn');
    
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const deleteConfirmMessage = document.getElementById('deleteConfirmMessage');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // Estado da aplicação
    let modalities = [];
    let categories = [];
    let subcategories = [];
    let expandedModalities = {};
    let expandedCategories = {};
    let currentModality = null;
    let currentCategory = null;
    let currentSubcategory = null;
    let deletingItem = null;
    let deletingItemType = null;
    
    // Inicializar a página
    initializePage();
    
    // Event Listeners
    searchInput.addEventListener('input', filterItems);
    clearSearchBtn.addEventListener('click', clearSearch);
    newModalityBtn.addEventListener('click', openNewModalityModal);
    emptyStateNewBtn.addEventListener('click', openNewModalityModal);
    
    closeModalityModal.addEventListener('click', () => hideModal(modalityModal));
    cancelModalityBtn.addEventListener('click', () => hideModal(modalityModal));
    saveModalityBtn.addEventListener('click', saveModality);
    
    closeCategoryModal.addEventListener('click', () => hideModal(categoryModal));
    cancelCategoryBtn.addEventListener('click', () => hideModal(categoryModal));
    saveCategoryBtn.addEventListener('click', saveCategory);
    
    closeSubcategoryModal.addEventListener('click', () => hideModal(subcategoryModal));
    cancelSubcategoryBtn.addEventListener('click', () => hideModal(subcategoryModal));
    saveSubcategoryBtn.addEventListener('click', saveSubcategory);
    
    closeDeleteModal.addEventListener('click', () => hideModal(deleteConfirmModal));
    cancelDeleteBtn.addEventListener('click', () => hideModal(deleteConfirmModal));
    confirmDeleteBtn.addEventListener('click', deleteItem);
    
    // Adicionar listener para redimensionamento da janela
    window.addEventListener('resize', makeTableResponsive);
    
    // Funções
    function initializePage() {
        // Simular carregamento de dados
        setTimeout(() => {
            // Dados mockados
            modalities = [
                { id: 1, code: 'HR', name: 'Recursos Humanos', description: 'Despesas relacionadas a recursos humanos', isActive: true, order: 1 },
                { id: 2, code: 'FB', name: 'F&B', description: 'Despesas de alimentos e bebidas', isActive: true, order: 2 },
                { id: 3, code: 'MKT', name: 'Marketing', description: 'Despesas de marketing e publicidade', isActive: true, order: 3 },
                { id: 4, code: 'OPS', name: 'Operações', description: 'Despesas operacionais', isActive: true, order: 4 },
                { id: 5, code: 'ADM', name: 'Administrativo', description: 'Despesas administrativas', isActive: true, order: 5 }
            ];
            
            categories = [
                { id: 1, modalityId: 1, code: 'SAL', name: 'Salários', description: 'Pagamentos de salários', isActive: true, order: 1 },
                { id: 2, modalityId: 1, code: 'BNFS', name: 'Benefícios', description: 'Benefícios a empregados', isActive: true, order: 2 },
                { id: 3, modalityId: 1, code: 'TRN', name: 'Treinamentos', description: 'Treinamentos e capacitações', isActive: true, order: 3 },
                { id: 4, modalityId: 2, code: 'FOOD', name: 'Alimentos', description: 'Despesas com alimentos', isActive: true, order: 1 },
                { id: 5, modalityId: 2, code: 'BEV', name: 'Bebidas', description: 'Despesas com bebidas', isActive: true, order: 2 },
                { id: 6, modalityId: 2, code: 'SUP', name: 'Suprimentos', description: 'Suprimentos gerais', isActive: true, order: 3 }
            ];
            
            subcategories = [
                { id: 1, categoryId: 1, code: 'MGR', name: 'Gerência', description: 'Salários de gerência', isActive: true, order: 1 },
                { id: 2, categoryId: 1, code: 'ADMIN', name: 'Administrativo', description: 'Salários administrativos', isActive: true, order: 2 },
                { id: 3, categoryId: 1, code: 'OPS', name: 'Operacional', description: 'Salários operacionais', isActive: true, order: 3 },
                { id: 4, categoryId: 4, code: 'MEAT', name: 'Carnes', description: 'Despesas com carnes', isActive: true, order: 1 },
                { id: 5, categoryId: 4, code: 'VEG', name: 'Vegetais', description: 'Despesas com vegetais', isActive: true, order: 2 },
                { id: 6, categoryId: 4, code: 'DAIRY', name: 'Laticínios', description: 'Despesas com laticínios', isActive: true, order: 3 }
            ];
            
            loadingIndicator.classList.add('hidden');
            
            if (modalities.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                modalitiesTable.classList.remove('hidden');
                renderModalities();
            }
        }, 800);
    }
    
    function renderModalities() {
        modalitiesTableBody.innerHTML = '';
        
        const filteredModalities = filterModalities();
        
        if (filteredModalities.length === 0) {
            modalitiesTable.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        modalitiesTable.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        filteredModalities.forEach(modality => {
            const isExpanded = expandedModalities[modality.id] || false;
            
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50';
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-center">
                        ${modality.code}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                        <button class="flex items-center hover:text-blue-600 focus:outline-none toggle-modality" data-modality-id="${modality.id}">
                            <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'} h-4 w-4 mr-1"></i>
                            ${modality.name}
                        </button>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-500 truncate max-w-md">
                        ${modality.description}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${modality.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${modality.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-4 new-category-btn" data-modality-id="${modality.id}">
                        Nova Categoria
                    </button>
                    <button class="text-indigo-600 hover:text-indigo-900 mr-4 edit-modality-btn" data-modality-id="${modality.id}">
                        Editar
                    </button>
                    <button class="text-red-600 hover:text-red-900 delete-modality-btn" data-modality-id="${modality.id}">
                        Excluir
                    </button>
                </td>
            `;
            
            modalitiesTableBody.appendChild(tr);
            
            // Renderizar categorias se a modalidade estiver expandida
            if (isExpanded) {
                const categoriesTr = document.createElement('tr');
                categoriesTr.innerHTML = `
                    <td colspan="5" class="px-6 py-0">
                        <div class="border-l-2 border-blue-200 ml-4 pl-4 py-2">
                            <table class="min-w-full">
                                <thead>
                                    <tr class="bg-blue-50">
                                        <th scope="col" class="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-14">
                                            Código
                                        </th>
                                        <th scope="col" class="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nome
                                        </th>
                                        <th scope="col" class="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Descrição
                                        </th>
                                        <th scope="col" class="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" class="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="categories-container" data-modality-id="${modality.id}">
                                </tbody>
                            </table>
                        </div>
                    </td>
                `;
                
                modalitiesTableBody.appendChild(categoriesTr);
                
                const categoriesContainer = categoriesTr.querySelector('.categories-container');
                const modalityCategories = categories.filter(category => category.modalityId === modality.id);
                
                if (modalityCategories.length === 0) {
                    const emptyTr = document.createElement('tr');
                    emptyTr.innerHTML = `
                        <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                            Nenhuma categoria encontrada. <button class="text-blue-600 hover:text-blue-900 new-category-btn" data-modality-id="${modality.id}">Adicionar uma categoria</button>
                        </td>
                    `;
                    categoriesContainer.appendChild(emptyTr);
                } else {
                    modalityCategories.forEach(category => {
                        const isExpandedCategory = expandedCategories[category.id] || false;
                        
                        const categoryTr = document.createElement('tr');
                        categoryTr.className = 'hover:bg-gray-50';
                        categoryTr.innerHTML = `
                            <td class="px-6 py-3 whitespace-nowrap">
                                <div class="text-xs font-medium bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-center">
                                    ${category.code}
                                </div>
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">
                                    <button class="flex items-center hover:text-blue-600 focus:outline-none toggle-category" data-category-id="${category.id}">
                                        <i class="fas fa-chevron-${isExpandedCategory ? 'up' : 'down'} h-4 w-4 mr-1"></i>
                                        ${category.name}
                                    </button>
                                </div>
                            </td>
                            <td class="px-6 py-3">
                                <div class="text-sm text-gray-500 truncate max-w-md">
                                    ${category.description}
                                </div>
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap text-center">
                                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                    ${category.isActive ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button class="text-blue-600 hover:text-blue-900 mr-4 new-subcategory-btn" data-category-id="${category.id}">
                                    Nova Subcategoria
                                </button>
                                <button class="text-indigo-600 hover:text-indigo-900 mr-4 edit-category-btn" data-category-id="${category.id}">
                                    Editar
                                </button>
                                <button class="text-red-600 hover:text-red-900 delete-category-btn" data-category-id="${category.id}">
                                    Excluir
                                </button>
                            </td>
                        `;
                        
                        categoriesContainer.appendChild(categoryTr);
                        
                        // Renderizar subcategorias se a categoria estiver expandida
                        if (isExpandedCategory) {
                            const subcategoriesTr = document.createElement('tr');
                            subcategoriesTr.innerHTML = `
                                <td colspan="5" class="px-6 py-0">
                                    <div class="border-l-2 border-green-200 ml-6 pl-6 py-2">
                                        <table class="min-w-full">
                                            <thead>
                                                <tr class="bg-green-50">
                                                    <th scope="col" class="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-14">
                                                        Código
                                                    </th>
                                                    <th scope="col" class="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Nome
                                                    </th>
                                                    <th scope="col" class="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Descrição
                                                    </th>
                                                    <th scope="col" class="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th scope="col" class="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Ações
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody class="subcategories-container" data-category-id="${category.id}">
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            `;
                            
                            categoriesContainer.appendChild(subcategoriesTr);
                            
                            const subcategoriesContainer = subcategoriesTr.querySelector('.subcategories-container');
                            const categorySubcategories = subcategories.filter(subcategory => subcategory.categoryId === category.id);
                            
                            if (categorySubcategories.length === 0) {
                                const emptySubTr = document.createElement('tr');
                                emptySubTr.innerHTML = `
                                    <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                                        Nenhuma subcategoria encontrada. <button class="text-blue-600 hover:text-blue-900 new-subcategory-btn" data-category-id="${category.id}">Adicionar uma subcategoria</button>
                                    </td>
                                `;
                                subcategoriesContainer.appendChild(emptySubTr);
                            } else {
                                categorySubcategories.forEach(subcategory => {
                                    const subcategoryTr = document.createElement('tr');
                                    subcategoryTr.className = 'hover:bg-gray-50';
                                    subcategoryTr.innerHTML = `
                                        <td class="px-6 py-3 whitespace-nowrap">
                                            <div class="text-xs font-medium bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-center">
                                                ${subcategory.code}
                                            </div>
                                        </td>
                                        <td class="px-6 py-3 whitespace-nowrap">
                                            <div class="text-sm font-medium text-gray-900">
                                                ${subcategory.name}
                                            </div>
                                        </td>
                                        <td class="px-6 py-3">
                                            <div class="text-sm text-gray-500 truncate max-w-md">
                                                ${subcategory.description}
                                            </div>
                                        </td>
                                        <td class="px-6 py-3 whitespace-nowrap text-center">
                                            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${subcategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                                ${subcategory.isActive ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <button class="text-indigo-600 hover:text-indigo-900 mr-4 edit-subcategory-btn" data-subcategory-id="${subcategory.id}">
                                                Editar
                                            </button>
                                            <button class="text-red-600 hover:text-red-900 delete-subcategory-btn" data-subcategory-id="${subcategory.id}">
                                                Excluir
                                            </button>
                                        </td>
                                    `;
                                    
                                    subcategoriesContainer.appendChild(subcategoryTr);
                                });
                            }
                        }
                    });
                }
            }
        });
        
        // Adicionar event listeners para os botões
        addEventListeners();
        
        // Tornar a tabela responsiva após atualizar o conteúdo
        setTimeout(makeTableResponsive, 100);
    }
    
    function addEventListeners() {
        // Toggle para expandir/colapsar modalidades
        document.querySelectorAll('.toggle-modality').forEach(button => {
            button.addEventListener('click', function() {
                const modalityId = parseInt(this.getAttribute('data-modality-id'));
                expandedModalities[modalityId] = !expandedModalities[modalityId];
                renderModalities();
            });
        });
        
        // Toggle para expandir/colapsar categorias
        document.querySelectorAll('.toggle-category').forEach(button => {
            button.addEventListener('click', function() {
                const categoryId = parseInt(this.getAttribute('data-category-id'));
                expandedCategories[categoryId] = !expandedCategories[categoryId];
                renderModalities();
            });
        });
        
        // Botões para adicionar nova categoria
        document.querySelectorAll('.new-category-btn').forEach(button => {
            button.addEventListener('click', function() {
                const modalityId = parseInt(this.getAttribute('data-modality-id'));
                openNewCategoryModal(modalityId);
            });
        });
        
        // Botões para adicionar nova subcategoria
        document.querySelectorAll('.new-subcategory-btn').forEach(button => {
            button.addEventListener('click', function() {
                const categoryId = parseInt(this.getAttribute('data-category-id'));
                openNewSubcategoryModal(categoryId);
            });
        });
        
        // Botões para editar modalidade
        document.querySelectorAll('.edit-modality-btn').forEach(button => {
            button.addEventListener('click', function() {
                const modalityId = parseInt(this.getAttribute('data-modality-id'));
                const modality = modalities.find(m => m.id === modalityId);
                if (modality) {
                    openEditModalityModal(modality);
                }
            });
        });
        
        // Botões para editar categoria
        document.querySelectorAll('.edit-category-btn').forEach(button => {
            button.addEventListener('click', function() {
                const categoryId = parseInt(this.getAttribute('data-category-id'));
                const category = categories.find(c => c.id === categoryId);
                if (category) {
                    openEditCategoryModal(category);
                }
            });
        });
        
        // Botões para editar subcategoria
        document.querySelectorAll('.edit-subcategory-btn').forEach(button => {
            button.addEventListener('click', function() {
                const subcategoryId = parseInt(this.getAttribute('data-subcategory-id'));
                const subcategory = subcategories.find(s => s.id === subcategoryId);
                if (subcategory) {
                    openEditSubcategoryModal(subcategory);
                }
            });
        });
        
        // Botões para excluir modalidade
        document.querySelectorAll('.delete-modality-btn').forEach(button => {
            button.addEventListener('click', function() {
                const modalityId = parseInt(this.getAttribute('data-modality-id'));
                const modality = modalities.find(m => m.id === modalityId);
                if (modality) {
                    confirmDelete(modality, 'modality');
                }
            });
        });
        
        // Botões para excluir categoria
        document.querySelectorAll('.delete-category-btn').forEach(button => {
            button.addEventListener('click', function() {
                const categoryId = parseInt(this.getAttribute('data-category-id'));
                const category = categories.find(c => c.id === categoryId);
                if (category) {
                    confirmDelete(category, 'category');
                }
            });
        });
        
        // Botões para excluir subcategoria
        document.querySelectorAll('.delete-subcategory-btn').forEach(button => {
            button.addEventListener('click', function() {
                const subcategoryId = parseInt(this.getAttribute('data-subcategory-id'));
                const subcategory = subcategories.find(s => s.id === subcategoryId);
                if (subcategory) {
                    confirmDelete(subcategory, 'subcategory');
                }
            });
        });
    }
    
    function filterItems() {
        renderModalities();
    }
    
    function filterModalities() {
        const query = searchInput.value.toLowerCase();
        
        if (!query) {
            return modalities;
        }
        
        return modalities.filter(modality => 
            modality.name.toLowerCase().includes(query) ||
            modality.code.toLowerCase().includes(query) ||
            modality.description.toLowerCase().includes(query)
        );
    }
    
    function clearSearch() {
        searchInput.value = '';
        renderModalities();
    }
    
    // Funções para modais
    function showModal(modal) {
        modal.classList.remove('hidden');
    }
    
    function hideModal(modal) {
        modal.classList.add('hidden');
    }
    
    function openNewModalityModal() {
        modalityModalTitle.textContent = 'Nova Modalidade';
        
        // Limpar campos
        document.getElementById('modalityCode').value = '';
        document.getElementById('modalityName').value = '';
        document.getElementById('modalityDescription').value = '';
        document.getElementById('modalityOrder').value = modalities.length + 1;
        document.getElementById('modalityActive').checked = true;
        
        currentModality = {
            code: '',
            name: '',
            description: '',
            isActive: true,
            order: modalities.length + 1
        };
        
        showModal(modalityModal);
    }
    
    function openEditModalityModal(modality) {
        modalityModalTitle.textContent = 'Editar Modalidade';
        
        // Preencher campos
        document.getElementById('modalityCode').value = modality.code;
        document.getElementById('modalityName').value = modality.name;
        document.getElementById('modalityDescription').value = modality.description;
        document.getElementById('modalityOrder').value = modality.order;
        document.getElementById('modalityActive').checked = modality.isActive;
        
        currentModality = { ...modality };
        
        showModal(modalityModal);
    }
    
    function openNewCategoryModal(modalityId) {
        categoryModalTitle.textContent = 'Nova Categoria';
        
        // Limpar campos
        document.getElementById('categoryCode').value = '';
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryDescription').value = '';
        document.getElementById('categoryOrder').value = categories.filter(c => c.modalityId === modalityId).length + 1;
        document.getElementById('categoryActive').checked = true;
        
        currentCategory = {
            modalityId: modalityId,
            code: '',
            name: '',
            description: '',
            isActive: true,
            order: categories.filter(c => c.modalityId === modalityId).length + 1
        };
        
        showModal(categoryModal);
    }
    
    function openEditCategoryModal(category) {
        categoryModalTitle.textContent = 'Editar Categoria';
        
        // Preencher campos
        document.getElementById('categoryCode').value = category.code;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description;
        document.getElementById('categoryOrder').value = category.order;
        document.getElementById('categoryActive').checked = category.isActive;
        
        currentCategory = { ...category };
        
        showModal(categoryModal);
    }
    
    function openNewSubcategoryModal(categoryId) {
        subcategoryModalTitle.textContent = 'Nova Subcategoria';
        
        // Limpar campos
        document.getElementById('subcategoryCode').value = '';
        document.getElementById('subcategoryName').value = '';
        document.getElementById('subcategoryDescription').value = '';
        document.getElementById('subcategoryOrder').value = subcategories.filter(s => s.categoryId === categoryId).length + 1;
        document.getElementById('subcategoryActive').checked = true;
        
        currentSubcategory = {
            categoryId: categoryId,
            code: '',
            name: '',
            description: '',
            isActive: true,
            order: subcategories.filter(s => s.categoryId === categoryId).length + 1
        };
        
        showModal(subcategoryModal);
    }
    
    function openEditSubcategoryModal(subcategory) {
        subcategoryModalTitle.textContent = 'Editar Subcategoria';
        
        // Preencher campos
        document.getElementById('subcategoryCode').value = subcategory.code;
        document.getElementById('subcategoryName').value = subcategory.name;
        document.getElementById('subcategoryDescription').value = subcategory.description;
        document.getElementById('subcategoryOrder').value = subcategory.order;
        document.getElementById('subcategoryActive').checked = subcategory.isActive;
        
        currentSubcategory = { ...subcategory };
        
        showModal(subcategoryModal);
    }
    
    function confirmDelete(item, type) {
        let message = '';
        
        if (type === 'modality') {
            const hasCategories = categories.some(c => c.modalityId === item.id);
            if (hasCategories) {
                message = `A modalidade "${item.name}" possui categorias associadas. Todas as categorias e subcategorias serão excluídas. Deseja continuar?`;
            } else {
                message = `Tem certeza que deseja excluir a modalidade "${item.name}"?`;
            }
        } else if (type === 'category') {
            const hasSubcategories = subcategories.some(s => s.categoryId === item.id);
            if (hasSubcategories) {
                message = `A categoria "${item.name}" possui subcategorias associadas. Todas as subcategorias serão excluídas. Deseja continuar?`;
            } else {
                message = `Tem certeza que deseja excluir a categoria "${item.name}"?`;
            }
        } else if (type === 'subcategory') {
            message = `Tem certeza que deseja excluir a subcategoria "${item.name}"?`;
        }
        
        deleteConfirmMessage.textContent = message;
        deletingItem = item;
        deletingItemType = type;
        
        showModal(deleteConfirmModal);
    }
    
    function saveModality() {
        // Obter valores dos campos
        const code = document.getElementById('modalityCode').value.trim();
        const name = document.getElementById('modalityName').value.trim();
        const description = document.getElementById('modalityDescription').value.trim();
        const order = parseInt(document.getElementById('modalityOrder').value);
        const isActive = document.getElementById('modalityActive').checked;
        
        // Validar campos
        if (!code || !name) {
            alert('Código e Nome são campos obrigatórios.');
            return;
        }
        
        // Verificar se o código já existe (exceto para o item atual)
        const codeExists = modalities.some(m => m.code === code && m.id !== currentModality.id);
        if (codeExists) {
            alert('Este código já está em uso por outra modalidade.');
            return;
        }
        
        // Atualizar ou adicionar modalidade
        if (currentModality.id) {
            // Atualizar modalidade existente
            const index = modalities.findIndex(m => m.id === currentModality.id);
            if (index !== -1) {
                modalities[index] = {
                    ...currentModality,
                    code,
                    name,
                    description,
                    order,
                    isActive
                };
            }
        } else {
            // Adicionar nova modalidade
            const newId = modalities.length > 0 ? Math.max(...modalities.map(m => m.id)) + 1 : 1;
            modalities.push({
                id: newId,
                code,
                name,
                description,
                order,
                isActive
            });
        }
        
        // Fechar modal e atualizar tabela
        hideModal(modalityModal);
        renderModalities();
    }
    
    function saveCategory() {
        // Obter valores dos campos
        const code = document.getElementById('categoryCode').value.trim();
        const name = document.getElementById('categoryName').value.trim();
        const description = document.getElementById('categoryDescription').value.trim();
        const order = parseInt(document.getElementById('categoryOrder').value);
        const isActive = document.getElementById('categoryActive').checked;
        
        // Validar campos
        if (!code || !name) {
            alert('Código e Nome são campos obrigatórios.');
            return;
        }
        
        // Verificar se o código já existe (exceto para o item atual)
        const codeExists = categories.some(c => c.code === code && c.id !== currentCategory.id);
        if (codeExists) {
            alert('Este código já está em uso por outra categoria.');
            return;
        }
        
        // Atualizar ou adicionar categoria
        if (currentCategory.id) {
            // Atualizar categoria existente
            const index = categories.findIndex(c => c.id === currentCategory.id);
            if (index !== -1) {
                categories[index] = {
                    ...currentCategory,
                    code,
                    name,
                    description,
                    order,
                    isActive
                };
            }
        } else {
            // Adicionar nova categoria
            const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
            categories.push({
                id: newId,
                modalityId: currentCategory.modalityId,
                code,
                name,
                description,
                order,
                isActive
            });
            
            // Expandir a modalidade para mostrar a nova categoria
            expandedModalities[currentCategory.modalityId] = true;
        }
        
        // Fechar modal e atualizar tabela
        hideModal(categoryModal);
        renderModalities();
    }
    
    function saveSubcategory() {
        // Obter valores dos campos
        const code = document.getElementById('subcategoryCode').value.trim();
        const name = document.getElementById('subcategoryName').value.trim();
        const description = document.getElementById('subcategoryDescription').value.trim();
        const order = parseInt(document.getElementById('subcategoryOrder').value);
        const isActive = document.getElementById('subcategoryActive').checked;
        
        // Validar campos
        if (!code || !name) {
            alert('Código e Nome são campos obrigatórios.');
            return;
        }
        
        // Verificar se o código já existe (exceto para o item atual)
        const codeExists = subcategories.some(s => s.code === code && s.id !== currentSubcategory.id);
        if (codeExists) {
            alert('Este código já está em uso por outra subcategoria.');
            return;
        }
        
        // Atualizar ou adicionar subcategoria
        if (currentSubcategory.id) {
            // Atualizar subcategoria existente
            const index = subcategories.findIndex(s => s.id === currentSubcategory.id);
            if (index !== -1) {
                subcategories[index] = {
                    ...currentSubcategory,
                    code,
                    name,
                    description,
                    order,
                    isActive
                };
            }
        } else {
            // Adicionar nova subcategoria
            const newId = subcategories.length > 0 ? Math.max(...subcategories.map(s => s.id)) + 1 : 1;
            subcategories.push({
                id: newId,
                categoryId: currentSubcategory.categoryId,
                code,
                name,
                description,
                order,
                isActive
            });
            
            // Expandir a categoria para mostrar a nova subcategoria
            expandedCategories[currentSubcategory.categoryId] = true;
            
            // Garantir que a modalidade também esteja expandida
            const category = categories.find(c => c.id === currentSubcategory.categoryId);
            if (category) {
                expandedModalities[category.modalityId] = true;
            }
        }
        
        // Fechar modal e atualizar tabela
        hideModal(subcategoryModal);
        renderModalities();
    }
    
    function deleteItem() {
        if (!deletingItem || !deletingItemType) {
            return;
        }
        
        if (deletingItemType === 'modality') {
            // Excluir modalidade e todas as categorias e subcategorias associadas
            modalities = modalities.filter(m => m.id !== deletingItem.id);
            
            // Encontrar categorias associadas
            const categoryIds = categories.filter(c => c.modalityId === deletingItem.id).map(c => c.id);
            
            // Excluir categorias associadas
            categories = categories.filter(c => c.modalityId !== deletingItem.id);
            
            // Excluir subcategorias associadas
            subcategories = subcategories.filter(s => !categoryIds.includes(s.categoryId));
            
        } else if (deletingItemType === 'category') {
            // Excluir categoria e todas as subcategorias associadas
            categories = categories.filter(c => c.id !== deletingItem.id);
            
            // Excluir subcategorias associadas
            subcategories = subcategories.filter(s => s.categoryId !== deletingItem.id);
            
        } else if (deletingItemType === 'subcategory') {
            // Excluir subcategoria
            subcategories = subcategories.filter(s => s.id !== deletingItem.id);
        }
        
        // Limpar variáveis
        deletingItem = null;
        deletingItemType = null;
        
        // Fechar modal e atualizar tabela
        hideModal(deleteConfirmModal);
        renderModalities();
    }
    
    /**
     * Função para tornar a tabela responsiva ao tamanho da tela
     */
    function makeTableResponsive() {
        const table = document.querySelector('#modalitiesTable table');
        const tableContainer = document.getElementById('modalitiesTable');
        
        if (table && tableContainer) {
            // Garantir que o container da tabela tenha overflow-x
            tableContainer.style.overflowX = 'auto';
            tableContainer.style.width = '100%';
            tableContainer.style.display = 'block';
            
            // Adicionar estilos para tabela responsiva se ainda não existirem
            if (!document.getElementById('responsive-table-styles')) {
                const style = document.createElement('style');
                style.id = 'responsive-table-styles';
                style.textContent = `
                    #modalitiesTable {
                        width: 100%;
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                    
                    @media (max-width: 768px) {
                        #modalitiesTable table {
                            width: 100%;
                            min-width: 650px;
                        }
                        
                        #modalitiesTable td, #modalitiesTable th {
                            white-space: nowrap;
                        }
                    }
                    
                    /* Ajustes para categorias e subcategorias aninhadas */
                    .category-row td:first-child,
                    .subcategory-row td:first-child {
                        padding-left: 2.5rem !important;
                    }
                    
                    .subcategory-row td:first-child {
                        padding-left: 4rem !important;
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Ajustar largura da tabela para o container
            table.style.width = '100%';
            
            // Ajustar largura das colunas
            const headerCells = table.querySelectorAll('thead th');
            if (headerCells.length > 0) {
                // Coluna de código (menor)
                headerCells[0].style.width = '10%';
                // Coluna de nome (maior)
                headerCells[1].style.width = '30%';
                // Coluna de descrição (maior)
                headerCells[2].style.width = '40%';
                // Coluna de status (menor)
                headerCells[3].style.width = '10%';
                // Coluna de ações (menor)
                headerCells[4].style.width = '10%';
            }
        }
    }
});