/**
 * Novo Chamado - Script JavaScript
 * Este script gerencia a funcionalidade do formulário de novo chamado,
 * incluindo validação, envio e manipulação de anexos.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização das variáveis
    const ticketForm = document.getElementById('ticketForm');
    const submitButton = document.getElementById('submitTicket');
    const successModal = document.getElementById('successModal');
    const fileUpload = document.getElementById('file-upload');
    const fileList = document.getElementById('file-list');
    const notificationCopy = document.getElementById('notification-copy');
    const copyUsersContainer = document.getElementById('copy-users-container');
    const captureScreenButton = document.getElementById('captureScreenButton');
    
    // Evento de copiar para outros usuários
    if (notificationCopy && copyUsersContainer) {
        notificationCopy.addEventListener('change', function() {
            copyUsersContainer.classList.toggle('hidden', !this.checked);
        });
    }
    
    // Evento de upload de arquivos
    if (fileUpload && fileList) {
        fileUpload.addEventListener('change', function(e) {
            updateFileList(this.files);
        });
        
        // Drag and drop para upload de arquivos
        const dropArea = fileUpload.closest('label');
        if (dropArea) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            ['dragenter', 'dragover'].forEach(eventName => {
                dropArea.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, unhighlight, false);
            });
            
            function highlight() {
                dropArea.classList.add('bg-gray-100');
                dropArea.classList.add('border-blue-500');
            }
            
            function unhighlight() {
                dropArea.classList.remove('bg-gray-100');
                dropArea.classList.remove('border-blue-500');
            }
            
            dropArea.addEventListener('drop', function(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                fileUpload.files = files;
                updateFileList(files);
            }, false);
        }
    }
    
    // Evento de captura de tela
    if (captureScreenButton) {
        captureScreenButton.addEventListener('click', function() {
            // Esta funcionalidade geralmente precisaria de uma integração com uma biblioteca
            // ou API de captura de tela, que pode variar dependendo do ambiente
            alert('A funcionalidade de captura de tela requer uma implementação específica de API/biblioteca.');
            
            // Mockup de uma implementação
            // Normalmente, isso envolveria uma biblioteca como html2canvas ou similares
            /*
            html2canvas(document.body).then(canvas => {
                canvas.toBlob(function(blob) {
                    // Cria um arquivo a partir do blob
                    const file = new File([blob], "captura_de_tela.png", { type: "image/png" });
                    
                    // Adiciona o arquivo à lista
                    const fileArray = new DataTransfer();
                    fileArray.items.add(file);
                    
                    if (fileUpload.files && fileUpload.files.length > 0) {
                        // Adiciona os arquivos existentes
                        for (let i = 0; i < fileUpload.files.length; i++) {
                            fileArray.items.add(fileUpload.files[i]);
                        }
                    }
                    
                    // Atualiza os arquivos no input
                    fileUpload.files = fileArray.files;
                    updateFileList(fileUpload.files);
                });
            });
            */
        });
    }
    
    // Evento de envio do formulário
    if (submitButton) {
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Validação do formulário
            if (validateForm()) {
                // Simulação de envio de formulário
                submitTicket();
            }
        });
    }
    
    /**
     * Valida o formulário antes do envio
     * @returns {boolean} True se o formulário for válido
     */
    function validateForm() {
        // Campos obrigatórios
        const requiredFields = [
            {id: 'ticketType', name: 'Tipo de Chamado'},
            {id: 'ticketCategory', name: 'Categoria'},
            {id: 'ticketSubject', name: 'Assunto'},
            {id: 'ticketDescription', name: 'Descrição'},
            {id: 'ticketPriority', name: 'Prioridade'},
            {id: 'ticketAssignee', name: 'Destinatário'},
            {id: 'ticketUnit', name: 'Unidade'}
        ];
        
        // Verifica se todos os campos obrigatórios estão preenchidos
        let isValid = true;
        let firstInvalid = null;
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                isValid = false;
                showFieldError(element, `O campo ${field.name} é obrigatório.`);
                
                if (!firstInvalid) {
                    firstInvalid = element;
                }
            } else {
                clearFieldError(element);
            }
        });
        
        // Foca no primeiro campo inválido
        if (firstInvalid) {
            firstInvalid.focus();
        }
        
        return isValid;
    }
    
    /**
     * Exibe mensagem de erro para um campo
     * @param {HTMLElement} field - O campo com erro
     * @param {string} message - A mensagem de erro
     */
    function showFieldError(field, message) {
        // Remove mensagem de erro existente
        clearFieldError(field);
        
        // Adiciona classe de erro ao campo
        field.classList.add('border-red-500');
        
        // Cria e adiciona mensagem de erro
        const errorMessage = document.createElement('p');
        errorMessage.className = 'mt-1 text-sm text-red-600';
        errorMessage.textContent = message;
        errorMessage.id = `${field.id}-error`;
        field.parentNode.appendChild(errorMessage);
    }
    
    /**
     * Remove mensagem de erro de um campo
     * @param {HTMLElement} field - O campo para remover o erro
     */
    function clearFieldError(field) {
        // Remove classe de erro
        field.classList.remove('border-red-500');
        
        // Remove mensagem de erro
        const errorMessage = document.getElementById(`${field.id}-error`);
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    /**
     * Atualiza a lista de arquivos anexados
     * @param {FileList} files - Os arquivos selecionados
     */
    function updateFileList(files) {
        if (!fileList) return;
        
        // Limpa a lista atual
        fileList.innerHTML = '';
        
        // Adiciona cada arquivo à lista
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Verifica o tamanho do arquivo (limite de 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showNotification(`O arquivo ${file.name} excede o limite de 10MB.`, 'error');
                continue;
            }
            
            const fileItem = document.createElement('div');
            fileItem.className = 'flex items-center justify-between p-2 bg-gray-50 rounded mb-2';
            
            // Escolhe o ícone com base no tipo de arquivo
            let icon = 'fa-file';
            if (file.type.startsWith('image/')) {
                icon = 'fa-file-image';
            } else if (file.type === 'application/pdf') {
                icon = 'fa-file-pdf';
            } else if (file.type.includes('word')) {
                icon = 'fa-file-word';
            } else if (file.type.includes('excel') || file.type.includes('sheet')) {
                icon = 'fa-file-excel';
            }
            
            // Formata o tamanho do arquivo
            const fileSize = formatFileSize(file.size);
            
            fileItem.innerHTML = `
                <div class="flex items-center">
                    <i class="fas ${icon} text-brand-600 mr-2"></i>
                    <span class="text-sm font-medium">${file.name}</span>
                </div>
                <div class="flex items-center">
                    <span class="text-xs text-gray-500 mr-2">${fileSize}</span>
                    <button type="button" class="text-red-500 hover:text-red-700" data-index="${i}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            fileList.appendChild(fileItem);
            
            // Adiciona evento para remover o arquivo
            const removeButton = fileItem.querySelector('button');
            removeButton.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeFile(index);
            });
        }
    }
    
    /**
     * Remove um arquivo da lista
     * @param {number} index - O índice do arquivo a ser removido
     */
    function removeFile(index) {
        // Cria um novo FileList sem o arquivo removido
        const dt = new DataTransfer();
        
        for (let i = 0; i < fileUpload.files.length; i++) {
            if (i !== index) {
                dt.items.add(fileUpload.files[i]);
            }
        }
        
        fileUpload.files = dt.files;
        updateFileList(fileUpload.files);
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
     * Realiza o envio do chamado
     */
    function submitTicket() {
        // Simulação de envio
        // Num cenário real, isso seria uma chamada AJAX para o backend
        
        // Mostra um indicador de carregamento
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';
        
        // Simula um delay de processamento
        setTimeout(() => {
            // Atualiza o modal de sucesso com os dados do chamado
            document.getElementById('modalSubject').textContent = document.getElementById('ticketSubject').value;
            
            const prioritySelect = document.getElementById('ticketPriority');
            const priorityText = prioritySelect.options[prioritySelect.selectedIndex].text;
            document.getElementById('modalPriority').textContent = priorityText;
            
            // Gera um número de chamado fictício
            document.getElementById('ticketNumber').textContent = generateTicketNumber();
            
            // Exibe o modal de sucesso
            if (successModal) {
                successModal.classList.remove('hidden');
            }
            
            // Reseta o estado do botão
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Enviar Chamado';
        }, 1500);
    }
    
    /**
     * Gera um número de chamado fictício
     * @returns {string} O número do chamado
     */
    function generateTicketNumber() {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
        return `TK-${year}-${randomNum}`;
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