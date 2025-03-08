// Schema for ProductList - Detailed product information including supplier details
const ProductListSchema = new mongoose.Schema({
    productId: {
      type: String,
      required: true,
      unique: true
    },
    productFamily: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    unitMeasure: {
      type: String,
      required: true
    },
    // References to other models
    
    productParentIdRef: {
        type: Schema.Types.ObjectId,
        ref: 'ProductParent'
      },

      supplierIdRef: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
      },
      
    // References to other models

    companyIdRef: {
        type: Schema.Types.ObjectId,
        ref: 'Company'
      },
    unitIdRef: {
      type: Schema.Types.ObjectId,
      ref: 'Unit'
    },
    
    supplierName: {
      type: String,
      required: true
    },
    supplierEmail: {
      type: String
    },
    supplierDescription: {
      type: String
    },
    currentPrice: {
      type: Number,
      required: true
    },
    supplierUnitMeasure: {
      type: String
    },
    equivalentQuantity: {
      type: Number
    },
    equivalentPrice: {
      type: Number
    },
    minimumQuantity: {
      type: Number,
      default: 1
    },
    reference: {
      type: String
    },
    photo: {
      type: String
    },
    allergens: [{
      type: String
    }],
    priority: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    deliveryDaysPlus: {
      type: Number,
      default: 1  // Default next-day delivery
    },
    deliveryDaysOfWeek: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    observations: {
      type: String
    },
    updateDate: {
      type: Date,
      default: Date.now
    },
    // Virtual references
    parentProduct: {
      type: Schema.Types.ObjectId,
      ref: 'ProductParent'
    }
  }, {
    timestamps: true,
    collection: 'product_list'
  });
  
  // Virtual for product charts related to this product
  ProductListSchema.virtual('productCharts', {
    ref: 'ProductChart',
    localField: '_id',
    foreignField: 'prodId'
  });
  
  // Set virtuals to be included in JSON response
  ProductListSchema.set('toJSON', { virtuals: true });
  ProductListSchema.set('toObject', { virtuals: true });

  module.exports = {ProductList: mongoose.model('ProductList', ProductListSchema)};