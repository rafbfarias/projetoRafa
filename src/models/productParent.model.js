// Schema for ProductParent - Parent product categories and reference information
const ProductParentSchema = new mongoose.Schema({
    parentId: {
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
    averagePrice: {
      type: Number,
      required: true
    },
    photo: {
      type: String
    },
    allergens: [{
      type: String
    }],
    lastUpdate: {
      type: Date,
      default: Date.now
    },
    preparations: [{
      type: Schema.Types.ObjectId,
      ref: 'Preparation'
    }]
  }, {
    timestamps: true,
    collection: 'product_parents'
  });
  
  module.exports = {ProductParent: mongoose.model('ProductParent', ProductParentSchema)};