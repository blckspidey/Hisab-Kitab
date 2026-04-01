const cron = require('node-cron');
const { generateDueTransactions } = require('./controllers/recurringTransactionController');

// Run daily at midnight to check for due recurring transactions
cron.schedule('0 0 * * *', async () => {
    console.log('=== Running Daily Recurring Transactions Cron ===');
    await generateDueTransactions();
});

// Run every hour to check for upcoming payments (for reminders)
cron.schedule('0 * * * *', async () => {
    console.log('=== Running Hourly Upcoming Payments Check ===');
    // This could be used for sending reminders
    // For now, we'll just log upcoming payments
    try {
        const RecurringTransaction = require('./models/RecurringTransactions');
        const { isReminderDue } = require('./utils');
        
        const upcomingTransactions = await RecurringTransaction.find({
            isActive: true,
            reminderSent: false
        });

        for (const transaction of upcomingTransactions) {
            if (isReminderDue(transaction.nextDueDate, 1)) {
                console.log(`REMINDER: ${transaction.name} is due tomorrow (${transaction.nextDueDate})`);
                // Here you could send email notifications, push notifications, etc.
                // For now, we'll just mark as reminder sent
                await RecurringTransaction.findByIdAndUpdate(transaction._id, {
                    reminderSent: true
                });
            }
        }
    } catch (err) {
        console.error('Error in reminder cron job:', err.message);
    }
});