require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const faturacaoRoutes = require('./routes/faturacao.routes');
const userRoutes = require('./routes/user.routes');
const timesheetRoutes = require('./routes/timesheet.routes');
const unitRoutes = require('./routes/unit.routes');
const authRoutes = require('./routes/auth.routes');
const permissionTemplateRoutes = require('./routes/permissionTemplate.routes');
const productParentRoutes = require('./routes/productParent.routes');
const supplierRoutes = require('./routes/supplier.routes');
const productListRoutes = require('./routes/productList.routes');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();
// Modificar a porta para usar 3000
const PORT = process.env.PORT || 3000;

// Configurar o transporter do Nodemailer
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    },
    debug: true // Ativar logs de debug
});

// Verificar conexão do email
emailTransporter.verify()
    .then(() => {
        console.log('Conexão com servidor de email estabelecida');
    })
    .catch((error) => {
        console.error('Erro ao verificar conexão com servidor de email:', error);
    });

// URL base da aplicação (usar a mesma porta do servidor)
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Adicionar configurações ao app
app.locals.config = {
    emailTransporter,
    appUrl: APP_URL
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Middleware para upload de arquivos
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 10 * 1024 * 1024 // limite de 10MB
    },
    abortOnLimit: true
}));

// Verificar e criar pasta de upload se não existir
const productsUploadDir = path.join(__dirname, '../public/images/products');
if (!fs.existsSync(productsUploadDir)) {
    fs.mkdirSync(productsUploadDir, { recursive: true });
}

// Configuração de sessão
app.use(session({
    secret: 'sua_chave_secreta',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // em produção deve ser true
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Middleware para disponibilizar o usuário logado em todas as views
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Conectar ao MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Conectado ao MongoDB Atlas');
    })
    .catch((error) => {
        console.error('Erro ao conectar ao MongoDB Atlas:', error);
    });

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rotas que não precisam de autenticação
const publicPaths = [
    '/',
    '/index.html',
    '/login.html',
    '/api/auth/login',
    '/api/users/validate-token',
    '/api/users/first-access',
    '/pages/account/first-access.html',
    '/js/account/firstAccess.js',
    '/css/account/firstAccess.css',
    '/css/styles.css',
    '/dineo-logo.png',
    '/images/users/default-avatar.svg',
    '/pages/config/permission-templates.html',
    '/js/config/permissionTemplates.js'
];

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
    // Verificar se é um arquivo estático público
    if (req.path.startsWith('/css/') || 
        req.path.startsWith('/js/') || 
        req.path.startsWith('/images/') || 
        req.path.startsWith('/fonts/')) {
        return next();
    }

    // Verificar se o caminho é público
    if (publicPaths.some(path => req.path === path)) {
        return next();
    }

    // Se não estiver autenticado
    if (!req.session.user) {
        // Se for uma requisição AJAX/API
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(401).json({
                status: 'error',
                code: 'UNAUTHORIZED',
                message: 'Sessão expirada ou usuário não autenticado'
            });
        }
        // Se for uma requisição normal, redirecionar para o login
        return res.redirect('/login.html');
    }

    next();
};

// Aplicar middleware de autenticação
app.use(authMiddleware);

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/faturacao', faturacaoRoutes);
app.use('/api/timesheet', timesheetRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/permission-templates', permissionTemplateRoutes);
app.use('/api/products/parent', productParentRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products/list', productListRoutes);

// Rota raiz
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/pages/dashboard.html');
    } else {
        res.redirect('/login.html');
    }
});

// Protege o dashboard
app.get('/pages/dashboard.html', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, '../public/pages/dashboard.html'));
});

// Rota de login
app.get('/login.html', (req, res) => {
    if (req.session.user) {
        return res.redirect('/pages/dashboard.html');
    }
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});