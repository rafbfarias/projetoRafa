class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        this.openSubmenus = JSON.parse(localStorage.getItem('openSubmenus')) || [];
        this.userData = null;
        
        // Aplicar tema inicial
        this.applyTheme(this.currentTheme);
    }

    // Método para aplicar o tema
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Atualizar ícone e texto do botão de tema
            const themeToggle = this.querySelector('#themeToggle');
            if (themeToggle) {
                const icon = themeToggle.querySelector('i');
            const text = themeToggle.querySelector('.sidebar-text');
            
            if (icon) {
                icon.classList.remove('fa-sun', 'fa-moon');
                icon.classList.add(theme === 'dark' ? 'fa-sun' : 'fa-moon');
            }
            
            if (text) {
                text.textContent = theme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
            }
        }
    }

    // Função para atualizar preview da foto
    updatePhotoPreview(imageUrl, userName, userRole) {
        const avatarImage = this.querySelector('.avatar-image');
        const userNameElement = this.querySelector('.sidebar-user-info p:first-child');
        const userRoleElement = this.querySelector('.sidebar-user-info p:last-child');
        
        if (!imageUrl || imageUrl === '') {
            avatarImage.src = '/images/users/default-avatar.svg';
        } else {
            let finalImageUrl = imageUrl;
            if (imageUrl.startsWith('uploads/')) {
                finalImageUrl = `/api/users/profile-photo/${imageUrl.split('/').pop()}`;
            }
            avatarImage.src = finalImageUrl;
            avatarImage.onerror = () => {
                avatarImage.src = '/images/users/default-avatar.svg';
            };
        }

        if (userNameElement) userNameElement.textContent = userName;
        if (userRoleElement) userRoleElement.textContent = userRole;
    }

    async connectedCallback() {
        try {
            const userResponse = await fetch('/api/users/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const userData = await userResponse.json();
            console.log('Dados do usuário para sidebar:', userData);

            if (!userResponse.ok) {
                throw new Error(userData.message || 'Erro ao carregar dados do usuário');
            }

            const user = userData.user;

            // Carregar template e inicializar sidebar
            const templateResponse = await fetch('/components/sidebar.html');
            const html = await templateResponse.text();
            this.innerHTML = html;

            // Atualizar informações do usuário
            this.updatePhotoPreview(
                user.photo,
                user.preferredName || user.name,
                user.role || 'Usuário'
            );

            // Inicializar comportamentos
            this.initializeSidebarBehaviors();

            // Restaurar estado do sidebar
            this.restoreSidebarState();

            // Restaurar tema ao carregar
            this.applyTheme(this.currentTheme);

            // Marca o item de menu atual como ativo
            const currentPath = window.location.pathname;
            const menuItems = this.querySelectorAll('.menu-item');
            
            menuItems.forEach(item => {
                if (item.getAttribute('href') === currentPath) {
                    item.classList.add('active');
                }
            });

        } catch (error) {
            console.error('Erro ao carregar sidebar:', error);
            this.innerHTML = `
                <div class="sidebar">
                    <div class="p-4 text-center text-red-500">
                        Erro ao carregar menu
                    </div>
                </div>
            `;
        }
    }

    initializeSidebarBehaviors() {
        // Toggle do sidebar
        const sidebarToggle = this.querySelector('#sidebarToggle');
        const sidebar = this.querySelector('#sidebar');
        
        if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
                const isCollapsed = sidebar.classList.toggle('collapsed');
            const icon = sidebarToggle.querySelector('i');
                if (icon) {
            icon.classList.toggle('fa-chevron-left');
            icon.classList.toggle('fa-chevron-right');
                }
                
                const sidebarTexts = this.querySelectorAll('.sidebar-text');
                sidebarTexts.forEach(text => {
                    text.classList.toggle('hidden');
                });

                localStorage.setItem('sidebarCollapsed', isCollapsed);
            });
        }

        // Dropdown do usuário
        const avatarButton = this.querySelector('#avatarButton');
        const userDropdown = this.querySelector('#userDropdown');
        if (avatarButton && userDropdown) {
            avatarButton.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });

            document.addEventListener('click', () => {
                userDropdown.classList.add('hidden');
            });
        }

        // Nova implementação dos submenus
        const submenuToggles = this.querySelectorAll('[data-submenu]');
        submenuToggles.forEach(toggle => {
            // Encontrar o submenu correspondente
            const submenuId = toggle.getAttribute('data-submenu');
            const submenu = document.getElementById(`${submenuId}-submenu`);
            const chevron = toggle.querySelector('.fa-chevron-right');

            // Garantir que o submenu comece oculto
            if (submenu) {
                submenu.style.maxHeight = '0';
                submenu.style.overflow = 'hidden';
                submenu.style.transition = 'max-height 0.3s ease-out';
                submenu.style.display = 'none';
            }

            // Adicionar evento de clique
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (submenu) {
                    // Toggle do submenu atual
                    const isVisible = submenu.style.display !== 'none';
                    
                    if (isVisible) {
                        // Fechar submenu
                        submenu.style.maxHeight = '0';
                        setTimeout(() => {
                            submenu.style.display = 'none';
                        }, 300); // Aguarda a animação terminar
                        if (chevron) {
                            chevron.style.transform = 'rotate(0deg)';
                        }
                    } else {
                        // Abrir submenu
                        submenu.style.display = 'block';
                        submenu.style.maxHeight = submenu.scrollHeight + 'px';
                        if (chevron) {
                            chevron.style.transform = 'rotate(90deg)';
                        }
                    }
                }
            });
        });

        // Marcar item ativo do menu e expandir seu submenu pai
        const currentPath = window.location.pathname;
        const menuLinks = this.querySelectorAll('a.menu-item');
        menuLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
                
                // Expandir submenu pai se existir
                const parentSubmenu = link.closest('.submenu');
                if (parentSubmenu) {
                    parentSubmenu.style.display = 'block';
                    parentSubmenu.style.maxHeight = parentSubmenu.scrollHeight + 'px';
                    
                    const parentToggle = this.querySelector(`[data-submenu="${parentSubmenu.id.replace('-submenu', '')}"]`);
                    const chevron = parentToggle?.querySelector('.fa-chevron-right');
                    if (chevron) {
                        chevron.style.transform = 'rotate(90deg)';
                    }
                }
            }
        });

        // Theme Toggle
        const themeToggle = this.querySelector('#themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
                this.currentTheme = newTheme;
                this.applyTheme(newTheme);
            });
        }
    }

    restoreSidebarState() {
        const sidebar = this.querySelector('#sidebar');
        const sidebarToggle = this.querySelector('#sidebarToggle');
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

        if (isCollapsed && sidebar) {
            sidebar.classList.add('collapsed');
            const icon = sidebarToggle?.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-chevron-left');
                icon.classList.add('fa-chevron-right');
            }
            
            const sidebarTexts = this.querySelectorAll('.sidebar-text');
            sidebarTexts.forEach(text => {
                text.classList.add('hidden');
            });
        }
    }
}

customElements.define('app-sidebar', Sidebar);