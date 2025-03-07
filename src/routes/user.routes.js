const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Rotas de primeiro acesso (mais específicas)
router.get('/validate-token/:token', userController.validateToken);
router.post('/first-access', userController.setFirstAccessPassword);

// Rotas de busca específica
router.get('/unit/:unitId', userController.findByUnit);
router.get('/status/:status', userController.findByStatus);

// Rota de listagem (sem parâmetros)
router.get('/', userController.findAll);

// Rotas com ID
router.post('/', userController.create);
router.get('/:id', userController.findOne);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.post('/:id/resend-access-email', userController.resendAccessEmail);

module.exports = router;