/**
 * Gerenciador principal da loja online
 */
const StoreApp = {
    config: {
        apiUrl: '/api',
        currency: '€',
        locale: 'pt-PT',
        api: null // Será configurado pelo store.init.js
    },
    
    // Cache de dados
    cache: {
        products: null,
        categories: null,
        favorites: null
    },
    
    // Estado da aplicação
    state: {
        currentCategory: null,
        currentSubcategory: null,
        searchQuery: '',
        view: 'grid', // 'grid' ou 'list'
        sortOrder: 'name-asc', // Ordenação padrão
        isLoading: false,
        error: null,
        isInitializing: false // Flag para prevenir reinicialização
    },
    
    // Inicialização
    async init() {
        // Prevenir inicialização múltipla
        if (this.state.isInitializing) {
            console.error('[StoreApp] Tentativa de reinicialização bloqueada!');
            return;
        }
        
        try {
            this.state.isInitializing = true;
            console.log('[StoreApp] Iniciando aplicação de loja...');
            
            this.setupCarousel();
            this.setupCategoryToggles();
            this.setupViewToggles();
            this.setupFloatingCart();
            
            console.log('[StoreApp] Inicialização concluída');
        } catch (error) {
            console.error('[StoreApp] Erro durante inicialização:', error);
        } finally {
            this.state.isInitializing = false;
        }
    },

    // Configurar carrossel
    setupCarousel() {
        const carousel = document.querySelector('[data-carousel="static"]');
        if (carousel) {
            let currentSlide = 0;
            const items = carousel.querySelectorAll('[data-carousel-item]');
            const prevButton = carousel.querySelector('[data-carousel-prev]');
            const nextButton = carousel.querySelector('[data-carousel-next]');
            
            const showSlide = (index) => {
                items.forEach(item => item.classList.add('hidden'));
                items[index].classList.remove('hidden');
            };
            
            const nextSlide = () => {
                currentSlide = (currentSlide + 1) % items.length;
                showSlide(currentSlide);
            };
            
            const prevSlide = () => {
                currentSlide = (currentSlide - 1 + items.length) % items.length;
                showSlide(currentSlide);
            };
            
            if (prevButton) prevButton.addEventListener('click', prevSlide);
            if (nextButton) nextButton.addEventListener('click', nextSlide);
            
            // Auto-play do carrossel
            setInterval(nextSlide, 5000);
        }
    },

    // Configurar toggles de categoria
    setupCategoryToggles() {
        const categoryButtons = document.querySelectorAll('.category-button');
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const chevron = this.querySelector('.fa-chevron-right');
                const subcategoryList = this.nextElementSibling;
                
                if (chevron && subcategoryList) {
                    subcategoryList.classList.toggle('hidden');
                    chevron.classList.toggle('rotate-90');
                }
            });
        });
    },

    // Configurar toggles de visualização
    setupViewToggles() {
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');
        const productsGrid = document.getElementById('products-grid');
        
        if (gridViewBtn && listViewBtn && productsGrid) {
            gridViewBtn.addEventListener('click', () => {
                this.state.view = 'grid';
                this.updateView();
            });
            
            listViewBtn.addEventListener('click', () => {
                this.state.view = 'list';
                this.updateView();
            });
        }
    },

    // Configurar carrinho flutuante
    setupFloatingCart() {
        const floatingCart = document.getElementById('floating-cart');
        const closeFloatingCartBtn = document.getElementById('close-floating-cart');
        
        if (floatingCart && closeFloatingCartBtn) {
            closeFloatingCartBtn.addEventListener('click', () => {
                floatingCart.classList.add('hidden');
            });
        }
    },
    
    // Atualizar visualização
    updateView() {
        const productsGrid = document.getElementById('products-grid');
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');
        
        if (!productsGrid || !gridViewBtn || !listViewBtn) return;
        
        if (this.state.view === 'grid') {
            productsGrid.classList.remove('grid-cols-1');
            productsGrid.classList.add('md:grid-cols-2', 'xl:grid-cols-3');
            
            gridViewBtn.classList.remove('bg-gray-200', 'text-gray-700');
            gridViewBtn.classList.add('bg-blue-600', 'text-white');
            
            listViewBtn.classList.remove('bg-blue-600', 'text-white');
            listViewBtn.classList.add('bg-gray-200', 'text-gray-700');
        } else {
            productsGrid.classList.remove('md:grid-cols-2', 'xl:grid-cols-3');
            productsGrid.classList.add('grid-cols-1');
            
            listViewBtn.classList.remove('bg-gray-200', 'text-gray-700');
            listViewBtn.classList.add('bg-blue-600', 'text-white');
            
            gridViewBtn.classList.remove('bg-blue-600', 'text-white');
            gridViewBtn.classList.add('bg-gray-200', 'text-gray-700');
        }
    },

    // Renderizar produtos
    renderProducts(products) {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;
        
        if (!products || products.length === 0) {
            productsGrid.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        productsGrid.innerHTML = products.map(product => this.getProductCardHTML(product)).join('');
        this.setupProductEventListeners();
    },

    // Template para estado vazio
    getEmptyStateHTML() {
        return `
            <div class="col-span-full flex flex-col items-center justify-center py-12">
                <i class="fas fa-box-open text-gray-400 text-5xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p class="text-gray-500">Não encontramos produtos para exibir neste momento.</p>
            </div>
        `;
    },

    // Template para card de produto
    getProductCardHTML(product) {
        return `
            <div class="dashboard-card p-6 product-card">
                <div class="flex items-center justify-between mb-4">
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        ${product.productFamily}
                    </span>
                    <button class="favorite-toggle text-gray-400 hover:text-yellow-500" data-product-id="${product.parentId}">
                        <i class="far fa-star"></i>
                    </button>
                </div>
                <div class="text-center mb-4">
                    <img src="${product.photo || '/images/placeholder.svg'}" 
                         alt="${product.productName}" 
                         class="mx-auto h-28 object-contain mb-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-1">${product.productName}</h3>
                    <p class="text-lg font-bold text-gray-900 mb-2">
                        ${this.formatCurrency(product.averagePrice)} 
                        <span class="text-sm font-normal text-gray-500">/ ${product.unitMeasure}</span>
                    </p>
                </div>
                <div class="flex items-center justify-between">
                    <a href="detail.store.html?id=${product.parentId}" class="text-blue-600 hover:text-blue-800 text-sm">
                        <i class="fas fa-info-circle mr-1"></i> Detalhes
                    </a>
                    <div class="flex items-center">
                        <button class="decrement-btn h-8 w-8 rounded-l-lg border border-gray-300 bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <i class="fas fa-minus text-gray-600"></i>
                        </button>
                        <input type="number" value="0" min="0" 
                               class="quantity-input h-8 w-12 border-t border-b border-gray-300 text-center text-sm"
                               data-product-id="${product.parentId}">
                        <button class="increment-btn h-8 w-8 rounded-r-lg border border-gray-300 bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <i class="fas fa-plus text-gray-600"></i>
                        </button>
                        <button class="ml-2 h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors text-white add-to-cart-btn"
                                data-product-id="${product.parentId}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Configurar event listeners dos produtos
    setupProductEventListeners() {
        // Botões de incremento/decremento
        document.querySelectorAll('.increment-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.parentElement.querySelector('.quantity-input');
                if (input) {
                    input.value = parseInt(input.value) + 1;
                }
            });
        });
        
        document.querySelectorAll('.decrement-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.parentElement.querySelector('.quantity-input');
                if (input && parseInt(input.value) > 0) {
                    input.value = parseInt(input.value) - 1;
                }
            });
        });
        
        // Botões de adicionar ao carrinho
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const productId = e.currentTarget.dataset.productId;
                const quantityInput = e.currentTarget.parentElement.querySelector('.quantity-input');
                const quantity = parseInt(quantityInput.value);
                
                if (quantity > 0) {
                    const product = this.cache.products.find(p => p.parentId === productId);
                    if (product) {
                        CartManager.addItem(product, { id: 'default', name: 'Fornecedor Padrão' }, quantity);
                        quantityInput.value = 0;
                    }
                }
            });
        });
        
        // Toggle de favoritos
        document.querySelectorAll('.favorite-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const icon = e.currentTarget.querySelector('i');
                if (icon) {
                    if (icon.classList.contains('far')) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        e.currentTarget.classList.add('text-yellow-400');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        e.currentTarget.classList.remove('text-yellow-400');
                    }
                }
            });
        });
    },

    // Formatar moeda
    formatCurrency(value) {
        return new Intl.NumberFormat(this.config.locale, {
            style: 'currency',
            currency: this.config.currency.replace('€', 'EUR')
        }).format(value);
    },

    // Adicionar a função para renderizar categorias
    renderCategories(categories) {
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList) return;
        
        if (!categories || categories.length === 0) {
            categoriesList.innerHTML = `
                <div class="py-4 text-center">
                    <i class="fas fa-tags text-gray-400 text-xl mb-2"></i>
                    <p class="text-gray-500 text-sm">Não encontramos categorias para mostrar neste momento.</p>
                </div>
            `;
            return;
        }
        
        categoriesList.innerHTML = categories.map(category => `
            <li>
                <button class="category-button w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors" data-category="${category.id}">
                    <span>${category.name}</span>
                    <i class="fas fa-chevron-right text-sm transition-transform"></i>
                </button>
                <ul class="pl-4 hidden">
                    ${category.subcategories.map(sub => `
                        <li>
                            <button class="subcategory-button w-full text-left p-2 text-sm rounded-lg hover:bg-gray-100 transition-colors" data-subcategory="${sub.id}">
                                ${sub.name}
                            </button>
                        </li>
                    `).join('')}
                </ul>
            </li>
        `).join('');
        
        this.setupCategoryToggles();
    },

    // Adicionar função para renderizar os favoritos
    renderFavorites(favorites) {
        const favoritesContainer = document.getElementById('favorites-container');
        if (!favoritesContainer) return;
        
        if (!favorites || favorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-8">
                    <i class="far fa-star text-gray-400 text-3xl mb-3"></i>
                    <p class="text-gray-500">Você ainda não possui produtos favoritos.</p>
                </div>
            `;
            return;
        }
        
        favoritesContainer.innerHTML = favorites.map(product => this.getProductCardHTML(product)).join('');
    }
};

// Exportar o módulo
window.StoreApp = StoreApp;