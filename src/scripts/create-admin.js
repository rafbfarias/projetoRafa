const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
require('dotenv').config();

async function createAdminUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Verificar se já existe
        const existingUser = await User.findOne({ email: 'admin@admin.com' });
        if (existingUser) {
            console.log('Usuário admin já existe');
            process.exit(0);
        }

        // Criar hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Criar usuário admin
        const adminUser = new User({
            email: 'admin@admin.com',
            password: hashedPassword,
            preferredName: 'Administrador',
            userStatus: 'Ativa',
            isFirstAccess: false,
            idDocumentNumber: 'ADMIN-' + Date.now() // Valor único para evitar conflitos
        });

        await adminUser.save();
        console.log('Usuário admin criado com sucesso');
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createAdminUser(); 