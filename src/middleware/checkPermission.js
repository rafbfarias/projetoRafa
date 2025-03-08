const Permission = require('../models/permission.model');

/**
 * Middleware para verificar permissões
 * @param {string} requiredAction - Ação necessária (view, create, edit, delete, approve, export)
 * @param {string} sectionId - ID opcional da seção específica
 */
const checkPermission = (requiredAction, sectionId = null) => {
  return async (req, res, next) => {
    try {
      // Extrai o pageId da URL
      const pageId = req.path;
      
      // Busca permissões ativas do usuário
      const userPermissions = await Permission.findOne({
        refIdUser: req.user._id,
        permissionStatus: 'Ativa'
      }).populate('inheritedTemplates.templateId');

      if (!userPermissions) {
        return res.status(403).json({
          error: 'Usuário sem permissões ativas'
        });
      }

      // Verifica se tem permissão
      const hasPermission = await userPermissions.hasPermission(pageId, requiredAction, sectionId);

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Não autorizado para esta ação'
        });
      }

      // Se chegou aqui, tem permissão
      next();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      res.status(500).json({
        error: 'Erro ao verificar permissões'
      });
    }
  };
};

module.exports = checkPermission; 