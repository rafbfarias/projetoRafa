const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const path = require('path');
const fs = require('fs');
const UserCompanyAssociation = require('../models/userCompanyAssociation.model');

// Rotas públicas (não precisam de autenticação)
router.get('/validate-token/:token', userController.validateToken);
router.post('/first-access', userController.setFirstAccessPassword);

// Rotas protegidas (precisam de autenticação)
router.use(authMiddleware);

// Rota para obter usuário atual e atualizar perfil
router.get('/me', userController.getCurrentUser);
router.post('/profile', userController.updateProfile);

// Rotas de busca específica
router.get('/unit/:unitId', userController.findByUnit);
router.get('/status/:status', userController.findByStatus);

// Rota de listagem (sem parâmetros)
router.get('/', userController.findAll);

// Rotas com ID
router.post('/', userController.create);
router.get('/:id', userController.findOne);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.post('/:id/resend-access-email', userController.resendAccessEmail);

// Rota para servir imagens de perfil (protegida por autenticação)
router.get('/profile-photo/:filename', (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Não autorizado'
            });
        }

        const filename = req.params.filename;
        console.log('Tentando acessar foto:', filename);

        // Garantir que o filename é seguro
        const sanitizedFilename = path.basename(filename);
        const filePath = path.join(__dirname, '../../uploads/users', sanitizedFilename);
        
        console.log('Caminho completo:', filePath);

        // Verificar se o arquivo existe
        if (!fs.existsSync(filePath)) {
            console.log('Arquivo não encontrado:', filePath);
            return res.sendFile(path.join(__dirname, '../../public/images/users/default-avatar.svg'));
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error('Erro ao servir foto:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao carregar foto'
        });
    }
});

// Adicionar esta rota
router.get('/company-association', authMiddleware, userController.getCompanyAssociation);

// Rota para verificar associação do usuário
router.get('/me/company-association', authMiddleware, async (req, res) => {
    try {
        const association = await UserCompanyAssociation.findOne({
            userId: req.user.id,
            status: 'active'
        });
        
        console.log('Associação encontrada:', association); // Debug
        
        res.json(association);
    } catch (error) {
        console.error('Erro ao buscar associação:', error);
        res.status(500).json({ message: 'Erro ao verificar associação' });
    }
});

module.exports = router;