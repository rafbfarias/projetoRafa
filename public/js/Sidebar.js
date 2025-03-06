class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        this.openSubmenus = JSON.parse(localStorage.getItem('openSubmenus')) || [];
        
        // Aplicar o tema atual ao documento
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.body.classList.toggle('dark', this.currentTheme === 'dark');
    }

    async connectedCallback() {
        try {
            const response = await fetch('/components/sidebar.html');
            const html = await response.text();
            this.innerHTML = html;
            this.setupEventListeners();
            
            // Atualizar o ícone do tema
            const themeToggle = this.querySelector('#themeToggle');
            if (themeToggle) {
                const icon = themeToggle.querySelector('i');
                if (this.currentTheme === 'dark') {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            }
            
            // Aplicar o estado do sidebar
            const sidebar = this.querySelector('#sidebar');
            if (sidebar && this.sidebarCollapsed) {
                sidebar.classList.add('collapsed');
                const sidebarToggle = this.querySelector('#sidebarToggle');
                if (sidebarToggle) {
                    const icon = sidebarToggle.querySelector('i');
                    icon.classList.remove('fa-chevron-left');
                    icon.classList.add('fa-chevron-right');
                }
            }
            
            // Restaurar submenus abertos
            this.openSubmenus.forEach(submenuId => {
                const submenu = this.querySelector(`#${submenuId}-submenu`);
                const toggle = this.querySelector(`[data-submenu="${submenuId}"]`);
                if (submenu && toggle) {
                    submenu.classList.add('open');
                    const icon = toggle.querySelector('.fa-chevron-right');
                    if (icon) {
                        icon.classList.add('rotate-90');
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao carregar o sidebar:', error);
        }
    }

    setupEventListeners() {
        // Theme Toggle
        const themeToggle = this.querySelector('#themeToggle');
        themeToggle.addEventListener('click', () => {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', this.currentTheme);
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', this.currentTheme);
            themeToggle.querySelector('i').classList.toggle('fa-sun');
            themeToggle.querySelector('i').classList.toggle('fa-moon');
        });

        // Sidebar Toggle
        const sidebarToggle = this.querySelector('#sidebarToggle');
        const sidebar = this.querySelector('#sidebar');
        sidebarToggle.addEventListener('click', () => {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            sidebar.classList.toggle('collapsed');
            const icon = sidebarToggle.querySelector('i');
            icon.classList.toggle('fa-chevron-left');
            icon.classList.toggle('fa-chevron-right');
            localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);
        });

        // User Dropdown
        const userProfileToggle = this.querySelector('#userProfileToggle');
        const userDropdown = this.querySelector('#userDropdown');
        if (userProfileToggle && userDropdown) {
            userProfileToggle.addEventListener('click', (event) => {
                event.stopPropagation();
                userDropdown.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                userDropdown.classList.remove('show');
            });

            userDropdown.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }

        // Submenus
        const submenuToggles = this.querySelectorAll('[data-submenu]');
        submenuToggles.forEach(toggle => {
            const submenuId = toggle.getAttribute('data-submenu');
            const submenu = this.querySelector(`#${submenuId}-submenu`);
            const icon = toggle.querySelector('.fa-chevron-right');

            toggle.addEventListener('click', () => {
                submenu.classList.toggle('open');
                icon.classList.toggle('rotate-90');
                
                // Atualizar estado no localStorage
                if (submenu.classList.contains('open')) {
                    if (!this.openSubmenus.includes(submenuId)) {
                        this.openSubmenus.push(submenuId);
                    }
                } else {
                    this.openSubmenus = this.openSubmenus.filter(id => id !== submenuId);
                }
                localStorage.setItem('openSubmenus', JSON.stringify(this.openSubmenus));
            });
        });
    }
}

customElements.define('app-sidebar', Sidebar);