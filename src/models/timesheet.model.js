const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KeyLogSchema = new mongoose.Schema({
  // Identification Fields
  keyLogId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  
  // Position Information
  position: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  
  // Time and Date Information
  day: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  
  // Location
  address: {
    type: String
  },
  coordinates: {
    type: {
      lat: Number,
      lng: Number
    }
  },
  
  // Check-in/Check-out Times
  timeIn: {
    type: Date,
    required: true
  },
  breakStartTime: {
    type: Date
  },
  breakEndTime: {
    type: Date
  },
  timeOut: {
    type: Date,
    required: true
  },
  
  // Hours Calculation
  totalHours: {
    type: String,
    required: true
  },
  totalBreakHours: {
    type: String
  },
  bhHours: {
    type: String,
    default: "0:00:00"
  },
  contractHours: {
    type: String,
    required: true
  },
  
  // Additional Information
  refUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isTopPerformer: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('KeyLog', KeyLogSchema);