const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const unitSchema = new mongoose.Schema({
  branchId: {
    type: String,
    required: true,
    unique: true
  },
  unitCode: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 4,
    uppercase: true
  },
  unitName: {
    type: String,
    required: true
  },
  fullAddress: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'Portugal'
  },
  seatingCapacity: {
    type: Number,
    required: true
  },
  squareMeters: {
    type: Number,
    required: true
  },
  floors: {
    type: Number,
    required: true,
    default: 1
  },
  phoneContact: {
    type: String,
    required: true
  },
  emailContact: {
    type: String,
    required: true
  },
  averageRevenue: {
    type: Number,
    default: 0
  },
  maxRevenue: {
    type: Number,
    default: 0
  },
  minRevenue: {
    type: Number,
    default: 0
  },
  seasonRevenue: {
    type: Number,
    default: 0
  },
  offSeasonRevenue: {
    type: Number,
    default: 0
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: function() {
      return this.companyId !== null;
    }
  },
  managerResponsibleId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chefResponsibleId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission'
  }],

  unitStatus: {
    type: String,
    enum: ['Pendente', 'Ativa', 'Inativa'],
    required: true,
    default: 'Pendente'
  },

}, {
  timestamps: true
});

module.exports = mongoose.model('Unit', unitSchema);