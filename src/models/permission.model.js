const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionSchema = new mongoose.Schema({
  // Identification and Time Fields
  permissionId: {
    type: String,
    required: true,
    unique: true
  },
  refIdUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refIdUnit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  refIdCompany: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  permissionType: {
    type: String,
    enum: ['Masteradmin', 'Admin', 'Manager', 'Chef', 'Supervisor', 'User', 'Guest'],
    required: true
  },

  // Templates herdados
  inheritedTemplates: [{
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'PermissionTemplate',
      required: true
    },
    // Permite sobrescrever ações específicas do template para este usuário
    overrides: [{
      pageId: String,
      actions: [{
        actionType: {
          type: String,
          enum: ['view', 'create', 'edit', 'delete', 'approve', 'export']
        },
        allowed: Boolean
      }],
      sections: [{
        sectionId: String,
        actions: [{
          actionType: String,
          allowed: Boolean
        }]
      }]
    }]
  }],

  // Páginas individuais (além dos templates)
  individualPages: [{
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
    actions: [{
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
      actions: [{
        actionType: {
          type: String,
          enum: ['view', 'create', 'edit', 'delete', 'approve', 'export']
        },
        allowed: Boolean
      }]
    }]
  }],

  permissionStatus: {
    type: String,
    enum: ['Pendente', 'Ativa', 'Inativa'],
    default: 'Pendente'
  },
  invitationId: {
    type: Schema.Types.ObjectId,
    ref: 'Invitation'
  }
}, {
  timestamps: true
});

// Middleware para limpar referências antes de deletar
permissionSchema.pre('findOneAndDelete', async function(next) {
  const permission = await this.model.findOne(this.getQuery());
  if (permission) {
    await mongoose.model('User').updateMany(
      { idRefPermission: permission._id },
      { $pull: { idRefPermission: permission._id } }
    );
  }
  next();
});

// Também para o método deleteOne
permissionSchema.pre('deleteOne', async function(next) {
  const permission = await this.model.findOne(this.getQuery());
  if (permission) {
    await mongoose.model('User').updateMany(
      { idRefPermission: permission._id },
      { $pull: { idRefPermission: permission._id } }
    );
  }
  next();
});

// Método para verificar se um usuário tem permissão para uma ação específica
permissionSchema.methods.hasPermission = async function(pageId, actionType, sectionId = null) {
  // Primeiro verifica nas páginas individuais
  const individualPage = this.individualPages.find(p => p.pageId === pageId);
  if (individualPage) {
    if (sectionId) {
      const section = individualPage.sections.find(s => s.sectionId === sectionId);
      if (section) {
        const action = section.actions.find(a => a.actionType === actionType);
        if (action) return action.allowed;
      }
    }
    const action = individualPage.actions.find(a => a.actionType === actionType);
    if (action) return action.allowed;
  }

  // Depois verifica nos templates herdados
  for (const template of this.inheritedTemplates) {
    // Verifica se há override para esta página específica
    const override = template.overrides.find(o => o.pageId === pageId);
    if (override) {
      if (sectionId) {
        const section = override.sections.find(s => s.sectionId === sectionId);
        if (section) {
          const action = section.actions.find(a => a.actionType === actionType);
          if (action) return action.allowed;
        }
      }
      const action = override.actions.find(a => a.actionType === actionType);
      if (action) return action.allowed;
    }

    // Se não houver override, busca no template original
    const templateDoc = await mongoose.model('PermissionTemplate').findById(template.templateId);
    if (templateDoc) {
      const templatePage = templateDoc.pages.find(p => p.pageId === pageId);
      if (templatePage) {
        if (sectionId) {
          const section = templatePage.sections.find(s => s.sectionId === sectionId);
          if (section) {
            const action = section.defaultActions.find(a => a.actionType === actionType);
            if (action) return action.allowed;
          }
        }
        const action = templatePage.defaultActions.find(a => a.actionType === actionType);
        if (action) return action.allowed;
      }
    }
  }

  return false;
};

module.exports = mongoose.model('Permission', permissionSchema); 