/**
 * products.js
 * Gerencia a exibição e manipulação de produtos na loja
 */

const ProductManager = {
    // Referências para elementos DOM frequentemente usados
    elements: {
        productsGrid: null,
        favoritesContainer: null,
        productListTitle: null,
    },
    
    // Inicialização
    init: function() {
        console.log('Inicializando gerenciador de produtos...');
        
        // Capturar referências de elementos DOM
        this.elements.productsGrid = document.getElementById('products-grid');
        this.elements.favoritesContainer = document.getElementById('favorites-container');
        this.elements.productListTitle = document.getElementById('product-list-title');
        
        // Configurar manipuladores de eventos relacionados a produtos
        this.setupEventHandlers();
        
        console.log('Gerenciador de produtos inicializado');
    },
    
    // Configurar manipuladores de eventos
    setupEventHandlers: function() {
        // Manipuladores para botões de categoria
        document.querySelectorAll('.category-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const categoryId = e.currentTarget.getAttribute('data-category');
                this.selectCategory(categoryId);
            });
        });
        
        // Manipuladores para botões de subcategoria
        document.querySelectorAll('.subcategory-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const subcategoryId = e.currentTarget.getAttribute('data-subcategory');
                this.selectSubcategory(subcategoryId);
            });
        });
        
        // Configurar botões de incremento/decremento para quantidades
        this.setupQuantityControls();
        
        // Configurar botões de favoritos
        this.setupFavoriteToggles();
        
        // Configurar botões de adicionar ao carrinho
        this.setupAddToCartButtons();
    },
    
    // Exibir todos os produtos
    displayProducts: function() {
        if (!StoreApp.cache.products || !this.elements.productsGrid) return;
        
        // Limpar o grid atual
        this.elements.productsGrid.innerHTML = '';
        
        // Filtrar os produtos com base no estado atual
        let products = StoreApp.cache.products;
        
        if (StoreApp.state.currentCategory) {
            products = products.filter(p => p.category === StoreApp.state.currentCategory);
        }
        
        if (StoreApp.state.currentSubcategory) {
            products = products.filter(p => p.subcategory === StoreApp.state.currentSubcategory);
        }
        
        if (StoreApp.state.searchQuery) {
            const query = StoreApp.state.searchQuery.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.supplier.toLowerCase().includes(query)
            );
        }
        
        // Ordenar produtos
        products = this.sortProductsList(products, StoreApp.state.sortOrder);
        
        // Atualizar o título da lista
        this.updateProductListTitle();
        
        // Renderizar os produtos
        products.forEach(product => {
            const productCard = this.createProductCard(product);
            this.elements.productsGrid.appendChild(productCard);
        });
        
        // Se não houver produtos
        if (products.length === 0) {
            this.elements.productsGrid.innerHTML = `
                <div class="col-span-full py-8 text-center">
                    <i class="fas fa-search text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">Nenhum produto encontrado com os critérios selecionados.</p>
                </div>
            `;
        }
        
        // Configurar eventos para os novos elementos
        this.setupQuantityControls();
        this.setupFavoriteToggles();
        this.setupAddToCartButtons();
    },
    
    // Exibir produtos favoritos
    displayFavorites: function() {
        if (!StoreApp.cache.products || !StoreApp.cache.favorites || !this.elements.favoritesContainer) return;
        
        // Limpar o container de favoritos
        this.elements.favoritesContainer.innerHTML = '';
        
        // Filtrar apenas produtos favoritos
        const favoriteProducts = StoreApp.cache.products.filter(
            p => StoreApp.cache.favorites.includes(p.id)
        );
        
        // Renderizar os produtos favoritos
        favoriteProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            this.elements.favoritesContainer.appendChild(productCard);
        });
        
        // Configurar eventos para os novos elementos
        this.setupQuantityControls();
        this.setupFavoriteToggles();
        this.setupAddToCartButtons();
    },
    
    // Criar card de produto
    createProductCard: function(product) {
        const card = document.createElement('div');
        card.className = 'dashboard-card p-6 product-card';
        card.setAttribute('data-product-id', product.id);
        
        // Verificar se o produto tem nova etiqueta de preço (simulado por simplicidade)
        const hasPriceChange = product.lastPurchase && product.price !== product.lastPurchase.price;
        
        // Formato para a última compra
        let lastPurchaseText = '';
        if (product.lastPurchase) {
            const daysSince = StoreApp.daysSince(product.lastPurchase.date);
            lastPurchaseText = `Última compra: ${product.lastPurchase.quantity}${product.lastPurchase.unit} há ${daysSince} dias`;
        }
        
        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <span class="bg-${hasPriceChange ? 'green' : 'blue'}-100 text-${hasPriceChange ? 'green' : 'blue'}-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    ${hasPriceChange ? 'Novo Preço' : 'Em Estoque'}
                </span>
                <button class="favorite-toggle ${product.isFavorite ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-500">
                    <i class="${product.isFavorite ? 'fas' : 'far'} fa-star"></i>
                </button>
            </div>
            <div class="text-center mb-4">
                <img src="${product.image}" alt="${product.name}" class="mx-auto h-28 object-contain mb-4">
                <h3 class="text-lg font-medium text-gray-900 mb-1">${product.name}</h3>
                <p class="text-sm text-gray-500 mb-2">${product.supplier}</p>
                <p class="text-lg font-bold text-gray-900 mb-2">${StoreApp.formatCurrency(product.price)} <span class="text-sm font-normal text-gray-500">/ ${product.unit}</span></p>
                <p class="text-xs text-gray-500 mb-4">${lastPurchaseText}</p>
            </div>
            <div class="flex items-center justify-between">
                <a href="productDetail.html?id=${product.id}" class="text-blue-600 hover:text-blue-800 text-sm">
                    <i class="fas fa-info-circle mr-1"></i> Detalhes
                </a>
                <div class="flex items-center">
                    <button class="decrement-btn h-8 w-8 rounded-l-lg border border-gray-300 bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <i class="fas fa-minus text-gray-600"></i>
                    </button>
                    <input type="number" value="0" min="0" class="product-quantity h-8 w-12 border-t border-b border-gray-300 text-center text-sm">
                    <button class="increment-btn h-8 w-8 rounded-r-lg border border-gray-300 bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <i class="fas fa-plus text-gray-600"></i>
                    </button>
                    <button class="add-to-cart-btn ml-2 h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors text-white">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    },
    
    // Configurar controles de quantidade
    setupQuantityControls: function() {
        // Botões de incremento
        document.querySelectorAll('.increment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.currentTarget.parentElement.querySelector('input');
                input.value = parseInt(input.value) + 1;
            });
        });
        
        // Botões de decremento
        document.querySelectorAll('.decrement-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.currentTarget.parentElement.querySelector('input');
                if (parseInt(input.value) > 0) {
                    input.value = parseInt(input.value) - 1;
                }
            });
        });
    },
    
    // Configurar botões de favoritos
    setupFavoriteToggles: function() {
        document.querySelectorAll('.favorite-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.currentTarget.closest('.product-card');
                const productId = parseInt(productCard.getAttribute('data-product-id'));
                
                const icon = e.currentTarget.querySelector('i');
                if (icon.classList.contains('far')) {
                    // Adicionar aos favoritos
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    e.currentTarget.classList.add('text-yellow-400');
                    
                    // Atualizar o estado
                    if (!StoreApp.cache.favorites.includes(productId)) {
                        StoreApp.cache.favorites.push(productId);
                    }
                } else {
                    // Remover dos favoritos
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    e.currentTarget.classList.remove('text-yellow-400');
                    
                    // Atualizar o estado
                    const index = StoreApp.cache.favorites.indexOf(productId);
                    if (index > -1) {
                        StoreApp.cache.favorites.splice(index, 1);
                    }
                }
                
                // Em um ambiente real, enviaríamos uma solicitação à API para atualizar os favoritos
                console.log('Favoritos atualizados:', StoreApp.cache.favorites);
            });
        });
    },
    
    // Configurar botões de adicionar ao carrinho
    setupAddToCartButtons: function() {
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.currentTarget.closest('.product-card');
                const productId = parseInt(productCard.getAttribute('data-product-id'));
                const quantity = parseInt(productCard.querySelector('.product-quantity').value);
                
                if (quantity <= 0) {
                    // Poderia mostrar uma mensagem de erro, mas por simplicidade, vamos ignorar
                    return;
                }
                
                // Adicionar ao carrinho usando o CartManager
                CartManager.addToCart(productId, quantity);
                
                // Redefinir a quantidade para zero
                productCard.querySelector('.product-quantity').value = 0;
            });
        });
    },
    
    // Selecionar uma categoria
    selectCategory: function(categoryId) {
        StoreApp.state.currentCategory = categoryId;
        StoreApp.state.currentSubcategory = null; // Limpar subcategoria quando uma nova categoria for selecionada
        
        // Atualizar a interface para mostrar as subcategorias
        this.toggleSubcategoryList(categoryId);
        
        // Atualizar a lista de produtos
        this.displayProducts();
    },
    
    // Selecionar uma subcategoria
    selectSubcategory: function(subcategoryId) {
        StoreApp.state.currentSubcategory = subcategoryId;
        
        // Atualizar a lista de produtos
        this.displayProducts();
    },
    
    // Alternar a visibilidade da lista de subcategorias
    toggleSubcategoryList: function(categoryId) {
        // Ocultar todas as listas de subcategorias
        document.querySelectorAll('.subcategory-list').forEach(list => {
            list.classList.add('hidden');
        });
        
        // Resetar todos os ícones de seta
        document.querySelectorAll('.category-button .fa-chevron-right').forEach(icon => {
            icon.classList.remove('rotate-90');
        });
        
        // Mostrar a lista de subcategorias para a categoria selecionada
        const categoryButton = document.querySelector(`.category-button[data-category="${categoryId}"]`);
        if (categoryButton) {
            const subcategoryList = categoryButton.nextElementSibling;
            if (subcategoryList && subcategoryList.classList.contains('subcategory-list')) {
                subcategoryList.classList.remove('hidden');
                categoryButton.querySelector('.fa-chevron-right').classList.add('rotate-90');
            }
        }
    },
    
    // Atualizar o título da lista de produtos
    updateProductListTitle: function() {
        if (!this.elements.productListTitle) return;
        
        let title = 'Todos os Produtos';
        
        if (StoreApp.state.currentCategory) {
            const category = StoreApp.cache.categories.find(c => c.id === StoreApp.state.currentCategory);
            if (category) {
                title = category.name;
                
                if (StoreApp.state.currentSubcategory) {
                    const subcategory = category.subcategories.find(s => s.id === StoreApp.state.currentSubcategory);
                    if (subcategory) {
                        title = `${category.name} > ${subcategory.name}`;
                    }
                }
            }
        }
        
        if (StoreApp.state.searchQuery) {
            title = `Resultados para "${StoreApp.state.searchQuery}"`;
        }
        
        this.elements.productListTitle.textContent = title;
    },
    
    // Ordenar a lista de produtos
    sortProductsList: function(products, sortOrder) {
        const sortedProducts = [...products]; // Criar uma cópia para não modificar o original