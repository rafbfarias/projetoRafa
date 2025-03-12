class Project {
    constructor(data = {}) {
        this.id = data.id || crypto.randomUUID();
        this.name = data.name || '';
        this.description = data.description || '';
        this.area = data.area || '';
        this.status = data.status || 'planejamento';
        this.startDate = data.startDate || null;
        this.endDate = data.endDate || null;
        this.priority = data.priority || 'media';
        this.budget = data.budget || 0;
        this.progress = data.progress || 0;
        this.manager = data.manager || null;
        this.team = data.team || [];
        this.objectives = data.objectives || '';
        this.deliverables = data.deliverables || '';
        this.successCriteria = data.successCriteria || '';
        this.visibility = data.visibility || 'público';
        this.tags = data.tags || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            area: this.area,
            status: this.status,
            startDate: this.startDate,
            endDate: this.endDate,
            priority: this.priority,
            budget: this.budget,
            progress: this.progress,
            manager: this.manager,
            team: this.team,
            objectives: this.objectives,
            deliverables: this.deliverables,
            successCriteria: this.successCriteria,
            visibility: this.visibility,
            tags: this.tags,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}