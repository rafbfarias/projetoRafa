const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  // Basic Personal Information
  preferredName: {
    type: String,
    required: true
  },
  fullName: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.isFirstAccess; // Senha só é obrigatória após o primeiro acesso
    },
    default: '$2a$10$XtluUj3B9y5ORx1JOK.0wuQ6HP0tX71zL5eM5MwzWa4r7y8/xZvnG' // Hash de '123'
  },
  
  // Controle de Acesso
  isFirstAccess: {
    type: Boolean,
    default: true
  },
  firstAccessToken: String,
  firstAccessTokenExpires: Date,
  
  // Identification Documents
  idDocumentType: String,
  idDocumentNumber: {
    type: String,
    sparse: true
  },
  idDocumentValidity: Date,
  
  // Tax & Social Security
  taxNumber: {
    type: String,
    sparse: true
  },
  socialSecurityNumber: {
    type: String,
    sparse: true
  },
  
  // Personal Details
  birthDate: Date,
  contactPhone: String,
  nationality: String,
  
  // Address Information
  address: String,
  postalCode: String,
  city: String,
  country: String,

  // Family Information
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Domestic Partnership']
  },
  dependents: {
    type: Number,
    default: 0
  },
  
  // Education & Financial
  education: String,
  bankAccountNumber: String,
  
  // Employment Information
  currentUnit: {
    type: String,
    default: 'Não definida'
  },
  userStatus: {
    type: String,
    enum: ['Pendente', 'Ativa', 'Inativa'],
    default: 'Pendente'
  },
  
  // Document Files
  idDocumentFront: String,
  idDocumentBack: String,
  otherDocuments: String,
  photo: {
    type: String,
    default: '/images/users/1.png'
  },
  signature: String,
  
  // Referencias a outros modelos
  idRefFact: {
    type: Schema.Types.ObjectId,
    ref: 'Fact'
  },
  idRefCompany: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  idRefUnit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit'
  },
  idRefContract: {
    type: Schema.Types.ObjectId,
    ref: 'Contract'
  },
  idRefPermission: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission'
  }],

  // Último convite recebido (referência)
  lastInvitation: {
    type: Schema.Types.ObjectId,
    ref: 'Invitation'
  },

  // Status de onboarding e rascunho
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  isDraft: {
    type: Boolean,
    default: false
  },

  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Remover todos os índices existentes
userSchema.pre('save', async function() {
  try {
    await this.collection.dropIndexes();
  } catch (error) {
    console.log('Erro ao remover índices:', error);
  }
});

// Método para gerar token de primeiro acesso
userSchema.methods.generateFirstAccessToken = function() {
  const crypto = require('crypto');
  this.firstAccessToken = crypto.randomBytes(32).toString('hex');
  this.firstAccessTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
};

module.exports = mongoose.model('User', userSchema);