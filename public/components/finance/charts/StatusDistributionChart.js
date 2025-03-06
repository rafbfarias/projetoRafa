class StatusDistributionChart extends HTMLElement {
    constructor() {
        super();
        this.chart = null;
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
            const response = await fetch(`/api/finance/status-distribution${queryParams}`);
            const data = await response.json();
            
            this.data = data;
            this.initChart();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    initChart() {
        const ctx = this.querySelector('#statusDistributionChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pago', 'Pendente', 'Cancelado'],
                datasets: [{
                    data: this.data.map(item => item.value),
                    backgroundColor: [
                        'var(--chart-donut-3)',
                        'var(--chart-donut-2)',
                        'var(--chart-donut-1)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--chart-text)',
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${percentage}%`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    render() {
        this.innerHTML = `
            <div class="dashboard-card p-6">
                <h3 class="font-semibold mb-4">Distribuição por Status</h3>
                <div class="h-80">
                    <canvas id="statusDistributionChart"></canvas>
                </div>
            </div>
        `;
    }
}

customElements.define('status-distribution-chart', StatusDistributionChart); 