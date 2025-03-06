const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const faturacaoRoutes = require('./routes/faturacao');
const userRoutes = require('./routes/user.routes');
const timesheetRoutes = require('./routes/timesheet.routes');
const unitRoutes = require('./routes/unit.routes');

const session = require('express-session');

const app = express();
// Modificar a porta para usar 3001 ou outra porta disponível
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/api', userRoutes);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Configuração de sessão (necessário para autenticação)
app.use(session({
  secret: 'sua_chave_secreta',
  resave: false,
  saveUninitialized: true
}));

// Modificar a conexão do MongoDB LOCAL
/*mongoose.connect('mongodb://localhost:27017/faturacao_db')
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));*/

// NÃO APAGAR A CONEXÃO DO MONGODB PARA ATLAS
mongoose.connect('mongodb+srv://rafbfarias:ecrb1QaKVbqHN8Wy@cluster0.swhzv.mongodb.net/faturacao_db?retryWrites=true&w=majority')
.then(() => console.log('Conectado ao MongoDB Atlas'))
.catch(err => console.error('Erro ao conectar ao MongoDB Atlas:', err));

// Rotas
app.use('/api/faturacao', faturacaoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/timesheet', timesheetRoutes);
app.use('/api/units', unitRoutes);

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/index.html');
  }
  next();
};

// Rota raiz
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard.html');
  } else {
    res.redirect('/index.html');
  }
});

// Protege o dashboard
app.get('/dashboard.html', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/dashboard.html'));
});

// Protege o index.html
app.get('/index.html', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rota específica para o login
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Servir arquivos estáticos - DEVE VIR DEPOIS das rotas específicas
app.use(express.static('public'));

// Credenciais dummy
const DUMMY_USER = {
  email: 'admin@admin.com',
  password: 'admin123'
};

// Login dummy
app.post('/api/auth/login', (req, res) => {
  console.log('Tentativa de login:', req.body); // Debug
  const { email, password } = req.body;
  
  if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
    req.session.user = { email };
    console.log('Login bem-sucedido'); // Debug
    res.json({ success: true });
  } else {
    console.log('Login falhou'); // Debug
    res.status(401).json({ 
      success: false, 
      message: 'Use: admin@admin.com / admin123' 
    });
  }
});

// Rota de logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Use estas credenciais:');
  console.log('Email: admin@admin.com');
  console.log('Senha: admin123');
});