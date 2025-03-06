const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unit.controller');

// Rotas para unidades
router.post('/', unitController.create);
router.get('/', unitController.findAll);
router.get('/:id', unitController.findOne);
router.put('/:id', unitController.update);
router.delete('/:id', unitController.delete);

module.exports = router; 