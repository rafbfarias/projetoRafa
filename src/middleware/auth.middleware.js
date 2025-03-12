const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        // Armazenar o método original de res.json para usá-lo mais tarde
        const originalJson = res.json;
        
        // Sobrescrever o método res.json para definir o Content-Type apenas para respostas JSON
        res.json = function(data) {
            res.setHeader('Content-Type', 'application/json');
            return originalJson.call(this, data);
        };
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Log simplificado
            return res.status(401).json({
                status: 'error',
                message: 'Acesso não autorizado'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Erro de autenticação:', error.message);
        return res.status(401).json({
            status: 'error',
            message: 'Token inválido ou expirado'
        });
    }
};

module.exports = authMiddleware; 