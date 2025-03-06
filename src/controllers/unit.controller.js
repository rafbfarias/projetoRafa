const Unit = require('../models/unit.model');

// Criar nova unidade
exports.create = async (req, res) => {
    try {
        const unit = new Unit(req.body);
        await unit.save();
        res.status(201).json(unit);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao criar unidade',
            error: error.message
        });
    }
};

// Buscar todas as unidades
exports.findAll = async (req, res) => {
    try {
        const units = await Unit.find()
            .populate('manager', 'name')
            .sort({ name: 1 });
        res.json(units);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar unidades',
            error: error.message
        });
    }
};

// Buscar unidade por ID
exports.findOne = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id)
            .populate('manager', 'name email');
        
        if (!unit) {
            return res.status(404).json({
                message: 'Unidade não encontrada'
            });
        }
        
        res.json(unit);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar unidade',
            error: error.message
        });
    }
};

// Atualizar unidade
exports.update = async (req, res) => {
    try {
        const unit = await Unit.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!unit) {
            return res.status(404).json({
                message: 'Unidade não encontrada'
            });
        }
        
        res.json(unit);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao atualizar unidade',
            error: error.message
        });
    }
};

// Excluir unidade
exports.delete = async (req, res) => {
    try {
        const unit = await Unit.findByIdAndDelete(req.params.id);
        
        if (!unit) {
            return res.status(404).json({
                message: 'Unidade não encontrada'
            });
        }
        
        res.json({
            message: 'Unidade excluída com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao excluir unidade',
            error: error.message
        });
    }
}; 