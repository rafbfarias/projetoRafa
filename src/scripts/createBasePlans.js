const mongoose = require('mongoose');
require('dotenv').config();
const Plan = require('../models/plan.model');

async function createBasePlans() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado ao MongoDB');

        // Planos base
        const basePlans = [
            {
                name: 'Básico',
                type: 'basic',
                maxUnits: 1,
                maxUsers: 5,
                price: 99,
                features: ['1 unidade', 'Até 5 usuários', 'Suporte por email'],
                description: 'Plano ideal para pequenos negócios',
                status: 'active'
            },
            {
                name: 'Profissional',
                type: 'professional',
                maxUnits: 3,
                maxUsers: 15,
                price: 199,
                features: ['Até 3 unidades', 'Até 15 usuários', 'Suporte prioritário'],
                description: 'Plano para negócios em crescimento',
                status: 'active'
            },
            {
                name: 'Empresarial',
                type: 'enterprise',
                maxUnits: 10,
                maxUsers: 999999,
                price: 499,
                features: ['Até 10 unidades', 'Usuários ilimitados', 'Suporte 24/7'],
                description: 'Plano completo para grandes empresas',
                status: 'active'
            },
            {
                name: 'Personalizado',
                type: 'custom',
                maxUnits: 999999,
                maxUsers: 999999,
                price: null,
                features: ['Unidades ilimitadas', 'Usuários ilimitados', 'Suporte dedicado'],
                description: 'Plano personalizado para necessidades específicas',
                status: 'active'
            }
        ];

        // Limpar planos existentes
        await Plan.deleteMany({});
        console.log('Planos anteriores removidos');

        // Criar novos planos
        const createdPlans = await Plan.create(basePlans);
        console.log('Planos criados:', createdPlans);

    } catch (error) {
        console.error('Erro ao criar planos:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Conexão fechada');
    }
}

// Executar o script
createBasePlans(); 