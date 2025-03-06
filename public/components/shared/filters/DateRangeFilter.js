class DateRangeFilter extends HTMLElement {
    constructor() {
        super();
        this.startDate = '';
        this.endDate = '';
        this.lastRecordDate = null;
    }

    async connectedCallback() {
        await this.loadLastRecordDate();
        this.render();
        this.setupEventListeners();
    }

    async loadLastRecordDate() {
        try {
            // TODO: Substituir pela chamada real à API
            const response = await fetch('/api/finance/last-record-date');
            const data = await response.json();
            this.lastRecordDate = new Date(data.lastRecordDate);
        } catch (error) {
            console.error('Erro ao carregar última data:', error);
            this.lastRecordDate = new Date(); // Usa data atual como fallback
        }
    }

    render() {
        this.innerHTML = `
            <div class="dashboard-card p-4 mb-6">
                <div class="flex flex-wrap items-center gap-6">
                    <div class="flex items-center gap-6">
                        <h2 class="text-lg font-semibold">Filter:</h2>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2">
                                <label class="text-sm font-medium whitespace-nowrap">DE:</label>
                                <input type="date" id="startDate" class="form-input rounded-md">
                            </div>
                            <div class="flex items-center gap-2">
                                <label class="text-sm font-medium whitespace-nowrap">ATÉ:</label>
                                <input type="date" id="endDate" class="form-input rounded-md">
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <button data-period="day" class="btn btn-secondary">
                            Último Dia
                        </button>
                        <button data-period="week" class="btn btn-secondary">
                            Semana
                        </button>
                        <button data-period="month" class="btn btn-secondary">
                            Mês
                        </button>
                        <button data-period="quarter" class="btn btn-secondary">
                            Trimestre
                        </button>
                        <button data-period="year" class="btn btn-secondary">
                            Ano
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos específicos
        const style = document.createElement('style');
        style.textContent = `
            .form-input {
                background-color: var(--bg-secondary);
                border: 1px solid var(--border-color);
                color: var(--text-primary);
                padding: 0.5rem;
                transition: border-color 0.2s;
            }

            .form-input:focus {
                outline: none;
                border-color: var(--brand-600);
                box-shadow: 0 0 0 2px var(--brand-200);
            }

            label {
                color: var(--text-secondary);
            }

            h2 {
                color: var(--text-primary);
            }
        `;
        this.appendChild(style);
    }

    setupEventListeners() {
        const startDateInput = this.querySelector('#startDate');
        const endDateInput = this.querySelector('#endDate');
        const periodButtons = this.querySelectorAll('[data-period]');

        startDateInput.addEventListener('change', () => this.handleDateChange());
        endDateInput.addEventListener('change', () => this.handleDateChange());

        periodButtons.forEach(button => {
            button.addEventListener('click', () => {
                const period = button.getAttribute('data-period');
                this.handlePeriodSelection(period);
            });
        });
    }

    handleDateChange() {
        const startDate = this.querySelector('#startDate').value;
        const endDate = this.querySelector('#endDate').value;
        
        if (startDate && endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.dispatchFilterEvent();
        }
    }

    handlePeriodSelection(period) {
        const endDate = this.lastRecordDate || new Date();
        let startDate = new Date(endDate);

        switch (period) {
            case 'day':
                // Mantém o mesmo dia
                break;
            case 'week':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(endDate.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
        }

        this.startDate = this.formatDate(startDate);
        this.endDate = this.formatDate(endDate);
        
        this.querySelector('#startDate').value = this.startDate;
        this.querySelector('#endDate').value = this.endDate;
        
        this.dispatchFilterEvent();
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    dispatchFilterEvent() {
        const event = new CustomEvent('dateFilterChange', {
            detail: {
                startDate: this.startDate,
                endDate: this.endDate
            },
            bubbles: true
        });
        this.dispatchEvent(event);
    }
}

customElements.define('date-range-filter', DateRangeFilter); 