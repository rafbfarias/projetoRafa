const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Básico', 'Profissional', 'Empresarial', 'Personalizado']
    },
    type: {
        type: String,
        required: true,
        enum: ['basic', 'professional', 'enterprise', 'custom']
    },
    maxUnits: {
        type: Number,
        required: true
    },
    maxUsers: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: function() {
            return this.type !== 'custom'; // Preço é obrigatório exceto para planos personalizados
        }
    },
    features: [{
        type: String
    }],
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Garantir que type seja único
PlanSchema.index({ type: 1 }, { unique: true });

module.exports = mongoose.model('Plan', PlanSchema);
