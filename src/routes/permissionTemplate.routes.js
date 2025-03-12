const express = require('express');
const router = express.Router();
const permissionTemplateController = require('../controllers/permissionTemplate.controller');
const authMiddleware = require('../middleware/auth.middleware');
const checkPermission = require('../middleware/checkPermission');

// Proteger todas as rotas
router.use(authMiddleware);

// Rotas para templates de permissão (requerem permissão específica)
router.post('/', checkPermission('create'), permissionTemplateController.create);
router.get('/', checkPermission('view'), permissionTemplateController.findAll);
router.get('/areas', permissionTemplateController.listAreas);
router.get('/system-pages', permissionTemplateController.listSystemPages);
router.get('/:id', permissionTemplateController.findOne);
router.put('/:id', permissionTemplateController.update);
router.delete('/:id', permissionTemplateController.delete);

module.exports = router; 