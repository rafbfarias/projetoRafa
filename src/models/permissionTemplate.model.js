const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionTemplateSchema = new mongoose.Schema({
  templateId: {
    type: String,
    required: true,
    unique: true
  },
  templateName: {
    type: String,
    required: true,
    unique: true
  },
  templateDescription: String,
  area: {
    type: String,
    enum: ['RH', 'Financeiro', 'Operacional', 'Administrativo', 'TI', 'Marketing', 'Vendas', 'Jurídico'],
    required: true
  },
  pages: [{
    pageId: {
      type: String,
      required: true
    },
    pageName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    defaultActions: [{
      actionType: {
        type: String,
        enum: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
        required: true
      },
      allowed: {
        type: Boolean,
        default: true
      }
    }],
    sections: [{
      sectionId: String,
      sectionName: String,
      defaultActions: [{
        actionType: {
          type: String,
          enum: ['view', 'create', 'edit', 'delete', 'approve', 'export']
        },
        allowed: Boolean
      }]
    }]
  }],
  status: {
    type: String,
    enum: ['Ativo', 'Inativo'],
    default: 'Ativo'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PermissionTemplate', permissionTemplateSchema); 