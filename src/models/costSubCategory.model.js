const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CostSubcategorySchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CostCategory',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: String
  },
  // Timestamps will automatically handle createdAt and updatedAt
}, {
  timestamps: true,
  collection: 'cost_subcategories'
});

// Virtual for incomes
CostSubcategorySchema.virtual('incomes', {
  ref: 'Income',
  localField: '_id',
  foreignField: 'subcategoryId'
});

// Virtual for expenses
CostSubcategorySchema.virtual('expenses', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'subcategoryId'
});

// Set virtuals to JSON
CostSubcategorySchema.set('toJSON', { virtuals: true });
CostSubcategorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CostSubcategory', CostSubcategorySchema);