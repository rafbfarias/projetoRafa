const Faturacao = require('../models/Faturacao');

// Obter todos os lançamentos
exports.getAllLancamentos = async (req, res) => {
  try {
    const lancamentos = await Faturacao.find().sort({ createdAt: -1 });
    res.status(200).json(lancamentos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar lançamentos', error: error.message });
  }
};

// Obter um lançamento específico
exports.getLancamento = async (req, res) => {
  try {
    const lancamento = await Faturacao.findById(req.params.id);
    if (!lancamento) {
      return res.status(404).json({ message: 'Lançamento não encontrado' });
    }
    res.status(200).json(lancamento);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar lançamento', error: error.message });
  }
};

// Criar um novo lançamento
exports.createLancamento = async (req, res) => {
  try {
    const novoLancamento = new Faturacao(req.body);
    const lancamentoSalvo = await novoLancamento.save();
    res.status(201).json(lancamentoSalvo);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar lançamento', error: error.message });
  }
};

// Atualizar um lançamento
exports.updateLancamento = async (req, res) => {
  try {
    const lancamentoAtualizado = await Faturacao.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!lancamentoAtualizado) {
      return res.status(404).json({ message: 'Lançamento não encontrado' });
    }
    res.status(200).json(lancamentoAtualizado);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar lançamento', error: error.message });
  }
};

// Excluir um lançamento
exports.deleteLancamento = async (req, res) => {
  try {
    const lancamento = await Faturacao.findByIdAndDelete(req.params.id);
    if (!lancamento) {
      return res.status(404).json({ message: 'Lançamento não encontrado' });
    }
    res.status(200).json({ message: 'Lançamento excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir lançamento', error: error.message });
  }
};