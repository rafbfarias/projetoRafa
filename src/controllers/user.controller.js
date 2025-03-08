const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Função centralizada para tratamento de erros
const handleError = (error, res) => {
    console.error('Erro detalhado:', error);

    if (error.code === 11000) {
        // Log detalhado para debug
        console.log('Detalhes do erro de duplicação:', {
            code: error.code,
            keyPattern: error.keyPattern,
            keyValue: error.keyValue
        });

        return res.status(400).json({
            status: 'error',
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Este email já está cadastrado no sistema.',
            details: {
                email: error.keyValue.email,
                suggestion: 'Por favor, tente com outro email ou use a opção de recuperação de senha caso seja seu email.'
            }
        });
    }

    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
            status: 'error',
            code: 'VALIDATION_ERROR',
            message: 'Erro de validação',
            details: messages
        });
    }

    // Log do erro completo para debug
    console.error('Erro completo:', {
        name: error.name,
        message: error.message,
        stack: error.stack
    });

    res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro interno do servidor. Por favor, tente novamente.',
        requestId: Date.now() // Identificador único para rastrear o erro nos logs
    });
};

// Controlador de usuários
const userController = {
    // Criar novo usuário
    async create(req, res) {
        try {
            console.log('Iniciando criação de usuário:', {
                email: req.body.email,
                preferredName: req.body.preferredName
            });

            // Verificar se email já existe
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                console.log('Email já existe:', req.body.email);
                return res.status(400).json({
                    status: 'error',
                    code: 'EMAIL_ALREADY_EXISTS',
                    message: 'Este email já está cadastrado no sistema.',
                    details: {
                        email: req.body.email,
                        suggestion: 'Por favor, tente com outro email ou use a opção de recuperação de senha caso seja seu email.'
                    }
                });
            }

            const user = new User(req.body);
            user.generateFirstAccessToken();
            
            console.log('Tentando salvar usuário:', {
                email: user.email,
                preferredName: user.preferredName,
                isFirstAccess: user.isFirstAccess
            });

            await user.save();

            // Enviar email de primeiro acesso
            try {
                const transporter = req.app.locals.config.emailTransporter;
                if (!transporter) {
                    console.error('Transporter não configurado');
                    throw new Error('Configuração de email não encontrada');
                }

                const appUrl = req.app.locals.config.appUrl;
                if (!appUrl) {
                    console.error('URL do app não configurada');
                    throw new Error('URL do aplicativo não configurada');
                }

                const accessLink = `${appUrl}/pages/account/first-access.html?token=${user.firstAccessToken}`;

                console.log('Tentando enviar email para:', user.email);
                console.log('Link de acesso:', accessLink);

                const mailOptions = {
                    from: {
                        name: 'Sistema de Gestão',
                        address: transporter.options.auth.user
                    },
                    to: user.email,
                    subject: 'Bem-vindo ao Sistema',
                    html: `
                        <h1>Bem-vindo ao Sistema</h1>
                        <p>Olá ${user.preferredName},</p>
                        <p>Seu cadastro foi realizado com sucesso. Clique no link abaixo para configurar seu acesso:</p>
                        <p><a href="${accessLink}">${accessLink}</a></p>
                        <p>Este link é válido por 24 horas.</p>
                        <p>Se você não solicitou este cadastro, por favor ignore este email.</p>
                    `
                };

                console.log('Configurações do email:', {
                    from: mailOptions.from,
                    to: mailOptions.to,
                    subject: mailOptions.subject
                });

                const info = await transporter.sendMail(mailOptions);
                console.log('Email enviado com sucesso:', info);

                res.status(201).json({
                    message: 'Usuário criado com sucesso. Email de acesso enviado.',
                    user: {
                        id: user._id,
                        preferredName: user.preferredName,
                        email: user.email,
                        status: user.userStatus
                    }
                });
            } catch (emailError) {
                console.error('Erro detalhado ao enviar email:', {
                    error: emailError,
                    stack: emailError.stack,
                    code: emailError.code,
                    command: emailError.command,
                    response: emailError.response
                });

                // Mesmo que o email falhe, o usuário foi criado
                res.status(201).json({
                    message: 'Usuário criado com sucesso, mas houve um erro ao enviar o email de acesso. Entre em contato com o suporte.',
                    error: emailError.message,
                    user: {
                        id: user._id,
                        preferredName: user.preferredName,
                        email: user.email,
                        status: user.userStatus
                    }
                });
            }
        } catch (error) {
            handleError(error, res);
        }
    },

    // Buscar todos os usuários
    async findAll(req, res) {
        try {
            console.log('Iniciando busca de usuários...');
            
            // Verificar conexão com o banco
            if (mongoose.connection.readyState !== 1) {
                console.error('Banco de dados não está conectado');
                throw new Error('Erro de conexão com o banco de dados');
            }

            // Buscar usuários
            console.log('Executando query no banco...');
            const users = await User.find({})
                .select('-password -firstAccessToken -firstAccessTokenExpires')
                .lean()
                .exec();
            
            console.log('Query executada, processando resultados...');
            console.log('Usuários encontrados (raw):', users);

            // Formatar os dados para o frontend
            const formattedUsers = users.map(user => ({
                _id: user._id,
                preferredName: user.preferredName || 'Sem nome',
                fullName: user.fullName || '',
                email: user.email,
                currentUnit: user.currentUnit || 'Não definida',
                userStatus: user.userStatus || 'Pendente',
                createdAt: user.createdAt,
                photo: user.photo || '/images/users/default-avatar.svg'
            }));

            console.log(`${formattedUsers.length} usuários formatados com sucesso`);
            console.log('Primeiro usuário formatado (exemplo):', formattedUsers[0]);

            res.json(formattedUsers);
        } catch (error) {
            console.error('Erro detalhado ao buscar usuários:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // Se for erro de conexão, retornar mensagem específica
            if (error.message.includes('conexão')) {
                return res.status(503).json({
                    status: 'error',
                    code: 'DATABASE_CONNECTION_ERROR',
                    message: 'Erro de conexão com o banco de dados. Tente novamente em alguns instantes.'
                });
            }

            handleError(error, res);
        }
    },

    // Buscar usuário por ID
    async findOne(req, res) {
        try {
            const user = await User.findById(req.params.id, '-password');
        if (!user) {
                return res.status(404).json({
                    message: 'Usuário não encontrado'
                });
        }
        res.json(user);
    } catch (error) {
            handleError(error, res);
        }
    },

    // Buscar usuários por unidade
    async findByUnit(req, res) {
        try {
            const users = await User.find({ currentUnit: req.params.unitId }, '-password');
            res.json(users);
        } catch (error) {
            handleError(error, res);
        }
    },

    // Buscar usuários por status
    async findByStatus(req, res) {
        try {
            const users = await User.find({ userStatus: req.params.status }, '-password');
            res.json(users);
        } catch (error) {
            handleError(error, res);
        }
    },

    // Atualizar usuário
    async update(req, res) {
        try {
            // Se estiver atualizando o email, verificar se já existe
            if (req.body.email) {
                const existingUser = await User.findOne({
                    email: req.body.email,
                    _id: { $ne: req.params.id }
                });
                if (existingUser) {
                    return res.status(400).json({
                        message: 'Este email já está cadastrado. Por favor, use outro email.'
                    });
                }
            }

            const user = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
                { new: true, runValidators: true }
            );

            if (!user) {
                return res.status(404).json({
                    message: 'Usuário não encontrado'
                });
            }

            res.json({
                message: 'Usuário atualizado com sucesso',
                user
            });
        } catch (error) {
            handleError(error, res);
        }
    },

    // Deletar usuário
    async delete(req, res) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({
                    message: 'Usuário não encontrado'
                });
            }
            res.json({
                message: 'Usuário deletado com sucesso'
            });
    } catch (error) {
            handleError(error, res);
        }
    },

    // Validar token de primeiro acesso
    async validateToken(req, res) {
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
            handleError(error, res);
        }
    },

    // Definir senha no primeiro acesso
    async setFirstAccessPassword(req, res) {
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
            handleError(error, res);
        }
    },

    // Reenviar email de primeiro acesso
    async resendAccessEmail(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({
                    message: 'Usuário não encontrado'
                });
            }

            // Gerar novo token
            user.generateFirstAccessToken();
            await user.save();

            // Enviar email com novo link
            const transporter = req.app.locals.config.emailTransporter;
            const appUrl = req.app.locals.config.appUrl;
            const accessLink = `${appUrl}/pages/account/first-access.html?token=${user.firstAccessToken}`;

            await transporter.sendMail({
                from: transporter.options.auth.user,
                to: user.email,
                subject: 'Novo Link de Acesso - Sistema',
                html: `
                    <h1>Novo Link de Acesso</h1>
                    <p>Olá ${user.preferredName},</p>
                    <p>Um novo link de acesso foi gerado para você. Clique abaixo para configurar seu acesso:</p>
                    <p><a href="${accessLink}">${accessLink}</a></p>
                    <p>Este link é válido por 24 horas.</p>
                    <p>Se você não solicitou este link, por favor ignore este email.</p>
                `
            });

            res.json({
                message: 'Novo email de acesso enviado com sucesso'
            });
    } catch (error) {
            handleError(error, res);
        }
    }
};

module.exports = userController; 