const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FaturacaoSchema = new mongoose.Schema({
  // Identification and Time Fields
  factId: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  weekDay: {
    type: String,
    required: true
  },
  weekNum: {
    type: Number,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  
  // Business Information
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  factResp: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Revenue Information
  totalFact: {
    type: Number,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['Pendente', 'Validado'],
    default: 'Pendente'
  }
}, {
  timestamps: true
});

// Middleware para limpar referências antes de deletar
FaturacaoSchema.pre('findOneAndDelete', async function(next) {
  const faturacao = await this.model.findOne(this.getQuery());
  if (faturacao) {
    await mongoose.model('Company').updateMany(
      { faturamentos: faturacao._id },
      { $pull: { faturamentos: faturacao._id } }
    );
  }
  next();
});

// Também adicionar para o método 'deleteOne'
FaturacaoSchema.pre('deleteOne', async function(next) {
  const faturacao = await this.model.findOne(this.getQuery());
  if (faturacao) {
    await mongoose.model('Company').updateMany(
      { faturamentos: faturacao._id },
      { $pull: { faturamentos: faturacao._id } }
    );
  }
  next();
});

module.exports = mongoose.model('Faturacao', FaturacaoSchema);