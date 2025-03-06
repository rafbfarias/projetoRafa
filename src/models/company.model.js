const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new mongoose.Schema({
  // Identification and Time Fields
companyId: {
    type: String,
    required: true,
    unique: true
  },
  companyCode: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 4,
    uppercase: true
  },
  companyName: {
    type: String,
    required: true
  },

  companyVATNumber: {
    type: String,
    required: true
  },

  companyFullAddress: {
    type: String,
    required: true
  },
  companyPostalCode: {
    type: String,
    required: true
  },
  companyCity: {
    type: String,
    required: true
  },
  companyCountry: {
    type: String,
    required: true,
    default: 'Portugal'
  },

  companyStatus: {
    type: String,
    enum: ['Pendente', 'Ativa', 'Inativa'],
    required: true,
    default: 'Pendente'
  },



}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
