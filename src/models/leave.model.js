const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AbsenceSchema = new mongoose.Schema({
  // Identification Fields
  absenceId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Manager Information
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  managerName: {
    type: String
  },
  managerUnit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  
  // Staff Information
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staffName: {
    type: String,
    required: true
  },
  staffUnit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  contractId: {
    type: Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  
  // Absence Type and Vacation Status
  absenceType: {
    type: String,
    required: true
  },
  vacationDaysEntitled: {
    type: Number,
    default: 0
  },
  vacationDaysTaken: {
    type: Number,
    default: 0
  },
  vacationDaysRemaining: {
    type: Number,
    default: 0
  },
  
  // Absence Period
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  totalHours: {
    type: Number
  },
  referenceMonth: {
    type: String,
    required: true
  },
  referenceYear: {
    type: Number,
    required: true
  },
  
  // Additional Information
  notes: {
    type: String
  },
  processed: {
    type: Boolean,
    default: false
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Supporting Documents
  supportingPhotoPath: {
    type: String
  },
  supportingPdfPath: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Absence', AbsenceSchema);