const mongoose = require('mongoose');
require('dotenv').config();

// Importar os modelos
const UserCompanyAssociation = require('../models/userCompanyAssociation.model');
const User = require('../models/user.model');
const Company = require('../models/company.model');

async function createTestAssociation() {
    try {
        // Conectar ao MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Conectado ao MongoDB');

        // 1. Buscar um usuário existente (ajuste o email conforme necessário)
        const user = await User.findOne({ email: 'rafbfarias@gmail.com' });
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        console.log('Usuário encontrado:', user._id);

        // 2. Criar uma empresa de teste se não existir
        let company = await Company.findOne({ companyName: 'Empresa Teste' });
        if (!company) {
            company = new Company({
                companyName: 'Empresa Teste',
                companyCode: 'TEST',
                businessType: 'test',
                companyVATNumber: '123456789',
                companyFullAddress: 'Endereço Teste',
                companyPostalCode: '12345-678',
                companyCity: 'Cidade Teste',
                companyCountry: 'Portugal',
                companyStatus: 'Ativa',
                hasPlan: true
            });
            await company.save();
            console.log('Empresa criada:', company._id);
        }

        // 3. Criar a associação
        const association = new UserCompanyAssociation({
            userId: user._id,
            companyId: company._id,
            role: 'superadmin',
            status: 'active',
            joinedAt: new Date(),
            notes: 'Associação criada via script de teste'
        });

        await association.save();
        console.log('Associação criada com sucesso:', {
            userId: association.userId,
            companyId: association.companyId,
            role: association.role
        });

        // 4. Atualizar o usuário com a empresa atual
        user.currentCompany = company._id;
        await user.save();
        console.log('Usuário atualizado com a empresa atual');

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Conexão fechada');
    }
}

// Executar o script
createTestAssociation(); 