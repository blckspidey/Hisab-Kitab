
const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    isIncome: { type: Boolean, required: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Optional end date for recurring transactions
    nextDueDate: { type: Date },
    isActive: { type: Boolean, default: true }, // For pause/resume functionality
    description: { type: String, default: '' },
    lastGeneratedDate: { type: Date }, // Track when the last transaction was generated
    generatedCount: { type: Number, default: 0 }, // Count of generated transactions
    reminderSent: { type: Boolean, default: false }, // Track if reminder was sent
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);
