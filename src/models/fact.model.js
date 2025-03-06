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
  company: {
    type: String,
    required: true
  },
  unitId: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  unit: {
    type: String,
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
  seriesDiff: {
    type: Number,
    default: 0
  },
  series1: {
    type: Number,
    default: 0
  },
  series2: {
    type: Number,
    default: 0
  },
  factDiff: {
    type: String
  },
  
  // Payment Methods
  totalCash: {
    type: Number,
    default: 0
  },
  wireTransfer: {
    type: Number,
    default: 0
  },
  posMb1Gross: {
    type: Number,
    default: 0
  },
  posMb2Gross: {
    type: Number,
    default: 0
  },
  
  // Tips
  tipsPosMb1: {
    type: Number,
    default: 0
  },
  tipsPosMb2: {
    type: Number,
    default: 0
  },
  
  // Delivery Services
  uberEatsMb: {
    type: Number,
    default: 0
  },
  glovoPosMb: {
    type: Number,
    default: 0
  },
  glovoCash: {
    type: Number,
    default: 0
  },
  
  // Cancellations and Adjustments
  canceledTransactions: {
    type: Number,
    default: 0
  },
  canceledDocuments: {
    type: Number,
    default: 0
  },
  canceledDocumentsJustification: {
    type: String
  },
  
  // Internal Operations
  internalConsumption: {
    type: Number,
    default: 0
  },
  discounts: {
    type: Number,
    default: 0
  },
  discountsJustification: {
    type: String
  },
  
  // Gift Cards
  giftCardSold: {
    type: Number,
    default: 0
  },
  giftCardUsed: {
    type: Number,
    default: 0
  },
  
  // Totals
  totalDeposits: {
    type: Number,
    default: 0
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  totalTips: {
    type: Number,
    default: 0
  },
  
  // Metrics
  fmActual: {
    type: Number
  },
  extActual: {
    type: Number
  },
  hrActual: {
    type: Number
  },
  peopleCount: {
    type: Number
  },
  
  // Additional Information
  timestamp: {
    type: Date,
    default: Date.now
  },
  emailAddress: {
    type: String
  },
  dayEvaluation: {
    type: String
  },
  dayObservations: {
    type: String
  },
  dayWeather: {
    type: String
  },
  
  // Confirmations
  confirmed: {
    type: Boolean,
    default: false
  },
  deposited: {
    type: Boolean,
    default: false
  },
  delivered: {
    type: Boolean,
    default: false
  },
  tips: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
     enum: ['Pendente', 'Validado'],
    default: 'Pendente'
  },
  
  // Photos
  photoFactTotal: {
    type: String
  },
  photoPosMb: {
    type: String
  },
  photoUberEats: {
    type: String
  },
  photoGlovoMbCash: {
    type: String
  },
  photoCanceledTransactionsDocuments: {
    type: String
  },
  photoInternalConsumption: {
    type: String
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