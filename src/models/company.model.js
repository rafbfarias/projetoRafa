const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new mongoose.Schema({
  // Identification and Time Fields
  companyId: {
    type: String,
    default: function() {
      return `COMP-${Date.now()}`;
    }
  },
  companyCode: {
    type: String,
    uppercase: true,
    default: function() {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 4; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return code;
    }
  },
  companyName: {
    type: String,
    required: [true, 'O nome da empresa é obrigatório']
  },
  businessType: {
    type: String,
    required: [true, 'O tipo de negócio é obrigatório']
  },
  companyVATNumber: {
    type: String,
    required: [true, 'O número fiscal é obrigatório']
  },

  companyFullAddress: {
    type: String,
    required: [true, 'O endereço é obrigatório']
  },
  companyPostalCode: {
    type: String,
    required: [true, 'O código postal é obrigatório']
  },
  companyCity: {
    type: String,
    required: [true, 'A cidade é obrigatória']
  },
  companyCountry: {
    type: String,
    default: 'Portugal',
    required: [true, 'O país é obrigatório']
  },

  companyStatus: {
    type: String,
    enum: {
      values: ['Draft', 'Pendente', 'Ativa', 'Inativa'],
      message: 'Status inválido. Deve ser: Draft, Pendente, Ativa ou Inativa'
    },
    default: 'Draft'
  },
  
  // Plano associado
  hasPlan: {
    type: Boolean,
    default: false
  },
  
  planId: {
    type: Schema.Types.ObjectId,
    ref: 'Plan',
    default: null
  },
  
  planName: {
    type: String,
    default: null
  },
  
  planStartDate: {
    type: Date,
    default: null
  },
  
  planEndDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
