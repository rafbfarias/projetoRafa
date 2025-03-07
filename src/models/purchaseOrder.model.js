const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new mongoose.Schema({
  // Order Identification
  orderRefId: {
    type: String,
    required: true,
    unique: true
  },
  complement: {
    type: Boolean,
    default: false
  },
  complementWhy: {
    type: String,
  },
  complementRefId: [{
    type: Schema.Types.ObjectId,
    ref: 'PurchaseOrder'
  }],
  
  // Dates & Time Reference
  orderDate: {
    type: Date,
    required: true
  },
  referenceMonth: {
    type: String,
    required: true
  },
  referenceYear: {
    type: Number,
    required: true
  },
  deliveryDate: {
    type: Date
  },
 
  
  // Status Information
  orderStatus: {
    type: String,
    required: true,
    enum: ['PENDENTE','WAITING DELIVERY','RECEBIDO', 'WAITING PAYMENT','PAYMENT ACCEPTED','PAYMENT REJECTED','CANCELADO']
  },
  justification: {
    type: String
  },
  
  // Supplier & Company Information
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit'
  },
  
  // Modality & Category & Product
  mode: {
    type: Schema.Types.ObjectId,
    ref: 'CostModality'
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'CostCategory'
  },
  category2: {
    type: Schema.Types.ObjectId,
    ref: 'CostSubCategory'
  },
  orderDescription: {
    type: String
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'ProductList'
  }],

  // Budget & Documentation
  hasBudget: {
    type: Boolean,
    default: false
  },
  budgetValueBeforeTax: {
    type: Number,
    required: true
  },
  budgetTaxValue: {
    type: Number,
    required: true
  },
  budgetValueWithTax: {
    type: Number,
    required: true
  },
  
  // Invoice Information
  hasInvoice: {
    type: Boolean,
    default: false
  },
  invoiceRefId: {
    type: Schema.Types.ObjectId,
    ref: 'PurchaseInvoice'
  },
  hasTaxId: {
    type: Boolean,
    default: false
  },
  
  // Cost & Category Information
  costRefId: {
    type: Schema.Types.ObjectId,
    ref: 'Expense'
  },

  // Payment Information
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentMethod: [{
    type: String
  }],
  paymentDate: {
    type: Date
  },
  
  // Installment Information
  installments: {
    type: Number,
    default: 1
  },
  
  // Reference Period
  referenceStartDate: {
    type: Date
  },
  referenceStartMonth: {
    type: String
  },
  referenceStartYear: {
    type: Number
  },
  referenceEndDate: {
    type: Date
  },
  referenceEndMonth: {
    type: String
  },
  referenceEndYear: {
    type: Number
  },
  
  // Installment Values
  installmentValueBeforeTax: {
    type: Number
  },
  installmentValueWithTax: {
    type: Number
  },
  monthsYearList: {
    type: String
  },
  
  // Files & References

  orderFilePdf: {
    type: String
  }, 
  orderRelevantPictures: [{
    type: String
  }],
  
  // Validation
  isChecked: {
    type: Boolean,
    default: false
  },
  isManual: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PurchaseOrder', OrderSchema);