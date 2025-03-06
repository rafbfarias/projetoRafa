class AverageRevenueCard extends HTMLElement {
    constructor() {
        super();
        this.average = 0;
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
            const response = await fetch(`/api/finance/average-revenue${queryParams}`);
            const data = await response.json();
            
            this.average = data.average;
            this.percentage = data.percentage;
            this.updateValues();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    updateValues() {
        const averageElement = this.querySelector('#averageValue');
        const percentageElement = this.querySelector('#percentageValue');
        const arrowIcon = this.querySelector('#arrowIcon');
        
        if (averageElement) {
            averageElement.textContent = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(this.average);
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
                    <h3 class="font-semibold">Média por Receita</h3>
                    <div style="background-color: var(--icon-employees-bg); color: var(--icon-employees-text);" class="p-2 rounded-lg">
                        <i class="fas fa-calculator"></i>
                    </div>
                </div>
                <p class="text-2xl font-bold" id="averageValue">R$ 0,00</p>
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

customElements.define('average-revenue-card', AverageRevenueCard); 