// Estado da aplicação
const app = {
    currentPage: null,
    sidebarInitialized: false,
    routes: {
        '/': '/pages/dashboard.html',
        '/dashboard': '/pages/dashboard.html',
        '/products': '/pages/kitchen/product/dash.productManagement.html',
        '/new-product': '/pages/kitchen/product/new.product.html',
        '/orders': '/pages/procurement/orders/dash.orders.html',
        '/new-order': '/pages/procurement/orders/new.order.html',
        // ... outras rotas ...
    }
};

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    setupNavigation();
    loadInitialPage();
});

// Carregar o sidebar (apenas uma vez)
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    
    fetch('/components/sidebar.html')
        .then(response => response.text())
        .then(html => {
            // Extrair apenas o conteúdo interno do sidebar
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const sidebarContent = doc.querySelector('#sidebar').innerHTML;
            
            sidebar.innerHTML = sidebarContent;
            
            // Inicializar controles do sidebar
            initSidebarControls();
            app.sidebarInitialized = true;
        })
        .catch(error => {
            console.error('Erro ao carregar o sidebar:', error);
        });
}

// Inicializar controles do sidebar
function initSidebarControls() {
    // Toggle button
    const toggleButton = document.getElementById('sidebarToggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleSidebar);
    }
    
    // Inicializar submenus
    initSubmenus();
    
    // Inicializar avatar dropdown
    initAvatarDropdown();
    
    // Inicializar gradientes
    initGradients();
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    document.documentElement.classList.toggle('sidebar-collapsed');
    sidebar.classList.toggle('collapsed');
    
    // Salvar preferência do usuário
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
}

// Inicializar submenus
function initSubmenus() {
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    
    submenuToggles.forEach(toggle => {
        const targetId = toggle.getAttribute('data-target');
        const submenu = document.getElementById(targetId);
        const icon = toggle.querySelector('.fa-chevron-right');
        
        // Verificar estado salvo
        const isOpen = localStorage.getItem(`submenu-${targetId}`) === 'open';
        if (isOpen && submenu) {
            submenu.style.display = 'block';
            if (icon) icon.classList.add('rotate-90');
        }
        
        toggle.addEventListener('click', () => {
            if (submenu) {
                const isCurrentlyOpen = submenu.style.display === 'block';
                submenu.style.display = isCurrentlyOpen ? 'none' : 'block';
                
                if (icon) {
                    icon.classList.toggle('rotate-90');
                }
                
                // Salvar estado
                localStorage.setItem(
                    `submenu-${targetId}`, 
                    isCurrentlyOpen ? 'closed' : 'open'
                );
                
                // Atualizar gradientes
                updateGradients();
            }
        });
    });
}

// Inicializar avatar dropdown
function initAvatarDropdown() {
    const avatarButton = document.getElementById('avatarButton');
    const userDropdown = document.getElementById('userDropdown');
    
    if (avatarButton && userDropdown) {
        avatarButton.addEventListener('click', () => {
            userDropdown.classList.toggle('hidden');
        });
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!avatarButton.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }
}

// Inicializar gradientes
function initGradients() {
    const menuScroll = document.querySelector('.menu-scroll');
    if (menuScroll) {
        menuScroll.addEventListener('scroll', updateGradients);
        updateGradients();
    }
}

// Atualizar gradientes
function updateGradients() {
    const menuScroll = document.querySelector('.menu-scroll');
    const fadeTop = document.querySelector('.fade-top');
    const fadeBottom = document.querySelector('.fade-bottom');

    if (menuScroll && fadeTop && fadeBottom) {
        fadeTop.style.opacity = menuScroll.scrollTop > 20 ? '1' : '0';
        
        const hasMoreContent = menuScroll.scrollHeight - menuScroll.scrollTop - menuScroll.clientHeight > 20;
        fadeBottom.style.opacity = hasMoreContent ? '1' : '0';
    }
}

// Configurar navegação
function setupNavigation() {
    // Interceptar cliques em links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href.startsWith(window.location.origin)) {
            e.preventDefault();
            
            const path = link.pathname;
            navigateTo(path);
        }
    });
    
    // Lidar com navegação do histórico
    window.addEventListener('popstate', (e) => {
        loadPageContent(window.location.pathname);
    });
}

// Navegar para uma página
function navigateTo(path) {
    history.pushState(null, null, path);
    loadPageContent(path);
}

// Carregar página inicial
function loadInitialPage() {
    const path = window.location.pathname;
    loadPageContent(path);
}

// Carregar conteúdo da página
function loadPageContent(path) {
    // Verificar se a rota existe
    const route = app.routes[path] || app.routes['/'];
    
    // Mostrar loading
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="flex items-center justify-center h-full">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    `;
    
    // Carregar conteúdo
    fetch(route)
        .then(response => response.text())
        .then(html => {
            // Extrair apenas o conteúdo principal
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extrair título
            const title = doc.querySelector('title')?.textContent || 'Dineo - Sistema de Gestão';
            document.title = title;
            
            // Extrair CSS específico
            const cssLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
                .filter(link => !link.href.includes('styles.css') && !link.href.includes('font-awesome') && !link.href.includes('fonts.googleapis'));
            
            // Carregar CSS específico se necessário
            const currentCssLinks = Array.from(document.querySelectorAll('link[data-page-specific]'));
            
            // Remover CSS antigo
            currentCssLinks.forEach(link => link.remove());
            
            // Adicionar novo CSS
            cssLinks.forEach(link => {
                const newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.href = link.href;
                newLink.setAttribute('data-page-specific', 'true');
                document.head.appendChild(newLink);
            });
            
            // Extrair scripts específicos
            const scripts = Array.from(doc.querySelectorAll('script'))
                .filter(script => !script.src.includes('Sidebar.js') && !script.src.includes('tailwindcss'));
            
            // Extrair conteúdo principal
            const content = doc.querySelector('main')?.innerHTML || '';
            mainContent.innerHTML = content;
            
            // Carregar scripts específicos
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
            });
            
            // Atualizar links ativos no sidebar
            updateActiveLinks(path);
            
            // Armazenar página atual
            app.currentPage = path;
        })
        .catch(error => {
            console.error('Erro ao carregar a página:', error);
            mainContent.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full">
                    <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
                    <h2 class="text-xl font-bold mb-2">Erro ao carregar a página</h2>
                    <p class="text-gray-600 mb-4">${error.message}</p>
                    <button onclick="loadInitialPage()" class="btn btn-primary">
                        Tentar novamente
                    </button>
                </div>
            `;
        });
}

// Atualizar links ativos no sidebar
function updateActiveLinks(path) {
    // Remover classe ativa de todos os links
    document.querySelectorAll('#sidebar a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Adicionar classe ativa ao link atual
    document.querySelectorAll('#sidebar a').forEach(link => {
        if (link.pathname === path) {
            link.classList.add('active');
            
            // Expandir submenu pai se necessário
            const parentSubmenu = link.closest('.submenu');
            if (parentSubmenu) {
                parentSubmenu.style.display = 'block';
                
                const toggle = document.querySelector(`[data-target="${parentSubmenu.id}"]`);
                if (toggle) {
                    const icon = toggle.querySelector('.fa-chevron-right');
                    if (icon) icon.classList.add('rotate-90');
                    
                    // Salvar estado
                    localStorage.setItem(`submenu-${parentSubmenu.id}`, 'open');
                }
            }
        }
    });
} 