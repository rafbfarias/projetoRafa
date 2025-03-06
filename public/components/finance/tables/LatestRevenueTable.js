class LatestRevenueTable extends HTMLElement {
    constructor() {
        super();
        this.data = [];
    }

    connectedCallback() {
        this.render();
        this.loadData();
    }

    async loadData(startDate = null, endDate = null) {
        try {
            // TODO: Substituir pela chamada real à API
            const queryParams = startDate && endDate ? `?start=${startDate}&end=${endDate}` : '';
            const response = await fetch(`/api/finance/latest-revenue${queryParams}`);
            const data = await response.json();
            
            this.data = data;
            this.updateTable();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    getStatusClass(status) {
        switch (status.toLowerCase()) {
            case 'pago':
                return 'text-green-500';
            case 'pendente':
                return 'text-yellow-500';
            case 'cancelado':
                return 'text-red-500';
            default:
                return '';
        }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    updateTable() {
        const tbody = this.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = this.data.map(item => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-4 py-3">${item.description}</td>
                <td class="px-4 py-3">${this.formatDate(item.date)}</td>
                <td class="px-4 py-3">${this.formatCurrency(item.value)}</td>
                <td class="px-4 py-3">
                    <span class="${this.getStatusClass(item.status)}">
                        ${item.status}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                        <button class="text-blue-500 hover:text-blue-700" onclick="handleEdit(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-500 hover:text-red-700" onclick="handleDelete(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    render() {
        this.innerHTML = `
            <div class="dashboard-card p-6">
                <h3 class="font-semibold mb-4">Últimas Receitas</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="text-left border-b border-gray-200 dark:border-gray-700">
                                <th class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Descrição</th>
                                <th class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Data</th>
                                <th class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Valor</th>
                                <th class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                                <th class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="5" class="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    Carregando...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

customElements.define('latest-revenue-table', LatestRevenueTable); 