// Variáveis globais
let sidebarCollapsed = false;
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = '';

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Configurar o tema
    setupTheme();
    
    // Configurar o sidebar
    setupSidebar();
    
    // Configurar o menu móvel
    setupMobileMenu();
    
    // Configurar o dropdown do usuário
    setupUserDropdown();
    
    // Configurar os submenus
    setupSubmenus();
    
    // Configurar a navegação
    setupNavigation();
    
    // Carregar a página inicial ou a página atual da URL
    loadInitialPage();
});

// Configurar o tema
function setupTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Atualizar o botão de tema
    updateThemeUI(currentTheme);
    
    // Adicionar evento de clique
    themeToggle.addEventListener('click', function() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        
        // Atualizar o botão de tema
        updateThemeUI(currentTheme);
    });
}

// Atualizar a interface com base no tema
function updateThemeUI(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeIcon.style.color = 'var(--bg-primary)';
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        themeIcon.style.color = 'var(--bg-primary)';
    }
}

// Configurar o sidebar
function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    // Verificar se o sidebar estava colapsado anteriormente
    sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    // Aplicar o estado inicial
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        content.classList.add('expanded');
        sidebarToggle.querySelector('i').classList.remove('fa-chevron-left');
        sidebarToggle.querySelector('i').classList.add('fa-chevron-right');
    }
    
    // Adicionar evento de clique
    sidebarToggle.addEventListener('click', function() {
        sidebarCollapsed = !sidebarCollapsed;
        sidebar.classList.toggle('collapsed', sidebarCollapsed);
        content.classList.toggle('expanded', sidebarCollapsed);
        
        // Atualizar o ícone
        if (sidebarCollapsed) {
            sidebarToggle.querySelector('i').classList.remove('fa-chevron-left');
            sidebarToggle.querySelector('i').classList.add('fa-chevron-right');
        } else {
            sidebarToggle.querySelector('i').classList.remove('fa-chevron-right');
            sidebarToggle.querySelector('i').classList.add('fa-chevron-left');
        }
        
        // Salvar o estado
        localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
    });
}

// Configurar o menu móvel
function setupMobileMenu() {
    const mobileOverlay = document.getElementById('mobileOverlay');
    const sidebar = document.getElementById('sidebar');
    
    // Adicionar evento de clique no overlay
    mobileOverlay.addEventListener('click', function() {
        sidebar.classList.remove('mobile-open');
        mobileOverlay.classList.add('hidden');
    });
    
    // Verificar o tamanho da tela e ajustar o sidebar
    function checkScreenSize() {
        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.add('hidden');
        }
    }
    
    // Verificar o tamanho da tela ao redimensionar
    window.addEventListener('resize', checkScreenSize);
    
    // Verificar o tamanho da tela inicialmente
    checkScreenSize();
}

// Configurar o dropdown do usuário
function setupUserDropdown() {
    const userProfileToggle = document.getElementById('userProfileToggle');
    const userDropdown = document.getElementById('userDropdown');
    
    // Adicionar evento de clique
    userProfileToggle.addEventListener('click', function(event) {
        event.stopPropagation();
        userDropdown.classList.toggle('show');
    });
    
    // Fechar o dropdown ao clicar fora
    document.addEventListener('click', function() {
        userDropdown.classList.remove('show');
    });
    
    // Impedir que o dropdown feche ao clicar nele
    userDropdown.addEventListener('click', function(event) {
        event.stopPropagation();
    });
}

// Configurar os submenus
function setupSubmenus() {
    const submenuToggles = document.querySelectorAll('[data-submenu]');
    
    // Adicionar evento de clique em cada toggle
    submenuToggles.forEach(toggle => {
        const submenuId = toggle.getAttribute('data-submenu');
        const submenu = document.getElementById(`${submenuId}-submenu`);
        const icon = toggle.querySelector('.fa-chevron-right');
        
        // Verificar se o submenu deve estar aberto (baseado na URL atual)
        const currentPath = window.location.pathname;
        const submenuLinks = submenu.querySelectorAll('a');
        let shouldBeOpen = false;
        
        submenuLinks.forEach(link => {
            if (currentPath.includes(link.getAttribute('href'))) {
                shouldBeOpen = true;
                link.classList.add('active', 'bg-slate-800');
            }
        });
        
        // Abrir o submenu se necessário
        if (shouldBeOpen) {
            submenu.classList.add('open');
            icon.classList.add('transform', 'rotate-90');
            toggle.classList.add('active', 'bg-slate-800');
        }
        
        // Adicionar evento de clique
        toggle.addEventListener('click', function() {
            submenu.classList.toggle('open');
            icon.classList.toggle('transform');
            icon.classList.toggle('rotate-90');
        });
    });
}

// Configurar a navegação
function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Adicionar evento de clique em cada item do menu
    menuItems.forEach(item => {
        // Ignorar os toggles de submenu
        if (item.hasAttribute('data-submenu')) {
            return;
        }
        
        // Verificar se é um link
        const link = item.tagName === 'A' ? item : item.querySelector('a');
        if (!link) return;
        
        // Adicionar evento de clique
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Obter o caminho da página
            const href = link.getAttribute('href');
            
            // Carregar a página
            loadContent(href);
            
            // Atualizar a URL
            history.pushState(null, null, href);
            
            // Atualizar o item ativo
            menuItems.forEach(i => i.classList.remove('active', 'bg-slate-800'));
            item.classList.add('active', 'bg-slate-800');
        });
    });
    
    // Lidar com a navegação do histórico
    window.addEventListener('popstate', function() {
        loadContent(window.location.pathname);
    });
}

// Carregar a página inicial ou a página atual da URL
function loadInitialPage() {
    // Obter o caminho da URL atual
    const path = window.location.pathname;
    
    // Se estiver na raiz, carregar o dashboard
    if (path === '/' || path === '/index.html') {
        loadContent('/pages/dashboard/dashboard.html');
    } else {
        // Carregar a página atual
        loadContent(path);
    }
}

// Carregar conteúdo
function loadContent(path) {
    // Verificar se o caminho é válido
    if (!path) return;
    
    // Remover a barra inicial se existir
    if (path.startsWith('/')) {
        path = path.substring(1);
    }
    
    // Se o caminho for a raiz ou index.html, redirecionar para o dashboard
    if (path === '' || path === 'index.html') {
        path = 'pages/dashboard/dashboard.html';
    }
    
    // Atualizar a página atual
    currentPage = path;
    
    // Mostrar o indicador de carregamento
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
    
    // Carregar o conteúdo
    fetch(`/${path}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Página não encontrada');
            }
            return response.text();
        })
        .then(html => {
            // Extrair apenas o conteúdo principal da página
            let mainContent = html;
            
            // Criar um elemento temporário para analisar o HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Verificar se a página tem uma estrutura HTML completa
            if (html.includes('<body') && html.includes('</body>')) {
                // Procurar por um elemento div principal ou o primeiro div de conteúdo
                const mainElement = tempDiv.querySelector('div.space-y-6') || 
                                   tempDiv.querySelector('main') || 
                                   tempDiv.querySelector('.container') || 
                                   tempDiv.querySelector('.content');
                
                if (mainElement) {
                    mainContent = mainElement.outerHTML;
                } else {
                    // Se não encontrar um elemento específico, pegar todo o conteúdo do body
                    const bodyContent = tempDiv.querySelector('body');
                    if (bodyContent) {
                        mainContent = bodyContent.innerHTML;
                    }
                }
            }
            
            // Inserir o conteúdo
            content.innerHTML = mainContent;
            
            // Executar scripts
            const scripts = content.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                
                // Copiar atributos
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                
                // Copiar conteúdo
                newScript.textContent = script.textContent;
                
                // Substituir o script original
                script.parentNode.replaceChild(newScript, script);
            });
            
            // Atualizar o título da página
            const title = tempDiv.querySelector('title');
            if (title) {
                document.title = title.textContent;
            } else {
                const h1 = content.querySelector('h1');
                if (h1) {
                    document.title = `${h1.textContent} - Sistema de Gestão`;
                }
            }
            
            // Atualizar o item ativo no menu
            updateActiveMenuItem(path);
        })
        .catch(error => {
            console.error('Erro ao carregar a página:', error);
            content.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full">
                    <div class="text-6xl text-red-500 mb-4">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 class="text-2xl font-bold mb-2">Página não encontrada</h1>
                    <p class="text-slate-500 mb-4">A página que você está procurando não existe ou não está disponível.</p>
                    <button class="bg-brand-600 hover:bg-brand-700 text-white py-2 px-4 rounded-lg" onclick="loadContent('/pages/dashboard/dashboard.html')">
                        Voltar para o Dashboard
                    </button>
                </div>
            `;
        });
}

// Atualizar o item ativo no menu
function updateActiveMenuItem(path) {
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Remover a classe ativa de todos os itens
    menuItems.forEach(item => {
        item.classList.remove('active', 'bg-slate-800');
    });
    
    // Encontrar o item correspondente ao caminho
    menuItems.forEach(item => {
        // Ignorar os toggles de submenu
        if (item.hasAttribute('data-submenu')) {
            return;
        }
        
        // Verificar se é um link
        const link = item.tagName === 'A' ? item : item.querySelector('a');
        if (!link) return;
        
        // Obter o caminho do link
        const href = link.getAttribute('href');
        
        // Verificar se o caminho corresponde
        if (path.includes(href)) {
            item.classList.add('active', 'bg-slate-800');
            
            // Abrir o submenu pai, se existir
            const submenu = item.closest('.submenu');
            if (submenu) {
                submenu.classList.add('open');
                
                // Ativar o toggle do submenu
                const submenuId = submenu.id.replace('-submenu', '');
                const toggle = document.querySelector(`[data-submenu="${submenuId}"]`);
                if (toggle) {
                    toggle.classList.add('active', 'bg-slate-800');
                    
                    // Rotacionar o ícone
                    const icon = toggle.querySelector('.fa-chevron-right');
                    if (icon) {
                        icon.classList.add('transform', 'rotate-90');
                    }
                }
            }
        }
    });
}