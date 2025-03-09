const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const authController = require('../controllers/auth.controller');

// Rota de login
router.post('/login', authController.login);

// Rota para obter usuário logado
router.get('/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            status: 'error',
            code: 'UNAUTHORIZED',
            message: 'Usuário não autenticado'
        });
    }

    res.json({
        status: 'success',
        user: req.session.user
    });
});

// Rota de logout
router.get('/logout', authController.logout);

// Rota para verificar se o usuário tem um supplier associado
router.get('/check-supplier', authController.checkSupplier);

module.exports = router; 