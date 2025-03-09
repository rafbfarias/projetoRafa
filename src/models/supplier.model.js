const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema para Supplier - representa fornecedores de produtos
const SupplierSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  unitId: {
    type: Schema.Types.ObjectId,
    ref: 'Unit'
  },
  description: {
    type: String,
    trim: true
  },
  categories: [{
    type: String,
    trim: true
  }],
  taxId: {
    type: String,
    trim: true
  },
  paymentTerms: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'suppliers'
});

// Virtual para relacionar com company
SupplierSchema.virtual('company', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true
});

// Virtual para relacionar com unit
SupplierSchema.virtual('unit', {
  ref: 'Unit',
  localField: 'unitId',
  foreignField: '_id',
  justOne: true
});

// Virtual para relacionar com produtos (ProductList)
SupplierSchema.virtual('products', {
  ref: 'ProductList',
  localField: '_id',
  foreignField: 'supplierIdRef',
  justOne: false
});

// Configurar virtuals para inclusão em JSON e Object
SupplierSchema.set('toJSON', { virtuals: true });
SupplierSchema.set('toObject', { virtuals: true });

module.exports = { Supplier: mongoose.model('Supplier', SupplierSchema) };