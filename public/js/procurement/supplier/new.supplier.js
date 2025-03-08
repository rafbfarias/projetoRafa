document.addEventListener('DOMContentLoaded', function() {
    const supplierForm = document.getElementById('supplierForm');
    const addLocationBtn = document.getElementById('addLocationBtn');
    const locationsContainer = document.getElementById('locationsContainer');
    
    // Contador para IDs únicos de localização
    let locationCounter = 1;
    
    // Adicionar nova localização
    addLocationBtn.addEventListener('click', function() {
        // Incrementar contador
        locationCounter++;
        
        // Criar elemento para nova localização
        const locationElement = document.createElement('div');
        locationElement.className = 'location-item p-4 border border-gray-200 rounded-lg mb-4';
        locationElement.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-medium">Localização #${locationCounter}</h4>
                <div class="flex items-center">
                    <label class="inline-flex items-center mr-4">
                        <input type="checkbox" name="locations[${locationCounter-1}][isMain]" class="form-checkbox h-4 w-4 text-blue-600">
                        <span class="ml-2 text-sm">Principal</span>
                    </label>
                    <button type="button" class="text-red-500 hover:text-red-700 delete-location">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium mb-1 required">Endereço</label>
                    <input type="text" name="locations[${locationCounter-1}][address]" class="form-input w-full" required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Cidade</label>
                    <input type="text" name="locations[${locationCounter-1}][city]" class="form-input w-full">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Código Postal</label>
                    <input type="text" name="locations[${locationCounter-1}][postalCode]" class="form-input w-full">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">País</label>
                    <select name="locations[${locationCounter-1}][country]" class="form-select w-full">
                        <option value="Portugal">Portugal</option>
                        <option value="Espanha">Espanha</option>
                        <option value="França">França</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>
            </div>
        `;
        
        // Adicionar ao container
        locationsContainer.appendChild(locationElement);
        
        // Adicionar evento para remover localização
        locationElement.querySelector('.delete-location').addEventListener('click', function() {
            locationElement.remove();
        });
    });
    
    // Adicionar evento para remover localização às localizações existentes
    document.querySelectorAll('.delete-location').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.location-item').remove();
        });
    });
    
    // Lidar com submissão do formulário
    supplierForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar formulário
        if (!validateForm()) {
            return;
        }
        
        // Coletar dados do formulário
        const formData = new FormData(supplierForm);
        const formObject = {};
        
        formData.forEach((value, key) => {
            // Tratar campos de array (locations[0][address], etc.)
            if (key.includes('[')) {
                const matches = key.match(/([^\[]+)\[([^\]]+)\](?:\[([^\]]+)\])?/);
                if (matches) {
                    const mainKey = matches[1];
                    const index = matches[2];
                    const subKey = matches[3];
                    
                    if (!formObject[mainKey]) {
                        formObject[mainKey] = [];
                    }
                    
                    if (!formObject[mainKey][index]) {
                        formObject[mainKey][index] = {};
                    }
                    
                    if (subKey) {
                        formObject[mainKey][index][subKey] = value;
                    } else {
                        formObject[mainKey][index] = value;
                    }
                }
            } else {
                formObject[key] = value;
            }
        });
        
        console.log('Dados do formulário:', formObject);
        
        // Em uma implementação real, enviaria os dados para o servidor
        // Por exemplo: saveSupplier(formObject);
        saveSupplier(formObject);
    });
    
    // Função de validação de formulário
    function validateForm() {
        // Limpar mensagens de erro anteriores
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Validar campos obrigatórios
        let isValid = true;
        const requiredFields = supplierForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('border-red-500');
                
                const errorMessage = document.createElement('p');
                errorMessage.className = 'text-red-500 text-xs mt-1 error-message';
                errorMessage.textContent = 'Este campo é obrigatório';
                
                field.parentNode.appendChild(errorMessage);
            } else {
                field.classList.remove('border-red-500');
            }
        });
        
        // Validar formato de email
        const emailFields = supplierForm.querySelectorAll('input[type="email"]');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        emailFields.forEach(field => {
            if (field.value.trim() && !emailRegex.test(field.value.trim())) {
                isValid = false;
                field.classList.add('border-red-500');
                
                const errorMessage = document.createElement('p');
                errorMessage.className = 'text-red-500 text-xs mt-1 error-message';
                errorMessage.textContent = 'Formato de email inválido';
                
                field.parentNode.appendChild(errorMessage);
            }
        });
        
        return isValid;
    }
    
    // Função para salvar o fornecedor (simulada)
    async function saveSupplier(formData) {
        try {
            // Simulação de envio para o servidor
            console.log('Enviando dados para o servidor...');
            
            // Simular tempo de processamento
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simular resposta de sucesso
            console.log('Fornecedor salvo com sucesso!');
            
            // Redirecionar para a lista de fornecedores (em produção)
            alert('Fornecedor salvo com sucesso!');
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('Erro ao salvar fornecedor:', error);
            alert('Ocorreu um erro ao salvar o fornecedor. Por favor, tente novamente.');
        }
    }
    
    // Carregar dados do fornecedor para edição (se estiver editando)
    async function loadSupplierForEdit() {
        const urlParams = new URLSearchParams(window.location.search);
        const supplierId = urlParams.get('id');
        
        // Se não tiver ID, estamos criando um novo fornecedor
        if (!supplierId) {
            document.querySelector('h1').textContent = 'Novo Fornecedor';
            return;
        }
        
        // Estamos editando um fornecedor existente
        document.querySelector('h1').textContent = 'Editar Fornecedor';
        
        try {
            // Em uma implementação real, buscaria os dados do fornecedor
            console.log(`Carregando dados do fornecedor ID: ${supplierId}`);
            
            // Simular tempo de resposta
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Dados simulados para edição
            const supplierData = {
                supplierName: "Vinhos do Vale",
                fiscalName: "Vinhos do Vale, Lda",
                vatNumber: "PT 514285963",
                status: "1",
                modality: "1",
                category: "2",
                subcategory: "1",
                isFavorite: true,
                fiscalAddress: "Rua do Douro, 123",
                fiscalCity: "Vila Nova de Gaia",
                fiscalPostalCode: "4400-123",
                fiscalCountry: "Portugal",
                commercialContact: {
                    name: "António Costa",
                    phone: "+351 222 333 444",
                    email: "antonio@vinhosdovale.pt"
                },
                financialContact: {
                    name: "Marta Silva",
                    phone: "+351 222 333 445",
                    email: "marta.financeiro@vinhosdovale.pt"
                },
                iban: "PT50 0000 0000 0000 0000 0000 0",
                paymentMethod: "Bank Transfer",
                paymentTerms: "30 dias",
                observations: "Fornecedor especializado em vinhos das regiões do Douro e Alentejo. Oferece condições especiais para pedidos acima de 24 garrafas."
            };
            
            // Preencher o formulário com os dados
            Object.keys(supplierData).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = supplierData[key];
                    } else {
                        element.value = supplierData[key];
                    }
                }
            });
            
            // Preencher contatos (caso especial para objetos aninhados)
            if (supplierData.commercialContact) {
                document.getElementById('commercialName').value = supplierData.commercialContact.name || '';
                document.getElementById('commercialPhone').value = supplierData.commercialContact.phone || '';
                document.getElementById('commercialEmail').value = supplierData.commercialContact.email || '';
            }
            
            if (supplierData.financialContact) {
                document.getElementById('financialName').value = supplierData.financialContact.name || '';
                document.getElementById('financialPhone').value = supplierData.financialContact.phone || '';
                document.getElementById('financialEmail').value = supplierData.financialContact.email || '';
            }
            
            console.log('Dados do fornecedor carregados com sucesso!');
            
        } catch (error) {
            console.error('Erro ao carregar dados do fornecedor:', error);
            alert('Ocorreu um erro ao carregar os dados do fornecedor. Por favor, tente novamente.');
        }
    }
    
    // Inicializar página
    loadSupplierForEdit();
});