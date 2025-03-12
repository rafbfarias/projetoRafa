// Estado da aplicação
let state = {
    orders: [],
    filters: {
        search: '',
        status: 'all',
        date: 'all',
        supplier: 'all',
        currentTab: 'all'
    },
    expandedOrder: null
};

// Mock data (será substituído pela API)
const mockOrders = [
    {
        id: "PO-2025-001",
        description: "Carnes frescas para restaurante",
        supplier: "FreshMeat Distribuidora",
        date: "2025-03-01",
        amount: 1250.75,
        status: "PENDENTE",
        urgent: true,
        items: [
            { name: "Picanha Premium", quantity: 5, unit: "kg", price: 95.80 },
            { name: "Costela Suína", quantity: 10, unit: "kg", price: 35.90 },
            { name: "Filé Mignon", quantity: 8, unit: "kg", price: 75.50 }
        ]
    },
    {
        id: "PO-2025-002",
        description: "Bebidas para estoque semanal",
        supplier: "DistribeBem Bebidas",
        date: "2025-03-02",
        amount: 875.30,
        status: "PENDENTE",
        urgent: false,
        items: [
            { name: "Água Mineral 500ml", quantity: 100, unit: "un", price: 1.50 },
            { name: "Refrigerante Cola 2L", quantity: 50, unit: "un", price: 8.90 },
            { name: "Suco Natural Laranja 1L", quantity: 30, unit: "un", price: 12.50 }
        ]
    },
    {
        id: "PO-2025-003",
        description: "Produtos de limpeza",
        supplier: "Clean & Fresh",
        date: "2025-03-03",
        amount: 542.60,
        status: "WAITING DELIVERY",
        urgent: true,
        items: [
            { name: "Detergente Industrial 5L", quantity: 10, unit: "un", price: 28.90 },
            { name: "Desinfetante Concentrado", quantity: 5, unit: "un", price: 35.50 },
            { name: "Pano Multiuso (pct 50)", quantity: 3, unit: "pct", price: 45.00 }
        ]
    },
    {
        id: "PO-2025-004",
        description: "Vegetais orgânicos",
        supplier: "Horta Orgânica",
        date: "2025-03-05",
        amount: 680.25,
        status: "RECEBIDO",
        urgent: false,
        items: [
            { name: "Alface Orgânica", quantity: 20, unit: "un", price: 4.50 },
            { name: "Tomate Cereja Orgânico", quantity: 15, unit: "kg", price: 18.90 },
            { name: "Rúcula Orgânica", quantity: 10, unit: "un", price: 5.75 }
        ]
    },
    {
        id: "PO-2025-005",
        description: "Frutos do mar frescos",
        supplier: "Peixaria do Mar",
        date: "2025-03-06",
        amount: 1580.90,
        status: "WAITING DELIVERY",
        urgent: false,
        items: [
            { name: "Camarão Fresco", quantity: 10, unit: "kg", price: 85.00 },
            { name: "Polvo", quantity: 5, unit: "kg", price: 95.50 },
            { name: "Lula Limpa", quantity: 8, unit: "kg", price: 45.30 }
        ]
    },
    {
        id: "PO-2025-006",
        description: "Embalagens para delivery",
        supplier: "EmbalaFácil",
        date: "2025-03-07",
        amount: 430.50,
        status: "RECEBIDO",
        urgent: false,
        items: [
            { name: "Marmitex Alumínio 500ml", quantity: 500, unit: "un", price: 0.45 },
            { name: "Sacola Kraft Delivery", quantity: 300, unit: "un", price: 0.38 },
            { name: "Caixa Pizza 35cm", quantity: 200, unit: "un", price: 0.85 }
        ]
    }
];

// Funções auxiliares
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', { 
        style: 'currency', 
        currency: 'EUR' 
    }).format(value);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
};

// Funções de UI
const getStatusIcon = (status) => {
    const icons = {
        'PENDENTE': '<i class="fas fa-clock text-yellow-500"></i>',
        'WAITING DELIVERY': '<i class="fas fa-truck text-blue-500"></i>',
        'RECEBIDO': '<i class="fas fa-check-circle text-green-500"></i>'
    };
    return icons[status] || '<i class="fas fa-question-circle text-gray-500"></i>';
};

const getStatusBadge = (status) => {
    const badges = {
        'PENDENTE': `
            <span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                Pendente Aprovação
            </span>
        `,
        'WAITING DELIVERY': `
            <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                Aguardando Entrega
            </span>
        `,
        'RECEBIDO': `
            <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Recebido
            </span>
        `
    };
    return badges[status] || `
        <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            ${status}
        </span>
    `;
};

// Renderização
const renderOrderCard = (order) => {
    return `
        <div class="dashboard-card order-card" data-order-id="${order.id}">
            <!-- Cabeçalho do Pedido -->
            <div class="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between order-header">
                <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                        <span class="text-sm font-medium text-gray-600">${order.id}</span>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium">${order.supplier}</h3>
                        <p class="text-sm text-gray-500">${order.items.length} itens - Total: ${formatCurrency(order.amount)}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    ${getStatusBadge(order.status)}
                    <i class="fas fa-chevron-down transform transition-transform duration-300"></i>
                </div>
            </div>
            
            <!-- Detalhes do Pedido -->
            <div class="order-details overflow-hidden transition-all duration-300" style="max-height: 0;">
                <div class="border-t border-gray-100 p-4">
                    <!-- Order Info Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div class="bg-white p-3 rounded border border-gray-200">
                            <div class="flex items-center">
                                <i class="fas fa-user text-gray-500 mr-2"></i>
                                <span class="text-xs font-medium text-gray-500">Fornecedor</span>
                            </div>
                            <p class="mt-1 text-sm font-medium">${order.supplier}</p>
                        </div>
                        <div class="bg-white p-3 rounded border border-gray-200">
                            <div class="flex items-center">
                                <i class="fas fa-calendar text-gray-500 mr-2"></i>
                                <span class="text-xs font-medium text-gray-500">Data do Pedido</span>
                            </div>
                            <p class="mt-1 text-sm font-medium">${formatDate(order.date)}</p>
                        </div>
                        <div class="bg-white p-3 rounded border border-gray-200">
                            <div class="flex items-center">
                                <i class="fas fa-dollar-sign text-gray-500 mr-2"></i>
                                <span class="text-xs font-medium text-gray-500">Valor Total</span>
                            </div>
                            <p class="mt-1 text-sm font-medium">${formatCurrency(order.amount)}</p>
                        </div>
                    </div>

                    <!-- Items Table -->
                    <div class="mt-3">
                        <h4 class="text-sm font-medium text-gray-700 mb-2">Itens do Pedido</h4>
                        <div class="bg-white overflow-x-auto rounded border border-gray-200">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                        <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                                        <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unitário</th>
                                        <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${order.items.map(item => `
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${item.name}</td>
                                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">${item.quantity} ${item.unit}</td>
                                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">${formatCurrency(item.price)}</td>
                                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium text-right">${formatCurrency(item.quantity * item.price)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot class="bg-gray-50">
                                    <tr>
                                        <th scope="row" colspan="3" class="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
                                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium text-right">${formatCurrency(order.amount)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="mt-5 flex justify-end gap-3">
                        <a href="view.order.html?id=${order.id}" class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
                            <span>Ver Detalhes</span>
                            <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                        
                        ${order.status === 'PENDENTE' ? `
                            <button class="action-button btn btn-danger-outline" data-action="reject" data-order-id="${order.id}">
                                Rejeitar
                            </button>
                            <button class="action-button btn btn-primary" data-action="approve" data-order-id="${order.id}">
                                Aprovar
                            </button>
                        ` : ''}
                        
                        ${order.status === 'WAITING DELIVERY' ? `
                            <button class="action-button btn btn-success" data-action="receive" data-order-id="${order.id}">
                                Confirmar Recebimento
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Atualização dos contadores
const updateCounters = () => {
    const pendingOrders = state.orders.filter(order => order.status === 'PENDENTE');
    const waitingOrders = state.orders.filter(order => order.status === 'WAITING DELIVERY');
    const receivedOrders = state.orders.filter(order => order.status === 'RECEBIDO');
    const total = state.orders.length;

    // Atualizar contadores
    document.getElementById('pendingCount').textContent = pendingOrders.length;
    document.getElementById('waitingCount').textContent = waitingOrders.length;
    document.getElementById('receivedCount').textContent = receivedOrders.length;

    // Atualizar barras de progresso
    document.getElementById('pendingProgress').style.width = `${(pendingOrders.length / total) * 100}%`;
    document.getElementById('waitingProgress').style.width = `${(waitingOrders.length / total) * 100}%`;
    document.getElementById('receivedProgress').style.width = `${(receivedOrders.length / total) * 100}%`;

    // Mostrar/esconder indicadores
    document.querySelector('.pending-indicator').classList.toggle('hidden', pendingOrders.length === 0);
    document.querySelector('.waiting-indicator').classList.toggle('hidden', waitingOrders.length === 0);
};

// Filtros
const filterOrders = () => {
    return state.orders.filter(order => {
        const matchSearch = state.filters.search === '' || 
            order.id.toLowerCase().includes(state.filters.search.toLowerCase()) ||
            order.description.toLowerCase().includes(state.filters.search.toLowerCase()) ||
            order.supplier.toLowerCase().includes(state.filters.search.toLowerCase());
        
        const matchStatus = state.filters.status === 'all' || 
            (state.filters.status === 'urgent' && order.urgent) ||
            (state.filters.status === 'normal' && !order.urgent);
        
        const matchDate = state.filters.date === 'all' || 
            (state.filters.date === 'today' && isToday(order.date)) ||
            (state.filters.date === 'week' && isWithinLastWeek(order.date)) ||
            (state.filters.date === 'month' && isWithinLastMonth(order.date));
        
        const matchSupplier = state.filters.supplier === 'all' || 
            order.supplier === state.filters.supplier;
        
        const matchTab = state.filters.currentTab === 'all' || 
            (state.filters.currentTab === 'pending' && order.status === 'PENDENTE') ||
            (state.filters.currentTab === 'waiting' && order.status === 'WAITING DELIVERY') ||
            (state.filters.currentTab === 'received' && order.status === 'RECEBIDO');
        
        return matchSearch && matchStatus && matchDate && matchSupplier && matchTab;
    });
};

// Funções de data
const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

const isWithinLastWeek = (dateString) => {
    const date = new Date(dateString);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
};

const isWithinLastMonth = (dateString) => {
    const date = new Date(dateString);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return date >= monthAgo;
};

// Renderização da lista
const renderOrders = () => {
    const ordersList = document.getElementById('ordersList');
    const emptyState = document.getElementById('emptyState');
    const filteredOrders = filterOrders();

    // Atualizar contador
    document.getElementById('orderCount').textContent = filteredOrders.length;

    if (filteredOrders.length === 0) {
        ordersList.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    ordersList.classList.remove('hidden');
    emptyState.classList.add('hidden');
    ordersList.innerHTML = `<div class="divide-y divide-gray-200">
        ${filteredOrders.map(order => renderOrderCard(order)).join('')}
    </div>`;

    // Adicionar event listeners para expansão
    document.querySelectorAll('[data-order-id]').forEach(card => {
        card.addEventListener('click', (e) => {
            // Ignorar cliques em botões de ação
            if (e.target.closest('[data-action]')) {
                return;
            }

            const orderId = card.getAttribute('data-order-id');
            toggleOrderDetails(orderId);
        });
    });

    // Adicionar event listeners para botões de ação
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = button.getAttribute('data-action');
            const orderId = button.getAttribute('data-order-id');
            
            handleOrderAction(action, orderId);
        });
    });
};

// Manipular ações de pedido
const handleOrderAction = (action, orderId) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    switch (action) {
        case 'approve':
            // Lógica para aprovar pedido
            order.status = 'WAITING DELIVERY';
            showToast('Pedido aprovado com sucesso!', 'success');
            break;
        case 'reject':
            // Lógica para rejeitar pedido
            if (confirm('Tem certeza que deseja rejeitar este pedido?')) {
                order.status = 'REJECTED';
                showToast('Pedido rejeitado.', 'warning');
            }
            break;
        case 'receive':
            // Lógica para confirmar recebimento
            order.status = 'RECEBIDO';
            showToast('Recebimento confirmado com sucesso!', 'success');
            break;
    }

    // Atualizar UI
    updateCounters();
    renderOrders();
};

// Toast de notificação
const showToast = (message, type = 'info') => {
    // Remover toast existente
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Criar novo toast
    const toast = document.createElement('div');
    toast.className = `toast fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'warning' ? 'bg-yellow-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white`;
    
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' : 
                type === 'warning' ? 'fa-exclamation-triangle' : 
                type === 'error' ? 'fa-times-circle' : 
                'fa-info-circle'
            } mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Event Listeners
const initializeEventListeners = () => {
    // Search
    const searchInput = document.getElementById('searchOrder');
    searchInput.addEventListener('input', (e) => {
        state.filters.search = e.target.value;
        renderOrders();
    });

    // Filter Panel Toggle
    const filterButton = document.getElementById('filterButton');
    const filtersPanel = document.getElementById('filtersPanel');
    filterButton.addEventListener('click', () => {
        filtersPanel.classList.toggle('hidden');
        filterButton.querySelector('i:last-child').classList.toggle('rotate-180');
    });

    // Status Filter
    const statusFilter = document.getElementById('statusFilter');
    statusFilter.addEventListener('change', (e) => {
        state.filters.status = e.target.value;
        renderOrders();
    });

    // Date Filter
    const dateFilter = document.getElementById('dateFilter');
    dateFilter.addEventListener('change', (e) => {
        state.filters.date = e.target.value;
        renderOrders();
    });

    // Supplier Filter
    const supplierFilter = document.getElementById('supplierFilter');
    supplierFilter.addEventListener('change', (e) => {
        state.filters.supplier = e.target.value;
        renderOrders();
    });

    // Status Cards
    document.getElementById('pendingCard').addEventListener('click', () => {
        setActiveTab('pending');
    });
    
    document.getElementById('waitingCard').addEventListener('click', () => {
        setActiveTab('waiting');
    });
    
    document.getElementById('receivedCard').addEventListener('click', () => {
        setActiveTab('received');
    });

    // Ver Todos
    document.getElementById('viewAllButton').addEventListener('click', () => {
        setActiveTab('all');
    });

    // Clear Filters
    document.getElementById('clearFilters').addEventListener('click', () => {
        resetFilters();
    });
};

// Definir tab ativo
const setActiveTab = (tab) => {
    document.querySelectorAll('[id$="Card"]').forEach(card => {
        card.classList.remove('active');
    });
    
    if (tab !== 'all') {
        document.getElementById(`${tab}Card`).classList.add('active');
    }
    
    state.filters.currentTab = tab;
    
    const titles = {
        'pending': 'Pedidos Pendentes de Aprovação',
        'waiting': 'Pedidos Aguardando Entrega',
        'received': 'Pedidos Recebidos',
        'all': 'Todos os Pedidos'
    };
    
    document.getElementById('listTitle').textContent = titles[tab];
    renderOrders();
};

// Resetar filtros
const resetFilters = () => {
    state.filters = {
        search: '',
        status: 'all',
        date: 'all',
        supplier: 'all',
        currentTab: 'all'
    };
    
    document.getElementById('searchOrder').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('supplierFilter').value = 'all';
    
    document.querySelectorAll('[id$="Card"]').forEach(card => {
        card.classList.remove('active');
    });
    
    document.getElementById('listTitle').textContent = 'Todos os Pedidos';
    renderOrders();
};

// Atualizar a função de toggle
const toggleOrderDetails = (orderId) => {
    const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
    const details = orderCard.querySelector('.order-details');
    const chevron = orderCard.querySelector('.fa-chevron-down');
    const isExpanded = details.style.maxHeight !== '0px';

    if (isExpanded) {
        details.style.maxHeight = '0';
        chevron.style.transform = 'rotate(0deg)';
    } else {
        details.style.maxHeight = `${details.scrollHeight}px`;
        chevron.style.transform = 'rotate(180deg)';
    }
};

// Inicialização
const initialize = async () => {
    try {
        // Mostrar loading state
        document.getElementById('ordersList').innerHTML = `
            <div class="flex items-center justify-center p-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        `;

        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));

        // Carregar dados (mock por enquanto)
        state.orders = mockOrders;

        // Preencher select de fornecedores
        const uniqueSuppliers = [...new Set(state.orders.map(order => order.supplier))];
        const supplierFilter = document.getElementById('supplierFilter');
        uniqueSuppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier;
            option.textContent = supplier;
            supplierFilter.appendChild(option);
        });

        // Inicializar
        initializeEventListeners();
        updateCounters();
        renderOrders();

    } catch (error) {
        console.error('Erro ao inicializar:', error);
        document.getElementById('ordersList').innerHTML = `
            <div class="p-8 text-center">
                <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900">Erro ao carregar pedidos</h3>
                <p class="text-gray-500">${error.message}</p>
                <button onclick="initialize()" class="btn btn-primary mt-4">
                    Tentar novamente
                </button>
            </div>
        `;
    }
};

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initialize);

// Adicionar estilos ao head do documento
const style = document.createElement('style');
style.textContent = `
    .order-card {
        transition: all 0.3s ease;
    }
    
    .order-details {
        transition: max-height 0.3s ease-out;
    }
    
    .fa-chevron-down {
        transition: transform 0.3s ease;
    }
`;
document.head.appendChild(style);