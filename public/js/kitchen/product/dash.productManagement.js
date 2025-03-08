const DEFAULT_PRODUCT_IMAGE = '/images/products/default-product.jpg';

card.querySelector('.product-image').onerror = function() {
    this.src = DEFAULT_PRODUCT_IMAGE;
    this.onerror = null;
};

const showLoading = () => {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = `
        <div class="flex items-center justify-center p-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    `;
};

const initialize = async () => {
    try {
        showLoading();
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // ... resto do código de inicialização ...
        
    } catch (error) {
        document.getElementById('productsList').innerHTML = `
            <div class="p-8 text-center">
                <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900">Erro ao carregar produtos</h3>
                <p class="text-gray-500">${error.message}</p>
                <button onclick="initialize()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Tentar novamente
                </button>
            </div>
        `;
    }
};

const handleResize = () => {
    const isMobile = window.innerWidth < 768;
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const variantList = card.querySelector('.variant-list');
        if (isMobile) {
            variantList.style.maxHeight = variantList.classList.contains('expanded') ? 
                `${variantList.scrollHeight}px` : '0px';
        }
    });
};

window.addEventListener('resize', handleResize); 