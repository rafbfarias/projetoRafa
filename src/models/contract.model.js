const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContractSchema = new mongoose.Schema({
  // Contract Identification
  contractId: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Employee and Position Information
  unit: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  
  // Contract Details
  contractType: {
    type: String,
    required: true
  },
  employmentType: {
    type: String,
    required: true
  },
  hoursPerWeek: {
    type: Number,
    required: true
  },
  contractDurationMonths: {
    type: Number
  },
  
  // Contract Dates
  startDate: {
    type: Date,
    required: true
  },
  firstRenewalDate: {
    type: Date
  },
  secondRenewalDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  terminationInitiative: {
    type: String
  },
  
  // Compensation
  totalGrossAnnual: {
    type: Number,
    required: true
  },
  baseSalary: {
    type: Number,
    required: true
  },
  mealAllowance: {
    type: Number,
    default: 0
  },
  holidayAllowance: {
    type: Number,
    default: 0
  },
  christmasAllowance: {
    type: Number,
    default: 0
  },
  transportAllowance: {
    type: Number,
    default: 0
  },
  expenseAllowance: {
    type: Number,
    default: 0
  },
  fixedBonus: {
    type: Number,
    default: 0
  },
  maxVariableBonus: {
    type: Number,
    default: 0
  },
  variableBonusRules: {
    type: String
  },
  hourlyRate: {
    type: Number
  },
  
  // Vacation Information
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
  vacationDaysCurrentYear: {
    type: Number,
    default: 0
  },
  
  // Company and Documentation
  company: {
    type: String,
    required: true
  },
  digitalContractPath: {
    type: String
  },
  hasTransportBenefit: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  },
  
  // References to other models
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contract', ContractSchema);