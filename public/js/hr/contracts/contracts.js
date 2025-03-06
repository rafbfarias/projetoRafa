// Inicializa a página
function initPage() {
    // Configuração do botão de tema
    const themeToggle = document.getElementById('themeToggle');
    const themeText = themeToggle.querySelector('span');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Configuração do botão para colapsar o menu
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        
        // Ajusta o conteúdo principal quando o menu é colapsado
        if (sidebar.classList.contains('collapsed')) {
            mainContent.style.marginLeft = '0';
        } else {
            mainContent.style.marginLeft = '0';
        }
    });
    
    // Configuração do menu móvel
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.add('mobile-open');
        sidebarOverlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Impede rolagem quando o menu está aberto
    });
    
    closeMobileMenu.addEventListener('click', function() {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('show');
        document.body.style.overflow = ''; // Restaura a rolagem
    });
    
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('show');
        document.body.style.overflow = ''; // Restaura a rolagem
    });
    
    // Verifica o tamanho da tela ao carregar e redimensionar
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('collapsed');
            mainContent.style.marginLeft = '0';
        } else {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    // Verifica o tamanho da tela ao carregar
    checkScreenSize();
    
    // Verifica o tamanho da tela ao redimensionar
    window.addEventListener('resize', checkScreenSize);
    
    // Verifica se há preferência de tema salva
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeUI(savedTheme);
    }
    
    // Configuração do botão para alternar visualização
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const listView = document.querySelector('table').parentElement.parentElement;
    const cardsView = document.getElementById('cardsView');
    
    toggleViewBtn.addEventListener('click', function() {
        const isListView = !listView.classList.contains('hidden');
        
        if (isListView) {
            listView.classList.add('hidden');
            cardsView.classList.remove('hidden');
            toggleViewBtn.innerHTML = '<i class="fas fa-list"></i><span>Alternar para Visualização em Lista</span>';
        } else {
            listView.classList.remove('hidden');
            cardsView.classList.add('hidden');
            toggleViewBtn.innerHTML = '<i class="fas fa-th-large"></i><span>Alternar para Visualização em Cards</span>';
        }
    });
    
    // Configuração do botão para baixar template
    const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
    downloadTemplateBtn.addEventListener('click', downloadTemplate);
    
    // Configuração do botão para importar
    const importBtn = document.getElementById('importBtn');
    importBtn.addEventListener('click', function() {
        // Simula o clique em um input de arquivo oculto
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xlsx,.xls';
        fileInput.addEventListener('change', handleFileUpload);
        fileInput.click();
    });
    
    // Configuração do botão para novo contrato
    const newContractBtn = document.getElementById('newContractBtn');
    newContractBtn.addEventListener('click', function() {
        window.location.href = '/pages/contracts/new/contract.html';
    });
    
    // Configuração do campo de pesquisa
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', filterContracts);
    
    // Configuração dos cliques nas linhas da tabela
    const tableRows = document.querySelectorAll('#contractsList tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            // Simula a navegação para a página de detalhes
            // Na implementação real, você usaria o ID do contrato
            window.location.href = '/pages/contracts/detail/contract.html';
        });
    });
    
    // Configuração dos cliques nos cards
    const contractCards = document.querySelectorAll('#cardsView > div:not(:last-child)');
    contractCards.forEach(card => {
        card.addEventListener('click', function() {
            // Simula a navegação para a página de detalhes
            window.location.href = '/pages/contracts/detail/contract.html';
        });
    });
    
    // Configuração do card para adicionar novo contrato
    const addContractCard = document.querySelector('#cardsView > div:last-child');
    addContractCard.addEventListener('click', function() {
        window.location.href = '/pages/contracts/new/contract.html';
    });
}

// Alterna entre os temas claro e escuro
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeUI(newTheme);
}

// Atualiza a interface com base no tema
function updateThemeUI(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        if (themeText) {
            themeText.textContent = 'Modo claro';
        }
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        if (themeText) {
            themeText.textContent = 'Modo escuro';
        }
    }
}

// Função para baixar o template
function downloadTemplate() {
    // Na implementação real, você geraria um arquivo Excel
    alert('Template baixado com sucesso!');
}

// Função para lidar com o upload de arquivo
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Na implementação real, você processaria o arquivo Excel
        alert(`Arquivo "${file.name}" importado com sucesso!`);
    }
}

// Função para filtrar contratos
function filterContracts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const tableRows = document.querySelectorAll('#contractsList tr');
    
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Também filtra os cards
    const contractCards = document.querySelectorAll('#cardsView > div:not(:last-child)');
    contractCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Inicializa a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initPage);