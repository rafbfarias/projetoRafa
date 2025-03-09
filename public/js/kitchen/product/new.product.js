/**
 * Script para gerenciar o formulário de novos produtos
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const form = document.getElementById('newProductForm');
    const variantsContainer = document.getElementById('variantsContainer');
    const addVariantBtn = document.getElementById('addVariantBtn');
    const productImage = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    
    // Contador para IDs únicos de variantes
    let variantCounter = 0;
    
    // Lista de fornecedores (será preenchida via API)
    let suppliers = [];
    
    // Inicializar
    initForm();
    
    /**
     * Inicializa o formulário e listeners
     */
    function initForm() {
        // Carregar lista de fornecedores
        fetchSuppliers();
        
        // Listener para adicionar variante
        addVariantBtn.addEventListener('click', function() {
            // Verificar se existem fornecedores antes de adicionar variante
            if (suppliers.length === 0) {
                showMessage('warning', 'Atenção', 'Não existem fornecedores cadastrados. Cadastre um fornecedor primeiro para adicionar variantes.');
                return;
            }
            
            addVariantField();
        });
        
        // Listener para o formulário
        form.addEventListener('submit', handleFormSubmit);
        
        // Listener para preview de imagem
        if (productImage) {
            productImage.addEventListener('change', handleImagePreview);
        }
    }
    
    /**
     * Busca fornecedores disponíveis da API
     */
    async function fetchSuppliers() {
        try {
            // Exibir indicador de carregamento
            showLoading(true);
            
            // Fazer a requisição para buscar fornecedores
            const response = await fetch('/api/suppliers');
            const result = await response.json();
            
            // Esconder indicador de carregamento
            showLoading(false);
            
            if (!result.success) {
                showMessage('error', 'Erro ao carregar fornecedores', result.error || 'Não foi possível carregar a lista de fornecedores');
                return;
            }
            
            // Armazenar a lista de fornecedores
            suppliers = result.data || [];
            
        } catch (error) {
            console.error('Erro ao buscar fornecedores:', error);
            showLoading(false);
            showMessage('error', 'Erro ao carregar fornecedores', 'Ocorreu um erro ao tentar carregar a lista de fornecedores.');
        }
    }
    
    /**
     * Coleta os dados do produto e variantes
     */
    function collectProductData() {
        // Dados do produto principal (que se deseja comprar)
        const productData = {
            parentId: document.getElementById('parentId').value.trim(),
            productName: document.getElementById('productName').value.trim(),
            description: document.getElementById('description').value.trim(),
            productFamily: document.getElementById('productFamily').value,
            unitMeasure: document.getElementById('unitMeasure').value,
            averagePrice: parseFloat(document.getElementById('averagePrice').value),
            preparations: [], // Array para referências de preparações (pode ser usado posteriormente)
            allergens: [], // Array de alergênicos 
            variants: [] // Array para variantes de fornecedores
        };
        
        // Coletar dados das variantes (produtos à venda) se existirem
        const variants = variantsContainer.querySelectorAll('.variant-item');
        
        variants.forEach(variant => {
            const variantId = variant.dataset.id;
            
            // Coletar campos básicos da variante
            const supplierSelect = variant.querySelector(`.variant-supplier-${variantId}`);
            const selectedSupplierId = supplierSelect.value;
            const selectedSupplier = suppliers.find(s => s._id === selectedSupplierId) || {};
            
            // Obter valores do fornecedor selecionado
            const supplierName = selectedSupplier.name || '';
            const supplierEmail = selectedSupplier.email || '';
            
            // Obter dados da company e unit do fornecedor (em produção seriam do usuário logado)
            const companyId = selectedSupplier.companyId || '';
            const unitId = selectedSupplier.unitId || '';
            
            // Coletar dados de preço, unidade e quantidade
            const unitMeasure = variant.querySelector(`.variant-unit-measure-${variantId}`).value.trim();
            const currentPrice = parseFloat(variant.querySelector(`.variant-price-${variantId}`).value);
            const minimumQuantity = parseInt(variant.querySelector(`.variant-min-quantity-${variantId}`).value) || 1;
            
            // Calcular equivalências (simplificado, em produção teria uma lógica mais complexa)
            // Por exemplo, converter de "pacote (200g)" para "kg"
            const equivalentQuantity = 1; // Simplificado
            const equivalentPrice = currentPrice; // Simplificado
            
            // Adicionar variante ao array
            productData.variants.push({
                productId: `${productData.parentId}-${variantId}`,
                productName: productData.productName,
                description: productData.description,
                supplierId: selectedSupplierId,
                supplierName: supplierName,
                supplierEmail: supplierEmail,
                supplierDescription: `Fornecedor de ${productData.productName}`,
                companyIdRef: companyId,
                unitIdRef: unitId,
                unitMeasure: unitMeasure,
                currentPrice: currentPrice,
                minimumQuantity: minimumQuantity,
                priority: 5, // Valor médio padrão
                equivalentQuantity: equivalentQuantity,
                equivalentPrice: equivalentPrice,
                allergens: productData.allergens,
                observations: variant.querySelector(`.variant-observations-${variantId}`).value.trim()
            });
        });
        
        return productData;
    }
    
    /**
     * Adiciona um novo campo de variante
     */
    function addVariantField() {
        variantCounter++;
        
        // Criar o select de fornecedores
        let suppliersOptions = suppliers.map(supplier => 
            `<option value="${supplier._id}">${supplier.name}</option>`
        ).join('');
        
        const variantHtml = `
            <div class="variant-item bg-white p-4 rounded-lg shadow mb-4" data-id="${variantCounter}">
                <div class="flex justify-between mb-2">
                    <h3 class="font-semibold text-gray-700">Variante #${variantCounter}</h3>
                    <button type="button" class="text-red-500 hover:text-red-700" onclick="removeVariant(this)">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Dados do fornecedor -->
                    <div class="space-y-3">
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700">Fornecedor</label>
                            <select class="variant-supplier-${variantCounter} mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                                <option value="">Selecione um fornecedor</option>
                                ${suppliersOptions}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700">Product List do Fornecedor</label>
                            <select class="variant-productlist-${variantCounter} mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                                <option value="">Selecione um ProductList</option>
                                <!-- Será preenchido quando o fornecedor for selecionado -->
                            </select>
                        </div>
                    </div>
                    
                    <!-- Dados de preço e quantidade -->
                    <div class="space-y-3">
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700">Unidade de Medida</label>
                            <input type="text" class="variant-unit-measure-${variantCounter} mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700">Preço (R$)</label>
                            <input type="number" step="0.01" min="0" class="variant-price-${variantCounter} mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700">Quantidade Mínima</label>
                            <input type="number" min="1" class="variant-min-quantity-${variantCounter} mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value="1">
                        </div>
                    </div>
                </div>
                
                <!-- Observações -->
                <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700">Observações</label>
                    <textarea class="variant-observations-${variantCounter} mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" rows="2"></textarea>
                </div>
            </div>
        `;
        
        variantsContainer.insertAdjacentHTML('beforeend', variantHtml);
        
        // Adicionar evento para carregar ProductLists quando o fornecedor for selecionado
        const supplierSelect = document.querySelector(`.variant-supplier-${variantCounter}`);
        const productListSelect = document.querySelector(`.variant-productlist-${variantCounter}`);
        
        supplierSelect.addEventListener('change', function() {
            const supplierId = this.value;
            if (supplierId) {
                fetchProductListsBySupplier(supplierId, productListSelect);
            } else {
                // Limpar o select de ProductLists
                productListSelect.innerHTML = '<option value="">Selecione um ProductList</option>';
            }
        });
    }
    
    /**
     * Busca os ProductLists de um fornecedor
     */
    async function fetchProductListsBySupplier(supplierId, selectElement) {
        try {
            // Exibir indicador de carregamento
            showLoading(true);
            
            // Fazer a requisição para buscar os ProductLists do fornecedor
            const response = await fetch(`/api/suppliers/${supplierId}/productlists`);
            const result = await response.json();
            
            // Esconder indicador de carregamento
            showLoading(false);
            
            if (!result.success) {
                showMessage('error', 'Erro ao carregar ProductLists', result.error || 'Não foi possível carregar a lista de produtos do fornecedor');
                return;
            }
            
            // Preencher o select com os ProductLists
            const productLists = result.data || [];
            
            if (productLists.length === 0) {
                selectElement.innerHTML = '<option value="">Este fornecedor não possui produtos cadastrados</option>';
                return;
            }
            
            let options = '<option value="">Selecione um ProductList</option>';
            options += productLists.map(pl => 
                `<option value="${pl._id}" 
                         data-unit="${pl.unitMeasure}" 
                         data-price="${pl.currentPrice}" 
                         data-min="${pl.minimumQuantity}">
                    ${pl.productName} (${pl.unitMeasure})
                </option>`
            ).join('');
            
            selectElement.innerHTML = options;
            
            // Adicionar evento para preencher os campos quando o ProductList for selecionado
            selectElement.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                if (selectedOption.value) {
                    const variantItem = this.closest('.variant-item');
                    const variantId = variantItem.dataset.id;
                    
                    // Preencher campos com dados do ProductList selecionado
                    variantItem.querySelector(`.variant-unit-measure-${variantId}`).value = selectedOption.dataset.unit;
                    variantItem.querySelector(`.variant-price-${variantId}`).value = selectedOption.dataset.price;
                    variantItem.querySelector(`.variant-min-quantity-${variantId}`).value = selectedOption.dataset.min;
                }
            });
            
        } catch (error) {
            console.error('Erro ao buscar ProductLists:', error);
            showLoading(false);
            showMessage('error', 'Erro ao carregar ProductLists', 'Ocorreu um erro ao tentar carregar a lista de produtos do fornecedor.');
        }
    }
    
    /**
     * Remove um campo de variante
     */
    window.removeVariant = function(button) {
        const variantItem = button.closest('.variant-item');
        variantItem.remove();
    };
    
    /**
     * Preview da imagem selecionada
     */
    function handleImagePreview(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            imagePreview.innerHTML = `<img src="${event.target.result}" class="max-h-48 rounded">`;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * Manipula o envio do formulário
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        try {
            // Validar o formulário
            if (!validateForm()) {
                return;
            }
            
            // Coletar dados
            const productData = collectProductData();
            
            // Preparar FormData para upload com arquivos
            const formData = new FormData();
            
            // Adicionar dados do produto como JSON
            formData.append('data', JSON.stringify(productData));
            
            // Adicionar imagem se selecionada
            const imageFile = document.getElementById('productImage').files[0];
            if (imageFile) {
                formData.append('photo', imageFile);
            }
            
            // Exibir indicador de carregamento
            showLoading(true);
            
            // Fazer a requisição
            const response = await fetch('/api/products/parent', {
                method: 'POST',
                body: formData,
                // Não definir Content-Type, o navegador fará isso automaticamente com o boundary correto
            });
            
            const result = await response.json();
            
            // Esconder indicador de carregamento
            showLoading(false);
            
            if (!result.success) {
                showMessage('error', 'Erro ao salvar produto', result.error);
                return;
            }
            
            // Sucesso
            showMessage('success', 'Produto salvo com sucesso', 'Produto foi salvo com sucesso!');
            
            // Limpar o formulário
            setTimeout(() => {
                form.reset();
                imagePreview.innerHTML = '';
                imagePreview.classList.add('hidden');
                variantsContainer.innerHTML = '';
            }, 1500);
            
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            showLoading(false);
            showMessage('error', 'Erro ao salvar produto', 'Ocorreu um erro ao tentar salvar o produto.');
        }
    }
    
    /**
     * Validação básica do formulário
     */
    function validateForm() {
        // Validar campos principais
        const requiredFields = ['parentId', 'productName', 'productFamily', 'unitMeasure', 'averagePrice'];
        for (const field of requiredFields) {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                showMessage('error', 'Dados incompletos', `O campo ${field} é obrigatório.`);
                input.focus();
                return false;
            }
        }
        
        // Verificar se há variantes (opcional)
        const variants = variantsContainer.querySelectorAll('.variant-item');
        
        // Se tiver variantes, validar cada uma
        if (variants.length > 0) {
            for (const variant of variants) {
                const variantId = variant.dataset.id;
                const supplierSelect = variant.querySelector(`.variant-supplier-${variantId}`);
                const productListSelect = variant.querySelector(`.variant-productlist-${variantId}`);
                const unitMeasure = variant.querySelector(`.variant-unit-measure-${variantId}`);
                const price = variant.querySelector(`.variant-price-${variantId}`);
                
                if (!supplierSelect.value) {
                    showMessage('error', 'Dados incompletos', 'Selecione um fornecedor para todas as variantes.');
                    supplierSelect.focus();
                    return false;
                }
                
                if (!productListSelect.value) {
                    showMessage('error', 'Dados incompletos', 'Selecione um ProductList para todas as variantes.');
                    productListSelect.focus();
                    return false;
                }
                
                if (!unitMeasure.value.trim()) {
                    showMessage('error', 'Dados incompletos', 'Unidade de medida é obrigatória para todas as variantes.');
                    unitMeasure.focus();
                    return false;
                }
                
                if (!price.value || parseFloat(price.value) <= 0) {
                    showMessage('error', 'Dados incompletos', 'Preço deve ser maior que zero para todas as variantes.');
                    price.focus();
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Exibe mensagem para o usuário
     */
    function showMessage(type, title, message) {
        // Poderia usar uma biblioteca de toasts como Toastify ou SweetAlert2
        alert(`${title}: ${message}`);
    }
    
    /**
     * Exibe/esconde indicador de carregamento
     */
    function showLoading(show) {
        const loadingElement = document.getElementById('loadingIndicator');
        if (loadingElement) {
            loadingElement.classList.toggle('hidden', !show);
        }
    }
}); 