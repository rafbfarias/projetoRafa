// Variáveis globais unificadas
let selectedFacturations = [];
let currentMethod = 'proportional';

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos os inputs de alocação com zero
    document.querySelectorAll('.allocation-input').forEach(input => {
        input.value = "0.00";
    });
    
    // Formatação de valores monetários
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
    }
    
    // Atualizar checkbox "Selecionar Todos"
    function updateSelectAllCheckbox() {
        const allCheckboxes = document.querySelectorAll('.factCheckbox');
        const selectedCheckboxes = document.querySelectorAll('.factCheckbox:checked');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        selectAllCheckbox.checked = allCheckboxes.length > 0 && selectedCheckboxes.length === allCheckboxes.length;
        selectAllCheckbox.indeterminate = selectedCheckboxes.length > 0 && selectedCheckboxes.length < allCheckboxes.length;
    }
    
    // Calcular e atualizar o total selecionado
    function updateSelectedTotal() {
        selectedFacturations = [];
        let total = 0;
        
        // Primeiro, zerar todos os inputs de faturações não selecionadas
        document.querySelectorAll('.factCheckbox').forEach(checkbox => {
            const input = document.querySelector(`.allocation-input[data-id="${checkbox.getAttribute('data-id')}"]`);
            if (!checkbox.checked) {
                input.value = "0.00";
            }
        });
        
        // Depois, processar as faturações selecionadas
        document.querySelectorAll('.factCheckbox:checked').forEach(checkbox => {
            const id = checkbox.getAttribute('data-id');
            const amount = parseFloat(checkbox.getAttribute('data-amount'));
            
            selectedFacturations.push({
                id: id,
                amount: amount,
                allocation: amount // inicialmente, a alocação é igual ao valor original
            });
            
            total += amount;
            
            // Restaurar o valor original para faturações selecionadas
            const input = document.querySelector(`.allocation-input[data-id="${id}"]`);
            input.value = amount.toFixed(2);
        });
        
        document.getElementById('totalSelected').textContent = formatCurrency(total);
        document.getElementById('summaryTotalSelected').textContent = formatCurrency(total);
        document.getElementById('expectedAmount').value = total.toFixed(2);
        
        updateAllocationPreview();
        checkDifference();
    }
    
    // Calcular a diferença entre valor esperado e valor real
    function checkDifference(skipRecalculate = false) {
        const expectedAmount = parseFloat(document.getElementById('expectedAmount').value) || 0;
        const actualAmount = parseFloat(document.getElementById('actualAmount').value) || 0;
        const difference = actualAmount - expectedAmount;
        
        document.getElementById('differenceAmount').value = difference.toFixed(2);
        document.getElementById('summaryActualAmount').textContent = formatCurrency(actualAmount);
        document.getElementById('summaryDifference').textContent = formatCurrency(difference);
        
        // Exibir o container de diferença apenas se houver um valor real informado
        const differenceContainer = document.getElementById('differenceAmountContainer');
        differenceContainer.classList.toggle('hidden', actualAmount === 0);
        
        // Definir o ícone e cor com base na diferença
        const differenceIcon = document.getElementById('differenceIcon');
        if (difference > 0) {
            differenceIcon.innerHTML = '<i class="fas fa-arrow-up text-green-600"></i>';
        } else if (difference < 0) {
            differenceIcon.innerHTML = '<i class="fas fa-arrow-down text-red-600"></i>';
        } else {
            differenceIcon.innerHTML = '<i class="fas fa-equals text-gray-600"></i>';
        }
        
        // Exibir alerta de alocação se necessário
        const alertContainer = document.getElementById('allocationAlertContainer');
        const alertTitle = document.getElementById('allocationAlertTitle');
        const alertMessage = document.getElementById('allocationAlertMessage');
        
        if (actualAmount === 0) {
            alertContainer.classList.add('hidden');
        } else if (difference < 0) {
            alertContainer.classList.remove('hidden');
            alertContainer.classList.add('bg-yellow-100', 'text-yellow-800');
            alertContainer.classList.remove('bg-green-100', 'text-green-800');
            alertTitle.textContent = 'Valor Insuficiente';
            alertMessage.textContent = 'O valor real da transação é menor que o total selecionado. Os valores serão alocados parcialmente conforme o método escolhido.';
        } else if (difference > 0) {
            alertContainer.classList.remove('hidden');
            alertContainer.classList.add('bg-green-100', 'text-green-800');
            alertContainer.classList.remove('bg-yellow-100', 'text-yellow-800');
            alertTitle.textContent = 'Valor Excedente';
            alertMessage.textContent = 'O valor real da transação é maior que o total selecionado. Todas as faturações serão processadas completamente.';
        } else {
            alertContainer.classList.add('hidden');
        }
        
        // Mostrar/esconder métodos de alocação e justificativa baseado na diferença
        const methodsContainer = document.getElementById('allocationMethodsContainer');
        const justificationContainer = document.getElementById('justificationContainer');
        
        if (difference !== 0) {
            justificationContainer.classList.remove('hidden');
            if (selectedFacturations.length > 1) {
                methodsContainer.classList.remove('hidden');
            } else {
                methodsContainer.classList.add('hidden');
            }
        } else {
            methodsContainer.classList.add('hidden');
            justificationContainer.classList.add('hidden');
        }
        
        // Recalcular alocação apenas se não estiver sendo chamado de dentro do recalculateAllocation
        if (!skipRecalculate) {
            recalculateAllocation(true);
        }
    }
    
    // Recalcular a alocação de valores com base no método selecionado
    function recalculateAllocation(skipDifferenceCheck = false) {
        if (selectedFacturations.length === 0) return;
        
        const expectedTotal = parseFloat(document.getElementById('expectedAmount').value) || 0;
        const actualAmount = parseFloat(document.getElementById('actualAmount').value) || 0;
        const allocationType = document.querySelector('input[name="allocationMethod"]:checked').value;
        
        if (allocationType === 'manual') {
            // No modo manual, calcular o valor real baseado nas alocações
            let totalManual = 0;
            selectedFacturations.forEach(fact => {
                const input = document.querySelector(`.allocation-input[data-id="${fact.id}"]`);
                const value = parseFloat(input.value) || 0;
                fact.allocation = value;
                totalManual += fact.allocation;
            });
            
            // Atualizar valor real sem disparar o evento input
            const actualAmountInput = document.getElementById('actualAmount');
            actualAmountInput.value = totalManual.toFixed(2);
            
            // Disparar manualmente o evento para atualizar a diferença
            if (!skipDifferenceCheck) {
                checkDifference(true);
            }
        } else {
            if (actualAmount === 0) {
                // Se não houver valor real definido, usar valores originais
                selectedFacturations.forEach(fact => {
                    fact.allocation = fact.amount;
                    const input = document.querySelector(`.allocation-input[data-id="${fact.id}"]`);
                    input.value = fact.amount.toFixed(2);
                });
            } else if (allocationType === 'proportional') {
                // Alocação proporcional
                const ratio = actualAmount / expectedTotal;
                selectedFacturations.forEach(fact => {
                    fact.allocation = fact.amount * ratio;
                    const input = document.querySelector(`.allocation-input[data-id="${fact.id}"]`);
                    input.value = fact.allocation.toFixed(2);
                });
            } else if (allocationType === 'oldest') {
                // Prioridade aos mais antigos
                let remaining = actualAmount;
                const sortedFacts = [...selectedFacturations].sort((a, b) => {
                    // Converter data do formato DD/MM/YYYY para YYYY-MM-DD para comparação correta
                    const dateA = a.date || document.querySelector(`.factCheckbox[data-id="${a.id}"]`).closest('tr').querySelector('td:nth-child(2)').textContent.trim().split('/').reverse().join('-');
                    const dateB = b.date || document.querySelector(`.factCheckbox[data-id="${b.id}"]`).closest('tr').querySelector('td:nth-child(2)').textContent.trim().split('/').reverse().join('-');
                    a.date = dateA;
                    b.date = dateB;
                    return new Date(dateA) - new Date(dateB);
                });

                // Primeiro, zerar todas as alocações
                sortedFacts.forEach(fact => {
                    fact.allocation = 0;
                });

                // Depois, alocar o valor disponível começando pelos mais antigos
                for (let fact of sortedFacts) {
                    if (remaining <= 0) break;
                    
                    // Se o valor restante é maior ou igual ao valor da faturação
                    if (remaining >= fact.amount) {
                        fact.allocation = fact.amount;
                        remaining -= fact.amount;
                    } else {
                        // Se não houver valor suficiente, aloca o que sobrou
                        fact.allocation = remaining;
                        remaining = 0;
                    }
                }

                // Se ainda houver valor restante, distribuir proporcionalmente entre as faturações já pagas
                if (remaining > 0) {
                    const paidFacts = sortedFacts.filter(fact => fact.allocation > 0);
                    if (paidFacts.length > 0) {
                        const totalPaid = paidFacts.reduce((sum, fact) => sum + fact.amount, 0);
                        paidFacts.forEach(fact => {
                            const extra = (fact.amount / totalPaid) * remaining;
                            fact.allocation += extra;
                        });
                    }
                }

                // Atualizar os inputs com os novos valores
                sortedFacts.forEach(fact => {
                    const input = document.querySelector(`.allocation-input[data-id="${fact.id}"]`);
                    input.value = fact.allocation.toFixed(2);
                });
            }
        }
        
        // Sempre atualizar o preview após recalcular
        updateAllocationPreview();
        
        // Verificar diferença apenas se não estiver sendo chamado do checkDifference
        if (!skipDifferenceCheck) {
            checkDifference(true);
        }
    }
    
    // Atualizar a visualização de preview da alocação
    function updateAllocationPreview() {
        const previewBody = document.getElementById('allocationPreviewBody');
        previewBody.innerHTML = '';
        
        let totalOriginal = 0;
        let totalAllocated = 0;
        
        selectedFacturations.forEach(fact => {
            // Pegar a data correta da linha selecionada
            const checkbox = document.querySelector(`.factCheckbox[data-id="${fact.id}"]`);
            const dateText = checkbox.closest('tr').querySelector('td:nth-child(2)').textContent.trim();
            const unitText = checkbox.closest('tr').querySelector('td:nth-child(3)').textContent.trim();
            
            const difference = fact.allocation - fact.amount;
            const status = fact.allocation > fact.amount ? 'Excedente' : fact.allocation >= fact.amount ? 'Completo' : 'Parcial';
            const statusClass = fact.allocation > fact.amount ? 'bg-blue-100 text-blue-800' : fact.allocation >= fact.amount ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
            
            totalOriginal += fact.amount;
            totalAllocated += fact.allocation;
            
            const row = `
                <tr>
                    <td class="px-4 py-3 text-sm">${dateText}</td>
                    <td class="px-4 py-3 text-sm">${unitText}</td>
                    <td class="px-4 py-3 text-sm text-right">${formatCurrency(fact.amount)}</td>
                    <td class="px-4 py-3 text-sm text-right">${formatCurrency(fact.allocation)}</td>
                    <td class="px-4 py-3 text-sm text-right ${difference < 0 ? 'text-red-600' : difference > 0 ? 'text-blue-600' : ''}">${formatCurrency(difference)}</td>
                    <td class="px-4 py-3 text-sm text-center">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">${status}</span>
                    </td>
                </tr>
            `;
            
            previewBody.innerHTML += row;
        });
        
        // Atualizar totais no preview
        document.getElementById('previewTotalOriginal').textContent = formatCurrency(totalOriginal);
        document.getElementById('previewTotalAllocated').textContent = formatCurrency(totalAllocated);
        document.getElementById('previewTotalDifference').textContent = formatCurrency(totalAllocated - totalOriginal);
        
        // Atualizar total alocado na tabela de seleção
        document.getElementById('totalAllocated').textContent = formatCurrency(totalAllocated);
    }
    
    // Função para selecionar o método de alocação (apenas interface)
    function selectAllocationMethod(method) {
        // Atualizar interface
        document.querySelectorAll('.method-check i').forEach(icon => {
            icon.classList.add('hidden');
        });
        document.querySelectorAll('[name="allocationMethod"]').forEach(radio => {
            radio.checked = false;
            radio.closest('div').classList.remove('bg-brand-50');
        });
        
        const selectedRadio = document.querySelector(`[name="allocationMethod"][value="${method}"]`);
        selectedRadio.checked = true;
        selectedRadio.closest('div').classList.add('bg-brand-50');
        selectedRadio.closest('label').querySelector('.method-check i').classList.remove('hidden');
        
        // Habilitar/desabilitar campos
        const actualAmountInput = document.getElementById('actualAmount');
        const allocationInputs = document.querySelectorAll('.allocation-input');
        const manualMessage = document.getElementById('manualMessage');
        
        if (method === 'manual') {
            actualAmountInput.readOnly = true;
            allocationInputs.forEach(input => {
                input.readOnly = false;
            });
            manualMessage.classList.remove('hidden');
        } else {
            actualAmountInput.readOnly = false;
            allocationInputs.forEach(input => {
                input.readOnly = true;
            });
            manualMessage.classList.add('hidden');
        }
    }
    
    // Função para mudar o método e recalcular (lógica completa)
    function changeAllocationMethod(newMethod) {
        // Validar método "mais antigos" se necessário
        if (newMethod === 'oldest') {
            if (!confirmOldestMethod()) {
                return false;
            }
        }
        
        // Atualizar método atual
        currentMethod = newMethod;
        
        // Atualizar interface
        selectAllocationMethod(newMethod);
        
        // Forçar recálculo
        if (newMethod !== 'manual') {
            // Usar setTimeout para garantir que o recálculo ocorra após a mudança de método
            setTimeout(() => {
                checkDifference();
            }, 0);
        } else {
            // No modo manual, recalcular com base nos valores atuais dos inputs
            setTimeout(() => {
                recalculateAllocation();
            }, 0);
        }
        
        return true;
    }
    
    // Função para validar o método "mais antigos"
    function confirmOldestMethod() {
        const actualAmount = parseFloat(document.getElementById('actualAmount').value) || 0;
        if (actualAmount <= 0 || selectedFacturations.length <= 1) return true;
        
        // Simular a alocação para identificar faturações que ficarão sem valor
        let remaining = actualAmount;
        const sortedFacts = [...selectedFacturations].sort((a, b) => {
            const dateA = document.querySelector(`.factCheckbox[data-id="${a.id}"]`).closest('tr').querySelector('td:nth-child(2)').textContent.trim().split('/').reverse().join('-');
            const dateB = document.querySelector(`.factCheckbox[data-id="${b.id}"]`).closest('tr').querySelector('td:nth-child(2)').textContent.trim().split('/').reverse().join('-');
            return new Date(dateA) - new Date(dateB);
        });
        
        // Identificar faturações que ficarão sem valor
        const unusedFacts = [];
        for (let fact of sortedFacts) {
            if (remaining <= 0) {
                const checkbox = document.querySelector(`.factCheckbox[data-id="${fact.id}"]`);
                const date = checkbox.closest('tr').querySelector('td:nth-child(2)').textContent.trim();
                const value = formatCurrency(fact.amount);
                unusedFacts.push({ id: fact.id, date: date, value: value });
            } else {
                remaining -= fact.amount;
            }
        }
        
        // Se houver faturações que ficarão sem valor, mostrar confirmação
        if (unusedFacts.length > 0) {
            const factsList = unusedFacts.map(f => `${f.date} (${f.value})`).join(', ');
            if (!confirm(`Com o método "Mais Antigos", as seguintes faturações ficarão sem valor alocado e serão removidas da seleção:\n\n${factsList}\n\nDeseja continuar?`)) {
                return false;
            }
            
            // Se confirmar, desmarcar as faturações que ficarão sem valor
            unusedFacts.forEach(fact => {
                const checkbox = document.querySelector(`.factCheckbox[data-id="${fact.id}"]`);
                checkbox.checked = false;
            });
            
            // Atualizar seleção
            updateSelectedTotal();
        }
        
        return true;
    }
    
    // Event Listeners
    // Selecionar Todos
    document.getElementById('selectAll').addEventListener('change', function() {
        const checked = this.checked;
        
        // Se estiver marcando todos e estiver no método "mais antigos" com diferença negativa
        if (checked) {
            const currentMethod = document.querySelector('input[name="allocationMethod"]:checked').value;
            const actualAmount = parseFloat(document.getElementById('actualAmount').value) || 0;
            const expectedAmount = parseFloat(document.getElementById('expectedAmount').value) || 0;
            const difference = actualAmount - expectedAmount;
            
            // Se estiver no método "mais antigos" e já tiver diferença negativa
            if (currentMethod === 'oldest' && difference < 0) {
                // Desmarcar o checkbox "Selecionar Todos"
                this.checked = false;
                
                // Mostrar modal de alerta
                const message = `Não é possível adicionar mais faturações no método "Mais Antigos" quando já existe uma diferença negativa.\n\nVocê pode:\n1. Aumentar o valor real da transação\n2. Mudar para o método "Proporcional"\n3. Remover outras faturações`;
                
                alert(message);
                
                // Não prosseguir com a atualização
                return;
            }
        }
        
        // Continuar com o fluxo normal
        document.querySelectorAll('.factCheckbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
        updateSelectedTotal();
    });
    
    // Checkboxes de seleção de faturação
    document.querySelectorAll('.factCheckbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Se estiver marcando (não desmarcando) e estiver no método "mais antigos" com diferença negativa
            if (this.checked) {
                const currentMethod = document.querySelector('input[name="allocationMethod"]:checked').value;
                const actualAmount = parseFloat(document.getElementById('actualAmount').value) || 0;
                const expectedAmount = parseFloat(document.getElementById('expectedAmount').value) || 0;
                const difference = actualAmount - expectedAmount;
                
                // Se estiver no método "mais antigos" e já tiver diferença negativa
                if (currentMethod === 'oldest' && difference < 0) {
                    // Desmarcar o checkbox que acabou de ser marcado
                    this.checked = false;
                    
                    // Mostrar modal de alerta
                    const message = `Não é possível adicionar mais faturações no método "Mais Antigos" quando já existe uma diferença negativa.\n\nVocê pode:\n1. Aumentar o valor real da transação\n2. Mudar para o método "Proporcional"\n3. Remover outras faturações`;
                    
                    alert(message);
                    
                    // Não prosseguir com a atualização
                    return;
                }
            }
            
            // Continuar com o fluxo normal
            updateSelectAllCheckbox();
            updateSelectedTotal();
            
            // Após atualizar a seleção, forçar recálculo com o método atual
            const currentMethod = document.querySelector('input[name="allocationMethod"]:checked').value;
            if (currentMethod !== 'manual') {
                recalculateAllocation();
            }
        });
    });
    
    // Valor Real
    document.getElementById('actualAmount').addEventListener('input', function() {
        const method = document.querySelector('input[name="allocationMethod"]:checked').value;
        if (method !== 'manual') {
            checkDifference();
        }
    });
    
    // Inputs de alocação
    document.querySelectorAll('.allocation-input').forEach(input => {
        input.addEventListener('input', function() {
            // Garantir que o valor seja positivo
            if (parseFloat(this.value) < 0) {
                this.value = "0.00";
            }
            
            // Se estiver no modo manual, recalcular
            const method = document.querySelector('input[name="allocationMethod"]:checked').value;
            if (method === 'manual') {
                // Atualizar o valor no objeto selectedFacturations
                const id = this.getAttribute('data-id');
                const fact = selectedFacturations.find(f => f.id === id);
                if (fact) {
                    fact.allocation = parseFloat(this.value) || 0;
                }
                
                // Recalcular para atualizar o valor real
                recalculateAllocation();
            }
        });
    });
    
    // Métodos de alocação
    document.querySelectorAll('.allocation-method-card').forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const newMethod = this.dataset.method;
            changeAllocationMethod(newMethod);
        });
    });
    
    // Marcar o método inicial como ativo
    selectAllocationMethod('proportional');
});