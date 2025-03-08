/**
 * Loja Online - Página de Detalhes do Produto
 * Gerencia a exibição de detalhes do produto e variantes de fornecedores
 */

document.addEventListener('DOMContentLoaded', function() {
    // Estado da aplicação
    const state = {
        product: null,
        suppliers: [],
        relatedProducts: [],
        cart: [],
        productId: null
    };

    // Elementos DOM
    const elements = {
        loadingArea: document.getElementById('loading-area'),
        productDetails: document.getElementById('product-details'),
        productImage: document.getElementById('product-image'),
        productTitle: document.getElementById('product-title'),
        productId: document.getElementById('product-id'),
        productDescription: document.getElementById('product-description'),
        productUnit: document.getElementById('product-unit'),
        categoryBadge: document.getElementById('category-badge'),
        categoryLink: document.getElementById('category-link'),
        productName: document.getElementById('product-name'),
        suppliersContainer: document.getElementById('suppliers-container'),
        relatedProducts: document.getElementById('related-products'),
        cartCount: document.getElementById('cart-count'),
        supplierCardTemplate: document.getElementById('supplier-card-template'),
        relatedProductCardTemplate: document.getElementById('related-product-card-template'),
        toastContainer: document.getElementById('toast-container')
    };

    // Inicializar
    initApp();

    /**
     * Inicializa a aplicação
     */
    async function initApp() {
        // Obter ID do produto da URL
        const urlParams = new URLSearchParams(window.location.search);
        state.productId = urlParams.get('id');
        
        if (!state.productId) {
            // Redirecionar para a loja se não houver ID
            window.location.href = 'dash.store.html';
            return;
        }
        
        // Carregar dados do carrinho do localStorage
        loadCartFromStorage();
        updateCartCount();
        
        // Carregar dados do produto
        await fetchProductDetails();
        
        // Configurar event listeners
        setupEventListeners();
    }

    /**
     * Configura os event listeners
     */
    function setupEventListeners() {
        // Delegação de eventos para botões "Adicionar ao Carrinho"
        elements.suppliersContainer.addEventListener('click', handleAddToCart);
        elements.relatedProducts.addEventListener('click', function(e) {
            const addBtn = e.target.closest('.add-to-cart-btn');
            if (addBtn) {
                e.preventDefault();
                const productId = addBtn.dataset.id;
                window.location.href = `detail.store.html?id=${productId}`;
            }
        });
    }

    /**
     * Busca os detalhes do produto da API
     */
    async function fetchProductDetails() {
        try {
            // Em um ambiente real, você faria uma chamada à API
            // fetch(`/api/products/${state.productId}`)
            
            // Simulando dados para demonstração
            await simulateApiCall();
            
            // Renderizar componentes
            renderProductDetails();
            renderSuppliers();
            renderRelatedProducts();
            
            // Esconder loading e mostrar detalhes
            elements.loadingArea.classList.add('hidden');
            elements.productDetails.classList.remove('hidden');
            
        } catch (error) {
            console.error('Erro ao carregar detalhes do produto:', error);
            showToast('Erro ao carregar detalhes do produto. Tente novamente.', 'error');
        }
    }

    /**
     * Simula uma chamada à API para obter dados do produto
     */
    async function simulateApiCall() {
        return new Promise(resolve => {
            setTimeout(() => {
                // Produto pai (ProductParent)
                state.product = {
                    id: state.productId || 'PRD-001',
                    parentId: state.productId || 'PRD-001',
                    productName: 'Filé Mignon',
                    productFamily: 'Carnes',
                    unitMeasure: 'kg',
                    averagePrice: 22.50,
                    description: 'Corte bovino nobre e macio, ideal para preparações especiais. Rico em proteínas e com pouca gordura, o filé mignon é uma das partes mais nobres do boi, sendo conhecido pela sua maciez e sabor suave.',
                    photo: '../../../images/products/file-mignon.jpg',
                    categoryClass: 'bg-red-100 text-red-800'
                };
                
                // Variantes de fornecedores (ProductList)
                state.suppliers = [
                    {
                        id: 'VAR-001',
                        productId: 'PRD-001-SUP1',
                        supplierIdRef: 'SUP-001',
                        supplierName: 'FreshMeat Distribuidora',
                        supplierEmail: 'contato@freshmeat.com',
                        currentPrice: 21.90,
                        supplierUnitMeasure: 'kg',
                        minimumQuantity: 1,
                        reference: 'Embalagem a vácuo. Produto refrigerado de alta qualidade.',
                        priority: 4,
                        locations: ['Porto', 'Matosinhos', 'Braga']
                    },
                    {
                        id: 'VAR-002',
                        productId: 'PRD-001-SUP2',
                        supplierIdRef: 'SUP-002',
                        supplierName: 'Açougue Premium',
                        supplierEmail: 'vendas@acouguepremium.com',
                        currentPrice: 23.50,
                        supplierUnitMeasure: 'kg',
                        minimumQuantity: 2,
                        reference: 'Filé fresco resfriado. Ideal para grelhados e assados.',
                        priority: 3,
                        locations: ['Porto', 'Lisboa']
                    },
                    {
                        id: 'VAR-003',
                        productId: 'PRD-001-SUP3',
                        supplierIdRef: 'SUP-003',
                        supplierName: 'CarnesOnline',
                        supplierEmail: 'pedidos@carnesonline.com',
                        currentPrice: 20.80,
                        supplierUnitMeasure: 'kg',
                        minimumQuantity: 1.5,
                        reference: 'Peça inteira. Produto congelado de procedência certificada.',
                        priority: 5,
                        locations: ['Porto', 'Matosinhos', 'Braga', 'Lisboa']
                    }
                ];
                
                // Produtos relacionados
                state.relatedProducts = [
                    {
                        id: 'PRD-002',
                        name: 'Picanha',
                        description: 'Corte bovino para churrasco',
                        price: 28.90,
                        unit: 'kg',
                        image: '../../../images/products/picanha.jpg'
                    },
                    {
                        id: 'PRD-011',
                        name: 'Contra Filé',
                        description: 'Corte bovino suculento',
                        price: 19.90,
                        unit: 'kg',
                        image: '../../../images/products/product-11.jpg'
                    },
                    {
                        id: 'PRD-012',
                        name: 'Alcatra',
                        description: 'Corte bovino versátil',
                        price: 18.50,
                        unit: 'kg',
                        image: '../../../images/products/product-12.jpg'
                    },
                    {
                        id: 'PRD-013',
                        name: 'Patinho',
                        description: 'Corte bovino magro',
                        price: 16.70,
                        unit: 'kg',
                        image: '../../../images/products/product-13.jpg'
                    }
                ];
                
                resolve();
            }, 1000); // Simula 1 segundo de delay
        });
    }

    /**
     * Renderiza os detalhes do produto
     */
    function renderProductDetails() {
        // Atualizar imagem
        elements.productImage.src = state.product.photo;
        elements.productImage.alt = state.product.productName;
        
        // Atualizar textos
        elements.productTitle.textContent = state.product.productName;
        elements.productId.textContent = state.product.parentId;
        elements.productDescription.textContent = state.product.description;
        elements.productUnit.textContent = state.product.unitMeasure;
        
        // Atualizar categoria
        elements.categoryBadge.textContent = state.product.productFamily;
        elements.categoryBadge.className = `inline-block ${state.product.categoryClass} text-xs font-semibold px-3 py-1 rounded-full mb-4`;
        
        // Atualizar breadcrumb
        elements.categoryLink.textContent = state.product.productFamily;
        elements.categoryLink.href = `dash.store.html?category=${state.product.productFamily}`;
        elements.productName.textContent = state.product.productName;
        
        // Atualizar título da página
        document.title = `${state.product.productName} - Loja Online`;
    }

    /**
     * Renderiza as variantes de fornecedores
     */
    function renderSuppliers() {
        elements.suppliersContainer.innerHTML = '';
        
        if (state.suppliers.length === 0) {
            const noSuppliers = document.createElement('div');
            noSuppliers.className = 'bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800';
            noSuppliers.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle mr-3"></i>
                    <p>Nenhum fornecedor disponível para este produto no momento.</p>
                </div>
            `;
            elements.suppliersContainer.appendChild(noSuppliers);
            return;
        }
        
        // Ordenar fornecedores por preço (do mais barato para o mais caro)
        const sortedSuppliers = [...state.suppliers].sort((a, b) => a.currentPrice - b.currentPrice);
        
        sortedSuppliers.forEach(supplier => {
            const supplierCard = createSupplierCard(supplier);
            elements.suppliersContainer.appendChild(supplierCard);
        });
    }

    /**
     * Cria um card de fornecedor a partir do template
     */
    function createSupplierCard(supplier) {
        const template = elements.supplierCardTemplate.content.cloneNode(true);
        
        // Gerar estrelas com base na prioridade
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= supplier.priority) {
                starsHtml += '<i class="fas fa-star text-yellow-400"></i>';
            } else {
                starsHtml += '<i class="far fa-star text-gray-300"></i>';
            }
        }
        
        // Gerar badges de localização
        let locationsHtml = '';
        supplier.locations.forEach(location => {
            locationsHtml += `<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">${location}</span>`;
        });
        
        // Substituir placeholders pelo conteúdo real
        const html = template.querySelector('.supplier-card').outerHTML
            .replace(/{{id}}/g, supplier.id)
            .replace(/{{supplierName}}/g, supplier.supplierName)
            .replace(/{{price}}/g, supplier.currentPrice.toFixed(2))
            .replace(/{{unit}}/g, supplier.supplierUnitMeasure)
            .replace(/{{minOrder}}/g, supplier.minimumQuantity)
            .replace(/{{reference}}/g, supplier.reference || '')
            .replace(/{{stars}}/g, starsHtml)
            .replace(/{{priority}}/g, supplier.priority)
            .replace(/{{locations}}/g, locationsHtml);
        
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        
        return tempContainer.firstElementChild;
    }

    /**
     * Renderiza os produtos relacionados
     */
    function renderRelatedProducts() {
        elements.relatedProducts.innerHTML = '';
        
        state.relatedProducts.forEach(product => {
            const productCard = createRelatedProductCard(product);
            elements.relatedProducts.appendChild(productCard);
        });
    }

    /**
     * Cria um card de produto relacionado a partir do template
     */
    function createRelatedProductCard(product) {
        const template = elements.relatedProductCardTemplate.content.cloneNode(true);
        
        // Substituir placeholders pelo conteúdo real
        const html = template.querySelector('.product-card').outerHTML
            .replace(/{{id}}/g, product.id)
            .replace(/{{image}}/g, product.image)
            .replace(/{{name}}/g, product.name)
            .replace(/{{description}}/g, product.description)
            .replace(/{{price}}/g, product.price.toFixed(2))
            .replace(/{{unit}}/g, product.unit);
        
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        
        return tempContainer.firstElementChild;
    }

    /**
     * Manipula a adição de produtos ao carrinho
     */
    function handleAddToCart(e) {
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (!addToCartBtn) return;
        
        e.preventDefault();
        
        const supplierId = addToCartBtn.dataset.id;
        const supplier = state.suppliers.find(s => s.id === supplierId);
        
        if (supplier) {
            // Verificar se o produto já está no carrinho
            const existingCartItem = state.cart.find(item => item.id === supplier.id);
            
            if (existingCartItem) {
                existingCartItem.quantity += 1;
                showToast(`Quantidade de ${state.product.productName} atualizada no carrinho!`, 'success');
            } else {
                state.cart.push({
                    id: supplier.id,
                    productId: state.product.id,
                    name: state.product.productName,
                    supplier: supplier.supplierName,
                    price: supplier.currentPrice,
                    unit: supplier.supplierUnitMeasure,
                    image: state.product.photo,
                    quantity: 1,
                    minOrder: supplier.minimumQuantity
                });
                showToast(`${state.product.productName} adicionado ao carrinho!`, 'success');
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
});