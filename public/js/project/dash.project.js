class ProjectDashboard {
    constructor() {
        this.projectService = new ProjectService();
        this.init();
    }

    init() {
        this.loadDashboardStats();
        this.loadRecentProjects();
        this.loadActivities();
        this.loadUpcomingDeadlines();
        this.setupEventListeners();
    }

    loadDashboardStats() {
        const stats = this.projectService.getProjectStats();
        
        // Atualiza os cards de estatísticas
        document.querySelector('[data-stat="active"]').textContent = stats.active;
        document.querySelector('[data-stat="pending"]').textContent = stats.pending;
        document.querySelector('[data-stat="completed"]').textContent = stats.completed;
        document.querySelector('[data-stat="total"]').textContent = stats.total;
    }

    loadRecentProjects() {
        const projects = this.projectService.getAll();
        const recentProjects = projects
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6);

        const cardView = document.getElementById('card-view');
        const listView = document.getElementById('list-view');

        cardView.innerHTML = this.generateCardView(recentProjects);
        listView.innerHTML = this.generateListView(recentProjects);
    }

    generateCardView(projects) {
        if (projects.length === 0) {
            return `<div class="col-span-full text-center py-8 text-gray-500">
                Nenhum projeto encontrado
            </div>`;
        }

        return projects.map(project => `
            <div class="dashboard-card overflow-hidden group">
                <div class="h-3 bg-${this.getStatusColor(project.status)}-600"></div>
                <div class="p-5">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="font-medium text-lg">${this.escapeHtml(project.name)}</h3>
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-${this.getStatusColor(project.status)}-100 text-${this.getStatusColor(project.status)}-800">
                            ${this.formatStatus(project.status)}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        ${this.escapeHtml(project.description)}
                    </p>
                    <div class="flex items-center text-sm text-gray-500 mb-4">
                        <i class="fas fa-calendar-alt mr-2"></i>
                        <span>${this.formatDate(project.startDate)} - ${this.formatDate(project.endDate)}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-500 mb-4">
                        <i class="fas fa-layer-group mr-2"></i>
                        <span>${this.escapeHtml(project.area)}</span>
                    </div>
                    <div class="mb-4">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm font-medium">Progresso</span>
                            <span class="text-sm font-medium">${project.progress}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div class="bg-${this.getStatusColor(project.status)}-600 h-2.5 rounded-full" 
                                 style="width: ${project.progress}%"></div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex -space-x-2">
                            ${this.generateTeamAvatars(project.team)}
                        </div>
                        <a href="detail.project.html?id=${project.id}" 
                           class="text-sm font-medium text-brand-600 hover:text-brand-700 hidden group-hover:block">
                            Ver detalhes
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    generateListView(projects) {
        if (projects.length === 0) {
            return `<tr><td colspan="7" class="px-4 py-8 text-center text-gray-500">
                Nenhum projeto encontrado
            </td></tr>`;
        }

        return projects.map(project => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">
                                ${this.escapeHtml(project.name)}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                ${this.escapeHtml(project.description)}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">${this.escapeHtml(project.area)}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                bg-${this.getStatusColor(project.status)}-100 
                                text-${this.getStatusColor(project.status)}-800">
                        ${this.formatStatus(project.status)}
                    </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">
                        ${this.formatDate(project.startDate)} - ${this.formatDate(project.endDate)}
                    </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div class="bg-${this.getStatusColor(project.status)}-600 h-2.5 rounded-full" 
                             style="width: ${project.progress}%"></div>
                    </div>
                    <div class="text-xs text-center mt-1">${project.progress}%</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="flex -space-x-2">
                        ${this.generateTeamAvatars(project.team)}
                    </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-center">
                    <a href="detail.project.html?id=${project.id}" 
                       class="text-blue-600 hover:text-blue-900 mx-1">
                        <i class="fas fa-eye"></i>
                    </a>
                    <a href="edit.project.html?id=${project.id}" 
                       class="text-green-600 hover:text-green-900 mx-1">
                        <i class="fas fa-edit"></i>
                    </a>
                </td>
            </tr>
        `).join('');
    }

    setupEventListeners() {
        // Toggle entre visualizações
        const viewToggles = document.querySelectorAll('.view-toggle');
        viewToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.toggleView(e.currentTarget.dataset.view);
            });
        });

        // Filtros e pesquisa
        const searchInput = document.querySelector('input[placeholder="Buscar projetos..."]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterProjects(e.target.value));
        }

        // Filtros de área e status
        const areaSelect = document.querySelector('select:first-of-type');
        const statusSelect = document.querySelector('select:nth-of-type(2)');
        
        if (areaSelect) {
            areaSelect.addEventListener('change', () => this.applyFilters());
        }
        if (statusSelect) {
            statusSelect.addEventListener('change', () => this.applyFilters());
        }
    }

    toggleView(viewType) {
        const viewToggles = document.querySelectorAll('.view-toggle');
        const viewContents = document.querySelectorAll('.view-content');
        
        viewToggles.forEach(t => t.classList.toggle('active', t.dataset.view === viewType));
        viewContents.forEach(content => {
            content.classList.toggle('hidden', content.id !== `${viewType}-view`);
        });
    }

    filterProjects(searchTerm) {
        const projects = this.projectService.getAll();
        const filtered = projects.filter(project => 
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.updateProjectsView(filtered);
    }

    applyFilters() {
        const areaSelect = document.querySelector('select:first-of-type');
        const statusSelect = document.querySelector('select:nth-of-type(2)');
        const searchInput = document.querySelector('input[placeholder="Buscar projetos..."]');

        let filtered = this.projectService.getAll();

        if (areaSelect && areaSelect.value !== 'Todas as áreas') {
            filtered = filtered.filter(p => p.area === areaSelect.value);
        }

        if (statusSelect && statusSelect.value !== 'Todos os status') {
            filtered = filtered.filter(p => p.status === statusSelect.value);
        }

        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            );
        }

        this.updateProjectsView(filtered);
    }

    updateProjectsView(projects) {
        const cardView = document.getElementById('card-view');
        const listView = document.getElementById('list-view');

        if (cardView) {
            cardView.innerHTML = this.generateCardView(projects);
        }
        if (listView) {
            listView.querySelector('tbody').innerHTML = this.generateListView(projects);
        }
    }

    // Funções auxiliares
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    generateTeamAvatars(team) {
        if (!team || team.length === 0) return '';

        const maxVisible = 3;
        const visibleMembers = team.slice(0, maxVisible);
        const remainingCount = team.length - maxVisible;

        let html = visibleMembers.map(member => `
            <img class="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800" 
                 src="${member.avatar || '/api/placeholder/32/32'}" 
                 alt="${this.escapeHtml(member.name)}">
        `).join('');

        if (remainingCount > 0) {
            html += `
                <span class="flex items-center justify-center w-7 h-7 text-xs font-medium text-white 
                            bg-gray-500 rounded-full border-2 border-white dark:border-gray-800">
                    +${remainingCount}
                </span>
            `;
        }

        return html;
    }

    getStatusColor(status) {
        const colors = {
            'planejamento': 'purple',
            'em-andamento': 'blue',
            'pausado': 'gray',
            'concluído': 'green',
            'atrasado': 'yellow',
            'cancelado': 'red'
        };
        return colors[status] || 'gray';
    }

    formatStatus(status) {
        const formats = {
            'planejamento': 'Planejamento',
            'em-andamento': 'Em andamento',
            'pausado': 'Pausado',
            'concluído': 'Concluído',
            'atrasado': 'Atrasado',
            'cancelado': 'Cancelado'
        };
        return formats[status] || status;
    }

    loadActivities() {
        const activities = this.projectService.getActivities();
        const container = document.querySelector('.dashboard-card:has(h3:contains("Atividades Pendentes")) .space-y-4');
        
        if (container) {
            container.innerHTML = activities.map(activity => this.generateActivityCard(activity)).join('');
        }
    }

    loadUpcomingDeadlines() {
        const deadlines = this.projectService.getUpcomingDeadlines();
        const container = document.querySelector('.dashboard-card:has(h3:contains("Prazos Próximos")) .space-y-4');
        
        if (container) {
            container.innerHTML = deadlines.map(deadline => this.generateDeadlineCard(deadline)).join('');
        }
    }

    generateActivityCard(activity) {
        return `
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="text-sm font-medium">${this.escapeHtml(activity.title)}</h4>
                        <p class="text-xs mt-1">Projeto: ${this.escapeHtml(activity.projectName)}</p>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium 
                               bg-${this.getStatusColor(activity.status)}-100 
                               dark:bg-${this.getStatusColor(activity.status)}-900">
                        ${this.formatStatus(activity.status)}
                    </span>
                </div>
                <div class="flex justify-between mt-3">
                    <div class="text-xs flex items-center">
                        <i class="fas fa-calendar-alt mr-1"></i> 
                        Prazo: ${this.formatDate(activity.dueDate)}
                    </div>
                    <div class="text-xs flex items-center">
                        <i class="fas fa-user mr-1"></i> 
                        ${this.escapeHtml(activity.assignee)}
                    </div>
                </div>
            </div>
        `;
    }

    generateDeadlineCard(deadline) {
        const urgencyColor = this.getUrgencyColor(deadline.daysLeft);
        return `
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-${urgencyColor}-500">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="text-sm font-medium">${this.escapeHtml(deadline.title)}</h4>
                        <p class="text-xs mt-1">Projeto: ${this.escapeHtml(deadline.projectName)}</p>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium 
                               bg-${urgencyColor}-100 
                               dark:bg-${urgencyColor}-900">
                        ${deadline.daysLeft} dias
                    </span>
                </div>
                <div class="flex justify-between mt-3">
                    <div class="text-xs">${this.formatDate(deadline.date)}</div>
                    <div class="text-xs">${deadline.progress}% completo</div>
                </div>
            </div>
        `;
    }

    getUrgencyColor(daysLeft) {
        if (daysLeft <= 2) return 'red';
        if (daysLeft <= 7) return 'yellow';
        return 'green';
    }
}

// Inicializa o dashboard quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new ProjectDashboard();
});