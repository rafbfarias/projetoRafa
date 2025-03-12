const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');

// Rota de teste simples para verificar se o router está funcionando
router.get('/test', (req, res) => {
    console.log('Rota GET /test acessada com sucesso');
    return res.status(200).json({ success: true, message: 'Rota GET de teste funcionando!' });
});

// Rota de teste para POST
router.post('/test', (req, res) => {
    console.log('Rota POST /test acessada com sucesso');
    console.log('Body recebido:', req.body);
    return res.status(200).json({ success: true, message: 'Rota POST de teste funcionando!', data: req.body });
});

// Rota de teste para criar empresa e associação (sem autenticação para teste)
router.post('/test-create', async (req, res) => {
    try {
        console.log('Teste de criação de empresa');
        
        // Importar os modelos
        const Company = require('../models/company.model');
        const UserCompanyAssociation = require('../models/userCompanyAssociation.model');
        const mongoose = require('mongoose');
        
        // Criar empresa de teste
        const company = new Company({
            companyName: 'Empresa Teste',
            businessType: 'restaurant',
            companyVATNumber: '123456789',
            companyFullAddress: 'Rua Teste, 123',
            companyPostalCode: '12345-678',
            companyCity: 'Lisboa',
            companyCountry: 'Portugal',
            companyStatus: 'Draft',
            hasPlan: false
        });
        
        // Salvar empresa
        const savedCompany = await company.save();
        console.log('Empresa salva com sucesso:', savedCompany);
        
        // Criar id de usuário falso (só para teste)
        const mockUserId = new mongoose.Types.ObjectId();
        
        // Criar associação
        const association = new UserCompanyAssociation({
            userId: mockUserId,
            companyId: savedCompany._id,
            role: 'superadmin',
            status: 'active'
        });
        
        // Salvar associação
        const savedAssociation = await association.save();
        console.log('Associação criada com sucesso:', savedAssociation);
        
        // Verificar que a empresa foi criada e associada
        const associationCount = await UserCompanyAssociation.countDocuments();
        
        return res.status(200).json({
            success: true,
            message: 'Teste executado com sucesso',
            company: savedCompany,
            association: savedAssociation,
            associationCount: associationCount
        });
    } catch (error) {
        console.error('Erro no teste:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro no teste',
            error: error.message
        });
    }
});

// Rota para obter empresas do usuário logado
router.get('/user', companyController.getUserCompanies);

// Rota para obter detalhes de uma empresa específica
router.get('/:companyId', companyController.getCompanyById);

// Rota para criar uma nova empresa
router.post('/', companyController.createCompany);

// Rota para associar um plano a uma empresa
router.post('/plan', companyController.associatePlan);

module.exports = router; 