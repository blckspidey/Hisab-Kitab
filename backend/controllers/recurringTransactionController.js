const RecurringTransaction = require('../models/RecurringTransactions');
const IncomeExpense = require('../models/IncomeExpense');
const { calculateNextDueDate, calculateNextDueDateFromLast, isTransactionDue, isReminderDue } = require('../utils');

const createRecurringTransaction = async (req, res) => {
    const { name, category, amount, isIncome, frequency, startDate, endDate, description } = req.body;

    try {
       // console.log('=== CREATE RECURRING TRANSACTION DEBUG ===');
       // console.log('User ID:', req.user.id);
        //console.log('Request body:', req.body);
        
        if (!name || !category || !amount || !frequency || !startDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const nextDueDate = calculateNextDueDate(startDate, frequency);

        const recurringTransaction = new RecurringTransaction({
            user: req.user.id,
            name,
            category,
            amount,
            isIncome,
            frequency,
            startDate,
            endDate: endDate || null,
            description: description || '',
            nextDueDate,
            isActive: true,
            generatedCount: 0,
            reminderSent: false,
        });

        console.log('Creating recurring transaction with data:', {
            user: req.user.id,
            name,
            category,
            amount,
            isIncome,
            frequency,
            startDate,
            endDate,
            description,
            nextDueDate,
        });

        const createdRecurringTransaction = await recurringTransaction.save();
        console.log('Created recurring transaction:', createdRecurringTransaction);
        res.status(201).json(createdRecurringTransaction);
    } catch (err) {
        console.error('Error creating recurring transaction:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};


const getRecurringTransactions = async (req, res) => {
    try {
      //  console.log('=== GET RECURRING TRANSACTIONS DEBUG ===');
      //  console.log('User ID:', req.user.id);
      //  console.log('User object:', req.user);
        
        const transactions = await RecurringTransaction.find({ user: req.user.id });
      //  console.log('Found transactions:', transactions.length);
      //  console.log('Transactions:', transactions);
        
        res.json(transactions);
    } catch (err) {
        console.error('Error fetching recurring transactions:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};


const updateRecurringTransaction = async (req, res) => {
    try {
        const { name, category, amount, isIncome, frequency, startDate, endDate, description, isActive } = req.body;

        const updateData = { name, category, amount, isIncome, frequency, startDate, endDate, description, isActive };

        if (startDate || frequency) {
            const transaction = await RecurringTransaction.findOne({ _id: req.params.id, user: req.user.id });
            if (!transaction) {
                return res.status(404).json({ message: 'Recurring transaction not found' });
            }

            const newStartDate = startDate || transaction.startDate;
            const newFrequency = frequency || transaction.frequency;
            updateData.nextDueDate = calculateNextDueDate(newStartDate, newFrequency);
        }

        const updated = await RecurringTransaction.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            updateData,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Recurring transaction not found' });
        }

        res.json(updated);
    } catch (err) {
        console.error('Error updating recurring transaction:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};


const deleteRecurringTransaction = async (req, res) => {
    try {
        const deleted = await RecurringTransaction.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Recurring transaction not found' });
        }

        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error('Error deleting recurring transaction:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Pause/Resume functionality
const toggleRecurringTransaction = async (req, res) => {
    try {
        const { isActive } = req.body;
        
        const updated = await RecurringTransaction.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isActive },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Recurring transaction not found' });
        }

        res.json(updated);
    } catch (err) {
        console.error('Error toggling recurring transaction:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Auto-generate transactions for due recurring transactions
const generateDueTransactions = async () => {
    try {
        console.log('=== AUTO-GENERATING DUE TRANSACTIONS ===');
        
       const today = new Date();
       today.setUTCHours(0, 0, 0, 0);
        
        // Find all active recurring transactions that are due
        const dueTransactions = await RecurringTransaction.find({
            isActive: true,
            nextDueDate: { $lte: today },
            $or: [
                { endDate: { $exists: false } },
                { endDate: null },
                { endDate: { $gte: today } }
            ]
        });

        console.log(`Found ${dueTransactions.length} due recurring transactions`);

        for (const recurring of dueTransactions) {
            try {
                // Check if transaction already exists for this date
                const existingTransaction = await IncomeExpense.findOne({
                    user: recurring.user,
                    name: recurring.name,
                    category: recurring.category,
                    amount: recurring.amount,
                    isIncome: recurring.isIncome,
                    date: {
                        $gte: new Date(recurring.nextDueDate.getTime() - 24 * 60 * 60 * 1000),
                        $lt: new Date(recurring.nextDueDate.getTime() + 24 * 60 * 60 * 1000)
                    }
                });

                if (existingTransaction) {
                    console.log(`Transaction already exists for ${recurring.name} on ${recurring.nextDueDate}`);
                    // Update next due date even if transaction exists
                    const nextDue = calculateNextDueDateFromLast(recurring.nextDueDate, recurring.frequency);
                    await RecurringTransaction.findByIdAndUpdate(recurring._id, {
                        nextDueDate: nextDue,
                        lastGeneratedDate: recurring.nextDueDate,
                        generatedCount: recurring.generatedCount + 1,
                        reminderSent: false
                    });
                    continue;
                }

                // Create new transaction
                const newTransaction = new IncomeExpense({
                    user: recurring.user,
                    name: recurring.name,
                    category: recurring.category,
                    amount: recurring.amount,
                    cost: recurring.amount,
                    isIncome: recurring.isIncome,
                    date: recurring.nextDueDate,
                    addedOn: recurring.nextDueDate,
                    description: recurring.description || `Auto-generated from recurring: ${recurring.name}`,
                    isRecurring: true,
                    recurringTransactionId: recurring._id
                });

                await newTransaction.save();
                console.log(`Generated transaction: ${recurring.name} - ${recurring.amount}`);

                // Update recurring transaction
                const nextDue = calculateNextDueDateFromLast(recurring.nextDueDate, recurring.frequency);
                await RecurringTransaction.findByIdAndUpdate(recurring._id, {
                    nextDueDate: nextDue,
                    lastGeneratedDate: recurring.nextDueDate,
                    generatedCount: recurring.generatedCount + 1,
                    reminderSent: false
                });

            } catch (err) {
                console.error(`Error generating transaction for ${recurring.name}:`, err.message);
            }
        }

        console.log('Auto-generation completed');
    } catch (err) {
        console.error('Error in generateDueTransactions:', err.message);
    }
};

// Get upcoming payments (for reminders)
const getUpcomingPayments = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(days));

        const upcomingPayments = await RecurringTransaction.find({
            user: req.user.id,
            isActive: true,
            nextDueDate: {
                $gte: new Date(),
                $lte: futureDate
            },
            $or: [
                { endDate: { $exists: false } },
                { endDate: null },
                { endDate: { $gte: new Date() } }
            ]
        }).sort({ nextDueDate: 1 });

        res.json(upcomingPayments);
    } catch (err) {
        console.error('Error fetching upcoming payments:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get transaction history for a recurring transaction
const getRecurringHistory = async (req, res) => {
    try {
        const recurringId = req.params.id;
        
        // Verify the recurring transaction belongs to the user
        const recurring = await RecurringTransaction.findOne({
            _id: recurringId,
            user: req.user.id
        });

        if (!recurring) {
            return res.status(404).json({ message: 'Recurring transaction not found' });
        }

        // Get all generated transactions for this recurring transaction
        const history = await IncomeExpense.find({
            user: req.user.id,
            recurringTransactionId: recurringId
        }).sort({ date: -1 });

        res.json({
            recurring,
            history,
            totalGenerated: history.length
        });
    } catch (err) {
        console.error('Error fetching recurring history:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = {
    createRecurringTransaction,
    getRecurringTransactions,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleRecurringTransaction,
    generateDueTransactions,
    getUpcomingPayments,
    getRecurringHistory,
};
