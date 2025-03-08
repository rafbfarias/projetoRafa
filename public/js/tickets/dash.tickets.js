/**
 * Dashboard de Chamados - Script JavaScript
 * Este script gerencia a funcionalidade do dashboard de chamados,
 * incluindo navegação de abas, renderização de gráficos e manipulação
 * de elementos da interface.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização das variáveis
    const tabLinks = document.querySelectorAll('[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Inicialização dos gráficos
    initializeCharts();
    
    // Navegação por abas
    tabLinks.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove a classe ativa de todas as abas
            tabLinks.forEach(t => {
                t.classList.remove('tab-active');
                t.classList.add('tab-inactive');
            });
            
            // Esconde todos os conteúdos de abas
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Adiciona a classe ativa na aba clicada
            this.classList.add('tab-active');
            this.classList.remove('tab-inactive');
            
            // Mostra o conteúdo da aba selecionada
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.remove('hidden');
        });
    });
    
    // Inicialização do filtro de período
    const filterPeriod = document.getElementById('filterPeriod');
    if (filterPeriod) {
        filterPeriod.addEventListener('change', function() {
            // Aqui seria implementada a lógica para filtrar os dados por período
            // Atualiza os gráficos e tabelas com base no período selecionado
            refreshDashboardData(this.value);
        });
    }
});

/**
 * Inicializa todos os gráficos do dashboard
 */
function initializeCharts() {
    initTicketsStatusChart();
    initCategoriesChart();
    initDepartmentsChart();
    initResolutionTimeChart();
    initTicketsVolumeChart();
    initPriorityDonutChart();
    initStatusDonutChart();
}

/**
 * Inicializa o gráfico de status dos chamados
 */
function initTicketsStatusChart() {
    const ctx = document.getElementById('ticketsStatusChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [
                {
                    label: 'Abertos',
                    data: [45, 39, 60, 75, 82, 68],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Em andamento',
                    data: [32, 42, 53, 60, 63, 54],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Resolvidos',
                    data: [50, 45, 64, 80, 88, 75],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + ' chamados';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Inicializa o gráfico de chamados por departamento
 */
function initDepartmentsChart() {
    const ctx = document.getElementById('departmentsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['TI', 'Financeiro', 'RH', 'Operacional', 'Administrativo'],
            datasets: [
                {
                    label: 'Chamados Recebidos',
                    data: [48, 22, 18, 35, 15],
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderWidth: 0
                },
                {
                    label: 'Chamados Resolvidos',
                    data: [42, 19, 15, 30, 12],
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Inicializa o gráfico de tempo médio de resolução
 */
function initResolutionTimeChart() {
    const ctx = document.getElementById('resolutionTimeChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sistema', 'Infraestrutura', 'Financeiro', 'RH', 'Manutenção', 'Estoque'],
            datasets: [
                {
                    label: 'Tempo Médio (dias)',
                    data: [2.3, 3.5, 1.8, 1.2, 4.1, 1.6],
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderWidth: 0
                },
                {
                    label: 'Meta de SLA (dias)',
                    data: [2, 3, 2, 1, 5, 2],
                    type: 'line',
                    borderColor: 'rgba(239, 68, 68, 0.7)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointBackgroundColor: 'rgba(239, 68, 68, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Dias'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Inicializa o gráfico de volume de chamados
 */
function initTicketsVolumeChart() {
    const ctx = document.getElementById('ticketsVolumeChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Out/24', 'Nov/24', 'Dez/24', 'Jan/25', 'Fev/25', 'Mar/25'],
            datasets: [
                {
                    label: 'Novos Chamados',
                    data: [85, 72, 78, 95, 114, 98],
                    borderColor: 'rgba(59, 130, 246, 0.7)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Chamados Resolvidos',
                    data: [80, 70, 75, 88, 105, 95],
                    borderColor: 'rgba(16, 185, 129, 0.7)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Inicializa o gráfico de donut de prioridades
 */
function initPriorityDonutChart() {
    const ctx = document.getElementById('priorityDonutChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Crítico', 'Alto', 'Médio', 'Baixo'],
            datasets: [
                {
                    data: [8, 24, 45, 23],
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',  // Vermelho
                        'rgba(245, 158, 11, 0.7)', // Laranja
                        'rgba(59, 130, 246, 0.7)', // Azul
                        'rgba(16, 185, 129, 0.7)'  // Verde
                    ],
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.raw / total) * 100);
                            return context.label + ': ' + context.raw + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Inicializa o gráfico de donut de status
 */
function initStatusDonutChart() {
    const ctx = document.getElementById('statusDonutChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Aberto', 'Em andamento', 'Em espera', 'Agendado', 'Resolvido', 'Fechado'],
            datasets: [
                {
                    data: [12, 24, 18, 8, 32, 6],
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',  // Vermelho (Aberto)
                        'rgba(245, 158, 11, 0.7)', // Laranja (Em andamento)
                        'rgba(234, 179, 8, 0.7)',  // Amarelo (Em espera)
                        'rgba(59, 130, 246, 0.7)', // Azul (Agendado)
                        'rgba(16, 185, 129, 0.7)', // Verde (Resolvido)
                        'rgba(107, 114, 128, 0.7)' // Cinza (Fechado)
                    ],
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.raw / total) * 100);
                            return context.label + ': ' + context.raw + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Atualiza os dados do dashboard com base no período selecionado
 * @param {string} period - O período selecionado (últimos 30 dias, últimos 7 dias, etc.)
 */
function refreshDashboardData(period) {
    // Esta função seria implementada para buscar dados do servidor
    // e atualizar os gráficos com base no período selecionado
    console.log('Atualizando dados para período:', period);
    
    // Exemplo de como poderia funcionar a atualização dos gráficos
    // Precisaria de uma chamada AJAX para buscar os dados do servidor
    fetch(`/api/tickets/dashboard?period=${period}`)
        .then(response => response.json())
        .then(data => {
            // Atualiza os gráficos com os novos dados
            updateCharts(data);
        })
        .catch(error => {
            console.error('Erro ao buscar dados do dashboard:', error);
        });
}

/**
 * Atualiza os gráficos com novos dados
 * @param {Object} data - Os novos dados para os gráficos
 */
function updateCharts(data) {
    // Esta função seria implementada para atualizar cada gráfico
    // com os novos dados recebidos do servidor
    
    // Exemplo fictício
    if (data.ticketsStatus) {
        const chart = Chart.getChart('ticketsStatusChart');
        if (chart) {
            chart.data.datasets[0].data = data.ticketsStatus.open;
            chart.data.datasets[1].data = data.ticketsStatus.inProgress;
            chart.data.datasets[2].data = data.ticketsStatus.resolved;
            chart.update();
        }
    }
    
    // Atualização semelhante para os outros gráficos
}

/**
 * Manipulador de notificações
 * Gerencia o contador de notificações e exibe alertas
 */
const NotificationHandler = {
    counter: 0,
    
    /**
     * Incrementa o contador de notificações
     * @param {number} count - O número a ser adicionado ao contador
     */
    increment: function(count = 1) {
        this.counter += count;
        this.updateUI();
    },
    
    /**
     * Decrementa o contador de notificações
     * @param {number} count - O número a ser subtraído do contador
     */
    decrement: function(count = 1) {
        this.counter = Math.max(0, this.counter - count);
        this.updateUI();
    },
    
    /**
     * Define um novo valor para o contador
     * @param {number} count - O novo valor para o contador
     */
    setCount: function(count) {
        this.counter = count;
        this.updateUI();
    },
    
    /**
     * Atualiza a interface do usuário com o valor atual do contador
     */
    updateUI: function() {
        // Encontra todos os elementos de contador de notificação e atualiza-os
        const counters = document.querySelectorAll('.notification-counter');
        counters.forEach(counter => {
            if (this.counter > 0) {
                counter.textContent = this.counter;
                counter.classList.remove('hidden');
            } else {
                counter.classList.add('hidden');
            }
        });
    },
    
    /**
     * Exibe uma notificação na interface
     * @param {string} message - A mensagem a ser exibida
     * @param {string} type - O tipo de notificação (success, error, warning, info)
     */
    showNotification: function(message, type = 'info') {
        // Implementação de uma notificação toast
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${this.getTypeClass(type)}`;
        toast.innerHTML = `
            <div class="flex items-center">
                ${this.getTypeIcon(type)}
                <span class="ml-2">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Remove o toast após alguns segundos
        setTimeout(() => {
            toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    },
    
    /**
     * Retorna a classe CSS correspondente ao tipo de notificação
     * @param {string} type - O tipo de notificação
     * @returns {string} A classe CSS
     */
    getTypeClass: function(type) {
        switch (type) {
            case 'success': return 'bg-green-100 text-green-800';
            case 'error': return 'bg-red-100 text-red-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'info': default: return 'bg-blue-100 text-blue-800';
        }
    },
    
    /**
     * Retorna o ícone correspondente ao tipo de notificação
     * @param {string} type - O tipo de notificação
     * @returns {string} O HTML do ícone
     */
    getTypeIcon: function(type) {
        switch (type) {
            case 'success': return '<i class="fas fa-check-circle"></i>';
            case 'error': return '<i class="fas fa-exclamation-circle"></i>';
            case 'warning': return '<i class="fas fa-exclamation-triangle"></i>';
            case 'info': default: return '<i class="fas fa-info-circle"></i>';
        }
    }
};

// Inicialização das notificações ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    // Exemplo: definir o contador inicial
    NotificationHandler.setCount(8);
});
}
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

/**
 * Inicializa o gráfico de chamados por categoria
 */
function initCategoriesChart() {
    const ctx = document.getElementById('categoriesChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sistema', 'Infraestrutura', 'Financeiro', 'RH', 'Manutenção', 'Estoque'],
            datasets: [
                {
                    label: 'Chamados',
                    data: [32, 24, 18, 15, 22, 12],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(107, 114, 128, 0.7)'
                    ],
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'