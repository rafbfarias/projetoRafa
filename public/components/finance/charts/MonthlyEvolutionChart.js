class MonthlyEvolutionChart extends HTMLElement {
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
            const response = await fetch(`/api/finance/monthly-evolution${queryParams}`);
            const data = await response.json();
            
            this.data = data;
            this.initChart();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    initChart() {
        const ctx = this.querySelector('#monthlyEvolutionChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.map(item => item.month),
                datasets: [{
                    label: 'Receitas',
                    data: this.data.map(item => item.value),
                    borderColor: 'var(--chart-line)',
                    backgroundColor: 'var(--chart-line-bg)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'var(--chart-grid)'
                        },
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    notation: 'compact',
                                    compactDisplay: 'short'
                                }).format(value);
                            },
                            color: 'var(--chart-text)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'var(--chart-grid)'
                        },
                        ticks: {
                            color: 'var(--chart-text)'
                        }
                    }
                }
            }
        });
    }

    render() {
        this.innerHTML = `
            <div class="dashboard-card p-6">
                <h3 class="font-semibold mb-4">Evolução Mensal</h3>
                <div class="h-80">
                    <canvas id="monthlyEvolutionChart"></canvas>
                </div>
            </div>
        `;
    }
}

customElements.define('monthly-evolution-chart', MonthlyEvolutionChart); 