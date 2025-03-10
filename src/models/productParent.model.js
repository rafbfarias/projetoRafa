const mongoose = require('mongoose');

// Schema for ProductParent - Parent product categories and reference information
const ProductParentSchema = new mongoose.Schema({
    parentId: {
      type: String,
      required: true,
      unique: true
    },
    productFamily: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    unitMeasure: {
      type: String,
      required: true
    },
    averagePrice: {
      type: Number,
      required: true
    },
    photo: {
      type: String
    },
    allergens: [{
      type: String
    }],
    // Indica se o produto possui fornecedores disponíveis
    hasSuppliers: {
      type: Boolean,
      default: false
    },
    // Indica se o produto está visível na loja online
    isVisible: {
      type: Boolean,
      default: true
    },
    lastUpdate: {
      type: Date,
      default: Date.now
    },
    preparations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Preparation'
    }]
  }, {
    timestamps: true,
    collection: 'product_parents'
  });
  
  module.exports = {ProductParent: mongoose.model('ProductParent', ProductParentSchema)};