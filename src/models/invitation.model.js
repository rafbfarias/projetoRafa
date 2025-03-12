const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvitationSchema = new mongoose.Schema({
  // Código único do convite
  invitationId: {
    type: String,
    required: true,
    unique: true,
    default: () => `INV-${Date.now()}`
  },

  // Email do convidado
  email: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  
  // Nome sugerido (opcional)
  name: {
    type: String
  },
  
  // Empresa que está convidando
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Unidades selecionadas
  unitIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Unit'
  }],
  
  // Contrato pré-associado (opcional)
  contractId: {
    type: Schema.Types.ObjectId,
    ref: 'Contract'
  },
  
  // Papel/função na empresa
  role: {
    type: String,
    required: true
  },
  
  // Status do convite
  status: {
    type: String,
    enum: ['Pendente', 'Aceito', 'Recusado', 'Expirado'],
    default: 'Pendente'
  },
  
  // Token único para validação
  token: {
    type: String,
    required: true,
    unique: true
  },
  
  // Mensagem personalizada
  message: String,
  
  // Usuário que criou o convite
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Datas
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 dias
  },
  
  acceptedAt: Date,
  
  rejectedAt: Date
}, {
  timestamps: true
});

// Índices
InvitationSchema.index({ email: 1, status: 1 });
InvitationSchema.index({ invitationId: 1 }, { unique: true });

module.exports = mongoose.model('Invitation', InvitationSchema);