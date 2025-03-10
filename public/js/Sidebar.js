class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        this.openSubmenus = JSON.parse(localStorage.getItem('openSubmenus')) || [];
        this.userData = null;
        
        // Aplicar o tema atual ao documento
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.body.classList.toggle('dark', this.currentTheme === 'dark');
    }

    async connectedCallback() {
        try {
            // Carregar dados do usuário
            await this.loadUserData();

            const response = await fetch('/components/sidebar.html');
            const html = await response.text();
            this.innerHTML = html;

            // Atualizar informações do usuário na sidebar
            this.updateUserInfo();

            this.setupEventListeners();
            this.setupDropdown();
            
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

            this.setupDropdownHoverEffects();
            this.loadInvitationNotification();
        } catch (error) {
            console.error('Erro ao carregar o sidebar:', error);
            // Se houver erro de autenticação, redirecionar para o login
            if (error.status === 401) {
                window.location.href = '/login.html';
            }
        }
    }

    async loadUserData() {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
            throw { status: response.status, message: 'Erro ao carregar dados do usuário' };
        }
        const data = await response.json();
        this.userData = data.user;
    }

    updateUserInfo() {
        if (!this.userData) return;

        // Atualizar avatar
        const avatarImg = this.querySelector('.avatar-image');
        if (avatarImg) {
            avatarImg.src = this.userData.photo;
            avatarImg.alt = `Avatar de ${this.userData.preferredName}`;
        }

        // Atualizar nome e email no botão do avatar
        const userInfo = this.querySelector('.sidebar-user-info');
        if (userInfo) {
            userInfo.querySelector('p:first-child').textContent = this.userData.preferredName;
            userInfo.querySelector('p:last-child').textContent = this.userData.email;
        }

        // Atualizar informações no dropdown
        const dropdownInfo = this.querySelector('#userDropdown .px-4.py-3');
        if (dropdownInfo) {
            dropdownInfo.querySelector('div:first-child').textContent = this.userData.preferredName;
            dropdownInfo.querySelector('.font-medium').textContent = this.userData.email;
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

        // Logout
        const logoutButton = this.querySelector('a[href="/index.html"]');
        if (logoutButton) {
            logoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const response = await fetch('/api/auth/logout', {
                        method: 'POST'
                    });
                    if (response.ok) {
                        window.location.href = '/login.html';
                    }
                } catch (error) {
                    console.error('Erro ao fazer logout:', error);
                }
            });
        }

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

    setupDropdown() {
        const avatarButton = this.querySelector('#avatarButton');
        const userDropdown = this.querySelector('#userDropdown');
        const sidebar = this.querySelector('#sidebar');

        if (!avatarButton || !userDropdown) return;

        // Função para posicionar o dropdown
        const positionDropdown = () => {
            if (sidebar.classList.contains('collapsed')) {
                const rect = avatarButton.getBoundingClientRect();
                userDropdown.style.position = 'fixed';
                userDropdown.style.left = `${rect.right + 5}px`;
                userDropdown.style.top = `${rect.top}px`;
                userDropdown.style.width = '200px';
            } else {
                userDropdown.style.position = 'absolute';
                userDropdown.style.left = '1rem';
                userDropdown.style.right = '1rem';
                userDropdown.style.top = '100%';
                userDropdown.style.width = 'auto';
            }
        };

        // Fechar dropdown
        const closeDropdown = () => {
            userDropdown.classList.add('hidden');
            avatarButton.setAttribute('aria-expanded', 'false');
        };

        // Toggle dropdown ao clicar no avatar
        avatarButton.addEventListener('click', (e) => {
            e.stopPropagation();
            positionDropdown();
            const isExpanded = !userDropdown.classList.contains('hidden');
            userDropdown.classList.toggle('hidden');
            avatarButton.setAttribute('aria-expanded', (!isExpanded).toString());
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!avatarButton.contains(e.target)) {
                closeDropdown();
            }
        });

        // Fechar dropdown ao fazer scroll
        document.addEventListener('scroll', () => {
            closeDropdown();
        });

        // Reposicionar dropdown quando o sidebar é toggleado
        const sidebarToggle = this.querySelector('#sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                if (!userDropdown.classList.contains('hidden')) {
                    setTimeout(positionDropdown, 300);
                }
            });
        }

        // Reposicionar dropdown ao redimensionar a janela
        window.addEventListener('resize', () => {
            if (!userDropdown.classList.contains('hidden')) {
                positionDropdown();
            }
        });

        // Atualizar tema do dropdown quando o tema global mudar
        const themeToggle = this.querySelector('#themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                // O evento de toggle do tema já existe, apenas precisamos garantir
                // que o dropdown use as classes corretas do Tailwind para dark mode
                userDropdown.classList.toggle('dark:bg-gray-700');
                userDropdown.classList.toggle('dark:divide-gray-600');
            });
        }
    }

    setupDropdownHoverEffects() {
        const dropdownItems = document.querySelectorAll('#userDropdown a');
        
        dropdownItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'var(--dropdown-hover)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
            });
        });
    }

    async loadInvitationNotification() {
        try {
            const response = await fetch('/components/invitation-notification.html');
            const html = await response.text();
            
            // Criar um container para a notificação
            const notificationContainer = document.createElement('div');
            notificationContainer.innerHTML = html;
            
            // Adicionar ao body
            document.body.appendChild(notificationContainer);
        } catch (error) {
            console.error('Erro ao carregar notificação de convites:', error);
        }
    }
}

customElements.define('app-sidebar', Sidebar);