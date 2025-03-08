// Funções auxiliares
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Estado da aplicação
let incomeData = [];
let companies = [];
let units = [];

// Funções de API
async function fetchIncomes(filters = {}) {
    try {
        const response = await fetch('/api/finance/income');
        if (!response.ok) throw new Error('Erro ao buscar receitas');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function fetchCompanies() {
    try {
        const response = await fetch('/api/companies');
        if (!response.ok) throw new Error('Erro ao buscar empresas');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function fetchUnits() {
    try {
        const response = await fetch('/api/units');
        if (!response.ok) throw new Error('Erro ao buscar unidades');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function createIncome(data) {
    try {
        const response = await fetch('/api/finance/income', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Erro ao criar receita');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function updateIncome(id, data) {
    try {
        const response = await fetch(`/api/finance/income/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Erro ao atualizar receita');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function deleteIncome(id) {
    try {
        const response = await fetch(`/api/finance/income/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erro ao excluir receita');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Funções de UI
function showLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.classList.remove('hidden');
}

function hideLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.classList.add('hidden');
}

function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.classList.remove('hidden');
}

function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.classList.add('hidden');
}

function renderIncomeList(data) {
    const tbody = document.getElementById('incomeList');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    if (data.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();
    
    data.forEach(income => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <a href="detail.fact.html?id=${income._id}" class="text-sm font-medium hover:text-brand-600">
                    ${income.factId}
                </a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm">${formatDate(income.date)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm">${income.companyId.name || '-'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm">${income.unit.name || '-'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium">${formatCurrency(income.totalFact)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full ${
                    income.status === 'Validado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                }">
                    ${income.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                <button onclick="handleView('${income._id}')" class="text-slate-600 hover:text-slate-900">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="handleEdit('${income._id}')" class="text-brand-600 hover:text-brand-700">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="handleDelete('${income._id}')" class="text-red-600 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function populateSelects() {
    const companySelect = document.getElementById('companyId');
    const unitSelect = document.getElementById('unit');

    if (companySelect) {
        companySelect.innerHTML = '<option value="">Selecione uma empresa</option>';
        companies.forEach(company => {
            companySelect.innerHTML += `<option value="${company._id}">${company.name}</option>`;
        });
    }

    if (unitSelect) {
        unitSelect.innerHTML = '<option value="">Selecione uma unidade</option>';
        units.forEach(unit => {
            unitSelect.innerHTML += `<option value="${unit._id}">${unit.name}</option>`;
        });
    }
}

// Event Handlers
async function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await createIncome(data);
        window.location.href = 'list.fact.html';
    } catch (error) {
        alert('Erro ao salvar receita: ' + error.message);
    }
}

async function handleEdit(id) {
    window.location.href = `edit.fact.html?id=${id}`;
}

async function handleView(id) {
    window.location.href = `detail.fact.html?id=${id}`;
}

async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;
    
    try {
        await deleteIncome(id);
        loadIncomes();
    } catch (error) {
        alert('Erro ao excluir receita: ' + error.message);
    }
}

async function handleFilter() {
    // Implementar filtros
    console.log('Aplicar filtros');
}

// Inicialização
async function loadIncomes() {
    showLoading();
    try {
        incomeData = await fetchIncomes();
        renderIncomeList(incomeData);
    } catch (error) {
        alert('Erro ao carregar receitas: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function initForm() {
    try {
        [companies, units] = await Promise.all([
            fetchCompanies(),
            fetchUnits()
        ]);
        populateSelects();
    } catch (error) {
        alert('Erro ao carregar dados do formulário: ' + error.message);
    }
}

async function loadIncomeDetails(id) {
    try {
        const income = await fetchIncome(id);
        
        // Atualizar campos
        document.getElementById('incomeId').textContent = `ID: ${income.factId}`;
        document.getElementById('incomeDate').textContent = formatDate(income.date);
        document.getElementById('incomeCompany').textContent = income.companyId.name;
        document.getElementById('incomeUnit').textContent = income.unit.name;
        document.getElementById('incomeValue').textContent = formatCurrency(income.totalFact);
        
        const statusSpan = document.createElement('span');
        statusSpan.className = `px-2 py-1 text-xs rounded-full ${
            income.status === 'Validado' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-amber-100 text-amber-800'
        }`;
        statusSpan.textContent = income.status;
        document.getElementById('incomeStatus').innerHTML = '';
        document.getElementById('incomeStatus').appendChild(statusSpan);
        
        document.getElementById('incomeCreatedAt').textContent = formatDate(income.createdAt);
        document.getElementById('incomeUpdatedAt').textContent = formatDate(income.updatedAt);
        
        // Configurar botão de edição
        const editButton = document.getElementById('editButton');
        if (editButton) {
            editButton.onclick = () => handleEdit(income._id);
        }
    } catch (error) {
        alert('Erro ao carregar detalhes da receita: ' + error.message);
    }
}

async function loadIncomeForEdit(id) {
    try {
        const income = await fetchIncome(id);
        
        // Preencher formulário
        document.getElementById('incomeId').value = income._id;
        document.getElementById('factId').value = income.factId;
        document.getElementById('date').value = income.date.split('T')[0];
        document.getElementById('companyId').value = income.companyId._id;
        document.getElementById('unit').value = income.unit._id;
        document.getElementById('totalFact').value = income.totalFact;
        document.getElementById('status').value = income.status;
        
        // Atualizar ID no cabeçalho
        const idDisplay = document.querySelector('p#incomeId');
        if (idDisplay) {
            idDisplay.textContent = `ID: ${income.factId}`;
        }
    } catch (error) {
        alert('Erro ao carregar receita para edição: ' + error.message);
    }
}

// Funções do Dashboard
async function loadDashboardData() {
    showLoading();
    try {
        const data = await fetchIncomes();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const lastMonth = currentMonth - 1;

        // Filtrar dados do mês atual e anterior
        const currentMonthData = data.filter(income => new Date(income.date).getMonth() === currentMonth);
        const lastMonthData = data.filter(income => new Date(income.date).getMonth() === lastMonth);

        // Calcular estatísticas
        const totalReceived = currentMonthData.reduce((sum, income) => sum + income.totalFact, 0);
        const lastMonthTotal = lastMonthData.reduce((sum, income) => sum + income.totalFact, 0);
        const percentageIncrease = lastMonthTotal ? ((totalReceived - lastMonthTotal) / lastMonthTotal) * 100 : 0;

        const pendingIncomes = currentMonthData.filter(income => income.status === 'Pendente');
        const pendingAmount = pendingIncomes.reduce((sum, income) => sum + income.totalFact, 0);
        
        const totalCount = currentMonthData.length;
        const averageAmount = totalCount ? totalReceived / totalCount : 0;

        // Atualizar cards
        document.getElementById('totalReceived').textContent = formatCurrency(totalReceived);
        document.getElementById('percentageIncrease').textContent = `${percentageIncrease.toFixed(1)}%`;
        document.getElementById('pendingAmount').textContent = formatCurrency(pendingAmount);
        document.getElementById('pendingCount').textContent = pendingIncomes.length;
        document.getElementById('totalCount').textContent = totalCount;
        document.getElementById('averageAmount').textContent = formatCurrency(averageAmount);

        // Renderizar gráficos
        renderMonthlyChart(data);
        renderStatusChart(currentMonthData);

        // Renderizar últimas receitas
        renderRecentIncomes(data.slice(0, 5));
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
        hideLoading();
    }
}

function renderMonthlyChart(data) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;

    // Agrupar dados por mês
    const monthlyData = data.reduce((acc, income) => {
        const month = new Date(income.date).toLocaleString('pt-BR', { month: 'short' });
        acc[month] = (acc[month] || 0) + income.totalFact;
        return acc;
    }, {});

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(monthlyData),
            datasets: [{
                label: 'Total Recebido',
                data: Object.values(monthlyData),
                borderColor: '#2563eb',
                backgroundColor: '#93c5fd',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

function renderStatusChart(data) {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;

    // Agrupar por status
    const statusData = data.reduce((acc, income) => {
        acc[income.status] = (acc[income.status] || 0) + income.totalFact;
        return acc;
    }, {});

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusData),
            datasets: [{
                data: Object.values(statusData),
                backgroundColor: [
                    '#2563eb',  // Validado
                    '#f59e0b'   // Pendente
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderRecentIncomes(incomes) {
    const tbody = document.getElementById('recentIncomes');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    incomes.forEach(income => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <a href="detail.fact.html?id=${income._id}" class="text-sm font-medium hover:text-brand-600">
                    ${income.factId}
                </a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm">${formatDate(income.date)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm">${income.companyId.name || '-'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium">${formatCurrency(income.totalFact)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full ${
                    income.status === 'Validado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                }">
                    ${income.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <a href="detail.fact.html?id=${income._id}" class="text-brand-600 hover:text-brand-700">
                    <i class="fas fa-eye"></i>
                </a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    const incomeForm = document.getElementById('incomeForm');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (incomeForm) {
        await initForm();
        
        if (id) {
            // Modo edição
            await loadIncomeForEdit(id);
            incomeForm.onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(incomeForm);
                const data = Object.fromEntries(formData.entries());
                
                try {
                    await updateIncome(id, data);
                    window.location.href = `detail.fact.html?id=${id}`;
                } catch (error) {
                    alert('Erro ao atualizar receita: ' + error.message);
                }
            };
        } else {
            // Modo criação
            incomeForm.onsubmit = handleSubmit;
        }
    } else if (id) {
        // Página de detalhes
        await loadIncomeDetails(id);
    } else if (window.location.pathname.includes('fact.dash.html')) {
        // Dashboard
        await loadDashboardData();
    } else {
        // Lista
        await loadIncomes();
    }
}); 

// Funções auxiliares
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'EUR'
    }).format(value);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Estado da aplicação
let incomeData = [];
let companies = [];
let units = [];

// Funções de API
async function fetchIncomes(filters = {}) {
    try {
        const response = await fetch('/api/finance/income');
        if (!response.ok) throw new Error('Erro ao buscar receitas');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function fetchCompanies() {
    try {
        const response = await fetch('/api/companies');
        if (!response.ok) throw new Error('Erro ao buscar empresas');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function fetchUnits() {
    try {
        const response = await fetch('/api/units');
        if (!response.ok) throw new Error('Erro ao buscar unidades');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function createIncome(data) {
    try {
        const response = await fetch('/api/finance/income', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Erro ao criar receita');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function updateIncome(id, data) {
    try {
        const response = await fetch(`/api/finance/income/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Erro ao atualizar receita');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function deleteIncome(id) {
    try {
        const response = await fetch(`/api/finance/income/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erro ao excluir receita');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Funções de UI
function showLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.classList.remove('hidden');
}

function hideLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.classList.add('hidden');
}

function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.classList.remove('hidden');
}

function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.classList.add('hidden');
}

// Funções específicas para a página de nova faturação
function initNewFactPage() {
    // Toggle de visualização
    const viewToggle = document.getElementById('viewToggle');
    const viewModeText = document.getElementById('viewModeText');
    const tabsNavContainer = document.getElementById('tabsNavContainer');
    const tabContentContainer = document.getElementById('tabContentContainer');
    const fullReceiptView = document.getElementById('fullReceiptView');

    if (viewToggle) {
        viewToggle.addEventListener('change', function() {
            if (this.checked) {
                // Modo talão completo
                viewModeText.textContent = 'Talão completo';
                tabsNavContainer.classList.add('hidden');
                tabContentContainer.classList.add('hidden');
                fullReceiptView.classList.remove('hidden');
                syncFormValues(true); // Sincronizar valores para o modo completo
            } else {
                // Modo por abas
                viewModeText.textContent = 'Por abas';
                tabsNavContainer.classList.remove('hidden');
                tabContentContainer.classList.remove('hidden');
                fullReceiptView.classList.add('hidden');
                syncFormValues(false); // Sincronizar valores para o modo abas
            }
        });
    }

    // Navegação por abas
    const tabLinks = document.querySelectorAll('#tabsNav a');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover classes ativas de todas as abas
            tabLinks.forEach(l => {
                l.classList.remove('tab-active');
                l.classList.add('tab-inactive');
            });
            
            // Esconder todos os conteúdos
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Ativar a aba clicada
            this.classList.remove('tab-inactive');
            this.classList.add('tab-active');
            
            // Mostrar o conteúdo correspondente
            const tabId = this.getAttribute('data-tab');
            const activeContent = document.querySelector(`.tab-content[data-tab="${tabId}"]`);
            if (activeContent) {
                activeContent.classList.remove('hidden');
            }
        });
    });

    // Sincronizar valores entre os modos de visualização
    function syncFormValues(toFullView) {
        const fieldPairs = [
            ['totalCash', 'totalCash_full'],
            ['wireTransfer', 'wireTransfer_full'],
            ['posMb1Gross', 'posMb1Gross_full'],
            ['posMb2Gross', 'posMb2Gross_full'],
            ['uberEatsMb', 'uberEatsMb_full'],
            ['totalFact', 'totalFact_full'],
            ['posMb1GrossDetail', 'posMb1GrossDetail_full'],
            ['posMb1Fee', 'posMb1Fee_full'],
            ['posMb1Net', 'posMb1Net_full'],
            ['posMb2GrossDetail', 'posMb2GrossDetail_full'],
            ['posMb2Fee', 'posMb2Fee_full'],
            ['posMb2Net', 'posMb2Net_full'],
            ['canceledTransactions', 'canceledTransactions_full'],
            ['canceledDocuments', 'canceledDocuments_full'],
            ['canceledDocumentsJustification', 'canceledDocumentsJustification_full'],
            ['discounts', 'discounts_full'],
            ['discountsJustification', 'discountsJustification_full'],
            ['internalConsumption', 'internalConsumption_full'],
            ['internalConsumptionDesc', 'internalConsumptionDesc_full'],
            ['giftCardSold', 'giftCardSold_full'],
            ['giftCardUsed', 'giftCardUsed_full'],
            ['averageTicket', 'averageTicket_full'],
            ['transactionCount', 'transactionCount_full'],
            ['previousDayFact', 'previousDayFact_full'],
            ['dayVariation', 'dayVariation_full']
        ];

        fieldPairs.forEach(pair => {
            const [tabField, fullField] = pair;
            const tabElement = document.getElementById(tabField);
            const fullElement = document.getElementById(fullField);
            
            if (tabElement && fullElement) {
                if (toFullView) {
                    // Copiar valores do modo abas para o modo completo
                    fullElement.value = tabElement.value;
                } else {
                    // Copiar valores do modo completo para o modo abas
                    tabElement.value = fullElement.value;
                }
            }
        });
    }

    // Configurar data e hora atual
    const now = new Date();
    const dateTimeInput = document.getElementById('dateTime');
    if (dateTimeInput) {
        dateTimeInput.value = now.toISOString().slice(0, 16);
        updateDateFields(now);

        // Atualizar campos de data quando mudar a data/hora
        dateTimeInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            updateDateFields(selectedDate);
        });
    }

    // Função para atualizar campos de data
    function updateDateFields(date) {
        const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        const weekDayDisplay = document.getElementById('weekDayDisplay');
        const weekNumDisplay = document.getElementById('weekNumDisplay');
        const monthDisplay = document.getElementById('monthDisplay');
        const yearDisplay = document.getElementById('yearDisplay');
        
        if (weekDayDisplay) weekDayDisplay.textContent = weekdays[date.getDay()];
        if (weekNumDisplay) weekNumDisplay.textContent = getWeekNumber(date);
        if (monthDisplay) monthDisplay.textContent = months[date.getMonth()];
        if (yearDisplay) yearDisplay.textContent = date.getFullYear();

        // Update hidden fields
        const weekDayField = document.getElementById('weekDay');
        const weekNumField = document.getElementById('weekNum');
        const monthField = document.getElementById('month');
        const yearField = document.getElementById('year');
        
        if (weekDayField) weekDayField.value = weekdays[date.getDay()];
        if (weekNumField) weekNumField.value = getWeekNumber(date);
        if (monthField) monthField.value = months[date.getMonth()];
        if (yearField) yearField.value = date.getFullYear();
    }

    // Calcular número da semana
    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
        return weekNo;
    }

    // Inicializar campos de seleção
    initSelectionFields();
    
    // Inicializar cálculos automáticos
    initCalculations();
    
    // Inicializar upload de imagem
    initPhotoUpload();
    
    // Inicializar avaliação por estrelas
    initStarRating();
}

function initSelectionFields() {
    // Campos de seleção com datalist
    const companyInput = document.getElementById('companyInput');
    const unitInput = document.getElementById('unitInput');
    const respInput = document.getElementById('respInput');
    const selectedUnit = document.getElementById('selectedUnit');

    if (companyInput) {
        companyInput.addEventListener('change', function() {
            const companyIdField = document.getElementById('companyId');
            if (companyIdField) {
                companyIdField.value = this.value === 'Plateiapositiva, Lda' ? '1' : '';
            }
        });
    }

    if (unitInput) {
        unitInput.addEventListener('change', function() {
            const unitId = this.value === 'Matosinhos' ? '1' : (this.value === 'Porto' ? '2' : '');
            const unitIdField = document.getElementById('unitId');
            
            if (unitIdField) unitIdField.value = unitId;
            
            if (selectedUnit) {
                if (this.value === 'Matosinhos') {
                    selectedUnit.textContent = 'Rua Sousa Aroso n° 544, Bloco A0.1 Fração K, 4450-286 Matosinhos';
                } else if (this.value === 'Porto') {
                    selectedUnit.textContent = 'Rua do Porto, 123';
                } else {
                    selectedUnit.textContent = 'Selecione uma unidade';
                }
            }
        });
    }

    if (respInput) {
        respInput.addEventListener('change', function() {
            let respId = '';
            if (this.value === 'João Silva') respId = '1';
            else if (this.value === 'Maria Santos') respId = '2';
            else if (this.value === 'Pedro Costa') respId = '3';
            
            const factRespIdField = document.getElementById('factRespId');
            if (factRespIdField) factRespIdField.value = respId;
        });
    }
}

function initCalculations() {
    // Cálculo automático do total da faturação
    const paymentInputs = ['totalCash', 'wireTransfer', 'posMb1Gross', 'posMb2Gross', 'uberEatsMb'];
    const paymentInputsFull = ['totalCash_full', 'wireTransfer_full', 'posMb1Gross_full', 'posMb2Gross_full', 'uberEatsMb_full'];
    
    paymentInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => updateTotal(false));
        }
    });
    
    paymentInputsFull.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => updateTotal(true));
        }
    });

    // Monitor total faturação para diferenças
    const totalFact = document.getElementById('totalFact');
    const totalFact_full = document.getElementById('totalFact_full');
    
    if (totalFact) {
        totalFact.addEventListener('input', () => checkFactDiff(false));
    }
    
    if (totalFact_full) {
        totalFact_full.addEventListener('input', () => checkFactDiff(true));
    }

    function updateTotal(isFullView) {
        const inputs = isFullView ? paymentInputsFull : paymentInputs;
        const totalFactId = isFullView ? 'totalFact_full' : 'totalFact';
        
        const total = inputs.reduce((sum, inputId) => {
            const input = document.getElementById(inputId);
            return sum + (input ? (parseFloat(input.value) || 0) : 0);
        }, 0);
        
        const totalFactInput = document.getElementById(totalFactId);
        if (totalFactInput) {
            totalFactInput.value = total.toFixed(2);
            
            // Sincronizar entre os modos
            const otherTotalFactId = isFullView ? 'totalFact' : 'totalFact_full';
            const otherTotalFactInput = document.getElementById(otherTotalFactId);
            if (otherTotalFactInput) {
                otherTotalFactInput.value = total.toFixed(2);
            }
            
            // Check for differences
            checkFactDiff(isFullView);
        }
    }

    function checkFactDiff(isFullView) {
        const inputs = isFullView ? paymentInputsFull : paymentInputs;
        const totalFactId = isFullView ? 'totalFact_full' : 'totalFact';
        const diffRowId = isFullView ? 'factDiffRow_full' : 'factDiffRow';
        const diffSpanId = isFullView ? 'factDiffDisplay_full' : 'factDiffDisplay';
        
        const calculatedTotal = inputs.reduce((sum, inputId) => {
            const input = document.getElementById(inputId);
            return sum + (input ? (parseFloat(input.value) || 0) : 0);
        }, 0);
        
        const totalFactInput = document.getElementById(totalFactId);
        const inputTotal = totalFactInput ? (parseFloat(totalFactInput.value) || 0) : 0;
        const diff = inputTotal - calculatedTotal;
        
        const diffRow = document.getElementById(diffRowId);
        const diffSpan = document.getElementById(diffSpanId);
        const factDiffInput = document.getElementById('factDiff');
        
        if (diffRow && diffSpan && Math.abs(diff) > 0.01) {
            diffRow.classList.remove('hidden');
            diffSpan.textContent = diff.toFixed(2);
            if (factDiffInput) factDiffInput.value = diff;
        } else if (diffRow) {
            diffRow.classList.add('hidden');
            if (factDiffInput) factDiffInput.value = 0;
        }
    }

    // Cálculo de valores líquidos para Multibanco
    const mb1GrossDetail = document.getElementById('posMb1GrossDetail');
    const mb1Fee = document.getElementById('posMb1Fee');
    const mb1Net = document.getElementById('posMb1Net');
    
    const mb2GrossDetail = document.getElementById('posMb2GrossDetail');
    const mb2Fee = document.getElementById('posMb2Fee');
    const mb2Net = document.getElementById('posMb2Net');
    
    const mb1GrossDetail_full = document.getElementById('posMb1GrossDetail_full');
    const mb1Fee_full = document.getElementById('posMb1Fee_full');
    const mb1Net_full = document.getElementById('posMb1Net_full');
    
    const mb2GrossDetail_full = document.getElementById('posMb2GrossDetail_full');
    const mb2Fee_full = document.getElementById('posMb2Fee_full');
    const mb2Net_full = document.getElementById('posMb2Net_full');

    // Calcular valor líquido para MB1
    function calculateMb1Net() {
        if (mb1GrossDetail && mb1Fee && mb1Net && mb1Net_full) {
            const gross = parseFloat(mb1GrossDetail.value) || 0;
            const fee = parseFloat(mb1Fee.value) || 0;
            const net = gross - (gross * fee / 100);
            mb1Net.value = net.toFixed(2);
            mb1Net_full.value = net.toFixed(2);
        }
    }

    // Calcular valor líquido para MB2
    function calculateMb2Net() {
        if (mb2GrossDetail && mb2Fee && mb2Net && mb2Net_full) {
            const gross = parseFloat(mb2GrossDetail.value) || 0;
            const fee = parseFloat(mb2Fee.value) || 0;
            const net = gross - (gross * fee / 100);
            mb2Net.value = net.toFixed(2);
            mb2Net_full.value = net.toFixed(2);
        }
    }

    // Calcular valor líquido para MB1 (modo completo)
    function calculateMb1Net_full() {
        if (mb1GrossDetail_full && mb1Fee_full && mb1Net_full && mb1Net) {
            const gross = parseFloat(mb1GrossDetail_full.value) || 0;
            const fee = parseFloat(mb1Fee_full.value) || 0;
            const net = gross - (gross * fee / 100);
            mb1Net_full.value = net.toFixed(2);
            mb1Net.value = net.toFixed(2);
        }
    }

    // Calcular valor líquido para MB2 (modo completo)
    function calculateMb2Net_full() {
        if (mb2GrossDetail_full && mb2Fee_full && mb2Net_full && mb2Net) {
            const gross = parseFloat(mb2GrossDetail_full.value) || 0;
            const fee = parseFloat(mb2Fee_full.value) || 0;
            const net = gross - (gross * fee / 100);
            mb2Net_full.value = net.toFixed(2);
            mb2Net.value = net.toFixed(2);
        }
    }

    // Adicionar event listeners para cálculos
    if (mb1GrossDetail) mb1GrossDetail.addEventListener('input', calculateMb1Net);
    if (mb1Fee) mb1Fee.addEventListener('input', calculateMb1Net);
    if (mb2GrossDetail) mb2GrossDetail.addEventListener('input', calculateMb2Net);
    if (mb2Fee) mb2Fee.addEventListener('input', calculateMb2Net);
    
    if (mb1GrossDetail_full) mb1GrossDetail_full.addEventListener('input', calculateMb1Net_full);
    if (mb1Fee_full) mb1Fee_full.addEventListener('input', calculateMb1Net_full);
    if (mb2GrossDetail_full) mb2GrossDetail_full.addEventListener('input', calculateMb2Net_full);
    if (mb2Fee_full) mb2Fee_full.addEventListener('input', calculateMb2Net_full);

    // Calcular variação percentual
    const previousDayFact = document.getElementById('previousDayFact');
    const dayVariation = document.getElementById('dayVariation');
    const totalFact = document.getElementById('totalFact');
    
    const previousDayFact_full = document.getElementById('previousDayFact_full');
    const dayVariation_full = document.getElementById('dayVariation_full');
    const totalFact_full = document.getElementById('totalFact_full');

    function calculateVariation() {
        if (previousDayFact && dayVariation && totalFact && dayVariation_full) {
            const previous = parseFloat(previousDayFact.value) || 0;
            const current = parseFloat(totalFact.value) || 0;
            
            if (previous > 0) {
                const variation = ((current - previous) / previous) * 100;
                dayVariation.value = variation.toFixed(2);
                dayVariation_full.value = variation.toFixed(2);
            } else {
                dayVariation.value = '0.00';
                dayVariation_full.value = '0.00';
            }
        }
    }

    function calculateVariation_full() {
        if (previousDayFact_full && dayVariation_full && totalFact_full && dayVariation) {
            const previous = parseFloat(previousDayFact_full.value) || 0;
            const current = parseFloat(totalFact_full.value) || 0;
            
            if (previous > 0) {
                const variation = ((current - previous) / previous) * 100;
                dayVariation_full.value = variation.toFixed(2);
                dayVariation.value = variation.toFixed(2);
            } else {
                dayVariation_full.value = '0.00';
                dayVariation.value = '0.00';
            }
        }
    }

    if (previousDayFact) previousDayFact.addEventListener('input', calculateVariation);
    if (totalFact) totalFact.addEventListener('input', calculateVariation);
    if (previousDayFact_full) previousDayFact_full.addEventListener('input', calculateVariation_full);
    if (totalFact_full) totalFact_full.addEventListener('input', calculateVariation_full);
}

function initPhotoUpload() {
    // Upload de imagem
    const photoUpload = document.getElementById('main-photo-upload');
    const photoInput = document.getElementById('photoFactTotal');

    if (photoUpload && photoInput) {
        photoUpload.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', handleImageUpload);
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            photoUpload.innerHTML = `
                <img src="${event.target.result}" class="w-full h-auto rounded-lg" style="max-height: 300px; object-fit: contain;">
                <button type="button" class="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm" id="removePhoto">
                    <i class="fas fa-times text-gray-600"></i>
                </button>
            `;
            
            const removeButton = document.getElementById('removePhoto');
            if (removeButton) {
                removeButton.addEventListener('click', function(e) {
                    e.stopPropagation();
                    resetPhotoUpload();
                });
            }
        };
        reader.readAsDataURL(file);
    }

    function resetPhotoUpload() {
        if (photoInput) photoInput.value = '';
        if (photoUpload) {
            photoUpload.innerHTML = `
                <i class="fas fa-image text-5xl text-gray-400 mb-3"></i>
                <p class="text-gray-600 font-medium">Clique para adicionar uma foto do talão</p>
                <p class="text-gray-500 text-sm mt-2">Formatos aceitos: JPG, PNG</p>
            `;
        }
    }
}

function initStarRating() {
    // Star Rating System
    const starRating = document.getElementById('starRating');
    let currentRating = 0;

    if (starRating) {
        starRating.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const rating = parseInt(e.target.dataset.rating);
                updateStars(rating, true);
            }
        });

        starRating.addEventListener('mouseout', () => {
            updateStars(currentRating, false);
        });

        starRating.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                currentRating = parseInt(e.target.dataset.rating);
                updateStars(currentRating, false);
                
                const dayEvaluationInput = document.getElementById('dayEvaluation');
                if (dayEvaluationInput) {
                    dayEvaluationInput.value = currentRating;
                }
            }
        });
    }

    function updateStars(rating, isHover) {
        if (!starRating) return;
        
        const stars = starRating.children;
        for (let i = 0; i < stars.length; i++) {
            stars[i].classList.toggle('text-yellow-400', i < rating);
            stars[i].classList.toggle('text-gray-300', i >= rating);
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    const currentPage = window.location.pathname;
    
    // Verificar qual página está sendo carregada
    if (currentPage.includes('new.fact.html')) {
        // Inicializar a página de nova faturação
        initNewFactPage();
    } else if (currentPage.includes('list.fact.html')) {
        // Inicializar a página de listagem
        await loadIncomes();
    } else if (currentPage.includes('detail.fact.html')) {
        // Inicializar a página de detalhes
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
            await loadIncomeDetails(id);
        }
    } else if (currentPage.includes('edit.fact.html')) {
        // Inicializar a página de edição
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
            await loadIncomeForEdit(id);
        }
    } else if (currentPage.includes('fact.dash.html')) {
        // Inicializar o dashboard
        await loadDashboardData();
    }
});

// Funções para renderização de listas
function renderIncomeList(data) {
    const tbody = document.getElementById('incomeList');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    if (data.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();
    
    data.forEach(income => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <a href="detail.fact.html?id=${income._id}" class="text-sm font-medium hover:text-brand-600">
                    ${income.factId}
                </a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm">${formatDate(income.date)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm">${income.companyId?.name || '-'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm">${income.unit?.name || '-'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium">${formatCurrency(income.totalFact)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full ${
                    income.status === 'Validado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                }">
                    ${income.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                <button onclick="handleView('${income._id}')" class="text-slate-600 hover:text-slate-900">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="handleEdit('${income._id}')" class="text-brand-600 hover:text-brand-700">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="handleDelete('${income._id}')" class="text-red-600 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Funções para detalhes e edição
async function loadIncomeDetails(id) {
    try {
        const income = await fetchIncome(id);
        
        // Atualizar campos
        const incomeIdElement = document.getElementById('incomeId');
        const incomeDateElement = document.getElementById('incomeDate');
        const incomeCompanyElement = document.getElementById('incomeCompany');
        const incomeUnitElement = document.getElementById('incomeUnit');
        const incomeValueElement = document.getElementById('incomeValue');
        const incomeStatusElement = document.getElementById('incomeStatus');
        const incomeCreatedAtElement = document.getElementById('incomeCreatedAt');
        const incomeUpdatedAtElement = document.getElementById('incomeUpdatedAt');
        
        if (incomeIdElement) incomeIdElement.textContent = `ID: ${income.factId}`;
        if (incomeDateElement) incomeDateElement.textContent = formatDate(income.date);
        if (incomeCompanyElement) incomeCompanyElement.textContent = income.companyId?.name || '-';
        if (incomeUnitElement) incomeUnitElement.textContent = income.unit?.name || '-';
        if (incomeValueElement) incomeValueElement.textContent = formatCurrency(income.totalFact);
        
        if (incomeStatusElement) {
            const statusSpan = document.createElement('span');
            statusSpan.className = `px-2 py-1 text-xs rounded-full ${
                income.status === 'Validado' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
            }`;
            statusSpan.textContent = income.status;
            incomeStatusElement.innerHTML = '';
            incomeStatusElement.appendChild(statusSpan);
        }
        
        if (incomeCreatedAtElement) incomeCreatedAtElement.textContent = formatDate(income.createdAt);
        if (incomeUpdatedAtElement) incomeUpdatedAtElement.textContent = formatDate(income.updatedAt);
        
        // Configurar botão de edição
        const editButton = document.getElementById('editButton');
        if (editButton) {
            editButton.onclick = () => handleEdit(income._id);
        }
    } catch (error) {
        alert('Erro ao carregar detalhes da receita: ' + error.message);
    }
}

async function loadIncomeForEdit(id) {
    try {
        const income = await fetchIncome(id);
        
        // Preencher formulário
        const incomeIdField = document.getElementById('incomeId');
        const factIdField = document.getElementById('factId');
        const dateField = document.getElementById('date');
        const companyIdField = document.getElementById('companyId');
        const unitField = document.getElementById('unit');
        const totalFactField = document.getElementById('totalFact');
        const statusField = document.getElementById('status');
        
        if (incomeIdField) incomeIdField.value = income._id;
        if (factIdField) factIdField.value = income.factId;
        if (dateField) dateField.value = income.date.split('T')[0];
        if (companyIdField) companyIdField.value = income.companyId?._id || '';
        if (unitField) unitField.value = income.unit?._id || '';
        if (totalFactField) totalFactField.value = income.totalFact;
        if (statusField) statusField.value = income.status;
        
        // Atualizar ID no cabeçalho
        const idDisplay = document.querySelector('p#incomeId');
        if (idDisplay) {
            idDisplay.textContent = `ID: ${income.factId}`;
        }
    } catch (error) {
        alert('Erro ao carregar receita para edição: ' + error.message);
    }
}

// Funções para o dashboard
async function loadDashboardData() {
    showLoading();
    try {
        const data = await fetchIncomes();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const lastMonth = currentMonth - 1;

        // Filtrar dados do mês atual e anterior
        const currentMonthData = data.filter(income => new Date(income.date).getMonth() === currentMonth);
        const lastMonthData = data.filter(income => new Date(income.date).getMonth() === lastMonth);

        // Calcular estatísticas
        const totalReceived = currentMonthData.reduce((sum, income) => sum + income.totalFact, 0);
        const lastMonthTotal = lastMonthData.reduce((sum, income) => sum + income.totalFact, 0);
        const percentageIncrease = lastMonthTotal ? ((totalReceived - lastMonthTotal) / lastMonthTotal) * 100 : 0;

        const pendingIncomes = currentMonthData.filter(income => income.status === 'Pendente');
        const pendingAmount = pendingIncomes.reduce((sum, income) => sum + income.totalFact, 0);
        
        const totalCount = currentMonthData.length;
        const averageAmount = totalCount ? totalReceived / totalCount : 0;

        // Atualizar cards
        const totalReceivedElement = document.getElementById('totalReceived');
        const percentageIncreaseElement = document.getElementById('percentageIncrease');
        const pendingAmountElement = document.getElementById('pendingAmount');
        const pendingCountElement = document.getElementById('pendingCount');
        const totalCountElement = document.getElementById('totalCount');
        const averageAmountElement = document.getElementById('averageAmount');
        
        if (totalReceivedElement) totalReceivedElement.textContent = formatCurrency(totalReceived);
        if (percentageIncreaseElement) percentageIncreaseElement.textContent = `${percentageIncrease.toFixed(1)}%`;
        if (pendingAmountElement) pendingAmountElement.textContent = formatCurrency(pendingAmount);
        if (pendingCountElement) pendingCountElement.textContent = pendingIncomes.length;
        if (totalCountElement) totalCountElement.textContent = totalCount;
        if (averageAmountElement) averageAmountElement.textContent = formatCurrency(averageAmount);

        // Renderizar gráficos
        renderMonthlyChart(data);
        renderStatusChart(currentMonthData);

        // Renderizar últimas receitas
        renderRecentIncomes(data.slice(0, 5));
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
        hideLoading();
    }
}