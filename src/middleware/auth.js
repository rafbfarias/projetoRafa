// Middleware de autenticação
module.exports = (req, res, next) => {
  // Verificar se o usuário está autenticado na sessão
  if (!req.session.user) {
    return res.status(401).json({ message: 'Não autorizado. Faça login para continuar.' });
  }
  
  // Adicionar informações do usuário ao objeto req
  req.user = req.session.user;
  
  next();
}; 