const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Configuração do nodemailer (ajuste conforme suas configurações de email)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Criar novo usuário
router.post('/', async (req, res) => {
    try {
        const userData = req.body;
        
        // Criar usuário com token de primeiro acesso
        const user = new User(userData);
        user.generateFirstAccessToken();

        await user.save();

        // Enviar email com link de primeiro acesso
        const accessLink = `${process.env.APP_URL}/pages/account/first-access.html?token=${user.firstAccessToken}`;
        
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: user.email,
            subject: 'Bem-vindo ao Sistema - Configure seu Acesso',
            html: `
                <h1>Bem-vindo ao Sistema!</h1>
                <p>Olá ${user.preferredName},</p>
                <p>Seu cadastro foi realizado com sucesso. Para acessar o sistema, você precisa definir sua senha.</p>
                <p>Clique no link abaixo para configurar seu acesso:</p>
                <p><a href="${accessLink}">${accessLink}</a></p>
                <p>Este link é válido por 24 horas.</p>
                <p>Se você não solicitou este cadastro, por favor ignore este email.</p>
            `
        });

        res.status(201).json({
            message: 'Usuário criado com sucesso. Email de configuração enviado.',
            userId: user._id
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Validar token de primeiro acesso
router.get('/validate-token/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            firstAccessToken: req.params.token,
            firstAccessTokenExpires: { $gt: Date.now() },
            isFirstAccess: true
        });

        if (!user) {
            return res.status(400).json({
                message: 'Token inválido ou expirado'
            });
        }

        res.json({
            preferredName: user.preferredName,
            email: user.email
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Definir senha no primeiro acesso
router.post('/first-access', async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            firstAccessToken: token,
            firstAccessTokenExpires: { $gt: Date.now() },
            isFirstAccess: true
        });

        if (!user) {
            return res.status(400).json({
                message: 'Token inválido ou expirado'
            });
        }

        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Limpar dados de primeiro acesso
        user.isFirstAccess = false;
        user.firstAccessToken = undefined;
        user.firstAccessTokenExpires = undefined;

        await user.save();

        res.json({
            message: 'Senha definida com sucesso'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Rota para obter a foto de perfil do usuário
router.get('/profile-photo/:filename', async (req, res) => {
    try {
        // Verificar se o usuário está autenticado via sessão OU token
        let isAuthenticated = false;
        let userId = null;
        
        // Verificar se há um token de autenticação
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
                isAuthenticated = true;
                userId = decoded.id;
            } catch (error) {
                console.log('Erro ao verificar token:', error);
                // Continuar para verificar a sessão
            }
        }
        
        // Se não autenticado por token, verificar a sessão
        if (!isAuthenticated && req.session && req.session.user) {
            isAuthenticated = true;
            userId = req.session.user._id;
        }
        
        // Se não autenticado de nenhuma forma, retornar erro
        if (!isAuthenticated) {
            return res.status(401).send('Acesso não autorizado');
        }
        
        // Obter o nome do arquivo da URL
        const { filename } = req.params;
        
        // Verificar se o arquivo pertence ao usuário (opcional, para maior segurança)
        if (filename.startsWith(userId)) {
            console.log('Arquivo pertence ao usuário autenticado');
        }
        
        // Definir o caminho para o arquivo
        const filePath = path.join(__dirname, '../../uploads/users/', filename);
        
        // Verificar se o arquivo existe
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        } else {
            console.log(`Arquivo não encontrado: ${filePath}`);
            return res.status(404).send('Imagem não encontrada');
        }
    } catch (error) {
        console.error('Erro ao buscar foto de perfil:', error);
        return res.status(500).send('Erro ao buscar imagem');
    }
});

module.exports = router; 