const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

// Rota de login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuário pelo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                code: 'INVALID_CREDENTIALS',
                message: 'Email ou senha inválidos'
            });
        }

        // Verificar senha
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 'error',
                code: 'INVALID_CREDENTIALS',
                message: 'Email ou senha inválidos'
            });
        }

        // Criar sessão
        req.session.user = {
            id: user._id,
            email: user.email,
            preferredName: user.preferredName,
            userStatus: user.userStatus,
            photo: user.photo || '/images/users/default-avatar.svg'
        };

        // Responder com sucesso
        res.json({
            status: 'success',
            message: 'Login realizado com sucesso',
            user: {
                id: user._id,
                email: user.email,
                preferredName: user.preferredName,
                userStatus: user.userStatus,
                photo: user.photo || '/images/users/default-avatar.svg'
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            status: 'error',
            code: 'SERVER_ERROR',
            message: 'Erro ao realizar login'
        });
    }
});

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
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 'LOGOUT_ERROR',
                message: 'Erro ao fazer logout'
            });
        }
        res.json({
            status: 'success',
            message: 'Logout realizado com sucesso'
        });
    });
});

module.exports = router; 