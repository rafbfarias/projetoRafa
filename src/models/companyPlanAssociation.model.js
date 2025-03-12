const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Definir os tipos de plano como constantes para garantir consistência
const PLAN_TYPES = {
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise',
    CUSTOM: 'custom'
};

const CompanyPlanAssociationSchema = new mongoose.Schema({
    // Relacionamentos principais
    planId: {
        type: Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    
    // Informação sobre a associação
    typePlan: {
        type: String,
        required: true,
        enum: ['basic', 'professional', 'enterprise', 'custom']
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    
    // Informações financeiras
    price: {
        type: Number,
        required: true
    },
    discountCode: String,
    
    // Datas importantes
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: () => {
            const date = new Date();
            date.setFullYear(date.getFullYear() + 1);
            return date;
        }
    },
    
    // Metadados
    notes: String
}, {
    timestamps: true
});

// Índice composto para evitar duplicação
CompanyPlanAssociationSchema.index({ companyId: 1 }, { unique: true });

// Exportar tanto o modelo quanto os tipos de plano
module.exports = {
    CompanyPlanAssociation: mongoose.model('CompanyPlanAssociation', CompanyPlanAssociationSchema),
    PLAN_TYPES
};