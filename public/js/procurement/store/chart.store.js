/**
 * Loja Online - Página do Carrinho
 * Gerencia a exibição e manipulação dos itens do carrinho
 */

document.addEventListener('DOMContentLoaded', function() {
    // Estado da aplicação
    const state = {
        cart: [],
        subtotal: 0,
        taxes: 0,
        total: 0,
        deliveryLocation: 'Porto'
    };

    // Elementos DOM
    const elements = {
        emptyCart: document.getElementById('empty-cart'),
        cartItemsList: document.getElementById('cart-items-list'),
        cartItemsContainer: document.getElementById('cart-items-container'),
        cartItemsCount: document.getElementById('cart-items-count'),
        emptySummary: document.getElementById('empty-summary'),
        orderSummary: document.getElementById('order-summary'),
        subtotalElement: document.getElementById('subtotal'),
        taxesElement: document.getElementById('taxes'),
        totalAmountElement: document.getElementById('total-amount'),
        summaryItemsCount: document.getElementById('summary-items-count'),
        itemsCountValue: document.getElementById('items-count-value'),
        deliveryLocation: document.getElementById('delivery-location'),
        orderNotes: document.getElementById('order-notes'),
        clearCartBtn: document.getElementById('clear-cart-btn'),
        updateCartBtn: document.getElementById('update-cart-btn'),
        checkoutBtn: document.getElementById('checkout-btn'),
        confirmModal: document.getElementById('confirm-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalMessage: document.getElementById('modal-message'),
        modalConfirm: document.getElementById('modal-confirm'),
        modalCancel: document.getElementById('modal-cancel'),
        successModal: document.getElementById('success-modal'),
        orderNumber: document.getElementById('order-number'),
        cartItemTemplate: document.getElementById('cart-item-template'),
        toastContainer: document.getElementById('toast-container')
    };

    // Inicializar
    initApp();

    /**
     * Inicializa a aplicação
     */
    function initApp() {
        // Carregar dados do carrinho do localStorage
        loadCartFromStorage();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Renderizar carrinho
        renderCart();
        
        // Calcular totais
        calculateTotals();
    }

    /**
     * Configura os event listeners
     */
    function setupEventListeners() {
        // Botões de ação do carrinho
        elements.clearCartBtn.addEventListener('click', confirmClearCart);
        elements.updateCartBtn.addEventListener('click', updateCartQuantities);
        elements.checkoutBtn.addEventListener('click', confirmCheckout);
        
        // Delegação de eventos para botões de quantidade e remoção
        elements.cartItemsContainer.addEventListener('click', handleCartItemActions);
        elements.cartItemsContainer.addEventListener('input', handleQuantityInput);
        
        // Local de entrega
        elements.deliveryLocation.addEventListener('change', function() {
            state.deliveryLocation = this.value;
        });
        
        // Botões do modal
        elements.modalCancel.addEventListener('click', closeModal);
    }

    /**
     * Renderiza o carrinho
     */
    function renderCart() {
        // Verificar se o carrinho está vazio
        if (state.cart.length === 0) {
            elements.emptyCart.classList.remove('hidden');
            elements.cartItemsList.classList.add('hidden');
            elements.emptySummary.classList.remove('hidden');
            elements.orderSummary.classList.add('hidden');
            return;
        }
        
        // Mostrar conteúdo do carrinho
        elements.emptyCart.classList.add('hidden');
        elements.cartItemsList.classList.remove('hidden');
        elements.emptySummary.classList.add('hidden');
        elements.orderSummary.classList.remove('hidden');
        
        // Limpar e renderizar itens
        elements.cartItemsContainer.innerHTML = '';
        elements.cartItemsCount.textContent = state.cart.length;
        
        state.cart.forEach(item => {
            const cartItemElement = createCartItemElement(item);
            elements.cartItemsContainer.appendChild(cartItemElement);
        });
    }

    /**
     * Cria um elemento de item do carrinho a partir do template
     */
    function createCartItemElement(item) {
        const template = elements.cartItemTemplate.content.cloneNode(true);
        
        // Calcular preço total do item
        const totalPrice = (item.price * item.quantity).toFixed(2);
        
        // Substituir placeholders pelo conteúdo real
        const html = template.querySelector('.cart-item').outerHTML
            .replace(/{{id}}/g, item.id)
            .replace(/{{image}}/g, item.image)
            .replace(/{{name}}/g, item.name)
            .replace(/{{supplier}}/g, item.supplier)
            .replace(/{{unitPrice}}/g, item.price.toFixed(2))
            .replace(/{{unit}}/g, item.unit)
            .replace(/{{quantity}}/g, item.quantity)
            .replace(/{{totalPrice}}/g, totalPrice);
        
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        
        return tempContainer.firstElementChild;
    }

    /**
     * Manipula ações nos itens do carrinho (aumentar, diminuir, remover)
     */
    function handleCartItemActions(e) {
        const increaseBtn = e.target.closest('.increase-btn');
        const decreaseBtn = e.target.closest('.decrease-btn');
        const removeBtn = e.target.closest('.remove-item-btn');
        
        if (!increaseBtn && !decreaseBtn && !removeBtn) return;
        
        const itemId = increaseBtn?.dataset.id || decreaseBtn?.dataset.id || removeBtn?.dataset.id;
        const itemIndex = state.cart.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) return;
        
        if (increaseBtn) {
            // Aumentar quantidade
            state.cart[itemIndex].quantity += 1;
            const quantityInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
            if (quantityInput) {
                quantityInput.value = state.cart[itemIndex].quantity;
            }
        } else if (decreaseBtn) {
            // Diminuir quantidade (mínimo 1)
            if (state.cart[itemIndex].quantity > 1) {
                state.cart[itemIndex].quantity -= 1;
                const quantityInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
                if (quantityInput) {
                    quantityInput.value = state.cart[itemIndex].quantity;
                }
            }
        } else if (removeBtn) {
            // Remover item
            confirmRemoveItem(itemId);
            return;
        }
        
        // Atualizar preço total do item
        updateItemTotalPrice(itemId);
        
        // Recalcular totais
        calculateTotals();
        
        // Salvar carrinho
        saveCartToStorage();
    }

    /**
     * Manipula a entrada direta de quantidade
     */
    function handleQuantityInput(e) {
        const quantityInput = e.target.closest('.quantity-input');
        if (!quantityInput) return;
        
        const itemId = quantityInput.dataset.id;
        const itemIndex = state.cart.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) return;
        
        // Obter e validar o valor
        let quantity = parseInt(quantityInput.value);
        
        // Garantir que a quantidade seja pelo menos 1
        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
            quantityInput.value = 1;
        }
        
        // Atualizar quantidade no estado
        state.cart[itemIndex].quantity = quantity;
        
        // Atualizar preço total do item
        updateItemTotalPrice(itemId);
    }

    /**
     * Atualiza o preço total exibido para um item
     */
    function updateItemTotalPrice(itemId) {
        const item = state.cart.find(item => item.id === itemId);
        if (!item) return;
        
        const cartItem = document.querySelector(`.cart-item[data-id="${itemId}"]`);
        if (!cartItem) return;
        
        const totalPriceElement = cartItem.querySelector('.font-bold');
        if (totalPriceElement) {
            totalPriceElement.textContent = `€${(item.price * item.quantity).toFixed(2)}`;
        }
    }

    /**
     * Calcula os totais do carrinho
     */
    function calculateTotals() {
        // Calcular subtotal
        state.subtotal = state.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        // Calcular taxas (exemplo: 23% de IVA)
        state.taxes = state.subtotal * 0.23;
        
        // Calcular total
        state.total = state.subtotal + state.taxes;
        
        // Atualizar elementos na UI
        elements.subtotalElement.textContent = `€${state.subtotal.toFixed(2)}`;
        elements.taxesElement.textContent = `€${state.taxes.toFixed(2)}`;
        elements.totalAmountElement.textContent = `€${state.total.toFixed(2)}`;
        
        // Atualizar contagem de itens
        const totalItems = state.cart.reduce((total, item) => total + item.quantity, 0);
        elements.summaryItemsCount.textContent = totalItems;
        elements.itemsCountValue.textContent = `€${state.subtotal.toFixed(2)}`;
    }

    /**
     * Confirma a remoção de um item
     */
    function confirmRemoveItem(itemId) {
        const item = state.cart.find(item => item.id === itemId);
        if (!item) return;
        
        elements.modalTitle.textContent = 'Remover Item';
        elements.modalMessage.textContent = `Tem certeza que deseja remover "${item.name}" do carrinho?`;
        
        elements.modalConfirm.onclick = () => {
            removeCartItem(itemId);
            closeModal();
        };
        
        openModal();
    }

    /**
     * Remove um item do carrinho
     */
    function removeCartItem(itemId) {
        const itemIndex = state.cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;
        
        // Remover do estado
        state.cart.splice(itemIndex, 1);
        
        // Atualizar UI
        renderCart();
        calculateTotals();
        
        // Salvar carrinho
        saveCartToStorage();
        
        // Mostrar notificação
        showToast('Item removido do carrinho!', 'success');
    }

    /**
     * Confirma a limpeza do carrinho
     */
    function confirmClearCart() {
        elements.modalTitle.textContent = 'Limpar Carrinho';
        elements.modalMessage.textContent = 'Tem certeza que deseja remover todos os itens do carrinho?';
        
        elements.modalConfirm.onclick = () => {
            clearCart();
            closeModal();
        };
        
        openModal();
    }

    /**
     * Limpa o carrinho
     */
    function clearCart() {
        state.cart = [];
        
        // Atualizar UI
        renderCart();
        calculateTotals();
        
        // Salvar carrinho
        saveCartToStorage();
        
        // Mostrar notificação
        showToast('Carrinho esvaziado com sucesso!', 'success');
    }

    /**
     * Atualiza as quantidades do carrinho
     */
    function updateCartQuantities() {
        // Obter todas as entradas de quantidade
        const quantityInputs = document.querySelectorAll('.quantity-input');
        
        // Atualizar quantidades no estado
        quantityInputs.forEach(input => {
            const itemId = input.dataset.id;
            const quantity = parseInt(input.value);
            
            if (!isNaN(quantity) && quantity >= 1) {
                const itemIndex = state.cart.findIndex(item => item.id === itemId);
                if (itemIndex !== -1) {
                    state.cart[itemIndex].quantity = quantity;
                }
            }
        });
        
        // Recalcular totais
        calculateTotals();
        
        // Salvar carrinho
        saveCartToStorage();
        
        // Atualizar UI
        renderCart();
        
        // Mostrar notificação
        showToast('Quantidades atualizadas com sucesso!', 'success');
    }

    /**
     * Confirma a finalização do pedido
     */
    function confirmCheckout() {
        // Verificar se há itens no carrinho
        if (state.cart.length === 0) {
            showToast('Adicione itens ao carrinho para finalizar o pedido.', 'error');
            return;
        }
        
        // Verificar quantidades mínimas
        const invalidItems = state.cart.filter(item => item.quantity < item.minOrder);
        if (invalidItems.length > 0) {
            const itemNames = invalidItems.map(item => `${item.name} (mín: ${item.minOrder})`).join(', ');
            showToast(`Alguns itens estão abaixo da quantidade mínima: ${itemNames}`, 'error');
            return;
        }
        
        elements.modalTitle.textContent = 'Finalizar Pedido';
        elements.modalMessage.textContent = `Tem certeza que deseja finalizar o pedido no valor de €${state.total.toFixed(2)}?`;
        
        elements.modalConfirm.onclick = () => {
            processCheckout();
            closeModal();
        };
        
        openModal();
    }

    /**
     * Processa a finalização do pedido
     */
    function processCheckout() {
        // Em um ambiente real, você enviaria os dados para a API
        // fetch('/api/orders', { method: 'POST', body: JSON.stringify(orderData) })
        
        // Gerar número de pedido aleatório
        const orderNumber = `ORD-${Math.floor(Math.random() * 100000)}`;
        elements.orderNumber.textContent = `#${orderNumber}`;
        
        // Mostrar modal de sucesso
        document.getElementById('success-modal').classList.remove('hidden');
        
        // Limpar carrinho
        state.cart = [];
        saveCartToStorage();
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
     * Abre o modal de confirmação
     */
    function openModal() {
        elements.confirmModal.classList.remove('hidden');
    }

    /**
     * Fecha o modal de confirmação
     */
    function closeModal() {
        elements.confirmModal.classList.add('hidden');
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
