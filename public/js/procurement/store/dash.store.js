/**
 * Loja Online - Dashboard Principal
 * Gerencia a exibição de produtos, filtros e adicionar ao carrinho
 */

document.addEventListener('DOMContentLoaded', function() {
    // Estado da aplicação
    const state = {
        products: [],
        filteredProducts: [],
        featuredProducts: [],
        cart: [],
        currentPage: 1,
        itemsPerPage: 8,
        searchTerm: '',
        categoryFilter: '',
        sortOption: 'name-asc'
    };

    // Elementos DOM
    const elements = {
        searchInput: document.getElementById('search-input'),
        categoryFilter: document.getElementById('category-filter'),
        sortFilter: document.getElementById('sort-filter'),
        featuredProductsContainer: document.getElementById('featured-products'),
        allProductsContainer: document.getElementById('all-products'),
        productCount: document.getElementById('product-count'),
        cartCount: document.getElementById('cart-count'),
        paginationNumbers: document.getElementById('pagination-numbers'),
        prevPageBtn: document.getElementById('prev-page'),
        nextPageBtn: document.getElementById('next-page'),
        categoryCards: document.querySelectorAll('.category-card'),
        toastContainer: document.getElementById('toast-container'),
        productCardTemplate: document.getElementById('product-card-template')
    };

    // Inicializar
    initApp();

    /**
     * Inicializa a aplicação
     */
    async function initApp() {
        // Carregar dados do carrinho do localStorage
        loadCartFromStorage();
        updateCartCount();

        // Carregar produtos
        await fetchProducts();

        // Configurar event listeners
        setupEventListeners();
    }

    /**
     * Configura os event listeners
     */
    function setupEventListeners() {
        // Pesquisa
        elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
        
        // Filtros
        elements.categoryFilter.addEventListener('change', applyFilters);
        elements.sortFilter.addEventListener('change', applyFilters);
        
        // Cards de categoria
        elements.categoryCards.forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.dataset.category;
                elements.categoryFilter.value = category;
                applyFilters();
                
                // Scroll para a seção de produtos
                document.querySelector('#all-products').scrollIntoView({ behavior: 'smooth' });
            });
        });
        
        // Paginação
        elements.prevPageBtn.addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderProductList();
            }
        });
        
        elements.nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(state.filteredProducts.length / state.itemsPerPage);
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderProductList();
            }
        });
        
        // Delegação de eventos para botões "Adicionar ao Carrinho"
        elements.allProductsContainer.addEventListener('click', handleAddToCart);
        elements.featuredProductsContainer.addEventListener('click', handleAddToCart);

        // Adicionar event listener para cliques nos cards de produto
        elements.allProductsContainer.addEventListener('click', function(e) {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const productId = productCard.querySelector('.add-to-cart-btn').dataset.id;
                window.location.href = `detail.store.html?id=${productId}`;
            }
        });
    }

    /**
     * Busca os produtos da API
     */
    async function fetchProducts() {
        try {
            // Em um ambiente real, você faria uma chamada à API
            // fetch('/api/products')
            
            // Simulando dados para demonstração
            const mockProducts = generateMockProducts();
            
            // Processar dados
            state.products = mockProducts;
            state.filteredProducts = [...mockProducts];
            
            // Selecionar produtos em destaque
            state.featuredProducts = selectFeaturedProducts(mockProducts);
            
            // Renderizar produtos
            renderFeaturedProducts();
            renderProductList();
            
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            showToast('Erro ao carregar produtos. Tente novamente.', 'error');
        }
    }

    /**
     * Gera produtos fictícios para demonstração
     */
    function generateMockProducts() {
        const categories = [
            { id: 'Carnes', class: 'bg-red-100 text-red-800' },
            { id: 'Bebidas', class: 'bg-blue-100 text-blue-800' },
            { id: 'Vegetais', class: 'bg-green-100 text-green-800' },
            { id: 'Laticínios', class: 'bg-yellow-100 text-yellow-800' },
            { id: 'Embalagens', class: 'bg-gray-100 text-gray-800' }
        ];
        
        const units = ['kg', 'g', 'un', 'L', 'ml', 'pct', 'cx'];
        
        const products = [];
        
        // Carnes
        products.push({
            id: 'PRD-001',
            name: 'Filé Mignon',
            description: 'Corte bovino nobre e macio',
            category: 'Carnes',
            categoryClass: 'bg-red-100 text-red-800',
            image: '../../../images/products/file-mignon.jpg',
            price: 22.50,
            unit: 'kg',
            featured: true
        });
        
        products.push({
            id: 'PRD-002',
            name: 'Picanha',
            description: 'Corte bovino para churrasco',
            category: 'Carnes',
            categoryClass: 'bg-red-100 text-red-800',
            image: '../../../images/products/picanha.jpg',
            price: 28.90,
            unit: 'kg',
            featured: true
        });
        
        // Bebidas
        products.push({
            id: 'PRD-003',
            name: 'Vinho Tinto',
            description: 'Vinho tinto seco importado',
            category: 'Bebidas',
            categoryClass: 'bg-blue-100 text-blue-800',
            image: '../../../images/products/vinho.jpg',
            price: 35.00,
            unit: 'un',
            featured: true
        });
        
        products.push({
            id: 'PRD-004',
            name: 'Água Mineral',
            description: 'Água mineral sem gás',
            category: 'Bebidas',
            categoryClass: 'bg-blue-100 text-blue-800',
            image: '../../../images/products/agua.jpg',
            price: 1.50,
            unit: 'un',
            featured: false
        });
        
        // Vegetais
        products.push({
            id: 'PRD-005',
            name: 'Tomate',
            description: 'Tomate fresco para salada',
            category: 'Vegetais',
            categoryClass: 'bg-green-100 text-green-800',
            image: '../../../images/products/tomate.jpg',
            price: 4.90,
            unit: 'kg',
            featured: false
        });
        
        products.push({
            id: 'PRD-006',
            name: 'Alface',
            description: 'Alface crespa fresca',
            category: 'Vegetais',
            categoryClass: 'bg-green-100 text-green-800',
            image: '../../../images/products/alface.jpg',
            price: 2.50,
            unit: 'un',
            featured: false
        });
        
        // Laticínios
        products.push({
            id: 'PRD-007',
            name: 'Queijo Mussarela',
            description: 'Queijo mussarela fatiado',
            category: 'Laticínios',
            categoryClass: 'bg-yellow-100 text-yellow-800',
            image: '../../../images/products/queijo.jpg',
            price: 18.90,
            unit: 'kg',
            featured: true
        });
        
        products.push({
            id: 'PRD-008',
            name: 'Leite Integral',
            description: 'Leite integral pasteurizado',
            category: 'Laticínios',
            categoryClass: 'bg-yellow-100 text-yellow-800',
            image: '../../../images/products/leite.jpg',
            price: 3.80,
            unit: 'L',
            featured: false
        });
        
        // Embalagens
        products.push({
            id: 'PRD-009',
            name: 'Embalagem para Viagem',
            description: 'Caixa para delivery de alimentos',
            category: 'Embalagens',
            categoryClass: 'bg-gray-100 text-gray-800',
            image: '../../../images/products/embalagem.jpg',
            price: 0.75,
            unit: 'un',
            featured: false
        });
        
        products.push({
            id: 'PRD-010',
            name: 'Rolo de Filme PVC',
            description: 'Filme plástico para alimentos',
            category: 'Embalagens',
            categoryClass: 'bg-gray-100 text-gray-800',
            image: '../../../images/products/filme-pvc.jpg',
            price: 5.50,
            unit: 'un',
            featured: false
        });
        
        // Gere mais produtos para ter um total de 20
        for (let i = 11; i <= 20; i++) {
            const categoryIndex = Math.floor(Math.random() * categories.length);
            const category = categories[categoryIndex];
            const unitIndex = Math.floor(Math.random() * units.length);
            
            products.push({
                id: `PRD-0${i}`,
                name: `Produto ${i}`,
                description: `Descrição do produto ${i}`,
                category: category.id,
                categoryClass: category.class,
                image: `../../../images/products/product-${i}.jpg`,
                price: (Math.random() * 50 + 1).toFixed(2) * 1,
                unit: units[unitIndex],
                featured: false
            });
        }
        
        return products;
    }

    /**
     * Seleciona produtos para destaque
     */
    function selectFeaturedProducts(products) {
        return products.filter(product => product.featured).slice(0, 4);
    }

    /**
     * Renderiza os produtos em destaque
     */
    function renderFeaturedProducts() {
        elements.featuredProductsContainer.innerHTML = '';
        
        state.featuredProducts.forEach(product => {
            const productCard = createProductCard(product);
            elements.featuredProductsContainer.appendChild(productCard);
        });
        
        // Se temos menos de 4 produtos em destaque, adicionar placeholders
        if (state.featuredProducts.length < 4) {
            const placeholdersNeeded = 4 - state.featuredProducts.length;
            for (let i = 0; i < placeholdersNeeded; i++) {
                const placeholder = document.createElement('div');
                placeholder.className = 'bg-white rounded-lg shadow-md p-4 h-80 flex items-center justify-center';
                placeholder.innerHTML = '<p class="text-gray-400">Produto em destaque</p>';
                elements.featuredProductsContainer.appendChild(placeholder);
            }
        }
    }

    /**
     * Renderiza a lista de produtos com paginação
     */
    function renderProductList() {
        elements.allProductsContainer.innerHTML = '';
        
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const end = start + state.itemsPerPage;
        const productsToShow = state.filteredProducts.slice(start, end);
        
        productsToShow.forEach(product => {
            const productCard = createProductCard(product);
            elements.allProductsContainer.appendChild(productCard);
        });
        
        // Atualizar contagem de produtos
        elements.productCount.textContent = `Exibindo ${productsToShow.length} de ${state.filteredProducts.length} produtos`;
        
        // Atualizar paginação
        updatePagination();
    }

    /**
     * Cria um card de produto a partir do template
     */
    function createProductCard(product) {
        const template = elements.productCardTemplate.content.cloneNode(true);
        
        // Substituir placeholders pelo conteúdo real
        const html = template.querySelector('.product-card').outerHTML
            .replace(/{{id}}/g, product.id)
            .replace(/{{image}}/g, product.image)
            .replace(/{{name}}/g, product.name)
            .replace(/{{description}}/g, product.description)
            .replace(/{{category}}/g, product.category)
            .replace(/{{categoryClass}}/g, product.categoryClass)
            .replace(/{{price}}/g, product.price.toFixed(2))
            .replace(/{{unit}}/g, product.unit);
        
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        
        return tempContainer.firstElementChild;
    }

    /**
     * Atualiza a paginação
     */
    function updatePagination() {
        const totalPages = Math.ceil(state.filteredProducts.length / state.itemsPerPage);
        
        // Atualizar botões de navegação
        elements.prevPageBtn.disabled = state.currentPage === 1;
        elements.nextPageBtn.disabled = state.currentPage === totalPages;
        
        // Gerar números de página
        elements.paginationNumbers.innerHTML = '';
        
        // Determinar quais páginas mostrar (máximo 5)
        let startPage = Math.max(1, state.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `w-10 h-10 border rounded-md ${i === state.currentPage ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                state.currentPage = i;
                renderProductList();
            });
            
            elements.paginationNumbers.appendChild(pageBtn);
        }
    }

    /**
     * Manipula a pesquisa de produtos
     */
    function handleSearch() {
        state.searchTerm = elements.searchInput.value.trim().toLowerCase();
        state.currentPage = 1;
        applyFilters();
    }

    /**
     * Aplica filtros aos produtos
     */
    function applyFilters() {
        const searchTerm = state.searchTerm;
        const categoryFilter = elements.categoryFilter.value;
        const sortOption = elements.sortFilter.value;
        
        // Filtrar produtos
        let filtered = state.products.filter(product => {
            // Filtro de pesquisa
            const matchesSearch = !searchTerm || 
                product.name.toLowerCase().includes(searchTerm) || 
                product.description.toLowerCase().includes(searchTerm);
            
            // Filtro de categoria
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            
            return matchesSearch && matchesCategory;
        });
        
        // Ordenar produtos
        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                default:
                    return 0;
            }
        });
        
        state.filteredProducts = filtered;
        state.currentPage = 1;
        renderProductList();
    }

    /**
     * Manipula a adição de produtos ao carrinho
     */
    function handleAddToCart(e) {
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (!addToCartBtn) return;
        
        e.preventDefault();
        
        const productId = addToCartBtn.dataset.id;
        const product = state.products.find(p => p.id === productId);
        
        if (product) {
            // Verificar se o produto já está no carrinho
            const existingCartItem = state.cart.find(item => item.id === productId);
            
            if (existingCartItem) {
                existingCartItem.quantity += 1;
                showToast(`Quantidade de ${product.name} atualizada no carrinho!`, 'success');
            } else {
                state.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    unit: product.unit,
                    image: product.image,
                    quantity: 1
                });
                showToast(`${product.name} adicionado ao carrinho!`, 'success');
            }
            
            // Atualizar localStorage e contador do carrinho
            saveCartToStorage();
            updateCartCount();
        }
    }

    /**
     * Carrega o carrinho do localStorage
     */
    function loadCartFromStorage() {
        const savedCart = localStorage.getItem('storeCart');
        if (savedCart) {
            state.cart = JSON.parse(savedCart);
        }
    }

    /**
     * Salva o carrinho no localStorage
     */
    function saveCartToStorage() {
        localStorage.setItem('storeCart', JSON.stringify(state.cart));
    }

    /**
     * Atualiza o contador de itens do carrinho
     */
    function updateCartCount() {
        const totalItems = state.cart.reduce((total, item) => total + item.quantity, 0);
        elements.cartCount.textContent = totalItems;
        
        // Mostrar/esconder o badge dependendo se há itens
        if (totalItems > 0) {
            elements.cartCount.classList.remove('hidden');
        } else {
            elements.cartCount.classList.add('hidden');
        }
    }

    /**
     * Exibe uma notificação toast
     */
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type} mb-3`;
        toast.innerHTML = `
            <div class="rounded-md p-4 flex items-center justify-between ${
                type === 'success' ? 'bg-green-100 border border-green-200' : 
                type === 'error' ? 'bg-red-100 border border-red-200' : 
                'bg-blue-100 border border-blue-200'
            }">
                <div class="flex items-center">
                    <i class="fas fa-${
                        type === 'success' ? 'check-circle text-green-500' : 
                        type === 'error' ? 'exclamation-circle text-red-500' : 
                        'info-circle text-blue-500'
                    } mr-3"></i>
                    <p class="${
                        type === 'success' ? 'text-green-700' : 
                        type === 'error' ? 'text-red-700' : 
                        'text-blue-700'
                    }">${message}</p>
                </div>
                <button class="ml-4 focus:outline-none" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times ${
                        type === 'success' ? 'text-green-500' : 
                        type === 'error' ? 'text-red-500' : 
                        'text-blue-500'
                    }"></i>
                </button>
            </div>
        `;
        
        elements.toastContainer.appendChild(toast);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    /**
     * Função para limitar a frequência de chamadas a outra função
     */
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
}); 