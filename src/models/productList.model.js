const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for ProductList - Detailed product information including supplier details
const ProductListSchema = new Schema({
  // Identificação do produto
  productId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Informações do fornecedor (quem está vendendo)
  supplierIdRef: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  supplierEmail: {
    type: String,
    required: true,
    trim: true
  },
  supplierDescription: {
    type: String,
    trim: true
  },
  
  // Informações da empresa e unidade do fornecedor
  companyIdRef: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
  },
  unitIdRef: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
  },
  
  // Detalhes do produto
  productName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  unitMeasure: {
    type: String,
    required: true,
    trim: true
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  minimumQuantity: {
    type: Number,
    default: 1,
    min: 1
  },
  available: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 5, // Prioridade média
    min: 1,
    max: 10
  },
  
  // Equivalências (para comparação com outros produtos)
  equivalentQuantity: {
    type: Number,
    min: 0
  },
  equivalentPrice: {
    type: Number,
    min: 0
  },
  
  // Informações adicionais
  photo: {
    type: String,
    trim: true
  },
  allergens: {
    type: [String],
    default: []
  },
  preparations: {
    type: [String],
    default: []
  },
  
  // Status de aprovação
  approvalStatus: {
    type: String,
    enum: ['aprovado', 'pendente', 'rejeitado'],
    default: 'pendente'
  },
  
  // Tracking
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  
  // Campo para observações adicionais
  observations: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'product_lists'
});

// Virtual para o fornecedor
ProductListSchema.virtual('supplier', {
  ref: 'Supplier',
  localField: 'supplierIdRef',
  foreignField: '_id',
  justOne: true
});

// Virtual para a empresa
ProductListSchema.virtual('company', {
  ref: 'Company',
  localField: 'companyIdRef',
  foreignField: '_id',
  justOne: true
});

// Virtual para a unidade
ProductListSchema.virtual('unit', {
  ref: 'Unit',
  localField: 'unitIdRef',
  foreignField: '_id',
  justOne: true
});

// Virtual para orders relacionados a este produto
ProductListSchema.virtual('productCharts', {
  ref: 'ProductChart',
  localField: '_id',
  foreignField: 'prodId'
});

// Configurar virtuals para inclusão em JSON e Object
ProductListSchema.set('toJSON', { virtuals: true });
ProductListSchema.set('toObject', { virtuals: true });

// Método para calcular equivalências quando associado a um produto pai
ProductListSchema.methods.calculateEquivalences = function(parentUnitMeasure) {
  // Implementar lógica de conversão entre unidades de medida
  // Por exemplo: converter de 'pacote (200g)' para 'kg'
  // Os valores calculados serão armazenados em this.equivalentQuantity e this.equivalentPrice
};

module.exports = { ProductList: mongoose.model('ProductList', ProductListSchema) };