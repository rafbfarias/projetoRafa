// Variáveis globais
let currentUser = null;
let currentKeyLog = null;
let timerId = null;
let userId = null;

// Formata o tempo trabalhado
const formatTime = (hours, minutes) => {
    return `${String(Math.floor(hours)).padStart(2, '0')}:${String(Math.floor(minutes)).padStart(2, '0')}`;
};

// Formata a data para exibição
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

// Formata a hora para exibição
const formatHour = (date) => {
    return new Date(date).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
};

// Calcula a diferença entre duas datas em minutos
const getTimeDifferenceInMinutes = (start, end) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    return Math.floor((endDate - startDate) / (1000 * 60));
};

// Atualiza o relógio e a data
function updateDateTime() {
    const now = new Date();
    
    // Formata a data
    const dateStr = formatDate(now);
    
    // Atualiza os elementos
    document.getElementById('headerDate').textContent = dateStr;
}

// Atualiza o tempo trabalhado
function updateWorkedTime() {
    if (!currentKeyLog || !currentKeyLog.timeIn) return;
    
    const now = new Date();
    let totalMinutes = 0;
    
    if (currentKeyLog.timeOut) {
        // Se já tem horário de saída, o tempo trabalhado é fixo
        totalMinutes = getTimeDifferenceInMinutes(currentKeyLog.timeIn, currentKeyLog.timeOut);
        
        // Subtrai o tempo de pausa, se houver
        if (currentKeyLog.breakStartTime && currentKeyLog.breakEndTime) {
            const breakMinutes = getTimeDifferenceInMinutes(currentKeyLog.breakStartTime, currentKeyLog.breakEndTime);
            totalMinutes -= breakMinutes;
        }
    } else if (currentKeyLog.breakStartTime && !currentKeyLog.breakEndTime) {
        // Se está em pausa, conta até o início da pausa
        totalMinutes = getTimeDifferenceInMinutes(currentKeyLog.timeIn, currentKeyLog.breakStartTime);
    } else {
        // Se está trabalhando, conta até agora
        totalMinutes = getTimeDifferenceInMinutes(currentKeyLog.timeIn, now);
        
        // Subtrai o tempo de pausa, se houver
        if (currentKeyLog.breakStartTime && currentKeyLog.breakEndTime) {
            const breakMinutes = getTimeDifferenceInMinutes(currentKeyLog.breakStartTime, currentKeyLog.breakEndTime);
            totalMinutes -= breakMinutes;
        }
    }
    
    // Formata o tempo trabalhado
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formattedTime = formatTime(hours, minutes);
    
    // Atualiza o elemento
    document.getElementById('workedTime').textContent = formattedTime;
    
    // Atualiza o tempo restante, se estiver trabalhando
    if (!currentKeyLog.timeOut && (!currentKeyLog.breakStartTime || currentKeyLog.breakEndTime)) {
        // Calcula o tempo restante até completar 8 horas
        const remainingMinutes = Math.max(0, 8 * 60 - totalMinutes);
        const remainingHours = Math.floor(remainingMinutes / 60);
        const remainingMins = remainingMinutes % 60;
        const formattedRemaining = formatTime(remainingHours, remainingMins);
        
        document.getElementById('remainingTime').textContent = formattedRemaining;
    }
    
    // Atualiza o tempo em pausa
    if (currentKeyLog.breakStartTime && !currentKeyLog.breakEndTime) {
        document.getElementById('breakStartTime').textContent = formatHour(currentKeyLog.breakStartTime);
    }
}

// Inicializa a página
function initPage() {
    // Atualiza o relógio a cada segundo
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Configuração do formulário de identificação
    const submitButton = document.getElementById('submitButton');
    const employeeIdInput = document.getElementById('employeeId');
    
    submitButton.addEventListener('click', () => {
        handleEmployeeIdSubmit();
    });
    
    employeeIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleEmployeeIdSubmit();
        }
    });
    
    // Configuração dos botões de ação
    document.getElementById('clockInButton').addEventListener('click', () => handleAction('clock-in'));
    document.getElementById('breakStartButton').addEventListener('click', () => handleAction('break-start'));
    document.getElementById('breakEndButton').addEventListener('click', () => handleAction('break-end'));
    document.getElementById('clockOutButton').addEventListener('click', () => handleAction('clock-out'));
    document.getElementById('backButton').addEventListener('click', resetForm);
    
    // Configuração do modal de histórico
    document.getElementById('historyButton').addEventListener('click', showHistoryModal);
    document.getElementById('breakHistoryButton').addEventListener('click', showHistoryModal);
    document.getElementById('closeHistoryModal').addEventListener('click', hideHistoryModal);
    document.getElementById('closeModalButton').addEventListener('click', hideHistoryModal);
    document.getElementById('historyPeriod').addEventListener('change', loadHistoryData);
    document.getElementById('fullReportButton').addEventListener('click', openFullReport);
}

// Processa o envio do ID do funcionário
async function handleEmployeeIdSubmit() {
    const employeeId = document.getElementById('employeeId').value.trim();
    
    // Verificação de campo vazio
    if (!employeeId) {
        alert('Por favor, digite um código de identificação.');
        return;
    }
    
    // Feedback visual durante o carregamento
    const buttonElement = document.querySelector('.submit-button');
    buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    buttonElement.disabled = true;
    
    try {
        // Busca o usuário pelo ID de funcionário
        const response = await fetch(`/api/users/employee/${employeeId}`);
        
        if (!response.ok) {
            throw new Error('Funcionário não encontrado');
        }
        
        currentUser = await response.json();
        userId = currentUser._id;
        
        // Carrega os dados do ponto do dia
        await loadTodayTimesheet();
        
        // Mostra o passo 2 e esconde passo 1
        document.getElementById('step1').classList.add('hidden');
        document.getElementById('step2').classList.remove('hidden');
        document.getElementById('secondaryCards').classList.remove('hidden');
        document.getElementById('stepTitle').textContent = 'Registro de Ponto';
        
        // Atualiza o texto do rodapé
        document.getElementById('footerText').textContent = 'Selecione a ação desejada com base no seu status atual de ponto.';
        
        // Preenche os dados do usuário
        fillUserData();
        
        // Carrega o histórico recente
        loadRecentHistory();
        
        // Carrega a escala da semana
        loadWeekSchedule();
        
        // Inicia o timer para atualizar o tempo trabalhado
        timerId = setInterval(updateWorkedTime, 60000); // Atualiza a cada minuto
        updateWorkedTime(); // Atualiza imediatamente
        
    } catch (error) {
        console.error('Erro ao buscar funcionário:', error);
        alert('Funcionário não encontrado. Verifique o código e tente novamente.');
        
        // Restaura o botão
        buttonElement.innerHTML = '<i class="fas fa-check"></i>';
        buttonElement.disabled = false;
    }
}

// Preenche os dados do usuário na interface
function fillUserData() {
    if (!currentUser) return;
    
    // Preenche os dados básicos
    document.getElementById('employeeName').textContent = currentUser.name;
    document.getElementById('employeeRole').textContent = currentUser.role || 'Não definido';
    document.getElementById('employeeUnit').textContent = currentUser.unit || 'Não definido';
    document.getElementById('employeeContract').textContent = `ID: ${currentUser.employeeId}`;
    
    // Preenche a foto do usuário, se disponível
    if (currentUser.photoUrl) {
        document.getElementById('userAvatar').src = currentUser.photoUrl;
    }
    
    // Preenche as informações de escala
    document.getElementById('scheduleTime').textContent = '08:00 - 17:00';
    document.getElementById('breakTime').textContent = '1 hora';
    
    // Atualiza o nome da unidade no cabeçalho
    document.getElementById('unitName').textContent = currentUser.unit || 'Não definido';
    
    // Atualiza os badges de status
    updateStatusBadges();
}

// Atualiza os badges de status do funcionário
function updateStatusBadges() {
    const statusBadges = document.getElementById('statusBadges');
    statusBadges.innerHTML = '';
    
    // Adiciona badge de status
    if (currentUser.status) {
        const statusColors = {
            'active': 'green',
            'inactive': 'red',
            'pending': 'yellow',
            'suspended': 'orange'
        };
        
        const color = statusColors[currentUser.status] || 'blue';
        
        const badge = document.createElement('span');
        badge.className = `inline-flex items-center px-2.5 py-0.5 rounded-full bg-${color}-500/20 text-${color}-500 text-xs font-medium`;
        badge.textContent = currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1);
        statusBadges.appendChild(badge);
    }
    
    // Adiciona badge de função
    if (currentUser.role) {
        const badge = document.createElement('span');
        badge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-500 text-xs font-medium';
        badge.textContent = currentUser.role;
        statusBadges.appendChild(badge);
    }
}

// Carrega os dados do ponto do dia atual
async function loadTodayTimesheet() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/timesheet/user/${userId}/date/${today}`);
        
        if (response.ok) {
            currentKeyLog = await response.json();
            updateTimesheetUI();
        } else {
            // Não tem registro para hoje
            currentKeyLog = null;
            showClockedOutUI();
        }
    } catch (error) {
        console.error('Erro ao carregar dados do ponto:', error);
        showClockedOutUI();
    }
}

// Atualiza a interface com base no status do ponto
function updateTimesheetUI() {
    if (!currentKeyLog) {
        showClockedOutUI();
        return;
    }
    
    // Esconde todos os painéis de status
    document.getElementById('clockedOut').classList.add('hidden');
    document.getElementById('clockedIn').classList.add('hidden');
    document.getElementById('onBreak').classList.add('hidden');
    
    // Esconde todos os botões de ação
    document.getElementById('clockInButton').classList.add('hidden');
    document.getElementById('breakStartButton').classList.add('hidden');
    document.getElementById('breakEndButton').classList.add('hidden');
    document.getElementById('clockOutButton').classList.add('hidden');
    
    if (currentKeyLog.timeOut) {
        // Já saiu
        showClockedOutUI();
    } else if (currentKeyLog.breakStartTime && !currentKeyLog.breakEndTime) {
        // Em pausa
        showOnBreakUI();
    } else {
        // Trabalhando
        showClockedInUI();
    }
}

// Mostra a interface para quando não há registro ou já saiu
function showClockedOutUI() {
    document.getElementById('clockedOut').classList.remove('hidden');
    document.getElementById('clockInButton').classList.remove('hidden');
    
    // Esconde os outros painéis e botões
    document.getElementById('clockedIn').classList.add('hidden');
    document.getElementById('onBreak').classList.add('hidden');
    document.getElementById('breakStartButton').classList.add('hidden');
    document.getElementById('breakEndButton').classList.add('hidden');
    document.getElementById('clockOutButton').classList.add('hidden');
}

// Mostra a interface para quando está trabalhando
function showClockedInUI() {
    document.getElementById('clockedIn').classList.remove('hidden');
    document.getElementById('breakStartButton').classList.remove('hidden');
    document.getElementById('clockOutButton').classList.remove('hidden');
    
    // Esconde os outros painéis e botões
    document.getElementById('clockedOut').classList.add('hidden');
    document.getElementById('onBreak').classList.add('hidden');
    document.getElementById('clockInButton').classList.add('hidden');
    document.getElementById('breakEndButton').classList.add('hidden');
    
    // Atualiza as informações de horário
    document.getElementById('checkInTime').textContent = formatHour(currentKeyLog.timeIn);
    
    // Calcula a previsão de saída (8 horas após a entrada)
    const timeIn = new Date(currentKeyLog.timeIn);
    const expectedOut = new Date(timeIn.getTime() + 8 * 60 * 60 * 1000);
    document.getElementById('expectedCheckOut').textContent = formatHour(expectedOut);
    
    // Atualiza o status do intervalo
    const breakStatus = document.getElementById('breakStatus');
    if (currentKeyLog.breakStartTime && currentKeyLog.breakEndTime) {
        const breakStart = formatHour(currentKeyLog.breakStartTime);
        const breakEnd = formatHour(currentKeyLog.breakEndTime);
        breakStatus.innerHTML = `<span class="text-blue-500">${breakStart} - ${breakEnd}</span>`;
        
        // Esconde o alerta de intervalo
        document.getElementById('breakAlert').classList.add('hidden');
    } else {
        breakStatus.innerHTML = `<span class="text-zinc-500">Pendente</span>`;
        
        // Mostra o alerta de intervalo se já passou de 12h
        const now = new Date();
        if (now.getHours() >= 12) {
            document.getElementById('breakAlert').classList.remove('hidden');
        } else {
            document.getElementById('breakAlert').classList.add('hidden');
        }
    }
}

// Mostra a interface para quando está em pausa
function showOnBreakUI() {
    document.getElementById('onBreak').classList.remove('hidden');
    document.getElementById('breakEndButton').classList.remove('hidden');
    
    // Esconde os outros painéis e botões
    document.getElementById('clockedOut').classList.add('hidden');
    document.getElementById('clockedIn').classList.add('hidden');
    document.getElementById('clockInButton').classList.add('hidden');
    document.getElementById('breakStartButton').classList.add('hidden');
    document.getElementById('clockOutButton').classList.add('hidden');
    
    // Atualiza as informações de horário
    document.getElementById('breakCheckInTime').textContent = formatHour(currentKeyLog.timeIn);
    document.getElementById('breakStartDisplay').textContent = `${formatHour(currentKeyLog.breakStartTime)} - Em andamento`;
    
    // Calcula a previsão de saída (8 horas após a entrada + tempo de pausa)
    const timeIn = new Date(currentKeyLog.timeIn);
    const breakStart = new Date(currentKeyLog.breakStartTime);
    const now = new Date();
    const breakDuration = now - breakStart;
    const expectedOut = new Date(timeIn.getTime() + 8 * 60 * 60 * 1000 + breakDuration);
    document.getElementById('breakExpectedCheckOut').textContent = formatHour(expectedOut);
}

// Manipula as ações do ponto (entrada, saída, início e fim de pausa)
async function handleAction(action) {
    try {
        let endpoint = '';
        let data = {};
        let successMessage = '';
        
        switch (action) {
            case 'clock-in':
                endpoint = '/api/timesheet';
                data = {
                    refUserId: userId,
                    date: new Date().toISOString(),
                    timeIn: new Date().toISOString(),
                    timeOut: new Date().toISOString(), // Será atualizado na saída
                    totalHours: '00:00:00',
                    contractHours: '08:00:00'
                };
                successMessage = 'Entrada registrada com sucesso!';
                break;
                
            case 'break-start':
                endpoint = `/api/timesheet/${currentKeyLog._id}/break-start`;
                data = {
                    breakStartTime: new Date().toISOString()
                };
                successMessage = 'Início de pausa registrado com sucesso!';
                break;
                
            case 'break-end':
                endpoint = `/api/timesheet/${currentKeyLog._id}/break-end`;
                data = {
                    breakEndTime: new Date().toISOString()
                };
                successMessage = 'Fim de pausa registrado com sucesso!';
                break;
                
            case 'clock-out':
                endpoint = `/api/timesheet/${currentKeyLog._id}/clock-out`;
                data = {
                    timeOut: new Date().toISOString()
                };
                successMessage = 'Saída registrada com sucesso!';
                break;
                
            default:
                throw new Error('Ação inválida');
        }
        
        // Desabilita os botões durante o processamento
        document.querySelectorAll('button').forEach(button => {
            button.disabled = true;
        });
        
        const response = await fetch(endpoint, {
            method: action === 'clock-in' ? 'POST' : 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao processar a ação');
        }
        
        // Atualiza os dados do ponto
        if (action === 'clock-in') {
            currentKeyLog = await response.json();
        } else {
            const updatedKeyLog = await response.json();
            currentKeyLog = updatedKeyLog;
        }
        
        // Mostra a mensagem de sucesso
        showSuccessMessage(successMessage, action);
        
        // Atualiza a interface após um tempo
        setTimeout(() => {
            updateTimesheetUI();
            document.getElementById('step3').classList.add('hidden');
            document.getElementById('step2').classList.remove('hidden');
            
            // Reabilita os botões
            document.querySelectorAll('button').forEach(button => {
                button.disabled = false;
            });
        }, 3000);
        
    } catch (error) {
        console.error('Erro ao processar ação:', error);
        alert('Ocorreu um erro ao processar a ação. Por favor, tente novamente.');
        
        // Reabilita os botões
        document.querySelectorAll('button').forEach(button => {
            button.disabled = false;
        });
    }
}

// Mostra a mensagem de sucesso
function showSuccessMessage(message, action) {
    // Esconde os passos 1 e 2
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.add('hidden');
    
    // Mostra o passo 3 (sucesso)
    document.getElementById('step3').classList.remove('hidden');
    
    // Atualiza a mensagem de sucesso
    document.getElementById('successTitle').textContent = message;
    
    // Atualiza a mensagem secundária com base na ação
    const now = new Date();
    const timeStr = formatHour(now);
    
    switch (action) {
        case 'clock-in':
            document.getElementById('successMessage').textContent = `Entrada registrada às ${timeStr}`;
            document.getElementById('roleDisplay').classList.remove('hidden');
            document.getElementById('successRole').textContent = currentUser.role || 'Não definido';
            break;
            
        case 'break-start':
            document.getElementById('successMessage').textContent = `Pausa iniciada às ${timeStr}`;
            document.getElementById('roleDisplay').classList.add('hidden');
            break;
            
        case 'break-end':
            document.getElementById('successMessage').textContent = `Pausa finalizada às ${timeStr}`;
            document.getElementById('roleDisplay').classList.add('hidden');
            break;
            
        case 'clock-out':
            document.getElementById('successMessage').textContent = `Saída registrada às ${timeStr}`;
            document.getElementById('roleDisplay').classList.add('hidden');
            break;
    }
}

// Carrega o histórico recente
async function loadRecentHistory() {
    try {
        const response = await fetch(`/api/timesheet/user/${userId}/recent`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar histórico recente');
        }
        
        const history = await response.json();
        const recentHistoryElement = document.getElementById('recentHistory');
        recentHistoryElement.innerHTML = '';
        
        if (history.length === 0) {
            recentHistoryElement.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-zinc-400">Nenhum registro encontrado</p>
                </div>
            `;
            return;
        }
        
        // Exibe os últimos 5 registros
        history.slice(0, 5).forEach(log => {
            const date = new Date(log.date);
            const dayStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
            
            const totalHours = log.totalHours || '00:00:00';
            
            const item = document.createElement('div');
            item.className = 'flex justify-between items-center border-b border-zinc-800/50 pb-2';
            item.innerHTML = `
                <div>
                    <span class="inline-flex items-center bg-zinc-800 text-zinc-300 text-xs font-medium px-2 py-0.5 rounded">
                        ${dayStr} (${dayName})
                    </span>
                    <p class="text-sm mt-1">${formatHour(log.timeIn)} - ${log.timeOut ? formatHour(log.timeOut) : 'Em andamento'}</p>
                </div>
                <span class="font-medium">${totalHours}</span>
            `;
            
            recentHistoryElement.appendChild(item);
        });
    } catch (error) {
        console.error('Erro ao carregar histórico recente:', error);
        document.getElementById('recentHistory').innerHTML = `
            <div class="text-center py-4">
                <p class="text-zinc-400">Erro ao carregar histórico</p>
            </div>
        `;
    }
}

// Carrega a escala da semana
async function loadWeekSchedule() {
    try {
        // Simulação de dados de escala (em um sistema real, isso viria da API)
        const schedule = [
            { date: new Date(), startTime: '08:00', endTime: '17:00', role: currentUser.role },
            { date: new Date(new Date().setDate(new Date().getDate() + 1)), startTime: '08:00', endTime: '17:00', role: currentUser.role },
            { date: new Date(new Date().setDate(new Date().getDate() + 2)), startTime: '08:00', endTime: '17:00', role: currentUser.role },
            { date: new Date(new Date().setDate(new Date().getDate() + 3)), startTime: '08:00', endTime: '17:00', role: currentUser.role },
            { date: new Date(new Date().setDate(new Date().getDate() + 4)), startTime: '08:00', endTime: '17:00', role: currentUser.role }
        ];
        
        const scheduleTableElement = document.getElementById('scheduleTable');
        scheduleTableElement.innerHTML = '';
        
        // Dias da semana em português
        const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        
        // Cria uma linha para cada dia da semana
        for (let i = 0; i < 7; i++) {
            const daySchedule = schedule.find(s => new Date(s.date).getDay() === i);
            
            const row = document.createElement('tr');
            row.className = 'border-b border-zinc-800/50';
            
            if (daySchedule) {
                const date = new Date(daySchedule.date);
                const dayStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                
                row.innerHTML = `
                    <td class="px-4 py-2 font-medium">${weekdays[i]} (${dayStr})</td>
                    <td class="px-4 py-2">${daySchedule.startTime} - ${daySchedule.endTime}</td>
                    <td class="px-4 py-2">${daySchedule.role || currentUser.role || 'Não definido'}</td>
                `;
            } else {
                row.innerHTML = `
                    <td class="px-4 py-2 font-medium">${weekdays[i]}</td>
                    <td class="px-4 py-2 text-zinc-500">Folga</td>
                    <td class="px-4 py-2">-</td>
                `;
            }
            
            scheduleTableElement.appendChild(row);
        }
    } catch (error) {
        console.error('Erro ao carregar escala da semana:', error);
        document.getElementById('scheduleTable').innerHTML = `
            <tr class="border-b border-zinc-800/50">
                <td colspan="3" class="px-4 py-2 text-center text-zinc-400">
                    Erro ao carregar escala
                </td>
            </tr>
        `;
    }
}

// Mostra o modal de histórico
function showHistoryModal() {
    document.getElementById('historyModal').classList.remove('hidden');
    loadHistoryData();
}

// Esconde o modal de histórico
function hideHistoryModal() {
    document.getElementById('historyModal').classList.add('hidden');
}

// Carrega os dados do histórico
async function loadHistoryData() {
    const period = document.getElementById('historyPeriod').value;
    
    try {
        const response = await fetch(`/api/timesheet/user/${userId}/history/${period}`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar histórico');
        }
        
        const history = await response.json();
        const historyListElement = document.getElementById('historyList');
        historyListElement.innerHTML = '';
        
        if (history.length === 0) {
            historyListElement.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-zinc-400">Nenhum registro encontrado para o período selecionado</p>
                </div>
            `;
            return;
        }
        
        // Agrupa os registros por mês
        const groupedByMonth = {};
        
        history.forEach(log => {
            const date = new Date(log.date);
            const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            
            if (!groupedByMonth[monthYear]) {
                groupedByMonth[monthYear] = [];
            }
            
            groupedByMonth[monthYear].push(log);
        });
        
        // Cria um card para cada mês
        Object.keys(groupedByMonth).forEach(monthYear => {
            const monthLogs = groupedByMonth[monthYear];
            
            const monthCard = document.createElement('div');
            monthCard.className = 'mb-6';
            
            monthCard.innerHTML = `
                <h3 class="text-lg font-medium mb-3 capitalize">${monthYear}</h3>
                <div class="space-y-3">
                    <!-- Os registros serão inseridos aqui -->
                </div>
            `;
            
            const logsContainer = monthCard.querySelector('.space-y-3');
            // Adiciona cada registro do mês
            monthLogs.forEach(log => {
                const date = new Date(log.date);
                const dayStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' });
                
                const logCard = document.createElement('div');
                logCard.className = 'border border-zinc-800 rounded-lg overflow-hidden';
                
                // Define a cor do status
                let statusClass = 'bg-zinc-700 text-zinc-300';
                let statusText = 'Completo';
                
                if (!log.timeOut) {
                    statusClass = 'bg-yellow-500/20 text-yellow-500';
                    statusText = 'Em andamento';
                }
                
                logCard.innerHTML = `
                    <div class="p-3 bg-zinc-800 border-b border-zinc-700 flex justify-between items-center">
                        <h3 class="font-medium">${dayName}, ${dayStr}</h3>
                        <span class="text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClass}">
                            ${statusText}
                        </span>
                    </div>
                    
                    <div class="p-3">
                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <p class="text-xs text-zinc-400">Entrada</p>
                                <p class="font-medium">${formatHour(log.timeIn)}</p>
                            </div>
                            <div>
                                <p class="text-xs text-zinc-400">Saída</p>
                                <p class="font-medium">${log.timeOut ? formatHour(log.timeOut) : '--:--'}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <p class="text-xs text-zinc-400">Intervalo</p>
                                <p class="font-medium">
                                    ${log.breakStartTime && log.breakEndTime 
                                        ? `${formatHour(log.breakStartTime)} - ${formatHour(log.breakEndTime)}`
                                        : log.breakStartTime && !log.breakEndTime
                                            ? `${formatHour(log.breakStartTime)} - Em andamento`
                                            : 'Não registrado'}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-zinc-400">Total</p>
                                <p class="font-medium">${log.totalHours || '00:00:00'}</p>
                            </div>
                        </div>
                    </div>
                `;
                
                logsContainer.appendChild(logCard);
            });
            
            historyListElement.appendChild(monthCard);
        });
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        document.getElementById('historyList').innerHTML = `
            <div class="text-center py-4">
                <p class="text-zinc-400">Erro ao carregar histórico</p>
            </div>
        `;
    }
}

// Abre o relatório completo em uma nova página
function openFullReport() {
    // Em um sistema real, isso redirecionaria para uma página de relatório completo
    alert('Funcionalidade de relatório completo será implementada em breve.');
}

// Reseta o formulário para o estado inicial
function resetForm() {
    // Limpa os dados do usuário
    currentUser = null;
    currentKeyLog = null;
    userId = null;
    
    // Para o timer de atualização
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    
    // Reseta o formulário
    document.getElementById('employeeId').value = '';
    document.getElementById('submitButton').innerHTML = '<i class="fas fa-check"></i>';
    document.getElementById('submitButton').disabled = false;
    
    // Mostra o passo 1 e esconde os outros
    document.getElementById('step1').classList.remove('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('secondaryCards').classList.add('hidden');
    
    // Reseta o título e o texto do rodapé
    document.getElementById('stepTitle').textContent = 'Identificação do Funcionário';
    document.getElementById('footerText').textContent = 'Digite seu código de funcionário para registrar seu ponto. Em caso de problemas, contate seu supervisor.';
}

// Inicializa a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initPage);