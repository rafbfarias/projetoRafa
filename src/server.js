// ==========================================
// 1. IMPORTAÇÕES E CONFIGURAÇÕES BÁSICAS
// ==========================================
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const MongoStore = require('connect-mongo');

// Rotas
const faturacaoRoutes = require('./routes/faturacao.routes');
const userRoutes = require('./routes/user.routes');
const timesheetRoutes = require('./routes/timesheet.routes');
const unitRoutes = require('./routes/unit.routes');
const authRoutes = require('./routes/auth.routes');
const permissionTemplateRoutes = require('./routes/permissionTemplate.routes');
const productParentRoutes = require('./routes/productParent.routes');
const supplierRoutes = require('./routes/supplier.routes');
const productListRoutes = require('./routes/productList.routes');
const companyRoutes = require('./routes/company.routes');
const invitationRoutes = require('./routes/invitation.routes');

// Criar app Express e definir porta
const app = express();
const PORT = process.env.PORT || 3000;

// URL base da aplicação
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// ==========================================
// 2. CONFIGURAÇÃO DO NODEMAILER E MONGODB
// ==========================================

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

// Adicionar configurações ao app
app.locals.config = {
    emailTransporter,
    appUrl: APP_URL
};

// Conectar ao MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4 // Use IPv4, skip trying IPv6
})
.then(() => {
    console.log('Conectado ao MongoDB Atlas');
    
    // Verificar se a conexão está realmente estabelecida
    if (mongoose.connection.readyState === 1) {
        console.log('Estado da conexão: Conectado');
        
        // Listar as coleções disponíveis
        mongoose.connection.db.listCollections().toArray()
            .then(collections => {
                console.log('Coleções disponíveis:', collections.map(c => c.name));
            })
            .catch(err => console.error('Erro ao listar coleções:', err));
    } else {
        console.log('Estado da conexão:', mongoose.connection.readyState);
    }
})
.catch((error) => {
    console.error('Erro ao conectar ao MongoDB Atlas:', error);
    console.error('Detalhes do erro:', {
        name: error.name,
        message: error.message,
        code: error.code
    });
});

// Monitorar eventos de conexão
mongoose.connection.on('error', err => {
    console.error('Erro na conexão MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB desconectado');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconectado');
});

// ==========================================
// 3. MIDDLEWARES GLOBAIS
// ==========================================

// Configuração CORS
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middlewares de parsing para JSON e uploads
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
const usersUploadDir = path.join(__dirname, '../uploads/users');
if (!fs.existsSync(productsUploadDir)) {
    fs.mkdirSync(productsUploadDir, { recursive: true });
}
if (!fs.existsSync(usersUploadDir)) {
    fs.mkdirSync(usersUploadDir, { recursive: true });
}

// Configuração de sessão com MongoDB
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'sua_chave_secreta',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60,
        autoRemove: 'native',
        touchAfter: 24 * 3600
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
};

app.use(session(sessionConfig));

// Middleware para logs de debug - versão simplificada
app.use((req, res, next) => {
    // Ignorar logs para arquivos estáticos
    if (req.path.startsWith('/css/') || 
        req.path.startsWith('/js/') || 
        req.path.startsWith('/images/') || 
        req.path.startsWith('/fonts/')) {
        return next();
    }
    
    // Log resumido para rotas de API
    if (req.path.startsWith('/api/')) {
        console.log(`API Request: ${req.method} ${req.path}`);
        
        // Log detalhado apenas para login/logout
        if (req.path === '/api/auth/login' || req.path === '/api/auth/logout') {
            console.log('=== Auth Info ===');
            console.log('Email:', req.body.email || 'N/A');
            console.log('Session ID:', req.sessionID);
            console.log('Has Token:', !!req.headers.authorization);
            console.log('================');
        }
    } else {
        // Log simples para páginas
        console.log(`Page Request: ${req.method} ${req.path}`);
    }
    
    next();
});

// Middleware para disponibilizar o usuário logado em todas as views
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// ==========================================
// 4. ROTAS E ENDPOINTS DE TESTE
// ==========================================

// Endpoints para teste - devem vir ANTES das rotas API e middleware de autenticação
app.post('/api/companies/test', (req, res) => {
    console.log('Rota explícita /api/companies/test (POST) acessada');
    console.log('Body:', req.body);
    return res.status(200).json({ 
        success: true, 
        message: 'Rota de teste funcionando!',
        data: req.body
    });
});

// ==========================================
// 5. ROTAS PÚBLICAS (NÃO PROTEGIDAS)
// ==========================================

// Lista de caminhos públicos que não precisam de autenticação
const publicPaths = [
    '/',
    '/index.html',
    '/login.html',
    '/api/auth/login',
    '/api/users/validate-token',
    '/api/users/first-access',
    '/api/companies',
    '/api/companies/test',
    '/pages/account/first-access.html',
    '/js/account/firstAccess.js',
    '/css/account/firstAccess.css',
    '/css/styles.css',
    '/dineo-logo.png',
    '/images/users/default-avatar.svg',
    '/pages/config/permission-templates.html',
    '/js/config/permissionTemplates.js'
];

// Rotas públicas que NUNCA precisam de autenticação
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/invitations', invitationRoutes);

// Adicionar log para debug de rotas
app.use((req, res, next) => {
    console.log('Rota acessada:', {
        path: req.path,
        method: req.method,
        baseUrl: req.baseUrl
    });
    next();
});

// ==========================================
// 6. MIDDLEWARE DE AUTENTICAÇÃO
// ==========================================

// Middleware de autenticação que protege rotas não públicas
const authMiddleware = (req, res, next) => {
    console.log('Auth Check - Session:', req.session);
    console.log('Auth Check - Path:', req.path);
    console.log('Auth Check - Method:', req.method);
    console.log('Auth Check - Token:', req.headers.authorization);

    // Verificar se é um arquivo estático público
    if (req.path.startsWith('/css/') || 
        req.path.startsWith('/js/') || 
        req.path.startsWith('/images/') || 
        req.path.startsWith('/fonts/')) {
        return next();
    }

    // Verificar se é um caminho público
    if (req.path === '/api/auth/register' || 
        req.path.startsWith('/api/companies') || 
        publicPaths.some(path => req.path === path)) {
        return next();
    }

    // Se não estiver autenticado
    if (!req.session.user) {
        console.log('Usuário não autenticado');
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

// Aplicar middleware de autenticação para rotas não públicas
app.use(authMiddleware);

// ==========================================
// 7. ROTAS PROTEGIDAS (AUTENTICADAS)
// ==========================================

// Rotas da API que precisam de autenticação
app.use('/api/faturacao', faturacaoRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/permission-templates', permissionTemplateRoutes);
app.use('/api/product-parents', productParentRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/product-lists', productListRoutes);

// ==========================================
// 8. ROTAS DE NAVEGAÇÃO E REDIRECIONAMENTO
// ==========================================

// Rota raiz (redireciona baseado no status de autenticação)
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

// ==========================================
// 9. TRATAMENTO DE ERROS E 404
// ==========================================

// Middleware para rotas não encontradas (404)
app.use((req, res, next) => {
    console.log('Rota não encontrada:', req.path);
    
    // API routes should return JSON
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            status: 'error',
            code: 'NOT_FOUND',
            message: 'Recurso não encontrado'
        });
    }
    
    // HTML routes should redirect to 404 page or index
    res.status(404).redirect('/login.html');
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro na aplicação:', err);
    
    // API routes should return JSON
    if (req.path.startsWith('/api/')) {
        return res.status(500).json({
            status: 'error',
            code: 'SERVER_ERROR',
            message: 'Erro interno do servidor'
        });
    }
    
    // HTML routes should redirect to error page or index
    res.status(500).redirect('/login.html');
});

// ==========================================
// 10. INICIALIZAÇÃO DO SERVIDOR
// ==========================================

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});