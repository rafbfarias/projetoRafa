const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Supplier } = require('../models/supplier.model');
const UserCompanyAssociation = require('../models/userCompanyAssociation.model');

/**
 * Controle de login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Verificar se os campos foram preenchidos
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email e senha são obrigatórios'
            });
        }
        
        // 2. Verificar se o usuário existe (ANTES da verificação de senha)
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log(`Tentativa de login com usuário inexistente: ${email}`);
            return res.status(404).json({
                status: 'error',
                message: 'Usuário não encontrado'
            });
        }
        
        // 3. Verificar se a senha está correta
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log(`Senha incorreta para o usuário: ${email}`);
            return res.status(401).json({
                status: 'error',
                message: 'Senha incorreta'
            });
        }
        
        // 4. Verificar se o usuário está ativo
        if (user.userStatus === 'Inativa') {
            return res.status(401).json({
                status: 'error',
                code: 'USER_INACTIVE',
                message: 'Usuário desativado. Contate o administrador.'
            });
        }
        
        // Gerar token JWT para API
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'sua_chave_secreta',
            { expiresIn: '24h' }
        );
        
        // Salvar usuário na sessão para o frontend (adicionando o campo photo)
        req.session.user = {
            _id: user._id,
            name: user.preferredName || user.fullName,
            email: user.email,
            companyId: user.idRefCompany,
            unitId: user.idRefUnit,
            permissions: user.idRefPermission,
            onboardingCompleted: user.onboardingCompleted,
            photo: user.photo
        };
        
        // Verificar se o usuário tem um fornecedor associado
        const hasSupplier = await Supplier.exists({
            $or: [
                { companyId: user.idRefCompany, unitId: user.idRefUnit },
                { companyId: user.idRefCompany, unitId: null }
            ],
            active: true
        });
        
        // Adicionar informação se o usuário tem supplier associado
        req.session.user.hasSupplier = !!hasSupplier;
        
        // Após autenticar o usuário, verificar associação ativa com empresa
        const activeAssociation = await UserCompanyAssociation.findOne({
            userId: user._id,
            status: 'active'
        }).populate('companyId');

        console.log('Login bem sucedido para:', email);
        console.log('Associação ativa:', activeAssociation ? 'Sim' : 'Não');

        // Preparar resposta com dados da associação
        const userData = {
            ...user.toObject(),
            companyAssociation: activeAssociation ? {
                companyId: activeAssociation.companyId._id,
                companyName: activeAssociation.companyId.name,
                role: activeAssociation.role,
                status: activeAssociation.status
            } : null
        };

        // Garantir que a sessão seja salva antes de responder
        await new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        return res.status(200).json({
            status: 'success',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro no servidor',
            details: error.message
        });
    }
};

/**
 * Logout
 */
exports.logout = (req, res) => {
    req.session.destroy();
    res.status(200).json({
        status: 'success',
        message: 'Logout realizado com sucesso'
    });
};

/**
 * Verifica se o usuário tem um supplier associado
 */
exports.checkSupplier = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não autenticado'
            });
        }
        
        const { companyId, unitId } = req.session.user;
        
        // Verificar se o usuário tem um fornecedor associado
        const supplier = await Supplier.findOne({
            $or: [
                { companyId, unitId },
                { companyId, unitId: null }
            ],
            active: true
        });
        
        return res.status(200).json({
            success: true,
            hasSupplier: !!supplier,
            supplier: supplier ? {
                _id: supplier._id,
                name: supplier.name,
                email: supplier.email
            } : null
        });
    } catch (error) {
        console.error('Erro ao verificar supplier:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao verificar supplier',
            details: error.message
        });
    }
};

/**
 * Registro de novo usuário
 */
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        console.log('Tentativa de registro:', { fullName, email });
        
        // Validar campos obrigatórios
        if (!fullName || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Nome completo, e-mail e senha são obrigatórios'
            });
        }
        
        // Verificar se o e-mail já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Este e-mail já está cadastrado. Por favor, faça login.',
                isExistingUser: true
            });
        }
        
        // Criar hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Criar novo usuário
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            preferredName: fullName,
            userStatus: 'Pendente',
            onboardingCompleted: false,
            isFirstAccess: true,
            idDocumentNumber: `USER-${Date.now()}`,
            dependents: 0
        });
        
        await newUser.save();
        console.log('Novo usuário criado:', newUser._id);
        
        // Gerar token JWT
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET || 'sua_chave_secreta',
            { expiresIn: '24h' }
        );
        
        // Criar sessão para o novo usuário (adicionando o campo photo)
        req.session.user = {
            _id: newUser._id,
            name: newUser.fullName,
            email: newUser.email,
            preferredName: newUser.fullName,
            onboardingCompleted: false,
            isFirstAccess: true,
            userStatus: 'Pendente',
            photo: newUser.photo
        };
        
        // Garantir que a sessão seja salva
        await new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) {
                    console.error('Erro ao salvar sessão:', err);
                    reject(err);
                } else {
                    console.log('Sessão salva com sucesso');
                    resolve();
                }
            });
        });
        
        return res.status(201).json({
            status: 'success',
            message: 'Usuário criado com sucesso',
            token,
            user: {
                id: newUser._id,
                name: newUser.fullName,
                email: newUser.email,
                preferredName: newUser.fullName,
                onboardingCompleted: false,
                isFirstAccess: true,
                userStatus: 'Pendente',
                photo: newUser.photo
            }
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro ao criar usuário. Por favor, tente novamente.',
            details: error.message
        });
    }
};

/**
 * Inicializa a sessão do usuário
 */
exports.initSession = async (req, res) => {
    try {
        console.log('Iniciando sessão - Headers:', req.headers);
        
        // Verificar o token do header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Token não fornecido ou formato inválido');
            return res.status(401).json({
                status: 'error',
                message: 'Token não fornecido ou formato inválido'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('Token não encontrado após split');
            return res.status(401).json({
                status: 'error',
                message: 'Token não fornecido'
            });
        }
        
        try {
            // Verificar e decodificar o token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
            console.log('Token decodificado:', decoded);
            
            // Buscar usuário no banco
            const user = await User.findById(decoded.id)
                .select('-password')
                .lean();

            if (!user) {
                console.log('Usuário não encontrado:', decoded.id);
                return res.status(404).json({
                    status: 'error',
                    message: 'Usuário não encontrado'
                });
            }

            console.log('Usuário encontrado:', user._id);

            // Verificar se o usuário tem um fornecedor associado
            const hasSupplier = await Supplier.exists({
                $or: [
                    { companyId: user.idRefCompany, unitId: user.idRefUnit },
                    { companyId: user.idRefCompany, unitId: null }
                ],
                active: true
            });
            
            // Criar sessão completa (adicionando o campo photo)
            const sessionUser = {
                _id: user._id,
                name: user.fullName,
                email: user.email,
                preferredName: user.preferredName,
                userStatus: user.userStatus,
                onboardingCompleted: user.onboardingCompleted,
                isFirstAccess: user.isFirstAccess,
                companyId: user.idRefCompany,
                unitId: user.idRefUnit,
                permissions: user.idRefPermission,
                hasSupplier: !!hasSupplier,
                photo: user.photo
            };

            // Atribuir à sessão
            req.session.user = sessionUser;
            
            // Garantir que a sessão seja salva
            await new Promise((resolve, reject) => {
                req.session.save(err => {
                    if (err) {
                        console.error('Erro ao salvar sessão:', err);
                        reject(err);
                    } else {
                        console.log('Sessão salva com sucesso');
                        resolve();
                    }
                });
            });
            
            // Verificar se a sessão foi realmente salva
            if (!req.session.user) {
                throw new Error('Falha ao salvar sessão');
            }
            
            return res.status(200).json({
                status: 'success',
                message: 'Sessão inicializada com sucesso',
                user: sessionUser
            });
            
        } catch (jwtError) {
            console.error('Erro ao verificar token:', jwtError);
            return res.status(401).json({
                status: 'error',
                message: jwtError.name === 'TokenExpiredError' 
                    ? 'Token expirado' 
                    : 'Token inválido'
            });
        }
    } catch (error) {
        console.error('Erro ao inicializar sessão:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro ao inicializar sessão',
            details: error.message
        });
    }
}; 