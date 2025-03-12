const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const authMiddleware = async (req, res, next) => {
    try {
        // Garantir que estamos enviando JSON
        res.setHeader('Content-Type', 'application/json');

        console.log('1. Headers recebidos:', req.headers); // Debug
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('2. Token não fornecido ou formato inválido'); // Debug
            return res.status(401).json({
                status: 'error',
                message: 'Acesso não autorizado'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('3. Token encontrado:', token.substring(0, 10) + '...'); // Debug

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
        console.log('4. Token decodificado:', decoded); // Debug

        req.user = decoded;
        next();
    } catch (error) {
        console.error('5. Erro de autenticação:', error); // Debug
        return res.status(401).json({
            status: 'error',
            message: 'Token inválido ou expirado'
        });
    }
};

module.exports = authMiddleware; 