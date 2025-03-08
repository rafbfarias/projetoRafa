const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for ProductChart - Tracks product orders, deliveries and incidents
const ProductChartSchema = new mongoose.Schema({
  chartId: {
    type: String,
    required: true,
    unique: true
  },
  prodId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductList',
    required: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  deliveryDateEst: {
    type: Date,
    required: true
  },
  unitId: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  supplierName: {
    type: String,
    required: true
  },
  productFamily: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  supplierDescription: {
    type: String
  },
  standardUnitMeasure: {
    type: String,
    required: true
  },
  standardUnitPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitMeasure: {
    type: String,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  estimatedPrice: {
    type: Number,
    required: true
  },
  averageOrderQuantity: {
    type: Number
  },
  observations: {
    type: String
  },
  hasIncident: {
    type: Boolean,
    default: false
  },
  incidentDetails: {
    type: String
  },
  incidentEvidencePhotos: [{
    type: String
  }],
  photos: [{
    type: String
  }],
  orderStatus: {
    type: String,
    enum: ['PENDING', 'ORDERED', 'DELIVERED', 'CANCELED', 'INCIDENT'],
    default: 'PENDING'
  },
  // References to other models if needed
  purchaseOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'PurchaseOrder'
  }
}, {
  timestamps: true,
  collection: 'product_charts'
});


// Export models
module.exports = {ProductChart: mongoose.model('ProductChart', ProductChartSchema)};