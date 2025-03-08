document.addEventListener('DOMContentLoaded', function() {
    // Controle de filtros
    const filterButton = document.getElementById('filterButton');
    const filterContainer = document.getElementById('filterContainer');
    const resetFilterButton = document.getElementById('resetFilterButton');
    const applyFilterButton = document.getElementById('applyFilterButton');
    
    // Toggle de filtros
    filterButton.addEventListener('click', function() {
        filterContainer.classList.toggle('hidden');
    });
    
    // Resetar filtros
    resetFilterButton.addEventListener('click', function() {
        document.getElementById('nameFilter').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('statusFilter').value = '';
    });
    
    // Aplicar filtros (simulação)
    applyFilterButton.addEventListener('click', function() {
        // Simulação de aplicação de filtros
        const nameFilter = document.getElementById('nameFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        console.log('Filtros aplicados:', { nameFilter, categoryFilter, statusFilter });
        
        // Em um cenário real, aqui você faria uma chamada AJAX para filtrar os dados
        alert('Filtros aplicados com sucesso!');
        
        // Fechar o container de filtros
        filterContainer.classList.add('hidden');
    });
    
    // Inicialização do gráfico de categorias
    const ctx = document.getElementById('categoriesChart').getContext('2d');
    const categoriesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Alimentação', 'Bebidas', 'Materiais', 'Serviços', 'Outros'],
            datasets: [{
                data: [42, 28, 18, 25, 12],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',  // Azul
                    'rgba(239, 68, 68, 0.7)',   // Vermelho
                    'rgba(16, 185, 129, 0.7)',  // Verde
                    'rgba(124, 58, 237, 0.7)',  // Roxo
                    'rgba(59, 130, 246, 0.7)',  // Azul
                    'rgba(239, 68, 68, 0.7)',   // Vermelho
                    'rgba(16, 185, 129, 0.7)',  // Verde
                    'rgba(124, 58, 237, 0.7)',  // Roxo
                    'rgba(245, 158, 11, 0.7)'   // Âmbar
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(124, 58, 237, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, item) => acc + item, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
});