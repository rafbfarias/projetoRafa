const { Supplier } = require('../models/supplier.model');

/**
 * Middleware para verificar se o usuário atual tem um Supplier associado à sua Company/Unit
 * Este middleware é usado para proteger rotas que só devem ser acessíveis para usuários
 * que representam um fornecedor (ou seja, sua empresa/unidade está cadastrada como fornecedora)
 */
module.exports = async (req, res, next) => {
  try {
    // Verificar se o usuário está autenticado
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
        details: 'É necessário fazer login para acessar este recurso'
      });
    }

    const user = req.session.user;
    
    // Verificar se o usuário tem company e unit
    if (!user.companyId || !user.unitId) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
        details: 'Usuário não está associado a uma empresa/unidade'
      });
    }

    // Buscar supplier associado à company/unit do usuário
    const supplier = await Supplier.findOne({
      $or: [
        { companyId: user.companyId, unitId: user.unitId },
        { companyId: user.companyId, unitId: null }
      ],
      active: true
    });

    // Se não houver supplier associado, negar acesso
    if (!supplier) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
        details: 'Sua empresa/unidade não está registrada como fornecedora'
      });
    }

    // Adicionar informações do supplier ao request para uso nos controllers
    req.supplier = supplier;
    
    // Continuar para o próximo middleware ou controller
    next();
  } catch (error) {
    console.error('Erro no middleware de autorização de supplier:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao verificar permissões de fornecedor',
      details: error.message
    });
  }
}; 