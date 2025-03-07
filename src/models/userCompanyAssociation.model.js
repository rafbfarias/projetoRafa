const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserCompanyAssociationSchema = new mongoose.Schema({
  // Relacionamentos principais
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Informação sobre a associação
  role: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  
  // Datas importantes
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: {
    type: Date
  },
  
  // Metadados
  invitationId: {
    type: Schema.Types.ObjectId,
    ref: 'Invitation'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Índice composto para evitar duplicação
UserCompanyAssociationSchema.index({ userId: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('UserCompanyAssociation', UserCompanyAssociationSchema);