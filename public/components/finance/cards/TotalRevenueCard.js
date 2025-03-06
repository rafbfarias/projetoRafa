class TotalRevenueCard extends HTMLElement {
    constructor() {
        super();
        this.total = 0;
        this.percentage = 0;
    }

    connectedCallback() {
        this.render();
        this.loadData();
    }

    async loadData(startDate = null, endDate = null) {
        try {
            // TODO: Substituir pela chamada real à API
            const queryParams = startDate && endDate ? `?start=${startDate}&end=${endDate}` : '';
            const response = await fetch(`/api/finance/total-revenue${queryParams}`);
            const data = await response.json();
            
            this.total = data.total;
            this.percentage = data.percentage;
            this.updateValues();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    updateValues() {
        const totalElement = this.querySelector('#totalValue');
        const percentageElement = this.querySelector('#percentageValue');
        const arrowIcon = this.querySelector('#arrowIcon');
        
        if (totalElement) {
            totalElement.textContent = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(this.total);
        }
        
        if (percentageElement) {
            percentageElement.textContent = `${this.percentage}%`;
            
            if (this.percentage > 0) {
                arrowIcon.classList.remove('fa-arrow-down');
                arrowIcon.classList.add('fa-arrow-up');
                percentageElement.parentElement.style.color = 'var(--status-paid)';
            } else {
                arrowIcon.classList.remove('fa-arrow-up');
                arrowIcon.classList.add('fa-arrow-down');
                percentageElement.parentElement.style.color = 'var(--status-canceled)';
            }
        }
    }

    render() {
        this.innerHTML = `
            <div class="dashboard-card p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold">Total de Receitas</h3>
                    <div style="background-color: var(--icon-clients-bg); color: var(--icon-clients-text);" class="p-2 rounded-lg">
                        <i class="fas fa-chart-line"></i>
                    </div>
                </div>
                <p class="text-2xl font-bold" id="totalValue">R$ 0,00</p>
                <div class="flex items-center mt-2 text-sm">
                    <span class="flex items-center" style="color: var(--status-paid)">
                        <i id="arrowIcon" class="fas fa-arrow-up mr-1"></i>
                        <span id="percentageValue">0%</span>
                    </span>
                    <span class="text-muted ml-2">vs mês anterior</span>
                </div>
            </div>
        `;
    }
}

customElements.define('total-revenue-card', TotalRevenueCard); 