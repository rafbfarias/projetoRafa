const mongoose = require('mongoose');
const User = require('../models/user.model');

// Conectar ao MongoDB Atlas
mongoose.connect('mongodb+srv://rafbfarias:ecrb1QaKVbqHN8Wy@cluster0.swhzv.mongodb.net/faturacao_db?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('Conectado ao MongoDB');
    
    try {
        // Buscar todos os usuários
        const users = await User.find({}, '-password');
        
        console.log('\nUsuários cadastrados:');
        console.log('===================\n');
        
        if (users.length === 0) {
            console.log('Nenhum usuário encontrado no banco de dados.');
        } else {
            users.forEach((user, index) => {
                console.log(`Usuário ${index + 1}:`);
                console.log(`- ID: ${user._id}`);
                console.log(`- Nome Preferido: ${user.preferredName}`);
                console.log(`- Nome Completo: ${user.fullName}`);
                console.log(`- Email: ${user.email}`);
                console.log(`- Status: ${user.userStatus}`);
                console.log(`- Primeiro Acesso: ${user.isFirstAccess ? 'Sim' : 'Não'}`);
                console.log('-------------------\n');
            });
        }
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
    } finally {
        // Fechar conexão
        await mongoose.connection.close();
        console.log('Conexão com MongoDB fechada');
    }
})
.catch(error => {
    console.error('Erro ao conectar ao MongoDB:', error);
}); 