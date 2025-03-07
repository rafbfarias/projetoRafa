const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CostCategorySchema = new mongoose.Schema({
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
  collection: 'cost_categories'
});

// Virtual for subcategories
CostCategorySchema.virtual('subcategories', {
  ref: 'CostSubcategory',
  localField: '_id',
  foreignField: 'categoryId'
});

// Virtual for incomes
CostCategorySchema.virtual('incomes', {
  ref: 'Income',
  localField: '_id',
  foreignField: 'categoryId'
});

// Virtual for expenses
CostCategorySchema.virtual('expenses', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'categoryId'
});

// Set virtuals to JSON
CostCategorySchema.set('toJSON', { virtuals: true });
CostCategorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CostCategory', CostCategorySchema);