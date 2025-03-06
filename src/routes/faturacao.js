const express = require('express');
const router = express.Router();
const faturacaoController = require('../controllers/faturacaoController');

// Rotas
router.get('/', faturacaoController.getAllLancamentos);
router.get('/:id', faturacaoController.getLancamento);
router.post('/', faturacaoController.createLancamento);
router.put('/:id', faturacaoController.updateLancamento);
router.delete('/:id', faturacaoController.deleteLancamento);

module.exports = router;