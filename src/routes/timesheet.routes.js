const express = require('express');
const router = express.Router();
const timesheetController = require('../controllers/timesheet.controller');

// Rotas para registros de ponto
router.post('/', timesheetController.create);
router.get('/', timesheetController.findAll);
router.get('/:id', timesheetController.findOne);
router.put('/:id', timesheetController.update);
router.delete('/:id', timesheetController.delete);

// Rotas para ações específicas
router.get('/user/:userId', timesheetController.findByUser);
router.get('/unit/:unit', timesheetController.findByUnit);

// Rota para exportação
router.get('/reports/export', timesheetController.export);

// Rota base de timesheet (placeholder)
router.get('/', (req, res) => {
    res.json({ message: 'Módulo de timesheet em desenvolvimento' });
});

module.exports = router; 