const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define ExpenseStatus enum equivalent
const ExpenseStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  PAID: 'PAID',
  WAITINGPAYMENT: 'WAITING PAYMENT',
  PAYMENTREJECTED: 'PAYMENT REJECTED'
};

const ExpenseSchema = new mongoose.Schema({
 // Business Information
 companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  company: {
    type: String,
    enum: Object.values(companyName),
    required: true
  },
  unitId: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  unit: {
    type: String,
    enum: Object.values(unitName),
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CostCategory',
    required: true
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CostSubcategory'
  },
  modalityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CostModality'
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: Object.values(ExpenseStatus),
    default: ExpenseStatus.PENDING
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
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
  collection: 'expenses'
});

// Virtual for payments
ExpenseSchema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'expenseId'
});

// Set virtuals to JSON
ExpenseSchema.set('toJSON', { virtuals: true });
ExpenseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Expense', ExpenseSchema);