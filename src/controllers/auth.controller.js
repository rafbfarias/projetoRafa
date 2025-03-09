const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Supplier } = require('../models/supplier.model');

/**
 * Controle de login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email e senha são obrigatórios'
            });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuário não encontrado'
            });
        }
        
        // Verificar senha
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Credenciais inválidas'
            });
        }
        
        // Verificar se o usuário está ativo
        if (!user.active) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuário desativado. Contate o administrador.'
            });
        }
        
        // Gerar token JWT para API
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'sua_chave_secreta',
            { expiresIn: '24h' }
        );
        
        // Salvar usuário na sessão para o frontend
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            companyId: user.companyId,
            unitId: user.unitId,
            permissions: user.permissions
        };
        
        // Verificar se o usuário tem um fornecedor associado
        const hasSupplier = await Supplier.exists({
            $or: [
                { companyId: user.companyId, unitId: user.unitId },
                { companyId: user.companyId, unitId: null }
            ],
            active: true
        });
        
        // Adicionar informação se o usuário tem supplier associado
        req.session.user.hasSupplier = !!hasSupplier;
        
        return res.status(200).json({
            status: 'success',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                companyId: user.companyId,
                unitId: user.unitId,
                permissions: user.permissions,
                hasSupplier: !!hasSupplier
            }
        });
    } catch (error) {
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