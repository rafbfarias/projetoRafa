const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvitationSchema = new mongoose.Schema({
  // Código único do convite
  invitationId: {
    type: String,
    required: true,
    unique: true
  },

  // Email do convidado
  email: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, insira um email válido']
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
  message: {
    type: String
  },
  
  // Usuário que criou o convite
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Datas
  expiresAt: {
    type: Date,
    required: true
  },
  
  acceptedAt: {
    type: Date
  },
  
  rejectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invitation', InvitationSchema);