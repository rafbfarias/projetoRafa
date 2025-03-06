// Variáveis globais
let currentPage = 1;
let totalPages = 1;
let pageSize = 10;
let currentFilters = {
    user: '',
    unit: '',
    startDate: '',
    endDate: '',
    status: '',
    type: ''
};

// Função principal de inicialização
function initReportsPage() {
    // Carregar dados iniciais
    loadUsers();
    loadUnits();
    setDefaultDates();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar relatórios com filtros padrão
    loadReports();
}

// Configurar event listeners
function setupEventListeners() {
    // Filtros
    document.getElementById('applyFilters').addEventListener('click', handleFilterChange);
    document.getElementById('pageSize').addEventListener('change', handlePageSizeChange);
    
    // Paginação
    document.getElementById('prevPage').addEventListener('click', () => changePage(currentPage - 1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(currentPage + 1));
    
    // Exportação
    document.getElementById('exportButton').addEventListener('click', exportReport);
    
    // Modal
    document.getElementById('closeDetailsModal').addEventListener('click', closeModal);
    document.getElementById('closeModalButton').addEventListener('click', closeModal);
    document.getElementById('editRecordButton').addEventListener('click', handleEditRecord);
    document.getElementById('printRecordButton').addEventListener('click', handlePrintRecord);
}

// Carregar usuários para o filtro
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        const userFilter = document.getElementById('userFilter');
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = user.name;
            userFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showNotification('Erro ao carregar lista de usuários', 'error');
    }
}

// Carregar unidades para o filtro
async function loadUnits() {
    try {
        const response = await fetch('/api/units');
        const units = await response.json();
        
        const unitFilter = document.getElementById('unitFilter');
        units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit._id;
            option.textContent = unit.name;
            unitFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar unidades:', error);
        showNotification('Erro ao carregar lista de unidades', 'error');
    }
}

// Definir datas padrão (último mês)
function setDefaultDates() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    document.getElementById('startDateFilter').value = formatDateForInput(startDate);
    document.getElementById('endDateFilter').value = formatDateForInput(endDate);
}

// Formatar data para input type="date"
function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

// Manipular mudança de filtros
function handleFilterChange() {
    currentPage = 1;
    currentFilters = {
        user: document.getElementById('userFilter').value,
        unit: document.getElementById('unitFilter').value,
        startDate: document.getElementById('startDateFilter').value,
        endDate: document.getElementById('endDateFilter').value,
        status: document.getElementById('statusFilter').value,
        type: document.getElementById('typeFilter').value
    };
    
    loadReports();
}

// Manipular mudança de itens por página
function handlePageSizeChange(event) {
    pageSize = parseInt(event.target.value);
    currentPage = 1;
    loadReports();
}

// Carregar relatórios
async function loadReports() {
    showLoading();
    
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: pageSize,
            ...currentFilters
        });
        
        const response = await fetch(`/api/timesheet/reports?${queryParams}`);
        const data = await response.json();
        
        updateTable(data.records);
        updatePagination(data.total);
        updateStatistics(data.statistics);
        
    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        showNotification('Erro ao carregar relatórios', 'error');
    } finally {
        hideLoading();
    }
}

// Atualizar tabela com os dados
function updateTable(records) {
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = '';
    
    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="px-6 py-4 text-center text-slate-500">
                    Nenhum registro encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    records.forEach(record => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 dark:hover:bg-slate-800';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                ${formatDate(record.date)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${record.userName}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${record.unitName}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${formatTime(record.timeIn)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${formatTime(record.timeOut)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${formatInterval(record.breakStart, record.breakEnd)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${formatTotalTime(record.totalTime)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${getStatusBadge(record.status)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button 
                    onclick="showRecordDetails('${record._id}')"
                    class="text-brand-600 hover:text-brand-700"
                >
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Atualizar paginação
function updatePagination(total) {
    totalPages = Math.ceil(total / pageSize);
    const pageInfo = document.getElementById('pageInfo');
    const pageNumbers = document.getElementById('pageNumbers');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    // Atualizar informações de página
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, total);
    pageInfo.textContent = `${start}-${end} de ${total}`;
    
    // Atualizar botões de navegação
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    
    // Atualizar números das páginas
    pageNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            const button = document.createElement('button');
            button.className = `px-3 py-1 rounded-md ${
                i === currentPage 
                    ? 'bg-brand-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`;
            button.textContent = i;
            button.onclick = () => changePage(i);
            pageNumbers.appendChild(button);
        } else if (
            i === currentPage - 3 || 
            i === currentPage + 3
        ) {
            const span = document.createElement('span');
            span.className = 'px-2 py-1 text-slate-500';
            span.textContent = '...';
            pageNumbers.appendChild(span);
        }
    }
}

// Atualizar estatísticas
function updateStatistics(statistics) {
    document.getElementById('totalHours').textContent = formatTotalTime(statistics.totalHours);
    document.getElementById('dailyAverage').textContent = formatTotalTime(statistics.dailyAverage);
    document.getElementById('overtimeHours').textContent = formatTotalTime(statistics.overtimeHours);
    document.getElementById('incompleteRecords').textContent = statistics.incompleteRecords;
}

// Mudar página
function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadReports();
}

// Mostrar detalhes do registro
async function showRecordDetails(recordId) {
    try {
        const response = await fetch(`/api/timesheet/${recordId}`);
        const record = await response.json();
        
        // Preencher dados no modal
        document.getElementById('modalUserName').textContent = record.userName;
        document.getElementById('modalUserRole').textContent = record.userRole;
        document.getElementById('modalUserId').textContent = record.userId;
        document.getElementById('modalUserUnit').textContent = record.unitName;
        document.getElementById('modalRecordDate').textContent = formatDate(record.date);
        document.getElementById('modalTimeIn').textContent = formatTime(record.timeIn);
        document.getElementById('modalTimeOut').textContent = formatTime(record.timeOut);
        document.getElementById('modalBreakStart').textContent = formatTime(record.breakStart);
        document.getElementById('modalBreakEnd').textContent = formatTime(record.breakEnd);
        document.getElementById('modalTotalTime').textContent = formatTotalTime(record.totalTime);
        document.getElementById('modalStatus').innerHTML = getStatusBadge(record.status);
        
        // Preencher observações
        document.getElementById('modalNotes').innerHTML = record.notes 
            ? record.notes 
            : '<p class="text-slate-500 dark:text-slate-400">Sem observações registradas.</p>';
        
        // Preencher histórico de edições
        updateEditHistory(record.editHistory);
        
        // Mostrar modal
        document.getElementById('recordDetailsModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Erro ao carregar detalhes do registro:', error);
        showNotification('Erro ao carregar detalhes do registro', 'error');
    }
}

// Atualizar histórico de edições
function updateEditHistory(history) {
    const container = document.getElementById('modalEditHistory');
    container.innerHTML = '';
    
    if (!history || history.length === 0) {
        container.innerHTML = `
            <div class="text-slate-500 dark:text-slate-400">
                Sem histórico de edições
            </div>
        `;
        return;
    }
    
    history.forEach(edit => {
        const div = document.createElement('div');
        div.className = 'flex items-start space-x-3';
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-pen-to-square"></i>
            </div>
            <div>
                <p class="font-medium">${edit.action}</p>
                <p class="text-sm text-slate-500">Por: ${edit.user}</p>
                <p class="text-xs text-slate-400">${formatDateTime(edit.timestamp)}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

// Fechar modal
function closeModal() {
    document.getElementById('recordDetailsModal').classList.add('hidden');
}

// Exportar relatório
async function exportReport() {
    try {
        const queryParams = new URLSearchParams(currentFilters);
        const response = await fetch(`/api/timesheet/reports/export?${queryParams}`);
        const blob = await response.blob();
        
        // Criar link para download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-ponto-${formatDateForFilename(new Date())}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification('Relatório exportado com sucesso', 'success');
    } catch (error) {
        console.error('Erro ao exportar relatório:', error);
        showNotification('Erro ao exportar relatório', 'error');
    }
}

// Funções auxiliares de formatação
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(time) {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatInterval(start, end) {
    if (!start) return '-';
    return `${formatTime(start)} - ${end ? formatTime(end) : 'Em andamento'}`;
}

function formatTotalTime(minutes) {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins ? ` ${mins}min` : ''}`;
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateForFilename(date) {
    return date.toISOString().split('T')[0];
}

function getStatusBadge(status) {
    const badges = {
        complete: '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completo</span>',
        incomplete: '<span class="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Incompleto</span>',
        late: '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Atrasado</span>'
    };
    return badges[status] || badges.incomplete;
}

// Funções de UI
function showLoading() {
    // Implementar indicador de carregamento se necessário
}

function hideLoading() {
    // Implementar remoção do indicador de carregamento se necessário
}

function showNotification(message, type = 'info') {
    // Implementar sistema de notificações se necessário
    console.log(`[${type}] ${message}`);
}

// Funções de manipulação de registros
function handleEditRecord() {
    const recordId = document.getElementById('modalUserId').textContent;
    window.location.href = `/pages/hr/timesheet/edit.html?id=${recordId}`;
}

function handlePrintRecord() {
    // Implementar impressão de registro
    window.print();
} 