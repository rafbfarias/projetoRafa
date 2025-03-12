const Invitation = require('../models/invitation.model');
const UserCompanyAssociation = require('../models/userCompanyAssociation.model');
const Company = require('../models/company.model');

exports.getPendingInvitations = async (req, res) => {
    try {
        console.log('Buscando convites pendentes para sessão:', req.session);
        
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        const userEmail = req.session.user.email;
        console.log('Buscando convites para email:', userEmail);

        const invitations = await Invitation.find({
            email: userEmail,
            status: 'Pendente',
            expiresAt: { $gt: new Date() }
        }).populate('companyId');

        console.log('Convites encontrados:', invitations);

        const formattedInvitations = invitations.map(invite => ({
            code: invite.invitationId,
            companyName: invite.companyId?.companyName || 'Empresa não encontrada',
            senderName: invite.name || 'Sistema',
            message: invite.message || '',
            expiresAt: invite.expiresAt
        }));

        return res.status(200).json({
            success: true,
            invitations: formattedInvitations
        });

    } catch (error) {
        console.error('Erro ao buscar convites:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar convites',
            error: error.message
        });
    }
};

exports.validateInvitation = async (req, res) => {
    // ... implementação futura ...
    res.status(200).json({ success: true });
};

exports.acceptInvitation = async (req, res) => {
    // ... implementação futura ...
    res.status(200).json({ success: true });
};

exports.rejectInvitation = async (req, res) => {
    // ... implementação futura ...
    res.status(200).json({ success: true });
}; 