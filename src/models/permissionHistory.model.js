const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionHistorySchema = new mongoose.Schema({
  permissionId: {
    type: Schema.Types.ObjectId,
    ref: 'Permission',
    required: true
  },
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
  unitId: {
    type: Schema.Types.ObjectId,
    ref: 'Unit'
  },
  previousStatus: {
    type: String,
    enum: ['Pendente', 'Ativa', 'Inativa'],
    required: true
  },
  newStatus: {
    type: String,
    enum: ['Pendente', 'Ativa', 'Inativa'],
    required: true
  },
  previousType: {
    type: String,
    enum: ['Masteradmin', 'Admin', 'Manager', 'Chef', 'Supervisor', 'User', 'Guest']
  },
  newType: {
    type: String,
    enum: ['Masteradmin', 'Admin', 'Manager', 'Chef', 'Supervisor', 'User', 'Guest']
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PermissionHistory', PermissionHistorySchema);