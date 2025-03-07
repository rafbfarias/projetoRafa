const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CostModalitySchema = new mongoose.Schema({
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
  updatedBy: {
    type: String
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: String
  },
  // Timestamps will automatically handle createdAt and updatedAt
}, {
  timestamps: true,
  collection: 'cost_modalities'
});

// Virtual for incomes
CostModalitySchema.virtual('incomes', {
  ref: 'Income',
  localField: '_id',
  foreignField: 'modalityId'
});

// Virtual for expenses
CostModalitySchema.virtual('expenses', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'modalityId'
});

// Set virtuals to JSON
CostModalitySchema.set('toJSON', { virtuals: true });
CostModalitySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CostModality', CostModalitySchema);