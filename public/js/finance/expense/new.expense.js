document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const expenseForm = document.getElementById('expenseForm');
    const saveBtn = document.getElementById('saveBtn');
    const saveAsDraftBtn = document.getElementById('saveAsDraftBtn');
    const modalitySelect = document.getElementById('modality');
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    const supplierSelect = document.getElementById('supplier');
    const newSupplierBtn = document.getElementById('newSupplierBtn');
    const recurrenceSelect = document.getElementById('recurrence');
    const recurrenceOptionsContainer = document.getElementById('recurrenceOptionsContainer');
    const dropzone = document.getElementById('dropzone');
    const fileUpload = document.getElementById('file-upload');
    const attachmentsContainer = document.getElementById('attachmentsContainer');
    const attachmentsList = document.getElementById('attachmentsList');
    
    // Modais
    const supplierModal = document.getElementById('supplierModal');
    const closeSupplierModal = document.getElementById('closeSupplierModal');
    const cancelSupplierBtn = document.getElementById('cancelSupplierBtn');
    const saveSupplierBtn = document.getElementById('saveSupplierBtn');
    const supplierForm = document.getElementById('supplierForm');
    
    const exitConfirmModal = document.getElementById('exitConfirmModal');
    const closeExitModal = document.getElementById('closeExitModal');
    const stayBtn = document.getElementById('stayBtn');
    const exitBtn = document.getElementById('exitBtn');
    
    // Estado da aplicação
    let modalities = [];
    let categories = [];
    let subcategories = [];
    let suppliers = [];
    let bankAccounts = [];
    let costCenters = [];
    let attachments = [];
    let formChanged = false;
    let exitUrl = '';
    
    // Inicializar a página
    initializePage();
    
    // Event Listeners
    expenseForm.addEventListener('input', () => {
        formChanged = true;
    });
    
    saveBtn.addEventListener('click', saveExpense);
    saveAsDraftBtn.addEventListener('click', saveAsDraft);
    
    modalitySelect.addEventListener('change', handleModalityChange);
    categorySelect.addEventListener('change', handleCategoryChange);
    
    recurrenceSelect.addEventListener('change', handleRecurrenceChange);
    
    newSupplierBtn.addEventListener('click', openSupplierModal);
    closeSupplierModal.addEventListener('click', () => hideModal(supplierModal));
    cancelSupplierBtn.addEventListener('click', () => hideModal(supplierModal));
    saveSupplierBtn.addEventListener('click', saveSupplier);
    
    closeExitModal.addEventListener('click', () => hideModal(exitConfirmModal));
    stayBtn.addEventListener('click', () => hideModal(exitConfirmModal));
    exitBtn.addEventListener('click', confirmExit);
    
    // Configurar o dropzone para upload de arquivos
    setupFileUpload();
    
    // Configurar a data atual como padrão para a data da despesa
    document.getElementById('expenseDate').valueAsDate = new Date();
    
    // Funções
    function initializePage() {
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
            
            bankAccounts = [
                { id: 1, name: 'Conta Principal', bank: 'Banco A', accountNumber: '12345-6', balance: 10000 },
                { id: 2, name: 'Conta Secundária', bank: 'Banco B', accountNumber: '65432-1', balance: 5000 },
                { id: 3, name: 'Conta Reserva', bank: 'Banco C', accountNumber: '98765-4', balance: 20000 }
            ];
            
            costCenters = [
                { id: 1, name: 'Centro de Custo A', description: 'Descrição do Centro A' },
                { id: 2, name: 'Centro de Custo B', description: 'Descrição do Centro B' },
                { id: 3, name: 'Centro de Custo C', description: 'Descrição do Centro C' }
            ];
            
            // Preencher os selects
            populateModalitySelect();
            populateSupplierSelect();
            populateBankAccountSelect();
            populateCostCenterSelect();
            
            // Verificar se estamos editando uma despesa existente
            const urlParams = new URLSearchParams(window.location.search);
            const expenseId = urlParams.get('id');
            
            if (expenseId) {
                loadExpenseForEdit(expenseId);
            }
            
            // Marcar o formulário como não alterado após o carregamento inicial
            setTimeout(() => {
                formChanged = false;
            }, 100);
            
        }, 500);
    }
    
    function populateModalitySelect() {
        modalitySelect.innerHTML = '<option value="">Selecione uma modalidade</option>';
        
        modalities.forEach(modality => {
            if (modality.isActive) {
                const option = document.createElement('option');
                option.value = modality.id;
                option.textContent = `${modality.code} - ${modality.name}`;
                modalitySelect.appendChild(option);
            }
        });
    }
    
    function populateCategorySelect(modalityId) {
        categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
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
        subcategorySelect.innerHTML = '<option value="">Selecione uma subcategoria</option>';
        subcategorySelect.disabled = true;
    }
    
    function populateSubcategorySelect(categoryId) {
        subcategorySelect.innerHTML = '<option value="">Selecione uma subcategoria</option>';
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
    
    function populateSupplierSelect() {
        supplierSelect.innerHTML = '<option value="">Selecione um fornecedor</option>';
        
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            supplierSelect.appendChild(option);
        });
    }
    
    function populateBankAccountSelect() {
        const bankAccountSelect = document.getElementById('bankAccount');
        bankAccountSelect.innerHTML = '<option value="">Selecione uma conta</option>';
        
        bankAccounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.name} (${account.bank} - ${account.accountNumber})`;
            bankAccountSelect.appendChild(option);
        });
    }
    
    function populateCostCenterSelect() {
        const costCenterSelect = document.getElementById('costCenter');
        costCenterSelect.innerHTML = '<option value="">Selecione um centro de custo</option>';
        
        costCenters.forEach(center => {
            const option = document.createElement('option');
            option.value = center.id;
            option.textContent = center.name;
            costCenterSelect.appendChild(option);
        });
    }
    
    function handleModalityChange() {
        const modalityId = parseInt(modalitySelect.value);
        populateCategorySelect(modalityId);
    }
    
    function handleCategoryChange() {
        const categoryId = parseInt(categorySelect.value);
        populateSubcategorySelect(categoryId);
    }
    
    function handleRecurrenceChange() {
        const recurrenceValue = recurrenceSelect.value;
        
        if (recurrenceValue !== 'none') {
            recurrenceOptionsContainer.classList.remove('hidden');
        } else {
            recurrenceOptionsContainer.classList.add('hidden');
        }
    }
    
    function setupFileUpload() {
        // Permitir arrastar e soltar arquivos
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropzone.classList.add('bg-blue-50', 'border-blue-300');
        }
        
        function unhighlight() {
            dropzone.classList.remove('bg-blue-50', 'border-blue-300');
        }
        
        dropzone.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }
        
        fileUpload.addEventListener('change', function() {
            handleFiles(this.files);
        });
        
        function handleFiles(files) {
            files = [...files];
            files.forEach(uploadFile);
        }
        
        function uploadFile(file) {
            // Verificar o tamanho do arquivo (limite de 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert(`O arquivo ${file.name} excede o limite de 10MB.`);
                return;
            }
            
            // Verificar o tipo de arquivo
            const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                alert(`O arquivo ${file.name} não é um tipo válido. Apenas PNG, JPG e PDF são permitidos.`);
                return;
            }
            
            // Simular upload (em uma aplicação real, você enviaria para o servidor)
            const attachment = {
                id: Date.now(),
                name: file.name,
                size: file.size,
                type: file.type,
                file: file
            };
            
            attachments.push(attachment);
            updateAttachmentsList();
        }
    }
    
    function updateAttachmentsList() {
        if (attachments.length > 0) {
            attachmentsContainer.classList.remove('hidden');
            attachmentsList.innerHTML = '';
            
            attachments.forEach(attachment => {
                const li = document.createElement('li');
                li.className = 'px-4 py-3 flex items-center justify-between';
                
                // Determinar o ícone com base no tipo de arquivo
                let icon = 'fa-file';
                if (attachment.type === 'application/pdf') {
                    icon = 'fa-file-pdf';
                } else if (attachment.type.startsWith('image/')) {
                    icon = 'fa-file-image';
                }
                
                // Formatar o tamanho do arquivo
                const size = formatFileSize(attachment.size);
                
                li.innerHTML = `
                    <div class="flex items-center">
                        <i class="fas ${icon} text-gray-500 mr-3"></i>
                        <div>
                            <p class="text-sm font-medium text-gray-900">${attachment.name}</p>
                            <p class="text-xs text-gray-500">${size}</p>
                        </div>
                    </div>
                    <button type="button" class="text-red-600 hover:text-red-900 delete-attachment" data-id="${attachment.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                
                attachmentsList.appendChild(li);
            });
            
            // Adicionar event listeners para os botões de exclusão
            document.querySelectorAll('.delete-attachment').forEach(button => {
                button.addEventListener('click', function() {
                    const attachmentId = parseInt(this.getAttribute('data-id'));
                    deleteAttachment(attachmentId);
                });
            });
        } else {
            attachmentsContainer.classList.add('hidden');
        }
    }
    
    function deleteAttachment(attachmentId) {
        attachments = attachments.filter(attachment => attachment.id !== attachmentId);
        updateAttachmentsList();
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function openSupplierModal() {
        // Limpar o formulário
        supplierForm.reset();
        
        // Mostrar o modal
        showModal(supplierModal);
    }
    
    function saveSupplier() {
        // Obter valores do formulário
        const name = document.getElementById('supplierName').value.trim();
        const email = document.getElementById('supplierEmail').value.trim();
        const phone = document.getElementById('supplierPhone').value.trim();
        const notes = document.getElementById('supplierNotes').value.trim();
        
        // Validar campos obrigatórios
        if (!name) {
            alert('O nome do fornecedor é obrigatório.');
            return;
        }
        
        // Criar novo fornecedor
        const newId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1;
        const newSupplier = {
            id: newId,
            name,
            email,
            phone,
            notes
        };
        
        // Adicionar à lista
        suppliers.push(newSupplier);
        
        // Atualizar o select de fornecedores
        populateSupplierSelect();
        
        // Selecionar o novo fornecedor
        supplierSelect.value = newId;
        
        // Fechar o modal
        hideModal(supplierModal);
    }
    
    function saveExpense(e) {
        e.preventDefault();
        
        // Validar campos obrigatórios
        if (!validateForm()) {
            return;
        }
        
        // Obter valores do formulário
        const formData = getFormData();
        
        // Simular salvamento (em uma aplicação real, você enviaria para o servidor)
        console.log('Salvando despesa:', formData);
        
        // Simular sucesso
        alert('Despesa salva com sucesso!');
        
        // Redirecionar para a lista de despesas
        formChanged = false;
        window.location.href = '/public/pages/finance/expense/dash.expense.html';
    }
    
    function saveAsDraft(e) {
        e.preventDefault();
        
        // Obter valores do formulário (sem validação completa)
        const formData = getFormData();
        
        // Definir como rascunho
        formData.status = 'draft';
        
        // Simular salvamento (em uma aplicação real, você enviaria para o servidor)
        console.log('Salvando rascunho:', formData);
        
        // Simular sucesso
        alert('Rascunho salvo com sucesso!');
        
        // Redirecionar para a lista de despesas
        formChanged = false;
        window.location.href = '/public/pages/finance/expense/dash.expense.html';
    }
    
    function validateForm() {
        // Obter elementos obrigatórios
        const description = document.getElementById('description');
        const amount = document.getElementById('amount');
        const expenseDate = document.getElementById('expenseDate');
        const status = document.getElementById('status');
        const modality = document.getElementById('modality');
        const category = document.getElementById('category');
        
        // Lista para armazenar mensagens de erro
        const errors = [];
        
        // Validar campos
        if (!description.value.trim()) {
            errors.push('A descrição é obrigatória.');
            description.classList.add('border-red-500');
        } else {
            description.classList.remove('border-red-500');
        }
        
        if (!amount.value || parseFloat(amount.value) <= 0) {
            errors.push('O valor deve ser maior que zero.');
            amount.classList.add('border-red-500');
        } else {
            amount.classList.remove('border-red-500');
        }
        
        if (!expenseDate.value) {
            errors.push('A data da despesa é obrigatória.');
            expenseDate.classList.add('border-red-500');
        } else {
            expenseDate.classList.remove('border-red-500');
        }
        
        if (!status.value) {
            errors.push('O status é obrigatório.');
            status.classList.add('border-red-500');
        } else {
            status.classList.remove('border-red-500');
        }
        
        if (!modality.value) {
            errors.push('A modalidade é obrigatória.');
            modality.classList.add('border-red-500');
        } else {
            modality.classList.remove('border-red-500');
        }
        
        if (!category.value && modality.value) {
            errors.push('A categoria é obrigatória.');
            category.classList.add('border-red-500');
        } else {
            category.classList.remove('border-red-500');
        }
        
        // Verificar recorrência
        const recurrence = document.getElementById('recurrence');
        const recurrenceCount = document.getElementById('recurrenceCount');
        const recurrenceEndDate = document.getElementById('recurrenceEndDate');
        
        if (recurrence.value !== 'none') {
            if (!recurrenceCount.value && !recurrenceEndDate.value) {
                errors.push('Para despesas recorrentes, informe o número de ocorrências ou a data final.');
                recurrenceCount.classList.add('border-red-500');
                recurrenceEndDate.classList.add('border-red-500');
            } else {
                recurrenceCount.classList.remove('border-red-500');
                recurrenceEndDate.classList.remove('border-red-500');
            }
        }
        
        // Exibir erros, se houver
        if (errors.length > 0) {
            alert('Por favor, corrija os seguintes erros:\n\n' + errors.join('\n'));
            return false;
        }
        
        return true;
    }
    
    function getFormData() {
        // Obter valores dos campos
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const expenseDate = document.getElementById('expenseDate').value;
        const dueDate = document.getElementById('dueDate').value;
        const paymentDate = document.getElementById('paymentDate').value;
        const status = document.getElementById('status').value;
        const modalityId = parseInt(document.getElementById('modality').value);
        const categoryId = parseInt(document.getElementById('category').value);
        const subcategoryId = parseInt(document.getElementById('subcategory').value) || null;
        const supplierId = parseInt(document.getElementById('supplier').value) || null;
        const costCenterId = parseInt(document.getElementById('costCenter').value) || null;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const bankAccountId = parseInt(document.getElementById('bankAccount').value) || null;
        const installments = parseInt(document.getElementById('installments').value);
        const recurrence = document.getElementById('recurrence').value;
        const recurrenceCount = parseInt(document.getElementById('recurrenceCount').value) || null;
        const recurrenceEndDate = document.getElementById('recurrenceEndDate').value || null;
        const notes = document.getElementById('notes').value.trim();
        
        // Construir objeto de dados
        const formData = {
            description,
            amount,
            expenseDate,
            dueDate: dueDate || null,
            paymentDate: paymentDate || null,
            status,
            classification: {
                modalityId,
                categoryId,
                subcategoryId,
                supplierId,
                costCenterId
            },
            payment: {
                method: paymentMethod || null,
                bankAccountId,
                installments,
                recurrence,
                recurrenceCount,
                recurrenceEndDate
            },
            notes,
            attachments: attachments.map(a => ({
                id: a.id,
                name: a.name,
                size: a.size,
                type: a.type
            }))
        };
        
        return formData;
    }
    
    function loadExpenseForEdit(expenseId) {
        // Simular carregamento de dados (em uma aplicação real, você buscaria do servidor)
        console.log(`Carregando despesa ID: ${expenseId}`);
        
        // Exemplo de dados mockados para edição
        const expenseData = {
            id: expenseId,
            description: 'Pagamento de Fornecedor XYZ',
            amount: 1250.75,
            expenseDate: '2023-06-15',
            dueDate: '2023-06-30',
            paymentDate: '2023-06-28',
            status: 'paid',
            classification: {
                modalityId: 2,
                categoryId: 4,
                subcategoryId: 4,
                supplierId: 1,
                costCenterId: 2
            },
            payment: {
                method: 'bank_transfer',
                bankAccountId: 1,
                installments: 1,
                recurrence: 'none',
                recurrenceCount: null,
                recurrenceEndDate: null
            },
            notes: 'Pagamento referente à fatura de junho.',
            attachments: [
                {
                    id: 1,
                    name: 'fatura-junho.pdf',
                    size: 1024 * 1024 * 2.5, // 2.5MB
                    type: 'application/pdf'
                }
            ]
        };
        
        // Preencher o formulário com os dados
        document.getElementById('description').value = expenseData.description;
        document.getElementById('amount').value = expenseData.amount;
        document.getElementById('expenseDate').value = expenseData.expenseDate;
        document.getElementById('dueDate').value = expenseData.dueDate || '';
        document.getElementById('paymentDate').value = expenseData.paymentDate || '';
        document.getElementById('status').value = expenseData.status;
        
        // Preencher classificação
        document.getElementById('modality').value = expenseData.classification.modalityId;
        handleModalityChange(); // Atualizar categorias
        
        setTimeout(() => {
            document.getElementById('category').value = expenseData.classification.categoryId;
            handleCategoryChange(); // Atualizar subcategorias
            
            setTimeout(() => {
                if (expenseData.classification.subcategoryId) {
                    document.getElementById('subcategory').value = expenseData.classification.subcategoryId;
                }
            }, 100);
        }, 100);
        
        if (expenseData.classification.supplierId) {
            document.getElementById('supplier').value = expenseData.classification.supplierId;
        }
        
        if (expenseData.classification.costCenterId) {
            document.getElementById('costCenter').value = expenseData.classification.costCenterId;
        }
        
        // Preencher pagamento
        if (expenseData.payment.method) {
            document.getElementById('paymentMethod').value = expenseData.payment.method;
        }
        
        if (expenseData.payment.bankAccountId) {
            document.getElementById('bankAccount').value = expenseData.payment.bankAccountId;
        }
        
        document.getElementById('installments').value = expenseData.payment.installments;
        document.getElementById('recurrence').value = expenseData.payment.recurrence;
        handleRecurrenceChange(); // Atualizar opções de recorrência
        
        if (expenseData.payment.recurrence !== 'none') {
            if (expenseData.payment.recurrenceCount) {
                document.getElementById('recurrenceCount').value = expenseData.payment.recurrenceCount;
            }
            
            if (expenseData.payment.recurrenceEndDate) {
                document.getElementById('recurrenceEndDate').value = expenseData.payment.recurrenceEndDate;
            }
        }
        
        // Preencher notas
        document.getElementById('notes').value = expenseData.notes || '';
        
        // Adicionar anexos
        attachments = expenseData.attachments.map(a => ({
            ...a,
            file: null // Em uma aplicação real, você não teria o arquivo em si, apenas os metadados
        }));
        
        updateAttachmentsList();
        
        // Atualizar título da página
        document.querySelector('h1').textContent = 'Editar Despesa';
    }
    
    // Funções para modais
    function showModal(modal) {
        modal.classList.remove('hidden');
    }
    
    function hideModal(modal) {
        modal.classList.add('hidden');
    }
    
    // Confirmar saída quando há alterações não salvas
    window.addEventListener('beforeunload', function(e) {
        if (formChanged) {
            const message = 'Você tem alterações não salvas. Deseja sair sem salvar?';
            e.returnValue = message;
            return message;
        }
    });
    
    // Interceptar cliques em links para confirmar saída
    document.addEventListener('click', function(e) {
        if (formChanged && e.target.tagName === 'A') {
            e.preventDefault();
            exitUrl = e.target.href;
            showModal(exitConfirmModal);
        }
    });
    
    function confirmExit() {
        formChanged = false;
        hideModal(exitConfirmModal);
        
        if (exitUrl) {
            window.location.href = exitUrl;
        } else {
            window.history.back();
        }
    }
});