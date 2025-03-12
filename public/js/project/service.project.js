class ProjectService {
    constructor() {
        this.storageKey = 'projects';
    }

    getAll() {
        const projects = localStorage.getItem(this.storageKey);
        return projects ? JSON.parse(projects) : [];
    }

    getById(id) {
        const projects = this.getAll();
        return projects.find(project => project.id === id);
    }

    create(projectData) {
        const projects = this.getAll();
        const newProject = new Project(projectData);
        projects.push(newProject.toJSON());
        localStorage.setItem(this.storageKey, JSON.stringify(projects));
        return newProject;
    }

    update(id, projectData) {
        const projects = this.getAll();
        const index = projects.findIndex(project => project.id === id);
        if (index !== -1) {
            const updatedProject = new Project({ ...projects[index], ...projectData });
            projects[index] = updatedProject.toJSON();
            localStorage.setItem(this.storageKey, JSON.stringify(projects));
            return updatedProject;
        }
        return null;
    }

    delete(id) {
        const projects = this.getAll();
        const filteredProjects = projects.filter(project => project.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filteredProjects));
    }

    getProjectStats() {
        const projects = this.getAll();
        return {
            active: projects.filter(p => p.status === 'em-andamento').length,
            pending: projects.filter(p => p.status === 'planejamento').length,
            completed: projects.filter(p => p.status === 'concluído').length,
            total: projects.length
        };
    }

    getActivities() {
        const projects = this.getAll();
        const activities = [];
        
        projects.forEach(project => {
            if (project.activities) {
                activities.push(...project.activities.map(activity => ({
                    ...activity,
                    projectName: project.name
                })));
            }
        });

        return activities
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 4);
    }

    getUpcomingDeadlines() {
        const projects = this.getAll();
        const today = new Date();
        const deadlines = projects
            .filter(p => new Date(p.endDate) > today)
            .map(p => ({
                title: p.name,
                projectName: p.name,
                date: p.endDate,
                daysLeft: Math.ceil((new Date(p.endDate) - today) / (1000 * 60 * 60 * 24)),
                progress: p.progress
            }))
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .slice(0, 4);

        return deadlines;
    }
}