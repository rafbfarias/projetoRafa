const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define InvoiceStatus enum equivalent
const InvoiceStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID'
};

const PurchaseInvoiceSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },

  hasScan: {
    type: Boolean,
    default: false
  },
  scanDate: {
    type: Date
  },
  
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  invoiceDueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    default: 'PENDING'
  },
  items: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductList'
  },
  invoiceValueBeforeTax: {
    type: Number,
    required: true
  },
  invoiceTaxValue: {
    type: Number,
    required: true
  },
  invoiceValueWithTax: {
    type: Number,
    required: true
  },
  notes: {
    type: String
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
  collection: 'purchase_invoices'
});

module.exports = mongoose.model('PurchaseInvoice', PurchaseInvoiceSchema);