const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define PaymentStatus enum equivalent
const PaymentStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED'
};

// Define PaymentType enum equivalent
const PaymentType = {
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  CASH: 'CASH',
  CHECK: 'CHECK',
  DIRECT_DEBIT: 'DIRECT_DEBIT',
  OTHER: 'OTHER'
};

const PaymentSchema = new mongoose.Schema({
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true
  },
  bankAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(PaymentType),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentBatch'
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: String
  },
  rejectedAt: {
    type: Date
  },
  rejectedBy: {
    type: String
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'payments'
});

module.exports = mongoose.model('Payment', PaymentSchema);