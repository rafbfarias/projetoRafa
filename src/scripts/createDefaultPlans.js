const mongoose = require('mongoose');
const Plan = require('../models/plan.model');

const defaultPlans = [
    {
        name: 'Básico',
        type: 'basic',
        basePrice: 99
    },
    {
        name: 'Profissional',
        type: 'professional',
        basePrice: 199
    },
    {
        name: 'Empresarial',
        type: 'enterprise',
        basePrice: 499
    },
    {
        name: 'Personalizado',
        type: 'custom',
        basePrice: 0
    }
];

async function createDefaultPlans() {
    try {
        for (const plan of defaultPlans) {
            await Plan.findOneAndUpdate(
                { type: plan.type },
                plan,
                { upsert: true, new: true }
            );
        }
        console.log('Planos padrão criados/atualizados com sucesso');
    } catch (error) {
        console.error('Erro ao criar planos:', error);
    }
}

module.exports = createDefaultPlans; 