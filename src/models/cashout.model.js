const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CashOutflowSchema = new mongoose.Schema({
  // Identification
  cashoutId: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Transaction Type and Company Info
  outflowType: {
    type: String,
    required: true
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  
  // Financial Values
  outflowAmount: {
    type: Number,
    required: true,
    default: 0
  },
  supposedAmount: {
    type: Number,
    default: 0
  },
  pendingResidualAmount: {
    type: Number,
    default: 0
  },
  
  // Time Reference
  referenceYear: {
    type: Number,
    required: true
  },
  referenceMonth: {
    type: String,
    required: true
  },
  referenceWeek: {
    type: String
  },
  referenceStartDate: {
    type: Date,
    required: true
  },
  referenceEndDate: {
    type: Date,
    required: true
  },
  
  // Transaction Details
  depositedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  depositedIn: {
    type: String  }
    ,
  supplier: {
    type: String
  },
  orderReference: {
    type: String
  },
  deliveredTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String
  },
  split: {
    type: String
  },
  emailAddress: {
    type: String
  },
  
  // Documentation
  receiptPath: {
    type: String
  },
  signaturePath: {
    type: String
  },
  factReference: {
    type: String
  },
  
  // Status
  confirmed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CashOutflow', CashOutflowSchema);