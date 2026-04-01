const mongoose = require('mongoose');

const incomeExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  cost: {
    type: Number,
    required: [true, 'Please add a cost or income amount'],
  },
  amount: {
    type: Number,
  },
  addedOn: {
    type: Date,
    default: Date.now,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isIncome: {
    type: Boolean,
    required: true,
    default: false, // false for expense, true for income
  },
  note: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringTransaction',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('IncomeExpense', incomeExpenseSchema);