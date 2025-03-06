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