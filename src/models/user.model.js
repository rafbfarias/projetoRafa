const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  // Basic Personal Information
  preferredName: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, insira um email válido']
  },
  password: {
    type: String,
    required: true
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
    sparse: true,
    index: true,
    default: function() {
      return `USER-${Date.now()}`;
    }
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
  currentUnit: [{
    type: Schema.Types.ObjectId,
    ref: 'Unit'
  }],
  currentCompany: [{
    type: Schema.Types.ObjectId,
    ref: 'Company'
  }],
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
    default: '/images/users/default-avatar.svg'
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

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Middleware para atualizar updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método para gerar token de primeiro acesso
userSchema.methods.generateFirstAccessToken = function() {
  const crypto = require('crypto');
  this.firstAccessToken = crypto.randomBytes(32).toString('hex');
  this.firstAccessTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
};

module.exports = mongoose.model('User', userSchema);