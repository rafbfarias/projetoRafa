document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const productsList = document.getElementById('productsList');
    const emptyState = document.getElementById('emptyState');
    const totalProductsEl = document.getElementById('totalProducts');
    const activeProductsEl = document.getElementById('activeProducts');
    const totalVariantsEl = document.getElementById('totalVariants');
    const totalSuppliersEl = document.getElementById('totalSuppliers');
    const searchInput = document.getElementById('searchProduct');
    const filterButton = document.getElementById('filterButton');
    const filtersPanel = document.getElementById('filtersPanel');
    const tabButtons = document.querySelectorAll('.tab-button');
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    // Estado global
    let allProducts = [];
    let filteredProducts = [];
    let currentTab = 'all';
    let searchTerm = '';
    let categoryFilter = 'all';
    let supplierFilter = 'all';
    let sortBy = 'name';
    let sortOrder = 'asc';
    
    // Função para exibir o loading
    function showLoading() {
        productsList.innerHTML = `
            <div class="flex items-center justify-center p-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span class="ml-2">Carregando produtos...</span>
            </div>
        `;
        emptyState.classList.add('hidden');
    }
    
    // Função para exibir mensagem de estado vazio
    function showEmptyState(message, withFilters = false) {
        emptyState.classList.remove('hidden');
        productsList.classList.add('hidden');
        
        // Verifica se não existem produtos ou se é apenas devido aos filtros
        if (!withFilters) {
            // Nenhum produto cadastrado
            emptyState.innerHTML = `
                <div class="p-8 text-center">
                    <i class="fas fa-box text-gray-400 text-5xl mb-4"></i>
                    <h3 class="mt-2 text-xl font-medium text-gray-900">Você ainda não possui produtos cadastrados</h3>
                    <p class="mt-1 text-sm text-gray-500">
                        Cadastre seu primeiro produto para começar a gerenciar seu catálogo.
                    </p>
                    <div class="mt-6">
                        <a href="new.product.html" class="btn btn-primary">
                            <i class="fas fa-plus w-4 h-4 mr-2"></i>
                            Cadastrar Novo Produto
                        </a>
                    </div>
                </div>
            `;
        } else {
            // Produtos existem, mas nenhum corresponde aos filtros
            emptyState.innerHTML = `
                <div class="p-8 text-center">
                    <i class="fas fa-filter text-gray-400 text-5xl mb-4"></i>
                    <h3 class="mt-2 text-xl font-medium text-gray-900">Nenhum produto encontrado</h3>
                    <p class="mt-1 text-sm text-gray-500">
                        ${message || 'Não encontramos produtos com os filtros selecionados.'}
                    </p>
                    <div class="mt-6">
                        <button id="clearFiltersBtn" class="btn btn-secondary">
                            Limpar filtros
                        </button>
                    </div>
                </div>
            `;
            
            // Adicionar event listener para o botão de limpar filtros
            document.getElementById('clearFiltersBtn').addEventListener('click', resetFilters);
        }
    }
    
    // Função para renderizar os produtos
    function renderProducts() {
        productsList.innerHTML = '';
        
        // Verificar primeiro se existem produtos na lista global
        if (allProducts.length === 0) {
            // Não há produtos cadastrados de forma alguma
            showEmptyState();
            return;
        }
        
        // Verificar se há produtos filtrados
        if (filteredProducts.length === 0) {
            // Há produtos, mas nenhum corresponde aos filtros
            showEmptyState('Nenhum produto corresponde aos filtros aplicados.', true);
            return;
        }
        
        // Se chegou aqui, temos produtos para mostrar
        emptyState.classList.add('hidden');
        productsList.classList.remove('hidden');
        
        // Adiciona os produtos na lista
        filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            productsList.appendChild(productCard);
        });
    }
    
    // Função para criar o card de um produto
    function createProductCard(product) {
        // Clonar o template
        const template = document.getElementById('productTemplate');
        const card = template.content.cloneNode(true).querySelector('.product-card');
        
        // Preencher os dados do produto
        card.querySelector('.product-name').textContent = product.productName;
        
        // Imagem
        const productImage = card.querySelector('.product-image');
        productImage.src = product.photo || '/images/products/default-product.jpg';
        productImage.alt = product.productName;
        
        // Tratar erro de imagem
        productImage.onerror = function() {
            this.src = '/images/products/default-product.jpg';
            this.onerror = null;
        };
        
        // Informações básicas
        card.querySelector('.product-info').textContent = `ID: ${product.parentId} • Unidade: ${product.unitMeasure}`;
        
        // Variantes
        const variantsCount = product.variants ? product.variants.length : 0;
        card.querySelector('.product-variants').textContent = `${variantsCount} variante${variantsCount !== 1 ? 's' : ''}`;
        
        // Tags (categoria, status)
        const tagsContainer = card.querySelector('.product-tags');
        
        // Tag de categoria
        const categoryTag = document.createElement('span');
        categoryTag.className = 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800';
        categoryTag.textContent = product.productFamily;
        tagsContainer.appendChild(categoryTag);
        
        // Tag de status
        const statusTag = document.createElement('span');
        const isActive = product.isActive !== false; // Considera ativo por padrão
        statusTag.className = `px-2 py-1 text-xs rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
        statusTag.textContent = isActive ? 'Ativo' : 'Inativo';
        tagsContainer.appendChild(statusTag);
        
        // Exibir variantes se houver
        const variantList = card.querySelector('.variant-list');
        
        if (variantsCount > 0) {
            variantList.innerHTML = `
                <div class="mt-2 border-t border-gray-100 pt-2">
                    <div class="text-xs font-medium text-gray-500 uppercase mb-2">Variantes</div>
                    <div class="space-y-2">
                        ${(product.variants || []).map(variant => `
                            <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <div>
                                    <span class="text-sm font-medium">${variant.supplierName}</span>
                                    <div class="text-xs text-gray-500">
                                        ${variant.unitMeasure} • R$ ${parseFloat(variant.currentPrice).toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <span class="px-2 py-1 text-xs rounded-full ${variant.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                        ${variant.available ? 'Disponível' : 'Indisponível'}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            variantList.innerHTML = `
                <div class="mt-2 border-t border-gray-100 pt-2 text-center py-4">
                    <span class="text-sm text-gray-500">
                        Este produto ainda não possui fornecedores cadastrados
                    </span>
                </div>
            `;
        }
        
        // Expandir/Colapsar variantes
        const expandButton = card.querySelector('.expand-button');
        expandButton.addEventListener('click', function() {
            const icon = this.querySelector('.expand-icon');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
            variantList.classList.toggle('hidden');
        });
        
        // Esconder variantes por padrão
        variantList.classList.add('hidden');
        
        return card;
    }
    
    // Função para carregar os produtos da API
    async function loadProducts() {
        try {
            showLoading();
            
            // Fazer a requisição para a API
            const response = await fetch('/api/products/parent');
            
            // Verificar se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Se não foi um sucesso na API ou se os dados estão ausentes
            if (!result.success) {
                throw new Error(result.error || 'Erro ao carregar produtos');
            }
            
            // Se temos um array de produtos (mesmo que vazio)
            allProducts = result.data || [];
            
            // Atualizar as estatísticas
            updateStats();
            
            // Aplicar filtros iniciais
            applyFilters();
            
            // Popular filtros de categorias e fornecedores
            populateFilters();
            
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            
            // Verificar se é um erro de "não há produtos" ou se é um erro técnico
            if (error.message === 'Erro ao carregar produtos' || error.message.includes('404')) {
                // Provavelmente não há produtos cadastrados ainda, mostrar mensagem amigável
                showEmptyState();
            } else {
                // É um erro técnico, mostrar mensagem de erro
                productsList.innerHTML = `
                    <div class="p-8 text-center">
                        <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
                        <h3 class="text-lg font-medium text-gray-900">Erro ao carregar produtos</h3>
                        <p class="text-gray-500">${error.message}</p>
                        <button onclick="loadProducts()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Tentar novamente
                        </button>
                    </div>
                `;
            }
            
            // Zerar a lista de produtos para evitar bugs em filtros
            allProducts = [];
            filteredProducts = [];
            
            // Atualizar estatísticas para mostrar zeros
            updateStats();
        }
    }
    
    // Função para atualizar as estatísticas
    function updateStats() {
        // Total de produtos
        totalProductsEl.textContent = allProducts.length;
        
        // Produtos ativos
        const activeCount = allProducts.filter(p => p.isActive !== false).length;
        activeProductsEl.textContent = activeCount;
        
        // Total de variantes
        let variantsCount = 0;
        let suppliersSet = new Set();
        
        allProducts.forEach(product => {
            if (product.variants && product.variants.length > 0) {
                variantsCount += product.variants.length;
                
                // Contar fornecedores únicos
                product.variants.forEach(variant => {
                    if (variant.supplierIdRef) {
                        suppliersSet.add(variant.supplierIdRef);
                    }
                });
            }
        });
        
        totalVariantsEl.textContent = variantsCount;
        totalSuppliersEl.textContent = suppliersSet.size;
    }
    
    // Função para popular filtros de categorias e fornecedores
    function populateFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const supplierFilter = document.getElementById('supplierFilter');
        
        // Limpar opções existentes
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        
        while (supplierFilter.options.length > 1) {
            supplierFilter.remove(1);
        }
        
        // Coletar categorias únicas
        const categories = [...new Set(allProducts.map(p => p.productFamily))];
        
        // Adicionar opções de categorias
        categories.forEach(category => {
            if (category) {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            }
        });
        
        // Coletar fornecedores únicos
        const suppliers = new Map();
        
        allProducts.forEach(product => {
            if (product.variants && product.variants.length > 0) {
                product.variants.forEach(variant => {
                    if (variant.supplierIdRef && variant.supplierName) {
                        suppliers.set(variant.supplierIdRef, variant.supplierName);
                    }
                });
            }
        });
        
        // Adicionar opções de fornecedores
        suppliers.forEach((name, id) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            supplierFilter.appendChild(option);
        });
    }
    
    // Função para aplicar filtros
    function applyFilters() {
        filteredProducts = [...allProducts];
        
        // Filtrar por tab (status)
        if (currentTab === 'active') {
            filteredProducts = filteredProducts.filter(p => p.isActive !== false);
        } else if (currentTab === 'inactive') {
            filteredProducts = filteredProducts.filter(p => p.isActive === false);
        }
        
        // Filtrar por termo de busca
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.productName.toLowerCase().includes(term) || 
                p.parentId.toLowerCase().includes(term) ||
                p.productFamily.toLowerCase().includes(term)
            );
        }
        
        // Filtrar por categoria
        if (categoryFilter !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.productFamily === categoryFilter);
        }
        
        // Filtrar por fornecedor
        if (supplierFilter !== 'all') {
            filteredProducts = filteredProducts.filter(p => 
                p.variants && p.variants.some(v => v.supplierIdRef === supplierFilter)
            );
        }
        
        // Ordenar
        filteredProducts.sort((a, b) => {
            let valueA, valueB;
            
            if (sortBy === 'name') {
                valueA = a.productName.toLowerCase();
                valueB = b.productName.toLowerCase();
            } else if (sortBy === 'category') {
                valueA = a.productFamily.toLowerCase();
                valueB = b.productFamily.toLowerCase();
            } else if (sortBy === 'variants') {
                valueA = a.variants ? a.variants.length : 0;
                valueB = b.variants ? b.variants.length : 0;
            }
            
            if (sortOrder === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
        
        // Renderizar produtos filtrados
        renderProducts();
    }
    
    // Função para resetar filtros
    function resetFilters() {
        searchInput.value = '';
        searchTerm = '';
        
        document.getElementById('categoryFilter').value = 'all';
        categoryFilter = 'all';
        
        document.getElementById('supplierFilter').value = 'all';
        supplierFilter = 'all';
        
        document.getElementById('sortBy').value = 'name';
        sortBy = 'name';
        
        sortOrder = 'asc';
        document.getElementById('sortOrder').innerHTML = '<i class="fas fa-sort-amount-down"></i>';
        
        // Resetar tabs
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === 'all') {
                btn.classList.add('active');
            }
        });
        currentTab = 'all';
        
        // Aplicar filtros
        applyFilters();
    }
    
    // Event listeners
    
    // Filtro de busca
    searchInput.addEventListener('input', function() {
        searchTerm = this.value.trim();
        applyFilters();
    });
    
    // Botão de filtros
    filterButton.addEventListener('click', function() {
        filtersPanel.classList.toggle('hidden');
        const icon = this.querySelector('i.fas.fa-chevron-down');
        icon.classList.toggle('rotate-180');
    });
    
    // Tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.dataset.tab;
            applyFilters();
        });
    });
    
    // Select de categoria
    document.getElementById('categoryFilter').addEventListener('change', function() {
        categoryFilter = this.value;
        applyFilters();
    });
    
    // Select de fornecedor
    document.getElementById('supplierFilter').addEventListener('change', function() {
        supplierFilter = this.value;
        applyFilters();
    });
    
    // Select de ordenação
    document.getElementById('sortBy').addEventListener('change', function() {
        sortBy = this.value;
        applyFilters();
    });
    
    // Botão de direção da ordenação
    document.getElementById('sortOrder').addEventListener('click', function() {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        this.innerHTML = sortOrder === 'asc' ? 
            '<i class="fas fa-sort-amount-down"></i>' : 
            '<i class="fas fa-sort-amount-up"></i>';
        applyFilters();
    });
    
    // Botão de limpar filtros
    clearFiltersBtn.addEventListener('click', resetFilters);
    
    // Inicializar - carregar produtos
    loadProducts();

    // Tornar loadProducts acessível globalmente para o botão "Tentar novamente"
    window.loadProducts = loadProducts;
}); 