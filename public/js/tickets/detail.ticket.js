/**
 * Detalhes do Chamado - Script JavaScript
 * Este script gerencia a funcionalidade da página de detalhes do chamado,
 * incluindo ações de resposta, alteração de status e manipulação de modais.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do dropdown de ações
    const actionsDropdown = document.getElementById('actionsDropdown');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    // Elementos de resposta
    const responseForm = document.getElementById('responseForm');
    const responseText = document.getElementById('responseText');
    const submitResponse = document.getElementById('submitResponse');
    const responseFiles = document.getElementById('response-files');
    
    // Elementos de ações
    const respondTicket = document.getElementById('respondTicket');
    const changeStatus = document.getElementById('changeStatus');
    const assignTicket = document.getElementById('assignTicket');
    const cancelTicket = document.getElementById('cancelTicket');
    
    // Elementos de modais
    const statusModal = document.getElementById('statusModal');
    const assignModal = document.getElementById('assignModal');
    const cancelTicketModal = document.getElementById('cancelTicketModal');
    
    // Elementos de confirmação em modais
    const confirmStatusChange = document.getElementById('confirmStatusChange');
    const cancelStatusChange = document.getElementById('cancelStatusChange');
    const confirmAssign = document.getElementById('confirmAssign');
    const cancelAssign = document.getElementById('cancelAssign');
    const confirmCancel = document.getElementById('confirmCancel');
    const cancelCancelation = document.getElementById('cancelCancelation');
    
    // Toggle para o dropdown de ações
    if (actionsDropdown && dropdownMenu) {
        actionsDropdown.addEventListener('click', function(e) {
            e.preventDefault();
            dropdownMenu.classList.toggle('hidden');
        });
        
        // Fechar o dropdown quando clicando fora dele
        document.addEventListener('click', function(e) {
            if (!actionsDropdown.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
            }
        });
    }
    
    // Scroll para área de resposta quando clicar em "Responder"
    if (respondTicket) {
        respondTicket.addEventListener('click', function(e) {
            e.preventDefault();
            dropdownMenu.classList.add('hidden');
            
            const responseArea = document.getElementById('response-area');
            if (responseArea) {
                responseArea.scrollIntoView({ behavior: 'smooth' });
                responseText.focus();
            }
        });
    }
    
    // Mostrar modal de alteração de status
    if (changeStatus && statusModal) {
        changeStatus.addEventListener('click', function(e) {
            e.preventDefault();
            dropdownMenu.classList.add('hidden');
            statusModal.classList.remove('hidden');
        });
    }
    
    // Mostrar modal de atribuição
    if (assignTicket && assignModal) {
        assignTicket.addEventListener('click', function(e) {
            e.preventDefault();
            dropdownMenu.classList.add('hidden');
            assignModal.classList.remove('hidden');
        });
    }
    
    // Mostrar modal de cancelamento
    if (cancelTicket && cancelTicketModal) {
        cancelTicket.addEventListener('click', function(e) {
            e.preventDefault();
            dropdownMenu.classList.add('hidden');
            cancelTicketModal.classList.remove('hidden');
        });
    }
    
    // Fechar modal de alteração de status
    if (cancelStatusChange && statusModal) {
        cancelStatusChange.addEventListener('click', function() {
            statusModal.classList.add('hidden');
        });
    }
    
    // Fechar modal de atribuição
    if (cancelAssign && assignModal) {
        cancelAssign.addEventListener('click', function() {
            assignModal.classList.add('hidden');
        });
    }
    
    // Fechar modal de cancelamento
    if (cancelCancelation && cancelTicketModal) {
        cancelCancelation.addEventListener('click', function() {
            cancelTicketModal.classList.add('hidden');
        });
    }
    
    // Confirmar alteração de status
    if (confirmStatusChange && statusModal) {
        confirmStatusChange.addEventListener('click', function() {
            const newStatus = document.getElementById('newStatus').value;
            const statusNote = document.getElementById('statusNote').value;
            const notifyOnStatusChange = document.getElementById('notifyOnStatusChange').checked;
            
            // Simulação de alteração de status
            // Num cenário real, isso seria uma chamada AJAX para o backend
            simulateStatusChange(newStatus, statusNote, notifyOnStatusChange);
            
            statusModal.classList.add('hidden');
        });
    }
    
    // Confirmar atribuição
    if (confirmAssign && assignModal) {
        confirmAssign.addEventListener('click', function() {
            const assignTo = document.getElementById('assignTo').value;
            const assignNote = document.getElementById('assignNote').value;
            
            // Simulação de atribuição
            // Num cenário real, isso seria uma chamada AJAX para o backend
            simulateAssignment(assignTo, assignNote);
            
            assignModal.classList.add('hidden');
        });
    }
    
    // Confirmar cancelamento
    if (confirmCancel && cancelTicketModal) {
        confirmCancel.addEventListener('click', function() {
            const cancelReason = document.getElementById('cancelReason').value;
            const cancelNote = document.getElementById('cancelNote').value;
            
            // Validação antes de confirmar
            if (!cancelReason) {
                alert('Por favor, selecione um motivo para o cancelamento.');
                return;
            }
            
            if (!cancelNote) {
                alert('Por favor, adicione uma observação sobre o cancelamento.');
                return;
            }
            
            // Simulação de cancelamento
            // Num cenário real, isso seria uma chamada AJAX para o backend
            simulateCancellation(cancelReason, cancelNote);
            
            cancelTicketModal.classList.add('hidden');
        });
    }
    
    // Enviar resposta
    if (submitResponse && responseForm) {
        submitResponse.addEventListener('click', function() {
            const response = responseText.value;
            const statusChange = document.getElementById('statusChange').value;
            const notifyRequestor = document.getElementById('notifyRequestor').checked;
            const isPrivateNote = document.getElementById('isPrivateNote').checked;
            
            // Validação antes de enviar
            if (!response.trim()) {
                alert('Por favor, digite uma resposta antes de enviar.');
                responseText.focus();
                return;
            }
            
            // Simulação de envio de resposta
            // Num cenário real, isso seria uma chamada AJAX para o backend
            submitButton = this;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';
            
            setTimeout(() => {
                simulateResponse(response, statusChange, notifyRequestor, isPrivateNote);
                
                // Reseta o formulário
                responseText.value = '';
                document.getElementById('statusChange').value = '';
                
                // Reseta o estado do botão
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Enviar Resposta';
            }, 1000);
        });
    }
    
    // Upload de arquivos na resposta
    if (responseFiles) {
        responseFiles.addEventListener('change', function(e) {
            updateResponseFileList(this.files);
        });
    }
    
    /**
     * Atualiza a lista de arquivos anexados à resposta
     * @param {FileList} files - Os arquivos selecionados
     */
    function updateResponseFileList(files) {
        // Exibe os arquivos selecionados
        let fileNames = '';
        for (let i = 0; i < files.length; i++) {
            fileNames += `<div class="text-sm text-gray-600 mt-1">
                <i class="fas fa-paperclip mr-1"></i> ${files[i].name} (${formatFileSize(files[i].size)})
            </div>`;
        }
        
        // Adiciona ao formulário
        const fileListContainer = document.createElement('div');
        fileListContainer.className = 'mt-2';
        fileListContainer.innerHTML = fileNames;
        
        // Remove a lista anterior, se existir
        const oldFileList = document.querySelector('.response-file-list');
        if (oldFileList) {
            oldFileList.remove();
        }
        
        fileListContainer.classList.add('response-file-list');
        const uploadContainer = responseFiles.closest('div');
        uploadContainer.appendChild(fileListContainer);
    }
    
    /**
     * Formata o tamanho do arquivo para exibição
     * @param {number} bytes - O tamanho em bytes
     * @returns {string} O tamanho formatado
     */
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' bytes';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    }
    
    /**
     * Simula o envio de uma resposta
     * @param {string} response - O texto da resposta
     * @param {string} statusChange - O novo status, se houver
     * @param {boolean} notifyRequestor - Se deve notificar o solicitante
     * @param {boolean} isPrivateNote - Se é uma nota interna
     */
    function simulateResponse(response, statusChange, notifyRequestor, isPrivateNote) {
        // Em um cenário real, isso seria uma chamada AJAX para o backend
        console.log('Enviando resposta:', { response, statusChange, notifyRequestor, isPrivateNote });
        
        // Simulação de sucesso
        // Atualiza a página com a nova resposta
        const historico = document.querySelector('.space-y-6');
        if (historico) {
            // Cria elemento de resposta
            const responseElement = document.createElement('div');
            responseElement.className = 'border-l-2 border-blue-500 pl-4 pb-6';
            
            // Obtém a data e hora atual
            const now = new Date();
            const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            responseElement.innerHTML = `
                <div class="flex justify-between mb-2">
                    <div class="flex items-center">
                        <img class="w-8 h-8 rounded-full mr-2" src="/api/placeholder/32/32" alt="Você">
                        <span class="font-medium">Você ${isPrivateNote ? '(Nota interna)' : ''}</span>
                    </div>
                    <span class="text-sm text-gray-500">${formattedDate}</span>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                    <p class="text-sm">${response.replace(/\n/g, '<br>')}</p>
                </div>
            `;
            
            // Insere no início do histórico
            historico.insertBefore(responseElement, historico.firstChild);
            
            // Se houver mudança de status, adiciona essa informação
            if (statusChange) {
                const statusElement = document.createElement('div');
                statusElement.className = 'border-l-2 border-orange-500 pl-4 pb-6';
                
                let oldStatus = 'Em andamento';
                let newStatusName = '';
                let newStatusClass = '';
                
                switch (statusChange) {
                    case 'waiting':
                        newStatusName = 'Em espera';
                        newStatusClass = 'bg-yellow-100 text-yellow-800';
                        break;
                    case 'scheduled':
                        newStatusName = 'Agendado';
                        newStatusClass = 'bg-blue-100 text-blue-800';
                        break;
                    case 'resolved':
                        newStatusName = 'Resolvido';
                        newStatusClass = 'bg-green-100 text-green-800';
                        break;
                    case 'closed':
                        newStatusName = 'Fechado';
                        newStatusClass = 'bg-purple-100 text-purple-800';
                        break;
                }
                
                statusElement.innerHTML = `
                    <div class="flex justify-between mb-2">
                        <div class="flex items-center">
                            <img class="w-8 h-8 rounded-full mr-2" src="/api/placeholder/32/32" alt="Você">
                            <span class="font-medium">Você</span>
                        </div>
                        <span class="text-sm text-gray-500">${formattedDate}</span>
                    </div>
                    <div class="bg-orange-50 rounded-lg p-4">
                        <p class="text-sm">
                            <span class="font-medium">Mudança de Status:</span> 
                            <span class="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">${oldStatus}</span>
                            <i class="fas fa-arrow-right mx-1"></i>
                            <span class="px-2 py-0.5 ${newStatusClass} rounded-full text-xs">${newStatusName}</span>
                        </p>
                    </div>
                `;
                
                // Insere após a resposta
                historico.insertBefore(statusElement, historico.firstChild);
                
                // Atualiza o status exibido na página
                const statusBadge = document.querySelector('h1 + span');
                if (statusBadge) {
                    statusBadge.className = `ml-4 px-3 py-1 rounded-full text-sm font-medium ${newStatusClass}`;
                    statusBadge.textContent = newStatusName;
                }
                
                // Atualiza o status na coluna lateral
                const statusInfo = document.querySelector('.space-y-4 span.rounded-full');
                if (statusInfo) {
                    statusInfo.className = `px-2 py-1 rounded-full text-xs font-medium ${newStatusClass}`;
                    statusInfo.textContent = newStatusName;
                }
            }
            
            // Exibe notificação
            showNotification('Resposta enviada com sucesso!', 'success');
        }
    }
    
    /**
     * Simula a alteração de status de um chamado
     * @param {string} newStatus - O novo status
     * @param {string} statusNote - A observação sobre a mudança
     * @param {boolean} notifyRequestor - Se deve notificar o solicitante
     */
    function simulateStatusChange(newStatus, statusNote, notifyRequestor) {
        // Em um cenário real, isso seria uma chamada AJAX para o backend
        console.log('Alterando status:', { newStatus, statusNote, notifyRequestor });
        
        // Mapeamento de status para nomes e classes
        const statusMap = {
            'open': { name: 'Aberto', class: 'bg-red-100 text-red-800' },
            'in-progress': { name: 'Em andamento', class: 'bg-orange-100 text-orange-800' },
            'waiting': { name: 'Em espera', class: 'bg-yellow-100 text-yellow-800' },
            'scheduled': { name: 'Agendado', class: 'bg-blue-100 text-blue-800' },
            'resolved': { name: 'Resolvido', class: 'bg-green-100 text-green-800' },
            'closed': { name: 'Fechado', class: 'bg-purple-100 text-purple-800' }
        };
        
        // Obtém informações do status
        const newStatusInfo = statusMap[newStatus];
        const oldStatusInfo = statusMap['in-progress']; // Assumindo que o status atual é "Em andamento"
        
        // Atualiza o status exibido na página
        const statusBadge = document.querySelector('h1 + span');
        if (statusBadge) {
            statusBadge.className = `ml-4 px-3 py-1 rounded-full text-sm font-medium ${newStatusInfo.class}`;
            statusBadge.textContent = newStatusInfo.name;
        }
        
        // Atualiza o status na coluna lateral
        const statusInfo = document.querySelector('.space-y-4 span.rounded-full');
        if (statusInfo) {
            statusInfo.className = `px-2 py-1 rounded-full text-xs font-medium ${newStatusInfo.class}`;
            statusInfo.textContent = newStatusInfo.name;
        }
        
        // Adiciona a mudança ao histórico
        const historico = document.querySelector('.space-y-6');
        if (historico) {
            // Obtém a data e hora atual
            const now = new Date();
            const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            const statusElement = document.createElement('div');
            statusElement.className = 'border-l-2 border-orange-500 pl-4 pb-6';
            
            let noteHtml = '';
            if (statusNote) {
                noteHtml = `<p class="text-sm mt-2">${statusNote}</p>`;
            }
            
            statusElement.innerHTML = `
                <div class="flex justify-between mb-2">
                    <div class="flex items-center">
                        <img class="w-8 h-8 rounded-full mr-2" src="/api/placeholder/32/32" alt="Você">
                        <span class="font-medium">Você</span>
                    </div>
                    <span class="text-sm text-gray-500">${formattedDate}</span>
                </div>
                <div class="bg-orange-50 rounded-lg p-4">
                    <p class="text-sm">
                        <span class="font-medium">Mudança de Status:</span> 
                        <span class="px-2 py-0.5 ${oldStatusInfo.class} rounded-full text-xs">${oldStatusInfo.name}</span>
                        <i class="fas fa-arrow-right mx-1"></i>
                        <span class="px-2 py-0.5 ${newStatusInfo.class} rounded-full text-xs">${newStatusInfo.name}</span>
                    </p>
                    ${noteHtml}
                </div>
            `;
            
            // Insere no início do histórico
            historico.insertBefore(statusElement, historico.firstChild);
            
            // Exibe notificação
            showNotification(`Status alterado para ${newStatusInfo.name}`, 'success');
        }
    }
    
    /**
     * Simula a atribuição de um chamado
     * @param {string} assignTo - O ID do usuário a quem atribuir
     * @param {string} assignNote - A observação sobre a atribuição
     */
    function simulateAssignment(assignTo, assignNote) {
        // Em um cenário real, isso seria uma chamada AJAX para o backend
        console.log('Atribuindo chamado:', { assignTo, assignNote });
        
        // Mapeamento de usuários para nomes
        const userMap = {
            'user_1': 'Bruno Santos',
            'user_2': 'Carla Oliveira',
            'user_3': 'Daniel Costa',
            'user_4': 'Elena Martins',
            'user_5': 'Fábio Pereira'
        };
        
        // Obtém o nome do usuário
        const userName = userMap[assignTo];
        
        // Atualiza o responsável na coluna lateral
        const responsavelInfo = document.querySelector('.space-y-4');
        if (responsavelInfo) {
            const responsavelLine = responsavelInfo.querySelector('div:nth-child(7)');
            if (responsavelLine) {
                const responsavelValue = responsavelLine.querySelector('span:nth-child(2)');
                if (responsavelValue) {
                    responsavelValue.textContent = userName;
                }
            }
        }
        
        // Adiciona a mudança ao histórico
        const historico = document.querySelector('.space-y-6');
        if (historico) {
            // Obtém a data e hora atual
            const now = new Date();
            const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            const assignElement = document.createElement('div');
            assignElement.className = 'border-l-2 border-blue-500 pl-4 pb-6';
            
            let noteHtml = '';
            if (assignNote) {
                noteHtml = `<p class="text-sm mt-2">${assignNote}</p>`;
            }
            
            assignElement.innerHTML = `
                <div class="flex justify-between mb-2">
                    <div class="flex items-center">
                        <img class="w-8 h-8 rounded-full mr-2" src="/api/placeholder/32/32" alt="Você">
                        <span class="font-medium">Você</span>
                    </div>
                    <span class="text-sm text-gray-500">${formattedDate}</span>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                    <p class="text-sm">
                        <span class="font-medium">Chamado atribuído a:</span> 
                        <span class="font-semibold">${userName}</span>
                    </p>
                    ${noteHtml}
                </div>
            `;
            
            // Insere no início do histórico
            historico.insertBefore(assignElement, historico.firstChild);
            
            // Exibe notificação
            showNotification(`Chamado atribuído a ${userName}`, 'success');
        }
    }
    
    /**
     * Simula o cancelamento de um chamado
     * @param {string} cancelReason - O motivo do cancelamento
     * @param {string} cancelNote - A observação sobre o cancelamento
     */
    function simulateCancellation(cancelReason, cancelNote) {
        // Em um cenário real, isso seria uma chamada AJAX para o backend
        console.log('Cancelando chamado:', { cancelReason, cancelNote });
        
        // Mapeamento de motivos para textos
        const reasonMap = {
            'duplicate': 'Chamado duplicado',
            'resolved': 'Problema já resolvido',
            'wrong_info': 'Informações incorretas',
            'test': 'Chamado de teste',
            'other': 'Outro motivo'
        };
        
        // Obtém o texto do motivo
        const reasonText = reasonMap[cancelReason];
        
        // Atualiza o status exibido na página
        const statusBadge = document.querySelector('h1 + span');
        if (statusBadge) {
            statusBadge.className = 'ml-4 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800';
            statusBadge.textContent = 'Cancelado';
        }
        
        // Atualiza o status na coluna lateral
        const statusInfo = document.querySelector('.space-y-4 span.rounded-full');
        if (statusInfo) {
            statusInfo.className = 'px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
            statusInfo.textContent = 'Cancelado';
        }
        
        // Adiciona o cancelamento ao histórico
        const historico = document.querySelector('.space-y-6');
        if (historico) {
            // Obtém a data e hora atual
            const now = new Date();
            const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            const cancelElement = document.createElement('div');
            cancelElement.className = 'border-l-2 border-gray-500 pl-4 pb-6';
            
            cancelElement.innerHTML = `
                <div class="flex justify-between mb-2">
                    <div class="flex items-center">
                        <img class="w-8 h-8 rounded-full mr-2" src="/api/placeholder/32/32" alt="Você">
                        <span class="font-medium">Você</span>
                    </div>
                    <span class="text-sm text-gray-500">${formattedDate}</span>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-sm">
                        <span class="font-medium">Chamado cancelado:</span> 
                        <span class="font-semibold">${reasonText}</span>
                    </p>
                    <p class="text-sm mt-2">${cancelNote}</p>
                </div>
            `;
            
            // Insere no início do histórico
            historico.insertBefore(cancelElement, historico.firstChild);
            
            // Desabilita a área de resposta
            const responseArea = document.getElementById('response-area');
            if (responseArea) {
                responseArea.innerHTML = `
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <p class="text-gray-500">Este chamado foi cancelado e não pode mais receber respostas.</p>
                    </div>
                `;
            }
            
            // Exibe notificação
            showNotification('Chamado cancelado com sucesso', 'success');
        }
    }
    
    /**
     * Exibe uma notificação na interface
     * @param {string} message - A mensagem a ser exibida
     * @param {string} type - O tipo de notificação (success, error, warning, info)
     */
    function showNotification(message, type = 'info') {
        // Implementação de uma notificação toast
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${getTypeClass(type)}`;
        toast.innerHTML = `
            <div class="flex items-center">
                ${getTypeIcon(type)}
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
    }
    
    /**
     * Retorna a classe CSS correspondente ao tipo de notificação
     * @param {string} type - O tipo de notificação
     * @returns {string} A classe CSS
     */
    function getTypeClass(type) {
        switch (type) {
            case 'success': return 'bg-green-100 text-green-800';
            case 'error': return 'bg-red-100 text-red-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'info': default: return 'bg-blue-100 text-blue-800';
        }
    }
    
    /**
     * Retorna o ícone correspondente ao tipo de notificação
     * @param {string} type - O tipo de notificação
     * @returns {string} O HTML do ícone
     */
    function getTypeIcon(type) {
        switch (type) {
            case 'success': return '<i class="fas fa-check-circle"></i>';
            case 'error': return '<i class="fas fa-exclamation-circle"></i>';
            case 'warning': return '<i class="fas fa-exclamation-triangle"></i>';
            case 'info': default: return '<i class="fas fa-info-circle"></i>';
        }
    }
});