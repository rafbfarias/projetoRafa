document.addEventListener('DOMContentLoaded', function() {
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (sidebarContainer) {
        // Carregar o componente de sidebar
        fetch('/components/sidebar.html')
            .then(response => response.text())
            .then(html => {
                sidebarContainer.innerHTML = html;
                
                // Inicializar comportamentos da sidebar
                initializeSidebar();
            })
            .catch(error => {
                console.error('Erro ao carregar sidebar:', error);
                sidebarContainer.innerHTML = '<div class="p-4 text-red-500">Erro ao carregar sidebar</div>';
            });
    }
    
    function initializeSidebar() {
        // Marcar item atual como ativo
        const currentPath = window.location.pathname;
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            const link = item.getAttribute('href');
            if (link && currentPath.includes(link)) {
                item.classList.add('active');
                
                // Se estiver em um submenu, abrir o submenu
                const submenu = item.closest('.submenu');
                if (submenu) {
                    submenu.classList.add('open');
                    const submenuId = submenu.id.replace('-submenu', '');
                    const toggle = document.querySelector(`[data-submenu="${submenuId}"]`);
                    if (toggle) {
                        const icon = toggle.querySelector('.fa-chevron-right');
                        if (icon) {
                            icon.classList.add('rotate-90');
                        }
                    }
                }
            }
        });
        
        // Configurar toggles de submenu
        const submenuToggles = document.querySelectorAll('[data-submenu]');
        submenuToggles.forEach(toggle => {
            const submenuId = toggle.getAttribute('data-submenu');
            const submenu = document.querySelector(`#${submenuId}-submenu`);
            const icon = toggle.querySelector('.fa-chevron-right');
            
            toggle.addEventListener('click', () => {
                submenu.classList.toggle('open');
                icon.classList.toggle('rotate-90');
            });
        });
        
        // Configurar toggle de tema
        const themeToggle = document.querySelector('#themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const isDark = document.body.classList.toggle('dark');
                document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                
                const icon = themeToggle.querySelector('i');
                icon.classList.toggle('fa-sun');
                icon.classList.toggle('fa-moon');
            });
        }
        
        // Configurar toggle de sidebar
        const sidebarToggle = document.querySelector('#sidebarToggle');
        const sidebar = document.querySelector('#sidebar');
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                const icon = sidebarToggle.querySelector('i');
                icon.classList.toggle('fa-chevron-left');
                icon.classList.toggle('fa-chevron-right');
                localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            });
        }
        
        // Aplicar estado salvo da sidebar
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed && sidebar) {
            sidebar.classList.add('collapsed');
            if (sidebarToggle) {
                const icon = sidebarToggle.querySelector('i');
                icon.classList.remove('fa-chevron-left');
                icon.classList.add('fa-chevron-right');
            }
        }
        
        // Aplicar tema salvo
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.classList.toggle('dark', savedTheme === 'dark');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (savedTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    }
}); 