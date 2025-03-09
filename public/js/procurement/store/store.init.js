/**
 * Arquivo de inicialização da loja online
 * Responsável por conectar o frontend com o backend e inicializar todos os módulos
 */

// Flag para evitar múltiplas inicializações
let isInitializing = false;
let apiCallCount = 0;
const MAX_API_CALLS = 10; // Limite para evitar loop infinito

document.addEventListener('DOMContentLoaded', async function() {
    console.log('[STORE] DOM carregado, iniciando aplicação...');
    
    // Proteção contra múltiplas inicializações
    if (isInitializing) {
        console.error('[STORE] Tentativa de inicialização múltipla detectada e bloqueada');
        return;
    }
    
    isInitializing = true;
    
    // Configuração da API
    const API = {
        baseUrl: '/api',
        endpoints: {
            products: '/product-parents',
            categories: '/product-parents/categories',
            search: '/product-parents/search'
        },
        
        // Métodos para chamadas à API
        async get(endpoint) {
            // Proteção contra muitas chamadas API (possível loop)
            apiCallCount++;
            if (apiCallCount > MAX_API_CALLS) {
                console.error(`[STORE] Limite de chamadas API excedido (${MAX_API_CALLS}). Possível loop infinito.`);
                throw new Error('Limite de chamadas API excedido. Possível loop infinito.');
            }
            
            console.log(`[STORE] Chamando API: ${this.baseUrl}${endpoint}`);
            try {
                const response = await fetch(this.baseUrl + endpoint);
                console.log(`[STORE] Resposta da API: ${response.status} ${response.statusText}`);
                
                if (!response.ok) {
                    console.error(`[STORE] Erro na resposta da API: ${response.status} ${response.statusText}`);
                    throw new Error(`Erro na API: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log(`[STORE] Dados recebidos:`, data);
                return data;
            } catch (error) {
                console.error('[STORE] Erro na chamada à API:', error);
                throw error;
            }
        },
        
        // Buscar todos os produtos
        async getAllProducts() {
            console.log('[STORE] Buscando todos os produtos...');
            return await this.get(this.endpoints.products);
        },
        
        // Buscar produtos por categoria
        async getProductsByCategory(category) {
            console.log(`[STORE] Buscando produtos da categoria: ${category}`);
            return await this.get(`${this.endpoints.products}/category/${category}`);
        },
        
        // Buscar produtos por termo de pesquisa
        async searchProducts(term) {
            console.log(`[STORE] Buscando produtos com termo: ${term}`);
            return await this.get(`${this.endpoints.search}/${encodeURIComponent(term)}`);
        }
    };

    // Configurar o StoreApp para usar a API
    console.log('[STORE] Configurando StoreApp...');
    
    try {
        if (!window.StoreApp) {
            console.error('[STORE] StoreApp não encontrado! Verifique se o arquivo storeAppManager.js está carregado.');
            showErrorMessage('Erro ao inicializar. StoreApp não encontrado.');
            isInitializing = false;
            return;
        }
        
        StoreApp.config.api = API;
        
        // Inicializar os módulos na ordem correta
        console.log('[STORE] Inicializando módulos...');
        
        // 1. Inicializar o gerenciador de carrinho
        if (!window.CartManager) {
            console.error('[STORE] CartManager não encontrado! Verifique se o arquivo chart.store.js está carregado.');
            showErrorMessage('Erro ao inicializar. CartManager não encontrado.');
            isInitializing = false;
            return;
        }
        
        await CartManager.init();
        console.log('✓ [STORE] Carrinho inicializado');

        // 2. Inicializar o StoreApp principal
        await StoreApp.init();
        console.log('✓ [STORE] Loja inicializada');

        // 3. Carregar dados iniciais
        console.log('[STORE] Carregando dados iniciais...');
        try {
            // Carregar produtos
            const initialData = await API.getAllProducts();
            console.log('[STORE] Dados iniciais recebidos:', initialData);
            
            if (initialData && initialData.success) {
                console.log(`[STORE] Produtos encontrados: ${initialData.data.length}`);
                StoreApp.cache.products = initialData.data;
                StoreApp.renderProducts(initialData.data);
                console.log(`✓ [STORE] ${initialData.data.length} produtos carregados`);
            } else {
                console.error('[STORE] Erro ao carregar produtos:', initialData);
                StoreApp.renderProducts([]); // Mostrar estado vazio
            }
            
            // Carregar categorias (mock vazio para demonstração)
            const categories = [];
            StoreApp.renderCategories(categories);
            
            // Carregar favoritos (mock vazio para demonstração)
            const favorites = [];
            StoreApp.renderFavorites(favorites);
            
        } catch (error) {
            console.error('[STORE] Erro ao carregar dados iniciais:', error);
            // Mostrar estado vazio nos componentes
            StoreApp.renderProducts([]);
            StoreApp.renderCategories([]);
            StoreApp.renderFavorites([]);
        }

        // Configurar event listeners globais
        console.log('[STORE] Configurando event listeners...');
        setupGlobalEventListeners();
        console.log('[STORE] Inicialização concluída com sucesso');

    } catch (error) {
        console.error('[STORE] Erro grave durante a inicialização:', error);
        showErrorMessage('Não foi possível carregar a loja. Por favor, tente novamente mais tarde.');
    } finally {
        isInitializing = false;
    }
});

// Configurar event listeners globais
function setupGlobalEventListeners() {
    console.log('[STORE] Configurando event listeners globais...');
    
    // Pesquisa
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        console.log('[STORE] Event listener para busca configurado');
        searchInput.addEventListener('input', debounce(async (e) => {
            const term = e.target.value.trim();
            if (term.length >= 3) {
                try {
                    console.log(`[STORE] Buscando por: ${term}`);
                    const results = await StoreApp.config.api.searchProducts(term);
                    if (results.success) {
                        console.log(`[STORE] Resultados da busca: ${results.data.length} produtos`);
                        StoreApp.renderProducts(results.data);
                    }
                } catch (error) {
                    console.error('[STORE] Erro na pesquisa:', error);
                }
            } else if (term.length === 0) {
                // Recarregar todos os produtos quando a pesquisa for limpa
                console.log('[STORE] Busca limpa, recarregando todos os produtos');
                try {
                    const allProducts = await StoreApp.config.api.getAllProducts();
                    if (allProducts.success) {
                        console.log(`[STORE] Recarregados ${allProducts.data.length} produtos`);
                        StoreApp.renderProducts(allProducts.data);
                    }
                } catch (error) {
                    console.error('[STORE] Erro ao recarregar produtos:', error);
                }
            }
        }, 300));
    } else {
        console.warn('[STORE] Elemento de busca não encontrado!');
    }

    // Categorias
    const categoryButtons = document.querySelectorAll('.category-button');
    if (categoryButtons.length > 0) {
        console.log(`[STORE] Configurados ${categoryButtons.length} botões de categoria`);
        categoryButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const category = e.currentTarget.dataset.category;
                console.log(`[STORE] Categoria selecionada: ${category}`);
                try {
                    const results = await StoreApp.config.api.getProductsByCategory(category);
                    if (results.success) {
                        console.log(`[STORE] Produtos na categoria: ${results.data.length}`);
                        StoreApp.renderProducts(results.data);
                    }
                } catch (error) {
                    console.error('[STORE] Erro ao carregar categoria:', error);
                }
            });
        });
    } else {
        console.warn('[STORE] Nenhum botão de categoria encontrado!');
    }
}

// Função auxiliar para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função para mostrar mensagens de erro
function showErrorMessage(message) {
    console.error('[STORE] Erro:', message);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
} 