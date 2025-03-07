const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Índice composto para evitar duplicação de faturação para o mesmo dia/unidade
//DailyRevenueSchema.index({ unitId: 1, date: 1 }, { unique: true });

// Modelo de Plano de Distribuição de Caixa
const CashDistributionPlanSchema = new mongoose.Schema({
  factId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faturacao',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  // Valores planejados para cada destino
  depositAmount: {
    type: Number,
    default: 0
  },
  deliveryAmount: {
    type: Number,
    default: 0
  },
  tipsAmount: {
    type: Number,
    default: 0
  },
  // Valores pendentes (atualizados a cada transação)
  pendingDepositAmount: {
    type: Number,
    default: 0
  },
  pendingDeliveryAmount: {
    type: Number,
    default: 0
  },
  pendingTipsAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'PARTIAL', 'COMPLETED'],
    default: 'PENDING'
  },
  notes: String
}, {
  timestamps: true
});

// Modelo de Transação de Caixa
const CashTransactionSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  transactionDate: {
    type: Date,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['DEPOSIT', 'HAND_DELIVERY', 'TIPS', 'PAYMENT'],
    required: true
  },
  actionBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actionTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expectedAmount: {
    type: Number,
    required: true
  },
  actualAmount: {
    type: Number,
    required: true
  },
  // Diferença entre o esperado e o real
  differenceAmount: {
    type: Number,
    default: function() {
      return this.actualAmount - this.expectedAmount;
    }
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'PARTIAL', 'CANCELLED'],
    default: 'PENDING'
  },
  justification: String,
  transactionMethod: {
    type: String,
    enum: ['BANK_DEPOSIT', 'CASH_DELIVERY', 'OTHER'],
    required: true
  },
  
  notes: String,
  // Campos de referência a documentos de prova
  receiptDocument: String,
  confirmationDocument: String
}, {
  timestamps: true
});

// Modelo de Alocação de Transação
const TransactionAllocationSchema = new mongoose.Schema({
  transactionId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CashTransaction',
    required: true
  }],
  distributionPlanId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CashDistributionPlan',
    required: true
  }],
  // Data original da faturação (para facilitar rastreamento)
  originalRevenueDate: [{
    type: Date,
    required: true
  }],
  // Time Reference
  referenceYears: [{
    type: Number,
    required: true
  }],
  referenceMonths: [{
    type: String,
    required: true
  }],
  referenceWeeks: [{
    type: String
  }],
  referenceStartDate: {
    type: Date,
    required: true
  },
  referenceEndDate: {
    type: Date,
    required: true
  },
  // Valor esperado original
  expectedAmount: {
    type: Number,
    required: true
  },
  // Valor realmente alocado nesta transação
  allocatedAmount: {
    type: Number,
    required: true,
    default: 0
  },
  // Valor que fica pendente após esta alocação
  remainingAmount: {
    type: Number,
    required: true
  },
  // Tipo de alocação (para qual destino)
  allocationType: {
    type: String,
    enum: ['DEPOSIT', 'HAND_DELIVERY', 'TIPS'],
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Exportando os modelos
module.exports = {
  CashDistributionPlan: mongoose.model('CashDistributionPlan', CashDistributionPlanSchema),
  CashTransaction: mongoose.model('CashTransaction', CashTransactionSchema),
  TransactionAllocation: mongoose.model('TransactionAllocation', TransactionAllocationSchema)
};