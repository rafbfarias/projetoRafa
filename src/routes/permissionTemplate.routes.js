const express = require('express');
const router = express.Router();
const permissionTemplateController = require('../controllers/permissionTemplate.controller');

// Rotas para templates de permissão
router.post('/', permissionTemplateController.create);
router.get('/', permissionTemplateController.findAll);
router.get('/areas', permissionTemplateController.listAreas);
router.get('/system-pages', permissionTemplateController.listSystemPages);
router.get('/:id', permissionTemplateController.findOne);
router.put('/:id', permissionTemplateController.update);
router.delete('/:id', permissionTemplateController.delete);

module.exports = router; 