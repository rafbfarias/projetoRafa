const express = require('express');
const router = express.Router();
const Plan = require('../models/plan.model');

router.get('/type/:type', async (req, res) => {
    try {
        const plan = await Plan.findOne({ type: req.params.type });
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plano não encontrado'
            });
        }

        res.json({
            success: true,
            plan: plan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar plano',
            error: error.message
        });
    }
});

module.exports = router; 