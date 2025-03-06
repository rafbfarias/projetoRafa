const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Rotas para usuários
router.post('/', userController.create);
router.get('/', userController.findAll);
router.get('/unit/:unitId', userController.findByUnit);
router.get('/status/:status', userController.findByStatus);
router.get('/:id', userController.findOne);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router;