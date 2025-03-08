
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupplierSchema = new mongoose.Schema({
  // Basic Information
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  fiscalName: {
    type: String,
    required: true,
    trim: true
  },
  vatNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  fiscalAddress: {
    type: String,
    required: true,
    trim: true
  },
  fiscalCity: {
    type: String,
    required: true,
    trim: true
  },    
  fiscalPostalCode: {
    type: String,
    required: true,
    trim: true
  },        
  fiscalCountry: {
    type: String,
    required: true,
    trim: true
  },
  
  // Locations - Array of objects with location details
  locationsProvider: [{
    address: {
      type: String,
      required: true
    },
    city: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Portugal'
    },
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  
  // Category information
  modality: {
    type: Schema.Types.ObjectId,
    ref: 'CostModality'
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'CostCategory'
  },
  subcategory: {
    type: Schema.Types.ObjectId,
    ref: 'CostSubcategory'
  },
  
  // Products supplied
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'ProductList'
  }],
  
  // Commercial Contact
  commercialContact: {
    name: String,
    phone: String,
    email: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    }
  },
  
  // Financial Contact
  financialContact: {
    name: String,
    phone: String,
    email: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    }
  },
  
  // Banking & Payment Details
  iban: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Credit Card', 'Check', 'Cash', 'Direct Debit', 'Other'],
    default: 'Bank Transfer'
  },
  paymentTerms: {
    type: String
  },
  
  // Notes & Observations
  observations: {
    type: String
  },
  
  // Supplier Ratings (1-5 scale)
  ratings: {
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    price: {
      type: Number,
      min: 1,
      max: 5
    },
    reliability: {
      type: Number,
      min: 1,
      max: 5
    },
    deliveryTime: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    paymentTerms: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Status Flags
  isActive: {
    type: Boolean,
    default: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  
  // References to related models
  companyIdRef: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  unitIdRef: {
    type: Schema.Types.ObjectId,
    ref: 'Unit'
  },
  
  // Document storage
  documents: [{
    type: String,  // Path to stored documents
    description: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  lastOrderDate: {
    type: Date
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'suppliers'
});

// Virtual for purchase orders
SupplierSchema.virtual('purchaseOrders', {
  ref: 'PurchaseOrder',
  localField: '_id',
  foreignField: 'supplierId'
});

// Virtual for product charts
SupplierSchema.virtual('productCharts', {
  ref: 'ProductChart',
  localField: '_id',
  foreignField: 'supplierId'
});

// Set virtuals to JSON
SupplierSchema.set('toJSON', { virtuals: true });
SupplierSchema.set('toObject', { virtuals: true });

// Calculate average rating method
SupplierSchema.methods.calculateOverallRating = function() {
  const ratings = this.ratings;
  let sum = 0;
  let count = 0;
  
  if (ratings.price) { sum += ratings.price; count++; }
  if (ratings.reliability) { sum += ratings.reliability; count++; }
  if (ratings.deliveryTime) { sum += ratings.deliveryTime; count++; }
  if (ratings.punctuality) { sum += ratings.punctuality; count++; }
  if (ratings.paymentTerms) { sum += ratings.paymentTerms; count++; }
  
  return count > 0 ? sum / count : 0;
};

// Update overall rating before saving
SupplierSchema.pre('save', function(next) {
  if (this.isModified('ratings.price') || 
      this.isModified('ratings.reliability') || 
      this.isModified('ratings.deliveryTime') || 
      this.isModified('ratings.punctuality') || 
      this.isModified('ratings.paymentTerms')) {
    this.ratings.overall = this.calculateOverallRating();
  }
  next();
});

// Create text index for search functionality
SupplierSchema.index({
  supplierName: 'text',
  fiscalName: 'text',
  'commercialContact.name': 'text',
  'financialContact.name': 'text',
  observations: 'text'
});

module.exports = mongoose.model('Supplier', SupplierSchema);