document.addEventListener('DOMContentLoaded', function() {
    initPage();
    initNotifications();
    checkPendingInvitations();
});

// Inicializa a página
function initPage() {
    // Configuração do botão de tema
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const themeText = themeToggle.querySelector('span');
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Configuração do botão para colapsar o menu
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            // Ajusta o conteúdo principal quando o menu é colapsado
            if (mainContent) {
                if (sidebar.classList.contains('collapsed')) {
                    mainContent.style.marginLeft = '0';
                } else {
                    mainContent.style.marginLeft = '0';
                }
            }
        });
    }
    
    // Configuração do menu móvel
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (mobileMenuToggle && sidebar && sidebarOverlay) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.add('mobile-open');
            sidebarOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeMobileMenu && sidebar && sidebarOverlay) {
        closeMobileMenu.addEventListener('click', function() {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('show');
            document.body.style.overflow = '';
        });
    }
    
    if (sidebarOverlay && sidebar) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('show');
            document.body.style.overflow = '';
        });
    }
    
    // Verifica o tamanho da tela ao carregar e redimensionar
    function checkScreenSize() {
        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('collapsed');
            if (mainContent) mainContent.style.marginLeft = '0';
        } else if (sidebar && sidebarOverlay) {
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
    if (!themeToggle) return;

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

/**
 * Inicializa as notificações no dashboard
 */
function initNotifications() {
    const notificationArea = document.getElementById('notificationArea');
    if (notificationArea) {
        // Aqui você pode adicionar lógica para buscar notificações do servidor
        // Por enquanto, usamos dados estáticos
    }
}

/**
 * Verifica se há convites pendentes e exibe notificação
 */
function checkPendingInvitations() {
    // Simulação de API - em produção, isso seria uma chamada real à API
    const pendingInvitations = 2; // Exemplo: 2 convites pendentes
    
    if (pendingInvitations > 0) {
        // Adicionar badge de notificação ao ícone de convites no sidebar
        const invitationsLink = document.querySelector('a[href="/pages/account/invitations.html"]');
        if (invitationsLink) {
            const badge = document.createElement('span');
            badge.className = 'absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center';
            badge.textContent = pendingInvitations;
            
            // Adicionar badge apenas se o elemento tiver posição relativa
            const iconContainer = invitationsLink.querySelector('i').parentElement;
            if (iconContainer) {
                iconContainer.style.position = 'relative';
                iconContainer.appendChild(badge);
            }
        }
    }
} 