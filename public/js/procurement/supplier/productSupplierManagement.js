document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const closeModal = document.getElementById('closeModal');
    const cancelButton = document.getElementById('cancelButton');
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const applyFilters = document.getElementById('applyFilters');
    
    // Abrir modal para adicionar produto
    addProductBtn.addEventListener('click', function() {
        openModal('add');
    });
    
    // Fechar modal
    closeModal.addEventListener('click', closeProductModal);
    cancelButton.addEventListener('click', closeProductModal);
    
    // Fechar modal quando clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target === productModal) {
            closeProductModal();
        }
    });
    
    // Submissão do formulário de produto
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar formulário
        if (!validateProductForm()) {
            return;
        }
        
        // Coletar dados do formulário
        const formData = new FormData(productForm);
        const formObject = {};
        
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Adicionar ID do fornecedor
        const urlParams = new URLSearchParams(window.location.search);
        formObject.supplierId = urlParams.get('id') || '1';
        
        console.log('Dados do produto:', formObject);
        
        // Em uma implementação real, enviaria os dados para o servidor
        saveProduct(formObject);
    });
    
    // Aplicar filtros
    applyFilters.addEventListener('click', function() {
        const nameFilter = document.getElementById('nameFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        console.log('Filtros aplicados:', { nameFilter, categoryFilter, statusFilter });
        
        // Em um cenário real, faria uma chamada AJAX para filtrar os produtos
        alert('Filtros aplicados com sucesso!');
    });
    
    // Adicionar eventos para botões de edição de produtos
    document.querySelectorAll('.dashboard-card .fa-edit').forEach(button => {
        button.closest('button').addEventListener('click', function() {
            // Obter ID do produto (em uma implementação real seria o ID real)
            const productId = this.closest('.dashboard-card').querySelector('.font-semibold:nth-child(3)').textContent;
            openModal('edit', productId);
        });
    });
    
    // Adicionar eventos para botões de exclusão de produtos
    document.querySelectorAll('.dashboard-card .fa-trash-alt').forEach(button => {
        button.closest('button').addEventListener('click', function() {
            // Obter informações do produto
            const card = this.closest('.dashboard-card');
            const productName = card.querySelector('h4').textContent;
            
            if (confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)) {
                // Em uma implementação real, enviaria uma requisição para excluir o produto
                console.log(`Excluindo produto: ${productName}`);
                
                // Simulação da exclusão do produto
                card.style.opacity = '0.5';
                setTimeout(() => {
                    card.remove();
                }, 500);
            }
        });
    });
    
    // Função para abrir o modal (adicionar ou editar produto)
    function openModal(mode, productId = null) {
        // Limpar formulário
        productForm.reset();
        
        if (mode === 'add') {
            modalTitle.textContent = 'Adicionar Produto';
        } else {
            modalTitle.textContent = 'Editar Produto';
            
            // Em uma implementação real, buscar os dados do produto pelo ID
            // Simulação de dados para edição
            const productData = {
                productName: "Vinho Tinto Reserva",
                productCategory: "tinto",
                productRegion: "douro",
                productYear: "2019",
                productPrice: "12.50",
                productSku: "VV-001",
                productStock: "245",
                productStatus: "active",
                productDescription: "Vinho tinto reserva da região do Douro, colheita de 2019. Notas de frutos vermelhos e baunilha."
            };
            
            // Preencher o formulário com os dados
            Object.keys(productData).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = productData[key];
                }
            });
        }
        
        // Mostrar modal
        productModal.classList.remove('hidden');
    }
    
    // Função para fechar o modal
    function closeProductModal() {
        productModal.classList.add('hidden');
    }
    
    // Função de validação do formulário de produto
    function validateProductForm() {
        // Limpar mensagens de erro anteriores
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Validar campos obrigatórios
        let isValid = true;
        const requiredFields = productForm.querySelectorAll('[required]');
        
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
        
        // Validar preço (deve ser um número positivo)
        const priceField = document.getElementById('productPrice');
        if (priceField.value && (isNaN(priceField.value) || parseFloat(priceField.value) < 0)) {
            isValid = false;
            priceField.classList.add('border-red-500');
            
            const errorMessage = document.createElement('p');
            errorMessage.className = 'text-red-500 text-xs mt-1 error-message';
            errorMessage.textContent = 'O preço deve ser um número positivo';
            
            priceField.parentNode.appendChild(errorMessage);
        }
        
        return isValid;
    }
    
    // Função para salvar o produto (simulada)
    async function saveProduct(formData) {
        try {
            // Simulação de envio para o servidor
            console.log('Enviando dados para o servidor...');
            
            // Simular tempo de processamento
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simular resposta de sucesso
            console.log('Produto salvo com sucesso!');
            
            // Fechar modal
            closeProductModal();
            
            // Atualizar a lista de produtos (em uma implementação real)
            alert('Produto salvo com sucesso!');
            
            // Recarregar a página para mostrar o novo produto
            // Em uma implementação real, você atualizaria a lista sem recarregar
            // location.reload();
            
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            alert('Ocorreu um erro ao salvar o produto. Por favor, tente novamente.');
        }
    }
    
    // Carregar dados do fornecedor
    async function loadSupplierInfo() {
        const urlParams = new URLSearchParams(window.location.search);
        const supplierId = urlParams.get('id') || '1';
        
        try {
            // Em uma implementação real, buscaria os dados do fornecedor
            console.log(`Carregando dados do fornecedor ID: ${supplierId}`);
            
            // Simular tempo de resposta
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Simulação de dados carregados
            const supplierData = {
                id: supplierId,
                name: "Vinhos do Vale",
                productsCount: 45
            };
            
            // Em uma implementação real, atualizaria o cabeçalho com o nome do fornecedor
            console.log('Dados do fornecedor carregados:', supplierData);
            
        } catch (error) {
            console.error('Erro ao carregar dados do fornecedor:', error);
        }
    }
    
    // Inicializar página
    loadSupplierInfo();
});