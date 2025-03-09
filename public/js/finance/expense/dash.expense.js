document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const periodSelect = document.getElementById('periodSelect');
    const dateRangeContainer = document.getElementById('dateRangeContainer');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    const modalitySelect = document.getElementById('modalityFilter');
    const categorySelect = document.getElementById('categoryFilter');
    const subcategorySelect = document.getElementById('subcategoryFilter');
    const statusSelect = document.getElementById('statusFilter');
    const supplierSelect = document.getElementById('supplierFilter');
    const totalExpensesValue = document.getElementById('totalExpensesValue');
    const pendingExpensesValue = document.getElementById('pendingExpensesValue');
    const paidExpensesValue = document.getElementById('paidExpensesValue');
    const overdueExpensesValue = document.getElementById('overdueExpensesValue');
    const expensesByModalityChart = document.getElementById('expensesByModalityChart');
    const expensesByCategoryChart = document.getElementById('expensesByCategoryChart');
    const expensesTrendChart = document.getElementById('expensesTrendChart');
    const recentExpensesTable = document.getElementById('recentExpensesTable');
    const recentExpensesBody = document.getElementById('recentExpensesBody');
    const newExpenseBtn = document.getElementById('newExpenseBtn');
    const viewAllExpensesBtn = document.getElementById('viewAllExpensesBtn');
    
    // Estado da aplicação
    let modalities = [];
    let categories = [];
    let subcategories = [];
    let suppliers = [];
    let expenses = [];
    let filters = {
        period: 'month',
        startDate: null,
        endDate: null,
        modalityId: null,
        categoryId: null,
        subcategoryId: null,
        status: null,
        supplierId: null
    };
    let charts = {
        modality: null,
        category: null,
        trend: null
    };
    
    // Inicializar a página
    initializePage();
    
    // Event Listeners
    periodSelect.addEventListener('change', handlePeriodChange);
    applyFilterBtn.addEventListener('click', applyFilters);
    resetFilterBtn.addEventListener('click', resetFilters);
    modalitySelect.addEventListener('change', handleModalityFilterChange);
    categorySelect.addEventListener('change', handleCategoryFilterChange);
    newExpenseBtn.addEventListener('click', () => {
        window.location.href = '/public/pages/finance/expense/new.expense.html';
    });
    viewAllExpensesBtn.addEventListener('click', () => {
        // Redirecionar para a lista completa de despesas
        console.log('Ver todas as despesas');
    });
    
    // Funções
    function initializePage() {
        // Configurar datas iniciais
        setDefaultDates();
        
        // Simular carregamento de dados
        setTimeout(() => {
            // Dados mockados
            modalities = [
                { id: 1, code: 'HR', name: 'Recursos Humanos', description: 'Despesas relacionadas a recursos humanos', isActive: true, order: 1 },
                { id: 2, code: 'FB', name: 'F&B', description: 'Despesas de alimentos e bebidas', isActive: true, order: 2 },
                { id: 3, code: 'MKT', name: 'Marketing', description: 'Despesas de marketing e publicidade', isActive: true, order: 3 },
                { id: 4, code: 'OPS', name: 'Operações', description: 'Despesas operacionais', isActive: true, order: 4 },
                { id: 5, code: 'ADM', name: 'Administrativo', description: 'Despesas administrativas', isActive: true, order: 5 }
            ];
            
            categories = [
                { id: 1, modalityId: 1, code: 'SAL', name: 'Salários', description: 'Pagamentos de salários', isActive: true, order: 1 },
                { id: 2, modalityId: 1, code: 'BNFS', name: 'Benefícios', description: 'Benefícios a empregados', isActive: true, order: 2 },
                { id: 3, modalityId: 1, code: 'TRN', name: 'Treinamentos', description: 'Treinamentos e capacitações', isActive: true, order: 3 },
                { id: 4, modalityId: 2, code: 'FOOD', name: 'Alimentos', description: 'Despesas com alimentos', isActive: true, order: 1 },
                { id: 5, modalityId: 2, code: 'BEV', name: 'Bebidas', description: 'Despesas com bebidas', isActive: true, order: 2 },
                { id: 6, modalityId: 2, code: 'SUP', name: 'Suprimentos', description: 'Suprimentos gerais', isActive: true, order: 3 }
            ];
            
            subcategories = [
                { id: 1, categoryId: 1, code: 'MGR', name: 'Gerência', description: 'Salários de gerência', isActive: true, order: 1 },
                { id: 2, categoryId: 1, code: 'ADMIN', name: 'Administrativo', description: 'Salários administrativos', isActive: true, order: 2 },
                { id: 3, categoryId: 1, code: 'OPS', name: 'Operacional', description: 'Salários operacionais', isActive: true, order: 3 },
                { id: 4, categoryId: 4, code: 'MEAT', name: 'Carnes', description: 'Despesas com carnes', isActive: true, order: 1 },
                { id: 5, categoryId: 4, code: 'VEG', name: 'Vegetais', description: 'Despesas com vegetais', isActive: true, order: 2 },
                { id: 6, categoryId: 4, code: 'DAIRY', name: 'Laticínios', description: 'Despesas com laticínios', isActive: true, order: 3 }
            ];
            
            suppliers = [
                { id: 1, name: 'Fornecedor A', email: 'contato@fornecedora.com', phone: '123456789', notes: 'Fornecedor principal' },
                { id: 2, name: 'Fornecedor B', email: 'contato@fornecedorb.com', phone: '987654321', notes: 'Fornecedor secundário' },
                { id: 3, name: 'Fornecedor C', email: 'contato@fornecedorc.com', phone: '456789123', notes: 'Fornecedor de emergência' }
            ];
            
            // Gerar despesas mockadas
            generateMockExpenses();
            
            // Preencher filtros
            populateFilterSelects();
            
            // Atualizar dashboard
            updateDashboard();
            
        }, 500);
    }
    
    function setDefaultDates() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        filters.startDate = formatDate(firstDayOfMonth);
        filters.endDate = formatDate(lastDayOfMonth);
        
        startDateInput.value = filters.startDate;
        endDateInput.value = filters.endDate;
    }
    
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    function handlePeriodChange() {
        const period = periodSelect.value;
        filters.period = period;
        
        if (period === 'custom') {
            dateRangeContainer.classList.remove('hidden');
        } else {
            dateRangeContainer.classList.add('hidden');
            
            // Definir datas com base no período selecionado
            const today = new Date();
            let startDate, endDate;
            
            switch (period) {
                case 'today':
                    startDate = new Date(today);
                    endDate = new Date(today);
                    break;
                case 'yesterday':
                    startDate = new Date(today);
                    startDate.setDate(startDate.getDate() - 1);
                    endDate = new Date(startDate);
                    break;
                case 'week':
                    startDate = new Date(today);
                    startDate.setDate(startDate.getDate() - startDate.getDay());
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + 6);
                    break;
                case 'month':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    break;
                case 'quarter':
                    const quarter = Math.floor(today.getMonth() / 3);
                    startDate = new Date(today.getFullYear(), quarter * 3, 1);
                    endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
                    break;
                case 'year':
                    startDate = new Date(today.getFullYear(), 0, 1);
                    endDate = new Date(today.getFullYear(), 11, 31);
                    break;
                default:
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            }
            
            filters.startDate = formatDate(startDate);
            filters.endDate = formatDate(endDate);
            
            startDateInput.value = filters.startDate;
            endDateInput.value = filters.endDate;
            
            // Aplicar filtros automaticamente
            applyFilters();
        }
    }
    
    function populateFilterSelects() {
        // Modalidades
        modalitySelect.innerHTML = '<option value="">Todas as Modalidades</option>';
        modalities.forEach(modality => {
            if (modality.isActive) {
                const option = document.createElement('option');
                option.value = modality.id;
                option.textContent = `${modality.code} - ${modality.name}`;
                modalitySelect.appendChild(option);
            }
        });
        
        // Status
        statusSelect.innerHTML = `
            <option value="">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="overdue">Vencido</option>
            <option value="cancelled">Cancelado</option>
            <option value="draft">Rascunho</option>
        `;
        
        // Fornecedores
        supplierSelect.innerHTML = '<option value="">Todos os Fornecedores</option>';
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            supplierSelect.appendChild(option);
        });
        
        // Categorias e subcategorias serão preenchidas quando uma modalidade for selecionada
        categorySelect.innerHTML = '<option value="">Todas as Categorias</option>';
        categorySelect.disabled = true;
        
        subcategorySelect.innerHTML = '<option value="">Todas as Subcategorias</option>';
        subcategorySelect.disabled = true;
    }
    
    function handleModalityFilterChange() {
        const modalityId = parseInt(modalitySelect.value) || null;
        filters.modalityId = modalityId;
        filters.categoryId = null;
        filters.subcategoryId = null;
        
        // Atualizar select de categorias
        categorySelect.innerHTML = '<option value="">Todas as Categorias</option>';
        categorySelect.disabled = !modalityId;
        
        if (modalityId) {
            const filteredCategories = categories.filter(category => category.modalityId === modalityId && category.isActive);
            
            filteredCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = `${category.code} - ${category.name}`;
                categorySelect.appendChild(option);
            });
        }
        
        // Limpar e desabilitar o select de subcategorias
        subcategorySelect.innerHTML = '<option value="">Todas as Subcategorias</option>';
        subcategorySelect.disabled = true;
    }
    
    function handleCategoryFilterChange() {
        const categoryId = parseInt(categorySelect.value) || null;
        filters.categoryId = categoryId;
        filters.subcategoryId = null;
        
        // Atualizar select de subcategorias
        subcategorySelect.innerHTML = '<option value="">Todas as Subcategorias</option>';
        subcategorySelect.disabled = !categoryId;
        
        if (categoryId) {
            const filteredSubcategories = subcategories.filter(subcategory => subcategory.categoryId === categoryId && subcategory.isActive);
            
            filteredSubcategories.forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory.id;
                option.textContent = `${subcategory.code} - ${subcategory.name}`;
                subcategorySelect.appendChild(option);
            });
        }
    }
    
    function applyFilters() {
        // Atualizar filtros
        if (periodSelect.value === 'custom') {
            filters.startDate = startDateInput.value;
            filters.endDate = endDateInput.value;
        }
        
        filters.modalityId = modalitySelect.value ? parseInt(modalitySelect.value) : null;
        filters.categoryId = categorySelect.value ? parseInt(categorySelect.value) : null;
        filters.subcategoryId = subcategorySelect.value ? parseInt(subcategorySelect.value) : null;
        filters.status = statusSelect.value || null;
        filters.supplierId = supplierSelect.value ? parseInt(supplierSelect.value) : null;
        
        // Atualizar dashboard com os novos filtros
        updateDashboard();
    }
    
    function resetFilters() {
        // Resetar selects
        periodSelect.value = 'month';
        modalitySelect.value = '';
        categorySelect.value = '';
        subcategorySelect.value = '';
        statusSelect.value = '';
        supplierSelect.value = '';
        
        // Resetar estado dos selects
        categorySelect.disabled = true;
        subcategorySelect.disabled = true;
        
        // Esconder container de datas personalizadas
        dateRangeContainer.classList.add('hidden');
        
        // Resetar datas para o mês atual
        setDefaultDates();
        
        // Resetar filtros
        filters = {
            period: 'month',
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            modalityId: null,
            categoryId: null,
            subcategoryId: null,
            status: null,
            supplierId: null
        };
        
        // Atualizar dashboard
        updateDashboard();
    }
    
    function updateDashboard() {
        // Filtrar despesas com base nos filtros atuais
        const filteredExpenses = filterExpenses();
        
        // Atualizar cards de resumo
        updateSummaryCards(filteredExpenses);
        
        // Atualizar gráficos
        updateCharts(filteredExpenses);
        
        // Atualizar tabela de despesas recentes
        updateRecentExpensesTable(filteredExpenses);
    }
    
    function filterExpenses() {
        return expenses.filter(expense => {
            // Filtrar por data
            const expenseDate = new Date(expense.expenseDate);
            const startDate = new Date(filters.startDate);
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999); // Incluir o último dia inteiro
            
            if (expenseDate < startDate || expenseDate > endDate) {
                return false;
            }
            
            // Filtrar por modalidade
            if (filters.modalityId && expense.classification.modalityId !== filters.modalityId) {
                return false;
            }
            
            // Filtrar por categoria
            if (filters.categoryId && expense.classification.categoryId !== filters.categoryId) {
                return false;
            }
            
            // Filtrar por subcategoria
            if (filters.subcategoryId && expense.classification.subcategoryId !== filters.subcategoryId) {
                return false;
            }
            
            // Filtrar por status
            if (filters.status && expense.status !== filters.status) {
                return false;
            }
            
            // Filtrar por fornecedor
            if (filters.supplierId && expense.classification.supplierId !== filters.supplierId) {
                return false;
            }
            
            return true;
        });
    }
    
    function updateSummaryCards(filteredExpenses) {
        // Calcular totais
        const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const pending = filteredExpenses.filter(e => e.status === 'pending').reduce((sum, expense) => sum + expense.amount, 0);
        const paid = filteredExpenses.filter(e => e.status === 'paid').reduce((sum, expense) => sum + expense.amount, 0);
        const overdue = filteredExpenses.filter(e => e.status === 'overdue').reduce((sum, expense) => sum + expense.amount, 0);
        
        // Atualizar valores nos cards
        totalExpensesValue.textContent = formatCurrency(total);
        pendingExpensesValue.textContent = formatCurrency(pending);
        paidExpensesValue.textContent = formatCurrency(paid);
        overdueExpensesValue.textContent = formatCurrency(overdue);
    }
    
    function updateCharts(filteredExpenses) {
        // Destruir gráficos existentes para evitar duplicação
        if (charts.modality) charts.modality.destroy();
        if (charts.category) charts.category.destroy();
        if (charts.trend) charts.trend.destroy();
        
        // Gráfico de despesas por modalidade
        const modalityData = getExpensesByModality(filteredExpenses);
        charts.modality = new Chart(expensesByModalityChart, {
            type: 'doughnut',
            data: {
                labels: modalityData.labels,
                datasets: [{
                    data: modalityData.values,
                    backgroundColor: [
                        '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                        '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        });
        
        // Gráfico de despesas por categoria
        const categoryData = getExpensesByCategory(filteredExpenses);
        charts.category = new Chart(expensesByCategoryChart, {
            type: 'bar',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    label: 'Valor',
                    data: categoryData.values,
                    backgroundColor: '#4F46E5',
                    borderColor: '#4338CA',
                    borderWidth: 1
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
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${formatCurrency(value)}`;
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
        
        // Gráfico de tendência de despesas
        const trendData = getExpensesTrend(filteredExpenses);
        charts.trend = new Chart(expensesTrendChart, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: 'Total de Despesas',
                    data: trendData.values,
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: '#4F46E5',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${formatCurrency(value)}`;
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
    
    function getExpensesByModality(filteredExpenses) {
        const modalityTotals = {};
        
        // Agrupar despesas por modalidade
        filteredExpenses.forEach(expense => {
            const modalityId = expense.classification.modalityId;
            if (!modalityTotals[modalityId]) {
                modalityTotals[modalityId] = 0;
            }
            modalityTotals[modalityId] += expense.amount;
        });
        
        // Preparar dados para o gráfico
        const labels = [];
        const values = [];
        
        Object.keys(modalityTotals).forEach(modalityId => {
            const modality = modalities.find(m => m.id === parseInt(modalityId));
            if (modality) {
                labels.push(modality.name);
                values.push(modalityTotals[modalityId]);
            }
        });
        
        return { labels, values };
    }
    
    function getExpensesByCategory(filteredExpenses) {
        const categoryTotals = {};
        
        // Agrupar despesas por categoria
        filteredExpenses.forEach(expense => {
            const categoryId = expense.classification.categoryId;
            if (!categoryTotals[categoryId]) {
                categoryTotals[categoryId] = 0;
            }
            categoryTotals[categoryId] += expense.amount;
        });
        
        // Preparar dados para o gráfico
        const labels = [];
        const values = [];
        
        // Ordenar por valor (do maior para o menor)
        const sortedCategories = Object.keys(categoryTotals)
            .map(categoryId => ({
                id: parseInt(categoryId),
                total: categoryTotals[categoryId]
            }))
            .sort((a, b) => b.total - a.total);
        
        // Limitar a 10 categorias para melhor visualização
        sortedCategories.slice(0, 10).forEach(item => {
            const category = categories.find(c => c.id === item.id);
            if (category) {
                labels.push(category.name);
                values.push(item.total);
            }
        });
        
        return { labels, values };
    }
    
    function getExpensesTrend(filteredExpenses) {
        // Determinar o intervalo de datas com base nos filtros
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let interval, format;
        
        // Determinar o intervalo e formato com base no período
        if (diffDays <= 7) {
            // Para períodos curtos, mostrar por dia
            interval = 'day';
            format = 'DD/MM';
        } else if (diffDays <= 31) {
            // Para períodos médios, agrupar por semana
            interval = 'week';
            format = 'DD/MM';
        } else if (diffDays <= 365) {
            // Para períodos longos, agrupar por mês
            interval = 'month';
            format = 'MMM/YYYY';
        } else {
            // Para períodos muito longos, agrupar por trimestre
            interval = 'quarter';
            format = 'Q[º Tri] YYYY';
        }
        
        // Agrupar despesas pelo intervalo definido
        const groupedExpenses = {};
        
        filteredExpenses.forEach(expense => {
            const date = new Date(expense.expenseDate);
            let key;
            
            if (interval === 'day') {
                key = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            } else if (interval === 'week') {
                // Calcular o primeiro dia da semana (domingo)
                const firstDayOfWeek = new Date(date);
                const day = date.getDay();
                firstDayOfWeek.setDate(date.getDate() - day);
                key = `${firstDayOfWeek.getDate().toString().padStart(2, '0')}/${(firstDayOfWeek.getMonth() + 1).toString().padStart(2, '0')}`;
            } else if (interval === 'month') {
                const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                key = `${months[date.getMonth()]}/${date.getFullYear()}`;
            } else if (interval === 'quarter') {
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                key = `${quarter}º Tri ${date.getFullYear()}`;
            }
            
            if (!groupedExpenses[key]) {
                groupedExpenses[key] = 0;
            }
            
            groupedExpenses[key] += expense.amount;
        });
        
        // Preparar dados para o gráfico
        const labels = [];
        const values = [];
        
        // Ordenar as chaves para garantir a sequência correta
        const sortedKeys = Object.keys(groupedExpenses).sort((a, b) => {
            if (interval === 'day' || interval === 'week') {
                const [dayA, monthA] = a.split('/').map(Number);
                const [dayB, monthB] = b.split('/').map(Number);
                return (monthA - monthB) || (dayA - dayB);
            } else if (interval === 'month') {
                const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                const [monthA, yearA] = a.split('/');
                const [monthB, yearB] = b.split('/');
                return (yearA - yearB) || (months.indexOf(monthA) - months.indexOf(monthB));
            } else if (interval === 'quarter') {
                const [quarterA, yearA] = a.split(' ');
                const [quarterB, yearB] = b.split(' ');
                return (yearA - yearB) || (parseInt(quarterA) - parseInt(quarterB));
            }
            return 0;
        });
        
        sortedKeys.forEach(key => {
            labels.push(key);
            values.push(groupedExpenses[key]);
        });
        
        return { labels, values };
    }
    
    function updateRecentExpensesTable(filteredExpenses) {
        // Limpar tabela
        recentExpensesBody.innerHTML = '';
        
        // Ordenar despesas por data (mais recentes primeiro)
        const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
        
        // Limitar a 10 despesas
        const recentExpenses = sortedExpenses.slice(0, 10);
        
        if (recentExpenses.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Nenhuma despesa encontrada para os filtros selecionados.
                </td>
            `;
            recentExpensesBody.appendChild(emptyRow);
            return;
        }
        
        // Adicionar despesas à tabela
        recentExpenses.forEach(expense => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50';
            
            // Encontrar modalidade, categoria e fornecedor
            const modality = modalities.find(m => m.id === expense.classification.modalityId);
            const category = categories.find(c => c.id === expense.classification.categoryId);
            const supplier = expense.classification.supplierId ? 
                suppliers.find(s => s.id === expense.classification.supplierId) : null;
            
            // Determinar a cor do status
            let statusColor;
            switch (expense.status) {
                case 'paid':
                    statusColor = 'bg-green-100 text-green-800';
                    break;
                case 'pending':
                    statusColor = 'bg-yellow-100 text-yellow-800';
                    break;
                case 'overdue':
                    statusColor = 'bg-red-100 text-red-800';
                    break;
                case 'cancelled':
                    statusColor = 'bg-gray-100 text-gray-800';
                    break;
                case 'draft':
                    statusColor = 'bg-blue-100 text-blue-800';
                    break;
                default:
                    statusColor = 'bg-gray-100 text-gray-800';
            }
            
            // Traduzir status
            const statusText = {
                'paid': 'Pago',
                'pending': 'Pendente',
                'overdue': 'Vencido',
                'cancelled': 'Cancelado',
                'draft': 'Rascunho'
            }[expense.status] || expense.status;
            
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${expense.description}</div>
                    <div class="text-xs text-gray-500">${modality ? modality.name : ''} > ${category ? category.name : ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="text-sm font-medium text-gray-900">${formatCurrency(expense.amount)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${formatDate(new Date(expense.expenseDate))}</div>
                    ${expense.dueDate ? `<div class="text-xs text-gray-500">Venc: ${formatDate(new Date(expense.dueDate))}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${expense.payment.method ? translatePaymentMethod(expense.payment.method) : '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="/public/pages/finance/expense/new.expense.html?id=${expense.id}" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </a>
                    <a href="#" class="text-red-600 hover:text-red-900 delete-expense" data-id="${expense.id}">
                        <i class="fas fa-trash-alt"></i>
                    </a>
                </td>
            `;
            
            recentExpensesBody.appendChild(tr);
        });
        
        // Adicionar event listeners para os botões de exclusão
        document.querySelectorAll('.delete-expense').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const expenseId = parseInt(this.getAttribute('data-id'));
                if (confirm('Tem certeza que deseja excluir esta despesa?')) {
                    deleteExpense(expenseId);
                }
            });
        });
    }
    
    function deleteExpense(expenseId) {
        // Simular exclusão (em uma aplicação real, você enviaria para o servidor)
        expenses = expenses.filter(expense => expense.id !== expenseId);
        
        // Atualizar dashboard
        updateDashboard();
        
        // Mostrar mensagem de sucesso
        alert('Despesa excluída com sucesso!');
    }
    
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    }
    
    function formatDate(date) {
        return date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    function translatePaymentMethod(method) {
        const translations = {
            'cash': 'Dinheiro',
            'bank_transfer': 'Transferência Bancária',
            'credit_card': 'Cartão de Crédito',
            'debit_card': 'Cartão de Débito',
            'check': 'Cheque',
            'other': 'Outro'
        };
        
        return translations[method] || method;
    }
    
    function generateMockExpenses() {
        // Gerar despesas aleatórias para demonstração
        expenses = [];
        
        // Definir período para gerar despesas (últimos 6 meses)
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        // Gerar 100 despesas aleatórias
        for (let i = 0; i < 100; i++) {
            // Gerar data aleatória entre hoje e 6 meses atrás
            const expenseDate = new Date(sixMonthsAgo.getTime() + Math.random() * (today.getTime() - sixMonthsAgo.getTime()));
            
            // Gerar data de vencimento (alguns dias após a data da despesa)
            const dueDate = new Date(expenseDate);
            dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 1);
            
            // Determinar se a despesa foi paga
            const isPaid = Math.random() > 0.3;
            
            // Determinar data de pagamento (se paga)
            let paymentDate = null;
            if (isPaid) {
                paymentDate = new Date(expenseDate);
                paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 15));
            }
            
            // Determinar status
            let status;
            if (isPaid) {
                status = 'paid';
            } else if (dueDate < today) {
                status = 'overdue';
            } else {
                status = 'pending';
            }
            
            // Adicionar alguns rascunhos e cancelados
            if (i % 20 === 0) {
                status = 'draft';
            } else if (i % 15 === 0) {
                status = 'cancelled';
            }
            
            // Selecionar modalidade, categoria e subcategoria aleatórias
            const modalityId = modalities[Math.floor(Math.random() * modalities.length)].id;
            const modalityCategories = categories.filter(c => c.modalityId === modalityId);
            const categoryId = modalityCategories[Math.floor(Math.random() * modalityCategories.length)].id;
            const categorySubcategories = subcategories.filter(s => s.categoryId === categoryId);
            
            // Nem todas as despesas têm subcategoria
            const hasSubcategory = Math.random() > 0.3;
            const subcategoryId = hasSubcategory && categorySubcategories.length > 0 ? 
                categorySubcategories[Math.floor(Math.random() * categorySubcategories.length)].id : null;
            
            // Nem todas as despesas têm fornecedor
            const hasSupplier = Math.random() > 0.2;
            const supplierId = hasSupplier ? suppliers[Math.floor(Math.random() * suppliers.length)].id : null;
            
            // Gerar valor aleatório entre 10 e 5000
            const amount = Math.round((10 + Math.random() * 4990) * 100) / 100;
            
            // Método de pagamento
            const paymentMethods = ['cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'other'];
            const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
            
            // Criar despesa
            expenses.push({
                id: i + 1,
                description: `Despesa ${i + 1} - ${getRandomExpenseDescription(categoryId)}`,
                amount,
                expenseDate: formatDate(expenseDate),
                dueDate: formatDate(dueDate),
                paymentDate: paymentDate ? formatDate(paymentDate) : null,
                status,
                classification: {
                    modalityId,
                    categoryId,
                    subcategoryId,
                    supplierId,
                    costCenterId: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : null
                },
                payment: {
                    method: paymentMethod,
                    bankAccountId: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : null,
                    installments: Math.random() > 0.8 ? Math.floor(Math.random() * 12) + 1 : 1,
                    recurrence: Math.random() > 0.9 ? ['monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual'][Math.floor(Math.random() * 5)] : 'none',
                    recurrenceCount: null,
                    recurrenceEndDate: null
                },
                notes: Math.random() > 0.7 ? 'Observações sobre esta despesa.' : '',
                attachments: Math.random() > 0.8 ? [
                    {
                        id: Date.now() + i,
                        name: 'documento.pdf',
                        size: 1024 * 1024 * (Math.random() * 5),
                        type: 'application/pdf'
                    }
                ] : []
            });
        }
    }
    
    function getRandomExpenseDescription(categoryId) {
        // Descrições baseadas na categoria
        const categoryDescriptions = {
            1: ['Folha de Pagamento', 'Bônus', 'Comissões', 'Horas Extras', 'Férias'],
            2: ['Vale Refeição', 'Plano de Saúde', 'Vale Transporte', 'Seguro de Vida', 'Auxílio Educação'],
            3: ['Curso de Capacitação', 'Workshop', 'Conferência', 'Seminário', 'Certificação'],
            4: ['Compra de Alimentos', 'Frutas e Verduras', 'Carnes', 'Bebidas', 'Produtos Perecíveis'],
            5: ['Água Mineral', 'Refrigerantes', 'Vinhos', 'Cervejas', 'Sucos'],
            6: ['Material de Limpeza', 'Utensílios de Cozinha', 'Descartáveis', 'Embalagens', 'Produtos de Higiene']
        };
        
        // Se a categoria não tiver descrições específicas, usar descrições genéricas
        const descriptions = categoryDescriptions[categoryId] || [
            'Pagamento de Serviço', 'Compra de Material', 'Manutenção', 'Consultoria', 'Assinatura',
            'Aluguel', 'Impostos', 'Taxas', 'Seguro', 'Utilidades', 'Transporte', 'Comunicação'
        ];
        
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }
});