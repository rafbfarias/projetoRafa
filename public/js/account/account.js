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

// Inicializa a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initPage); 