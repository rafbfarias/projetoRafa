const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Esquema para ProductRelation - representa a relação entre
 * ProductList (produtos à venda por fornecedores) e 
 * ProductParent (produtos que as empresas/unidades querem comprar)
 */
const ProductRelationSchema = new Schema({
  // ProductList (produto à venda pelo fornecedor)
  productListId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductList',
    required: true
  },
  
  // ProductParent (produto que a empresa/unidade quer comprar)
  productParentId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductParent',
    required: true
  },
  
  // Company e Unit que desejam comprar este produto
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  unitId: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  
  // Status da relação
  status: {
    type: String,
    enum: ['ativo', 'inativo', 'favorito', 'bloqueado'],
    default: 'ativo'
  },
  
  // Equivalência calculada entre as unidades de medida
  // do ProductList e do ProductParent
  equivalentQuantity: {
    type: Number,
    min: 0
  },
  equivalentPrice: {
    type: Number,
    min: 0
  },
  
  // Notas sobre esta relação específica
  notes: {
    type: String,
    trim: true
  },
  
  // Tracking
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'product_relations'
});

// Índices compostos para garantir unicidade
ProductRelationSchema.index({ 
  productListId: 1, 
  productParentId: 1, 
  companyId: 1, 
  unitId: 1 
}, { 
  unique: true 
});

// Virtuals
ProductRelationSchema.virtual('productList', {
  ref: 'ProductList',
  localField: 'productListId',
  foreignField: '_id',
  justOne: true
});

ProductRelationSchema.virtual('productParent', {
  ref: 'ProductParent',
  localField: 'productParentId',
  foreignField: '_id',
  justOne: true
});

ProductRelationSchema.virtual('company', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true
});

ProductRelationSchema.virtual('unit', {
  ref: 'Unit',
  localField: 'unitId',
  foreignField: '_id',
  justOne: true
});

// Configurar virtuals para inclusão em JSON e Object
ProductRelationSchema.set('toJSON', { virtuals: true });
ProductRelationSchema.set('toObject', { virtuals: true });

// Método para calcular equivalências
ProductRelationSchema.methods.calculateEquivalences = async function() {
  try {
    // Aqui implementaremos a lógica de converter entre unidades de medida
    // do productList e do productParent
    const productList = await this.model('ProductList').findById(this.productListId);
    const productParent = await this.model('ProductParent').findById(this.productParentId);
    
    if (productList && productParent) {
      // Lógica de conversão será implementada aqui
      // Por exemplo: converter de 'kg' para 'pacote (200g)'
      
      // Valores calculados serão armazenados:
      // this.equivalentQuantity e this.equivalentPrice
    }
  } catch (error) {
    console.error('Erro ao calcular equivalências:', error);
  }
};

module.exports = { 
  ProductRelation: mongoose.model('ProductRelation', ProductRelationSchema) 
}; 