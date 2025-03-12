const Company = require('../models/company.model');
const UserCompanyAssociation = require('../models/userCompanyAssociation.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { CompanyPlanAssociation, PLAN_TYPES } = require('../models/companyPlanAssociation.model');
const Plan = require('../models/plan.model');

/**
 * Criar uma nova empresa e vincular o usuário como superadmin
 */
exports.createCompany = async (req, res) => {
    try {
        console.log('==== INICIANDO CRIAÇÃO DE EMPRESA ====');
        console.log('Método HTTP:', req.method);
        console.log('URL completa:', req.originalUrl);
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        console.log('Session:', req.session ? JSON.stringify(req.session, null, 2) : 'Sem sessão');

        // Verificar se o usuário está autenticado
        const userId = req.session?.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não autenticado',
                code: 'UNAUTHORIZED'
            });
        }

        // Verificar se o usuário já tem empresas associadas no onboarding
        const existingAssociations = await UserCompanyAssociation.find({ 
            userId: userId
        }).populate('companyId');
        
        if (existingAssociations && existingAssociations.length > 0) {
            // O usuário já tem empresas associadas, retornar a lista delas
            const companies = existingAssociations.map(assoc => assoc.companyId);
            
            return res.status(200).json({
                success: true,
                message: 'Usuário já possui empresas associadas',
                companies: companies,
                shouldSelectExisting: true
            });
        }

        // Validar dados recebidos
        const companyData = req.body;
        console.log('Validando dados da empresa:', {
            companyData,
            companyId: companyData.companyId,
            companyCode: companyData.companyCode,
            companyName: companyData.companyName,
            businessType: companyData.businessType,
            companyVATNumber: companyData.companyVATNumber,
            companyFullAddress: companyData.companyFullAddress,
            companyPostalCode: companyData.companyPostalCode,
            companyCity: companyData.companyCity,
            companyCountry: companyData.companyCountry,
            companyStatus: companyData.companyStatus
        });
        
        // Validar formato do companyId se não foi fornecido
        if (!companyData.companyId) {
            const timestamp = Date.now();
            companyData.companyId = `COMP-${timestamp}`;
        }

        // Gerar código único para a empresa se não foi fornecido
        if (!companyData.companyCode) {
            companyData.companyCode = await generateUniqueCompanyCode();
        }
        
        // Definir status como Draft por padrão (empresa sem plano)
        companyData.companyStatus = 'Draft';
        companyData.hasPlan = false;

        // Garantir que o país seja Portugal se não for fornecido
        if (!companyData.companyCountry) {
            companyData.companyCountry = 'Portugal';
        }
        
        // Criar a empresa com dados validados
        const company = new Company(companyData);

        // Validar cada campo individualmente
        console.log('Validando campos individualmente:', {
            companyId: {
                value: company.companyId,
                type: typeof company.companyId
            },
            companyCode: {
                value: company.companyCode,
                type: typeof company.companyCode
            },
            companyName: {
                value: company.companyName,
                type: typeof company.companyName
            },
            businessType: {
                value: company.businessType,
                type: typeof company.businessType
            },
            companyVATNumber: {
                value: company.companyVATNumber,
                type: typeof company.companyVATNumber
            },
            companyFullAddress: {
                value: company.companyFullAddress,
                type: typeof company.companyFullAddress
            },
            companyPostalCode: {
                value: company.companyPostalCode,
                type: typeof company.companyPostalCode
            },
            companyCity: {
                value: company.companyCity,
                type: typeof company.companyCity
            },
            companyCountry: {
                value: company.companyCountry,
                type: typeof company.companyCountry
            },
            companyStatus: {
                value: company.companyStatus,
                type: typeof company.companyStatus,
                allowedValues: ['Draft', 'Pendente', 'Ativa', 'Inativa']
            },
            hasPlan: {
                value: company.hasPlan,
                type: typeof company.hasPlan
            }
        });

        console.log('Tentando salvar empresa com dados validados:', company.toObject());

        try {
            // Salvar a empresa
            const savedCompany = await company.save();
            console.log('Empresa salva com sucesso:', savedCompany);

            // Criar associação entre usuário e empresa
            const userCompanyAssociation = new UserCompanyAssociation({
                userId: userId,
                companyId: savedCompany._id,
                role: 'superadmin',
                status: 'active',
                joinedAt: new Date()
            });

            // Salvar associação
            const savedAssociation = await userCompanyAssociation.save();
            console.log('Associação criada com sucesso:', savedAssociation);

            // Atualizar o usuário para adicionar a empresa ao array currentCompany
            const user = await User.findById(userId);
            if (user) {
                // Adicionar a empresa ao array currentCompany (se ainda não estiver)
                if (!user.currentCompany.includes(savedCompany._id)) {
                    user.currentCompany.push(savedCompany._id);
                }
                
                // Salvar as alterações no usuário
                await user.save();
                console.log('Usuário atualizado com sucesso após criação de empresa:', {
                    userId: user._id,
                    currentCompany: user.currentCompany
                });
            }

            // Atualizar a sessão do usuário com a empresa atual
            if (req.session && req.session.user) {
                req.session.user.companyId = savedCompany._id;
                req.session.user.companyRole = 'superadmin';
            }

            res.status(201).json({
                success: true,
                data: savedCompany,
                message: 'Empresa criada com sucesso',
                status: 'draft',
                needsPlan: true
            });
        } catch (saveError) {
            console.error('Erro ao salvar empresa:', {
                error: saveError.message,
                name: saveError.name,
                errors: saveError.errors ? Object.keys(saveError.errors).map(key => ({
                    field: key,
                    message: saveError.errors[key].message,
                    value: saveError.errors[key].value,
                    kind: saveError.errors[key].kind
                })) : null
            });
            throw saveError;
        }

    } catch (error) {
        console.error('Erro detalhado ao criar empresa:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });

        // Se for erro de validação do Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                code: 'VALIDATION_ERROR',
                details: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message,
                    value: err.value
                }))
            });
        }

        // Se for erro de duplicação (unique constraint)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Dados duplicados',
                code: 'DUPLICATE_ERROR',
                details: {
                    field: Object.keys(error.keyPattern)[0],
                    value: error.keyValue[Object.keys(error.keyPattern)[0]]
                }
            });
        }

        res.status(500).json({
            success: false,
            error: 'Erro ao criar empresa',
            code: 'INTERNAL_ERROR',
            details: error.message
        });
    }
};

/**
 * Gerar código único para a empresa
 */
async function generateUniqueCompanyCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = '';
        for (let i = 0; i < 4; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Verificar se o código já existe
        const existingCompany = await Company.findOne({ companyCode: code });
        if (!existingCompany) {
            isUnique = true;
        }
    }

    return code;
}

/**
 * Obter empresas associadas ao usuário atual
 */
exports.getUserCompanies = async (req, res) => {
    try {
        const userId = req.session?.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não autenticado'
            });
        }

        // Buscar associações do usuário com empresas
        const associations = await UserCompanyAssociation.find({
            userId: userId,
            status: 'active'
        });

        // Buscar empresas associadas
        const companyIds = associations.map(a => a.companyId);
        const companies = await Company.find({
            _id: { $in: companyIds }
        });

        // Filtrar empresas nulas
        const validCompanies = companies.filter(company => company != null);

        return res.status(200).json({
            success: true,
            data: validCompanies
        });

    } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar empresas',
            details: error.message
        });
    }
};

/**
 * Obter detalhes de uma empresa pelo ID
 */
exports.getCompanyById = async (req, res) => {
    try {
        // Verificar autenticação
        const userId = req.session?.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
                code: 'UNAUTHORIZED'
            });
        }

        const { companyId } = req.params;
        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'ID da empresa não fornecido',
                code: 'BAD_REQUEST'
            });
        }

        // Verificar se o usuário tem acesso à empresa
        const association = await UserCompanyAssociation.findOne({
            userId: userId,
            companyId: companyId
        });

        if (!association) {
            // Verificar se a empresa existe no banco de dados
            const company = await Company.findById(companyId);
            
            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: 'Empresa não encontrada',
                    code: 'NOT_FOUND'
                });
            }
            
            return res.status(403).json({
                success: false,
                message: 'Usuário não tem permissão para acessar esta empresa',
                code: 'FORBIDDEN'
            });
        }

        // Buscar dados da empresa
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Empresa não encontrada',
                code: 'NOT_FOUND'
            });
        }

        return res.status(200).json({
            success: true,
            company: company
        });
    } catch (error) {
        console.error('Erro ao buscar empresa:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar empresa',
            error: error.message,
            code: 'SERVER_ERROR'
        });
    }
};

/**
 * Associar um plano a uma empresa
 */
exports.associatePlan = async (req, res) => {
    try {
        const { planType, companyId } = req.body;
        
        // Log para debug
        console.log('Recebido:', planType);
        console.log('Deve ser um destes:', ['basic', 'professional', 'enterprise', 'custom']);
        console.log('É igual?', ['basic', 'professional', 'enterprise', 'custom'].includes(planType));

        // Normalizar o planType (remover espaços, converter para minúsculo)
        const normalizedPlanType = planType.trim().toLowerCase();
        console.log('planType normalizado:', normalizedPlanType);

        // Buscar plano
        const plan = await Plan.findOne({ type: normalizedPlanType });
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plano não encontrado'
            });
        }

        // Criar associação
        const planAssociation = new CompanyPlanAssociation({
            planId: plan._id,
            companyId: companyId,
            typePlan: normalizedPlanType, // Usar o valor normalizado
            status: 'active',
            price: plan.price || 0,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            notes: `Plano ${plan.name} ativado em ${new Date().toISOString()}`
        });

        console.log('Tentando salvar associação:', {
            planId: planAssociation.planId,
            companyId: planAssociation.companyId,
            typePlan: planAssociation.typePlan,
            validationError: planAssociation.validateSync()
        });

        await planAssociation.save();

        // Atualizar empresa
        await Company.findByIdAndUpdate(companyId, {
            hasPlan: true,
            companyStatus: 'Ativa'
        });

        return res.status(200).json({
            success: true,
            message: 'Plano associado com sucesso',
            data: planAssociation
        });

    } catch (error) {
        console.error('Erro detalhado:', {
            message: error.message,
            name: error.name,
            errors: error.errors,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            message: 'Erro ao associar plano',
            error: error.message
        });
    }
};

const CompanyPlanAssociationSchema = new mongoose.Schema({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    planId: {
        type: Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: Date,
    typePlan: {
        type: String,
        required: true,
        enum: ['basic', 'professional', 'enterprise', 'custom']
    },
    // outros campos relevantes...
}, {
    timestamps: true
}); 