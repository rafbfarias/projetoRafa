document.addEventListener('DOMContentLoaded', function() {
    // Controle do menu de ações
    const actionsButton = document.getElementById('actionsButton');
    const actionsMenu = document.getElementById('actionsMenu');
    
    // Toggle do menu de ações
    actionsButton.addEventListener('click', function() {
        actionsMenu.classList.toggle('hidden');
    });
    
    // Fechar o menu quando clicar fora dele
    document.addEventListener('click', function(event) {
        if (!actionsButton.contains(event.target) && !actionsMenu.contains(event.target)) {
            actionsMenu.classList.add('hidden');
        }
    });
    
    // Controle das tabs
    const tabButtons = document.querySelectorAll('[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover classe ativa de todas as tabs
            tabButtons.forEach(btn => {
                btn.classList.remove('tab-active');
                btn.classList.add('tab-inactive');
            });
            
            // Adicionar classe ativa na tab clicada
            this.classList.add('tab-active');
            this.classList.remove('tab-inactive');
            
            // Esconder todos os conteúdos
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Mostrar o conteúdo da tab selecionada
            const tabName = this.getAttribute('data-tab');
            document.getElementById(`tab-${tabName}`).classList.remove('hidden');
        });
    });

    // Funções para carregar dados do fornecedor (simulação)
    async function loadSupplierDetails(supplierId) {
        // Em uma implementação real, isso seria uma chamada AJAX
        console.log(`Carregando detalhes do fornecedor ID: ${supplierId}`);
        
        // Simular o tempo de resposta
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Retornar dados simulados
        return {
            id: supplierId,
            name: "Vinhos do Vale",
            status: "active",
            rating: 5.0
        };
    }
    
    // Função para carregar produtos do fornecedor (simulação)
    async function loadSupplierProducts(supplierId) {
        console.log(`Carregando produtos do fornecedor ID: ${supplierId}`);
        
        // Simular o tempo de resposta
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Retornar dados simulados
        return [
            { id: 1, name: "Vinho Tinto Reserva", price: 12.50, stock: 245 },
            { id: 2, name: "Vinho Branco Verde", price: 8.95, stock: 320 },
            { id: 3, name: "Vinho Rosé", price: 9.75, stock: 180 }
        ];
    }
    
    // Função para inicializar os dados da página
    async function initPageData() {
        // Obter ID do fornecedor da URL
        const urlParams = new URLSearchParams(window.location.search);
        const supplierId = urlParams.get('id') || 1;
        
        try {
            // Carregar dados do fornecedor
            const supplierData = await loadSupplierDetails(supplierId);
            console.log("Dados do fornecedor carregados:", supplierData);
            
            // Em uma implementação real, você atualizaria os elementos da página
            // com os dados recebidos do servidor
            
        } catch (error) {
            console.error("Erro ao carregar dados do fornecedor:", error);
            // Mostrar alguma mensagem de erro para o usuário
        }
    }
    
    // Inicializar a página
    initPageData();
});