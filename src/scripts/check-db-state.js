require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('../models/company.model');

async function checkDatabaseState() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
        }

        // Conectar ao MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Conectado ao MongoDB');

        // Contar total de empresas
        const totalCompanies = await Company.countDocuments();
        console.log(`Total de empresas: ${totalCompanies}`);

        // Contar empresas com businessType
        const companiesWithBusinessType = await Company.countDocuments({ businessType: { $exists: true } });
        console.log(`Empresas com businessType: ${companiesWithBusinessType}`);

        // Contar empresas sem businessType
        const companiesWithoutBusinessType = await Company.countDocuments({ businessType: { $exists: false } });
        console.log(`Empresas sem businessType: ${companiesWithoutBusinessType}`);

        // Mostrar distribuição dos tipos de negócio
        const businessTypes = await Company.aggregate([
            {
                $group: {
                    _id: '$businessType',
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('\nDistribuição dos tipos de negócio:');
        businessTypes.forEach(type => {
            console.log(`${type._id || 'Sem tipo'}: ${type.count}`);
        });

        await mongoose.connection.close();
        console.log('\nConexão com o MongoDB fechada');
        process.exit(0);
    } catch (error) {
        console.error('Erro ao verificar estado do banco:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

checkDatabaseState(); 