const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserUnitAssociationSchema = new mongoose.Schema({
  // Relacionamentos principais
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  unitId: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
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
  assignedAt: {
    type: Date,
    default: Date.now
  },
  removedAt: {
    type: Date
  },
  
  // Metadados
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índice composto para evitar duplicação
UserUnitAssociationSchema.index({ userId: 1, unitId: 1 }, { unique: true });

module.exports = mongoose.model('UserUnitAssociation', UserUnitAssociationSchema);