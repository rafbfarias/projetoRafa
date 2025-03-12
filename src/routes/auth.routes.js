const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const authController = require('../controllers/auth.controller');

// Rota de login
router.post('/login', async (req, res) => {
    try {
        // Garantir que estamos enviando JSON
        res.setHeader('Content-Type', 'application/json');
        
        // Chamar o controller
        await authController.login(req, res);
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro interno do servidor'
        });
    }
});

// Rota de registro
router.post('/register', authController.register);

// Rota para inicializar sessão
router.post('/init-session', authController.initSession);

// Rota para obter usuário logado
router.get('/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            status: 'error',
            message: 'Usuário não autenticado'
        });
    }

    res.json({
        status: 'success',
        user: req.session.user
    });
});

// Rota de logout
router.post('/logout', authController.logout);

// Rota para verificar se o usuário tem um supplier associado
router.get('/check-supplier', authController.checkSupplier);

module.exports = router; 