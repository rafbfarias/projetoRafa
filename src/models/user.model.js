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
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Identification Documents
  idDocumentType: {
    type: String,
    required: function() {
        return this.status !== 'Pendente';
    }
  },
  idDocumentNumber: {
    type: String,
    required: function() {
        return this.status !== 'Pendente';
    },
    unique: true
  },
  idDocumentValidity: {
    type: Date,
    required: function() {
        return this.status !== 'Pendente';
    }
  },
  
  // Tax & Social Security
  taxNumber: {
    type: String,
    required: function() {
        return this.status !== 'Pendente';
    },
    unique: true
  },
  socialSecurityNumber: {
    type: String,
    required: function() {
        return this.status !== 'Pendente';
    }
  },
  
  // Personal Details
  birthDate: {
    type: Date,
    required: function() {
        return this.status !== 'Pendente';
    }
  },
  contactPhone: {
    type: String,
    required: function() {
        return this.status !== 'Pendente';
    }
  },
  
  nationality: {
    type: String,
    required: function() {
        return this.status !== 'Pendente';
    }
  },
  
  // Address Information
  address: {
    type: String,
    required: function() {
        return this.status !== 'Pendente';
    }
  },
  postalCode: {
    type: String,
    required: function() {
        return this.status !== 'Pendente';
    }
  },

  city: {
    type: String,
    required: function() {
        return this.status !== 'Pendente';
    }
  },
  country: {
    type: String,
    required: function() {
        return this.status !== 'Pendente';
    }
  },

  // Family Information
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Domestic Partnership'],
    required: function() {
        return this.status !== 'Pendente';
    }
  },
  dependents: {
    type: Number,
    default: 0
  },
  
  // Education & Financial
  education: {
    type: String
  },
  bankAccountNumber: {
    type: String
  },
  
  // Employment Information
  currentUnit: {
    type: String,
    required: function() {
        return this.status !== 'Pendente';
    }
  },
  userStatus: {
    type: String,
    enum: ['Pendente', 'Ativa', 'Inativa'],
    required: function() {
        return this.status !== 'Pendente';
    },
    default: 'Pendente'
  },
  
  // Document Files
  idDocumentFront: {
    type: String
  },
  idDocumentBack: {
    type: String
  },
  otherDocuments: {
    type: String
  },
  photo: {
    type: String
  },
  signature: {
    type: String
  },
  

  // Referencias 

  idRefFact: {
    type: String
  },
  idRefUnit: {
    type: String
  },
  idRefContract: {
    type: String
  },
  idRefPermission: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission'
  }],

  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);