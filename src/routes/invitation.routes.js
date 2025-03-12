const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitation.controller');

// Log para debug
router.use((req, res, next) => {
    console.log('Rota de convites acessada:', {
        path: req.path,
        method: req.method,
        session: req.session
    });
    next();
});

// Rotas de convites
router.get('/pending', invitationController.getPendingInvitations);
router.get('/validate/:code', invitationController.validateInvitation);
router.post('/accept/:code', invitationController.acceptInvitation);
router.post('/reject/:code', invitationController.rejectInvitation);

module.exports = router; 