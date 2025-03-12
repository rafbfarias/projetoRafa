/**
 * Formata um valor numérico como moeda
 * @param {number} value - Valor a ser formatado
 * @param {string} currency - Código da moeda (padrão: 'EUR')
 * @returns {string} Valor formatado como moeda
 */
function formatCurrency(value, currency = 'EUR') {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Inicializa a página
function initPage() {
    // Configuração do botão de tema
    const themeToggle = document.getElementById('themeToggle');
    const themeText = themeToggle.querySelector('span');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Configuração do botão para colapsar o menu
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        
        // Ajusta o conteúdo principal quando o menu é colapsado
        if (sidebar.classList.contains('collapsed')) {
            mainContent.style.marginLeft = '0';
        } else {
            mainContent.style.marginLeft = '0';
        }
    });
    
    // Configuração do menu móvel
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.add('mobile-open');
        sidebarOverlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Impede rolagem quando o menu está aberto
    });
    
    closeMobileMenu.addEventListener('click', function() {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('show');
        document.body.style.overflow = ''; // Restaura a rolagem
    });
    
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('show');
        document.body.style.overflow = ''; // Restaura a rolagem
    });
    
    // Verifica o tamanho da tela ao carregar e redimensionar
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('collapsed');
            mainContent.style.marginLeft = '0';
        } else {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    // Verifica o tamanho da tela ao carregar
    checkScreenSize();
    
    // Verifica o tamanho da tela ao redimensionar
    window.addEventListener('resize', checkScreenSize);
    
    // Verifica se há preferência de tema salva
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeUI(savedTheme);
    }
}

// Alterna entre os temas claro e escuro
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeUI(newTheme);
}

// Atualiza a interface com base no tema
function updateThemeUI(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        if (themeText) {
            themeText.textContent = 'Modo claro';
        }
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        if (themeText) {
            themeText.textContent = 'Modo escuro';
        }
    }
}

// Função para carregar um componente
async function loadComponent(elementId, componentName) {
    try {
        const response = await fetch(`/components/${componentName}.comp`);
        if (!response.ok) throw new Error(`Erro ao carregar ${componentName}`);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Erro ao carregar componente ${componentName}:`, error);
    }
}

// Função para inicializar os gráficos
function initializeCharts() {
    // Gráfico de Receita Mensal
    const monthlyChart = document.getElementById('monthlyRevenueChart');
    if (monthlyChart) {
        new Chart(monthlyChart, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [{
                    label: 'Receita',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHitRadius: 10
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
                        callbacks: {
                            label: function(context) {
                                return formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de Distribuição
    const distributionChart = document.getElementById('revenueDistributionChart');
    if (distributionChart) {
        new Chart(distributionChart, {
            type: 'doughnut',
            data: {
                labels: ['Desenvolvimento', 'Consultoria', 'Design'],
                datasets: [{
                    data: [45, 35, 20],
                    backgroundColor: [
                        'var(--chart-donut-1)',
                        'var(--chart-donut-2)',
                        'var(--chart-donut-3)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--chart-text)'
                        }
                    }
                }
            }
        });
    }
}

// Função para fazer requisições autenticadas
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('Token não encontrado');
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    };

    return fetch(url, { ...defaultOptions, ...options });
}

// Usar esta função para todas as requisições
async function initializeDashboard() {
    try {
        // Exemplo de requisição autenticada
        const response = await fetchWithAuth('/api/dashboard/data');
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao carregar dados');
        }

        // Renderizar dados
        console.log('Dados do dashboard:', data);
    } catch (error) {
        console.error('Erro:', error);
        if (error.message.includes('Token')) {
            window.location.href = '/login.html';
        }
    }
}

// Carrega todos os componentes quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    // Carrega os cards
    await loadComponent('totalRevenueCard', 'totalRevenueCard');
    await loadComponent('activeClientsCard', 'activeClientsCard');
    await loadComponent('activeContractsCard', 'activeContractsCard');
    await loadComponent('employeesCard', 'employeesCard');

    // Carrega os gráficos
    await loadComponent('monthlyRevenueGraph', 'monthlyRevenueGraph');
    await loadComponent('revenueDistributionGraph', 'revenueDistributionGraph');

    // Carrega as tabelas e listas
    await loadComponent('recentContracts', 'recentContracts');
    await loadComponent('recentActivities', 'recentActivities');

    // Carrega tarefas e projetos
    await loadComponent('pendingTasks', 'pendingTasks');
    await loadComponent('ongoingProjects', 'ongoingProjects');

    // Inicializa os gráficos após carregar os componentes
    initializeCharts();
});

// Inicializa a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação e associação com empresa
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token) {
        console.log('Sem token, redirecionando para login');
        window.location.href = '/login.html';
        return;
    }
    
    // Verificar se o usuário tem associação ativa com empresa
    if (!userData.companyAssociation || userData.companyAssociation.status !== 'active') {
        console.log('Usuário sem associação ativa - redirecionando para welcome');
        window.location.href = '/pages/welcome/welcome.html';
        return;
    }
    
    // Se chegou aqui, inicializar dashboard
    console.log('Iniciando dashboard para usuário com associação ativa');
    initializeDashboard();
});