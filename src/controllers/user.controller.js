const User = require('../models/user.model');

// Criar um novo usuário
exports.create = async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar todos os usuários
exports.findAll = async (req, res) => {
    try {
        const users = await User.find()
            .select('-documents -taxDocuments -socialSecurityDocuments') // Exclui documentos sensíveis
            .populate('permissions');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar um usuário pelo ID
exports.findOne = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('permissions');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Atualizar um usuário
exports.update = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).populate('permissions');
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Excluir um usuário
exports.delete = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar usuários por unidade
exports.findByUnit = async (req, res) => {
    try {
        const users = await User.find({ unit: req.params.unitId })
            .select('-documents -taxDocuments -socialSecurityDocuments')
            .populate('permissions');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar usuários por status
exports.findByStatus = async (req, res) => {
    try {
        const users = await User.find({ status: req.params.status })
            .select('-documents -taxDocuments -socialSecurityDocuments')
            .populate('permissions');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 