// Variáveis globais
let currentRecord = null;

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    // Carregar registro a partir do ID na URL
    const urlParams = new URLSearchParams(window.location.search);
    const recordId = urlParams.get('id');
    
    if (recordId) {
        loadRecord(recordId);
    } else {
        window.location.href = '/pages/hr/timesheet/reports.html';
    }
    
    // Configurar formulário
    setupForm();
});

// Carregar registro
async function loadRecord(recordId) {
    try {
        const response = await fetch(`/api/timesheet/${recordId}`);
        const record = await response.json();
        
        currentRecord = record;
        
        // Preencher informações do usuário
        document.getElementById('userName').textContent = record.userName;
        document.getElementById('userUnit').textContent = record.unitName;
        document.getElementById('recordDate').textContent = formatDate(record.date);
        document.getElementById('recordId').value = record._id;
        
        // Preencher horários
        document.getElementById('timeIn').value = formatTimeForInput(record.timeIn);
        document.getElementById('timeOut').value = formatTimeForInput(record.timeOut);
        document.getElementById('breakStart').value = formatTimeForInput(record.breakStart);
        document.getElementById('breakEnd').value = formatTimeForInput(record.breakEnd);
        
        // Preencher status e tipo
        document.getElementById('status').value = record.status;
        document.getElementById('type').value = record.type;
        
        // Preencher observações
        document.getElementById('notes').value = record.notes || '';
        
    } catch (error) {
        console.error('Erro ao carregar registro:', error);
        showNotification('Erro ao carregar registro', 'error');
        setTimeout(() => {
            window.location.href = '/pages/hr/timesheet/reports.html';
        }, 2000);
    }
}

// Configurar formulário
function setupForm() {
    const form = document.getElementById('editForm');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const formData = {
            timeIn: combineDateTime(currentRecord.date, document.getElementById('timeIn').value),
            timeOut: combineDateTime(currentRecord.date, document.getElementById('timeOut').value),
            breakStart: document.getElementById('breakStart').value ? 
                combineDateTime(currentRecord.date, document.getElementById('breakStart').value) : null,
            breakEnd: document.getElementById('breakEnd').value ? 
                combineDateTime(currentRecord.date, document.getElementById('breakEnd').value) : null,
            status: document.getElementById('status').value,
            type: document.getElementById('type').value,
            notes: document.getElementById('notes').value,
            justification: document.getElementById('justification').value
        };
        
        try {
            const response = await fetch(`/api/timesheet/${currentRecord._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('Erro ao atualizar registro');
            }
            
            showNotification('Registro atualizado com sucesso', 'success');
            setTimeout(() => {
                window.location.href = '/pages/hr/timesheet/reports.html';
            }, 1500);
            
        } catch (error) {
            console.error('Erro ao atualizar registro:', error);
            showNotification('Erro ao atualizar registro', 'error');
        }
    });
}

// Validar formulário
function validateForm() {
    const timeIn = document.getElementById('timeIn').value;
    const timeOut = document.getElementById('timeOut').value;
    const breakStart = document.getElementById('breakStart').value;
    const breakEnd = document.getElementById('breakEnd').value;
    const justification = document.getElementById('justification').value.trim();
    
    if (!timeIn) {
        showNotification('Horário de entrada é obrigatório', 'error');
        return false;
    }
    
    if (breakStart && !breakEnd) {
        showNotification('Se houver início do intervalo, o fim do intervalo é obrigatório', 'error');
        return false;
    }
    
    if (!breakStart && breakEnd) {
        showNotification('Se houver fim do intervalo, o início do intervalo é obrigatório', 'error');
        return false;
    }
    
    if (breakStart && breakEnd) {
        if (breakStart >= breakEnd) {
            showNotification('O fim do intervalo deve ser depois do início', 'error');
            return false;
        }
        
        if (timeIn >= breakStart) {
            showNotification('O início do intervalo deve ser depois da entrada', 'error');
            return false;
        }
    }
    
    if (timeOut) {
        if (timeIn >= timeOut) {
            showNotification('O horário de saída deve ser depois da entrada', 'error');
            return false;
        }
        
        if (breakEnd && timeOut <= breakEnd) {
            showNotification('O horário de saída deve ser depois do fim do intervalo', 'error');
            return false;
        }
    }
    
    if (!justification) {
        showNotification('A justificativa da edição é obrigatória', 'error');
        return false;
    }
    
    return true;
}

// Funções auxiliares
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTimeForInput(dateTime) {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function combineDateTime(date, time) {
    const [hours, minutes] = time.split(':');
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return dateTime.toISOString();
}

function showNotification(message, type = 'info') {
    // Implementar sistema de notificações se necessário
    console.log(`[${type}] ${message}`);
    alert(message);
} 