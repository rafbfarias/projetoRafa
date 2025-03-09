/**
 * Gerenciador do Carrinho de Compras
 */
const CartManager = {
    // Estado do carrinho
    state: {
        items: [],
        total: 0,
        count: 0,
        suppliers: new Set()
    },

    // Inicialização
    init() {
        console.log('Inicializando gerenciador do carrinho...');
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateUI();
    },

    // Configurar event listeners
    setupEventListeners() {
        // Atualizar quantidade
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const itemId = e.target.dataset.itemId;
                const quantity = parseInt(e.target.value);
                this.updateQuantity(itemId, quantity);
            });
        });

        // Remover item
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                this.removeItem(itemId);
            });
        });

        // Limpar carrinho
        const clearCartBtn = document.getElementById('clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }
    },

    // Adicionar item ao carrinho
    addItem(product, supplier, quantity = 1) {
        const existingItem = this.state.items.find(
            item => item.productId === product.id && item.supplierId === supplier.id
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.state.items.push({
                id: Date.now().toString(),
                productId: product.id,
                productName: product.productName,
                supplierId: supplier.id,
                supplierName: supplier.supplierName,
                price: supplier.currentPrice,
                unit: supplier.supplierUnitMeasure,
                quantity: quantity,
                image: product.photo
            });
        }

        this.state.suppliers.add(supplier.id);
        this.updateState();
        this.showNotification('Produto adicionado ao carrinho');
    },

    // Remover item do carrinho
    removeItem(itemId) {
        const index = this.state.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            const item = this.state.items[index];
            this.state.items.splice(index, 1);
            
            // Verificar se ainda existem itens deste fornecedor
            const hasOtherItemsFromSupplier = this.state.items.some(
                i => i.supplierId === item.supplierId
            );
            if (!hasOtherItemsFromSupplier) {
                this.state.suppliers.delete(item.supplierId);
            }
            
            this.updateState();
            this.showNotification('Produto removido do carrinho');
        }
    },

    // Atualizar quantidade de um item
    updateQuantity(itemId, quantity) {
        const item = this.state.items.find(item => item.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.updateState();
            }
        }
    },

    // Limpar carrinho
    clearCart() {
        this.state.items = [];
        this.state.suppliers.clear();
        this.updateState();
        this.showNotification('Carrinho limpo');
    },

    // Atualizar estado do carrinho
    updateState() {
        this.calculateTotals();
        this.saveToStorage();
        this.updateUI();
    },

    // Calcular totais
    calculateTotals() {
        this.state.total = this.state.items.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
        );
        this.state.count = this.state.items.reduce(
            (count, item) => count + item.quantity,
            0
        );
    },

    // Salvar no localStorage
    saveToStorage() {
        localStorage.setItem('cart', JSON.stringify({
            items: this.state.items,
            suppliers: Array.from(this.state.suppliers)
        }));
    },

    // Carregar do localStorage
    loadFromStorage() {
        const saved = localStorage.getItem('cart');
        if (saved) {
            const data = JSON.parse(saved);
            this.state.items = data.items;
            this.state.suppliers = new Set(data.suppliers);
            this.calculateTotals();
        }
    },

    // Atualizar interface
    updateUI() {
        // Atualizar contador do carrinho
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.state.count;
        }

        // Atualizar carrinho flutuante
        this.updateFloatingCart();

        // Atualizar página do carrinho se estiver nela
        if (window.location.pathname.includes('chart.store.html')) {
            this.updateCartPage();
        }
    },

    // Atualizar carrinho flutuante
    updateFloatingCart() {
        const floatingCart = document.getElementById('floating-cart');
        if (!floatingCart) return;

        const cartSummary = document.getElementById('cart-summary');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartSuppliers = document.getElementById('cart-suppliers');

        if (cartSummary) {
            cartSummary.innerHTML = this.state.items.map(item => `
                <div class="flex items-center justify-between mb-2 pb-2 border-b">
                    <div class="flex items-center">
                        <img src="${item.image}" alt="${item.productName}" class="w-8 h-8 object-cover mr-2">
                        <div>
                            <p class="text-sm font-medium">${item.productName}</p>
                            <p class="text-xs text-gray-500">${item.quantity} x €${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <span class="text-sm font-semibold">€${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');
        }

        if (cartSubtotal) {
            cartSubtotal.textContent = `€${this.state.total.toFixed(2)}`;
        }

        if (cartSuppliers) {
            cartSuppliers.textContent = this.state.suppliers.size;
        }
    },

    // Atualizar página do carrinho
    updateCartPage() {
        const cartTable = document.getElementById('cart-items');
        if (!cartTable) return;

        if (this.state.items.length === 0) {
            cartTable.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
                            <p class="text-gray-500 mb-4">Seu carrinho está vazio</p>
                            <a href="dash.store.html" class="btn btn-primary">
                                Continuar Comprando
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            cartTable.innerHTML = this.state.items.map(item => `
                <tr>
                    <td class="py-4">
                        <div class="flex items-center">
                            <img src="${item.image}" alt="${item.productName}" class="w-16 h-16 object-cover rounded">
                            <div class="ml-4">
                                <h3 class="font-medium">${item.productName}</h3>
                                <p class="text-sm text-gray-500">${item.supplierName}</p>
                            </div>
                        </div>
                    </td>
                    <td class="text-center">€${item.price.toFixed(2)}/${item.unit}</td>
                    <td>
                        <div class="flex items-center justify-center">
                            <button class="decrement-btn h-8 w-8 rounded-l-lg border border-gray-300 bg-gray-100">
                                <i class="fas fa-minus text-gray-600"></i>
                            </button>
                            <input 
                                type="number" 
                                value="${item.quantity}" 
                                min="0" 
                                class="quantity-input h-8 w-16 border-t border-b border-gray-300 text-center"
                                data-item-id="${item.id}"
                            >
                            <button class="increment-btn h-8 w-8 rounded-r-lg border border-gray-300 bg-gray-100">
                                <i class="fas fa-plus text-gray-600"></i>
                            </button>
                        </div>
                    </td>
                    <td class="text-center font-medium">€${(item.price * item.quantity).toFixed(2)}</td>
                    <td class="text-center">
                        <button 
                            class="remove-item text-red-600 hover:text-red-800"
                            data-item-id="${item.id}"
                        >
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            // Atualizar totais
            const subtotal = document.getElementById('subtotal');
            const total = document.getElementById('total');
            if (subtotal) subtotal.textContent = `€${this.state.total.toFixed(2)}`;
            if (total) total.textContent = `€${this.state.total.toFixed(2)}`;
        }

        // Reconfigurar event listeners após atualizar o DOM
        this.setupEventListeners();
    },

    // Mostrar notificação
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        notification.textContent = message;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Exportar o módulo
window.CartManager = CartManager;
