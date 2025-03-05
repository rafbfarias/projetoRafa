const mongoose = require('mongoose');

const FaturacaoSchema = new mongoose.Schema({
  cliente: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  valor: {
    type: Number,
    required: true
  },
  dataEmissao: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pendente', 'Pago', 'Cancelado'],
    default: 'Pendente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Faturacao', FaturacaoSchema);