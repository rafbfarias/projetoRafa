/**
 * detail.store.js
 * Script para a página de detalhes do produto
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar se estamos na página de detalhes do produto
    if (!window.location.pathname.includes('detail.store.html')) {
        // Não estamos na página de detalhes, então não inicializa
        console.log('[DetailStore] Não estamos na página de detalhes, ignorando inicialização');
        return;
    }
    
    console.log('[DetailStore] Inicializando página de detalhes...');
    
    // Estado da página
    const state = {
        product: null,
        suppliers: [],
        relatedProducts: [],
        selectedSupplierId: null
    };
    
    // Inicialização da aplicação
    async function initApp() {
        try {
            console.log('[DetailStore] Buscando dados do produto...');
            
            // Extrair ID do produto da URL
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            
            if (!productId) {
                // Mostrar uma mensagem amigável em vez de erro técnico
                showEmptyState('Produto não encontrado', 'Não foi possível encontrar o produto solicitado. Por favor, volte para a loja e selecione um produto.');
                return;
            }
            
            // Buscar detalhes do produto
            await fetchProductDetails(productId);
            
            // Renderizar a página
            renderProductDetails();
            renderSuppliers();
            renderRelatedProducts();
            
            // Configurar event listeners
            setupEventListeners();
            
            console.log('[DetailStore] Inicialização concluída');
        } catch (error) {
            console.error('[DetailStore] Erro durante inicialização:', error);
            showEmptyState('Erro ao carregar produto', 'Ocorreu um erro ao tentar carregar os detalhes do produto. Por favor, tente novamente mais tarde.');
        }
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Botões de adicionar ao carrinho
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', handleAddToCart);
        });
        
        // Seleção de fornecedor
        document.querySelectorAll('.supplier-card').forEach(card => {
            card.addEventListener('click', function() {
                const supplierId = this.dataset.supplierId;
                selectSupplier(supplierId);
            });
        });
        
        // Controles de quantidade
        document.querySelectorAll('.increment-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.parentElement.querySelector('.quantity-input');
                input.value = parseInt(input.value) + 1;
            });
        });
        
        document.querySelectorAll('.decrement-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.parentElement.querySelector('.quantity-input');
                if (parseInt(input.value) > 0) {
                    input.value = parseInt(input.value) - 1;
                }
            });
        });
    }
    
    // Buscar detalhes do produto
    async function fetchProductDetails(productId) {
        try {
            // Simular chamada à API
            const result = await simulateApiCall(productId);
            
            if (!result.success) {
                throw new Error(result.error || 'Erro ao buscar dados do produto');
            }
            
            state.product = result.data.product;
            state.suppliers = result.data.suppliers;
            state.relatedProducts = result.data.relatedProducts;
            
            // Selecionar o primeiro fornecedor por padrão
            if (state.suppliers.length > 0) {
                state.selectedSupplierId = state.suppliers[0].id;
            }
            
            return result.data;
        } catch (error) {
            console.error('[DetailStore] Erro ao buscar detalhes do produto:', error);
            throw error;
        }
    }
    
    // API simulada para testes
    async function simulateApiCall(productId) {
        // Simular um delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            success: true,
            data: {
                product: {
                    id: productId,
                    name: 'Produto de Exemplo',
                    description: 'Uma descrição detalhada do produto para demonstração.',
                    category: 'Categoria Exemplo',
                    image: '/images/placeholder.svg',
                    specifications: [
                        { name: 'Origem', value: 'Brasil' },
                        { name: 'Tipo', value: 'Orgânico' },
                        { name: 'Certificações', value: 'ISO 9001, Orgânico' }
                    ]
                },
                suppliers: [
                    {
                        id: 'sup1',
                        name: 'Fornecedor A',
                        rating: 4.5,
                        price: 29.90,
                        unit: 'kg',
                        stock: 15,
                        deliveryTime: '1-2 dias',
                        minOrder: 1
                    },
                    {
                        id: 'sup2',
                        name: 'Fornecedor B',
                        rating: 4.2,
                        price: 28.50,
                        unit: 'kg',
                        stock: 8,
                        deliveryTime: '2-3 dias',
                        minOrder: 2
                    },
                    {
                        id: 'sup3',
                        name: 'Fornecedor C',
                        rating: 3.8,
                        price: 27.90,
                        unit: 'kg',
                        stock: 20,
                        deliveryTime: '3-5 dias',
                        minOrder: 1
                    }
                ],
                relatedProducts: [
                    {
                        id: 'rel1',
                        name: 'Produto Relacionado 1',
                        image: '/images/placeholder.svg',
                        price: 19.90,
                        unit: 'kg'
                    },
                    {
                        id: 'rel2',
                        name: 'Produto Relacionado 2',
                        image: '/images/placeholder.svg',
                        price: 15.90,
                        unit: 'kg'
                    },
                    {
                        id: 'rel3',
                        name: 'Produto Relacionado 3',
                        image: '/images/placeholder.svg',
                        price: 22.90,
                        unit: 'kg'
                    }
                ]
            }
        };
    }
    
    // Renderizar detalhes do produto
    function renderProductDetails() {
        const productTitle = document.getElementById('product-title');
        const productDescription = document.getElementById('product-description');
        const productImage = document.getElementById('product-image');
        const productCategory = document.getElementById('product-category');
        const productSpecifications = document.getElementById('product-specifications');
        
        if (productTitle) productTitle.textContent = state.product.name;
        if (productDescription) productDescription.textContent = state.product.description;
        if (productImage) {
            productImage.src = state.product.image;
            productImage.alt = state.product.name;
        }
        if (productCategory) productCategory.textContent = state.product.category;
        
        if (productSpecifications) {
            productSpecifications.innerHTML = state.product.specifications.map(spec => `
                <div class="flex justify-between border-b border-gray-200 py-2">
                    <span class="font-medium">${spec.name}</span>
                    <span>${spec.value}</span>
                </div>
            `).join('');
        }
    }
    
    // Renderizar fornecedores
    function renderSuppliers() {
        const suppliersContainer = document.getElementById('suppliers-container');
        
        if (!suppliersContainer) return;
        
        suppliersContainer.innerHTML = state.suppliers.map(supplier => 
            createSupplierCard(supplier)
        ).join('');
        
        // Marcar o fornecedor selecionado
        const selectedCard = document.querySelector(`.supplier-card[data-supplier-id="${state.selectedSupplierId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('border-blue-500', 'bg-blue-50');
        }
    }
    
    // Criar card de fornecedor
    function createSupplierCard(supplier) {
        const isSelected = supplier.id === state.selectedSupplierId;
        
        return `
            <div class="supplier-card p-4 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}" data-supplier-id="${supplier.id}">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-medium">${supplier.name}</h3>
                    <div class="flex items-center text-sm">
                        <i class="fas fa-star text-yellow-400 mr-1"></i>
                        <span>${supplier.rating.toFixed(1)}</span>
                    </div>
                </div>
                <div class="flex justify-between mb-2">
                    <div>
                        <span class="text-xl font-bold">€${supplier.price.toFixed(2)}</span>
                        <span class="text-gray-500">/${supplier.unit}</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        Estoque: <span class="font-medium">${supplier.stock}</span>
                    </div>
                </div>
                <div class="flex justify-between text-sm text-gray-600">
                    <div>Entrega: ${supplier.deliveryTime}</div>
                    <div>Min: ${supplier.minOrder} ${supplier.unit}</div>
                </div>
                ${isSelected ? '<div class="mt-2 text-blue-600 text-sm font-medium">✓ Selecionado</div>' : ''}
            </div>
        `;
    }
    
    // Renderizar produtos relacionados
    function renderRelatedProducts() {
        const relatedContainer = document.getElementById('related-products');
        
        if (!relatedContainer) return;
        
        relatedContainer.innerHTML = state.relatedProducts.map(product => 
            createRelatedProductCard(product)
        ).join('');
    }
    
    // Criar card de produto relacionado
    function createRelatedProductCard(product) {
        return `
            <div class="dashboard-card p-4">
                <div class="text-center mb-3">
                    <img src="${product.image}" alt="${product.name}" class="mx-auto h-24 object-contain">
                </div>
                <h4 class="font-medium text-sm mb-2">${product.name}</h4>
                <div class="flex justify-between items-center">
                    <div class="font-bold">€${product.price.toFixed(2)}</div>
                    <a href="detail.store.html?id=${product.id}" class="text-blue-600 hover:text-blue-800 text-xs">
                        Ver Detalhes
                    </a>
                </div>
            </div>
        `;
    }
    
    // Selecionar fornecedor
    function selectSupplier(supplierId) {
        state.selectedSupplierId = supplierId;
        renderSuppliers();
    }
    
    // Mostrar estado vazio ou erro
    function showEmptyState(title, message) {
        // Esconder o conteúdo principal
        const mainContent = document.getElementById('product-content');
        if (mainContent) {
            mainContent.classList.add('hidden');
        }
        
        // Criar e mostrar estado vazio
        const emptyStateHTML = `
            <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
                <i class="fas fa-exclamation-circle text-gray-400 text-5xl mb-4"></i>
                <h2 class="text-xl font-medium text-gray-900 mb-2">${title}</h2>
                <p class="text-gray-500 max-w-md mb-6">${message}</p>
                <a href="dash.store.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Voltar para a Loja
                </a>
            </div>
        `;
        
        // Inserir o estado vazio na página
        const container = document.createElement('div');
        container.className = 'dashboard-card p-8';
        container.innerHTML = emptyStateHTML;
        
        // Remover mensagem de erro se existir
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Adicionar no documento
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
            mainContainer.prepend(container);
        }
    }
    
    // Mostrar mensagem de erro (para compatibilidade com código existente)
    function showError(message) {
        showEmptyState('Erro', message);
    }
    
    // Manipulador para adicionar ao carrinho
    function handleAddToCart(e) {
        e.preventDefault();
        
        // Verificar se o CartManager está disponível
        if (!window.CartManager) {
            console.error('[DetailStore] CartManager não encontrado ou fornecedor inválido!');
            return;
        }
        
        // Obter fornecedor selecionado
        const selectedSupplier = state.suppliers.find(s => s.id === state.selectedSupplierId);
        if (!selectedSupplier) return;
        
        // Obter quantidade
        const quantityInput = document.querySelector('.quantity-input');
        const quantity = parseInt(quantityInput?.value || 0);
        
        if (quantity <= 0) {
            alert('Por favor, selecione uma quantidade válida.');
            return;
        }
        
        // Adicionar ao carrinho
        CartManager.addToCart({
            productId: state.product.id,
            productName: state.product.name,
            supplierId: selectedSupplier.id,
            supplierName: selectedSupplier.name,
            price: selectedSupplier.price,
            unit: selectedSupplier.unit,
            quantity: quantity,
            image: state.product.image
        });
        
        // Mostrar feedback
        alert(`${quantity} ${selectedSupplier.unit} de ${state.product.name} adicionado ao carrinho!`);
    }
    
    // Iniciar
    initApp();
});