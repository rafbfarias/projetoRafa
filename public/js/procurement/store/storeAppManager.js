/**
 * store.js
 * Script principal para gerenciar a loja online
 */

// Namespace da aplicação
const StoreApp = {
    config: {
        apiUrl: '/api',  // Em um ambiente real, esta seria a URL da API
        currency: '€',
        locale: 'pt-PT',
    },
    
    // Cache de dados
    cache: {
        products: null,
        categories: null,
        favorites: null,
    },
    
    // Estado da aplicação
    state: {
        currentCategory: null,
        currentSubcategory: null,
        searchQuery: '',
        view: 'grid', // 'grid' ou 'list'
        sortOrder: 'name-asc', // Ordenação padrão
    },
    
    // Inicialização
    init: function() {
        console.log('Iniciando aplicação de loja...');
        
        // Registrar manipuladores de eventos globais
        this.registerGlobalEventHandlers();
        
        // Inicializar o carrinho de compras
        CartManager.init();
        
        // Inicializar gerenciador de produtos
        ProductManager.init();
        
        // Carregar dados iniciais
        this.loadInitialData();
        
        console.log('Aplicação de loja inicializada com sucesso');
    },
    
    // Registrar manipuladores de eventos globais
    registerGlobalEventHandlers: function() {
        // Exemplo: manipulador para o campo de busca
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.state.searchQuery = e.target.value;
                ProductManager.filterProducts();
            });
        }
        
        // Exemplo: manipuladores para os botões de visualização
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');
        
        if (gridViewBtn && listViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                this.state.view = 'grid';
                ProductManager.updateView();
            });
            
            listViewBtn.addEventListener('click', () => {
                this.state.view = 'list';
                ProductManager.updateView();
            });
        }
        
        // Exemplo: manipulador para o menu de ordenação
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.state.sortOrder = e.target.value;
                ProductManager.sortProducts();
            });
        }
    },
    
    // Carregar dados iniciais
    loadInitialData: function() {
        // Em um ambiente real, estas seriam chamadas à API
        
        // Simular uma chamada à API para obter os produtos
        setTimeout(() => {
            this.cache.products = this.getMockProducts();
            ProductManager.displayProducts();
        }, 300);
        
        // Simular uma chamada à API para obter as categorias
        setTimeout(() => {
            this.cache.categories = this.getMockCategories();
            // Atualizar UI das categorias (se necessário)
        }, 200);
        
        // Simular uma chamada à API para obter os favoritos
        setTimeout(() => {
            this.cache.favorites = this.getMockFavorites();
            ProductManager.displayFavorites();
        }, 100);
    },
    
    // Obter dados simulados para produtos
    getMockProducts: function() {
        return [
            {
                id: 1,
                name: 'Queijo Parmesão',
                supplier: 'Laticínios Ramos',
                category: 'laticínios',
                subcategory: 'queijos',
                price: 32.90,
                unit: 'kg',
                image: '/api/placeholder/150/150',
                description: 'Queijo Parmesão importado da Itália, curado por 24 meses.',
                inStock: true,
                isFavorite: true,
                lastPurchase: {
                    date: '2025-03-01',
                    quantity: 0.25,
                    unit: 'kg',
                    price: 32.50
                }
            },
            {
                id: 2,
                name: 'Tomate Cereja',
                supplier: 'Horta Natural',
                category: 'frutas-e-vegetais',
                subcategory: 'vegetais',
                price: 4.50,
                unit: '250g',
                image: '/api/placeholder/150/150',
                description: 'Tomates cereja frescos, selecionados e embalados no mesmo dia.',
                inStock: true,
                isFavorite: true,
                lastPurchase: {
                    date: '2025-03-05',
                    quantity: 1,
                    unit: 'kg',
                    price: 4.25
                }
            },
            {
                id: 3,
                name: 'Azeite Extra Virgem',
                supplier: 'Olivais do Douro',
                category: 'alimentos-secos',
                subcategory: 'óleos',
                price: 8.90,
                unit: '500ml',
                image: '/api/placeholder/150/150',
                description: 'Azeite extra virgem de primeira prensagem a frio.',
                inStock: true,
                isFavorite: true,
                lastPurchase: {
                    date: '2025-02-20',
                    quantity: 2,
                    unit: 'unidades',
                    price: 8.90
                }
            },
            {
                id: 4,
                name: 'Pão de Centeio',
                supplier: 'Padaria Tradicional',
                category: 'padaria-e-confeitaria',
                subcategory: 'pães',
                price: 3.20,
                unit: 'unidade',
                image: '/api/placeholder/150/150',
                description: 'Pão de centeio artesanal, feito com massa madre.',
                inStock: true,
                isFavorite: true,
                lastPurchase: {
                    date: '2025-03-06',
                    quantity: 5,
                    unit: 'unidades',
                    price: 3.00
                }
            },
            {
                id: 5,
                name: 'Queijo Mussarela',
                supplier: 'Laticínios Ramos',
                category: 'laticínios',
                subcategory: 'queijos',
                price: 28.90,
                unit: 'kg',
                image: '/api/placeholder/150/150',
                description: 'Queijo mussarela fresco, ideal para pizzas e sanduíches.',
                inStock: true,
                isFavorite: false,
                lastPurchase: {
                    date: '2025-03-03',
                    quantity: 0.5,
                    unit: 'kg',
                    price: 27.90
                }
            }
            // Mais produtos seriam adicionados aqui em um ambiente real
        ];
    },
    
    // Obter dados simulados para categorias
    getMockCategories: function() {
        return [
            {
                id: 'laticínios',
                name: 'Laticínios',
                subcategories: [
                    { id: 'queijos', name: 'Queijos' },
                    { id: 'iogurtes', name: 'Iogurtes' },
                    { id: 'leites', name: 'Leites' }
                ]
            },
            {
                id: 'frutas-e-vegetais',
                name: 'Frutas e Vegetais',
                subcategories: [
                    { id: 'frutas', name: 'Frutas' },
                    { id: 'vegetais', name: 'Vegetais' },
                    { id: 'saladas', name: 'Saladas' }
                ]
            },
            {
                id: 'carnes',
                name: 'Carnes',
                subcategories: [
                    { id: 'bovinas', name: 'Bovinas' },
                    { id: 'aves', name: 'Aves' },
                    { id: 'suínas', name: 'Suínas' }
                ]
            },
            {
                id: 'padaria-e-confeitaria',
                name: 'Padaria e Confeitaria',
                subcategories: [
                    { id: 'pães', name: 'Pães' },
                    { id: 'bolos', name: 'Bolos' },
                    { id: 'doces', name: 'Doces' }
                ]
            },
            {
                id: 'bebidas',
                name: 'Bebidas',
                subcategories: [
                    { id: 'águas', name: 'Águas' },
                    { id: 'sucos', name: 'Sucos' },
                    { id: 'refrigerantes', name: 'Refrigerantes' },
                    { id: 'vinhos', name: 'Vinhos' }
                ]
            }
        ];
    },
    
    // Obter dados simulados para favoritos
    getMockFavorites: function() {
        // Neste exemplo, simplesmente retornamos os IDs dos produtos favoritos
        return [1, 2, 3, 4];
    },
    
    // Formatação de valores monetários
    formatCurrency: function(value) {
        return this.config.currency + ' ' + value.toFixed(2).replace('.', ',');
    },
    
    // Formatação de datas
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(this.config.locale);
    },
    
    // Calcular dias passados desde uma data
    daysSince: function(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - date);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    StoreApp.init();
});