const calculateNextDueDate = (startDate, frequency) => {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
        throw new Error('Invalid startDate');
    }

    let nextDueDate = new Date(start);

    switch (frequency) {
        case 'daily':
            nextDueDate.setDate(nextDueDate.getDate() + 1);
            break;
        case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + 7);
            break;
        case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            break;
        case 'yearly':
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            break;
        default:
            throw new Error(`Unknown frequency: ${frequency}`);
    }

    return nextDueDate;
};

const calculateNextDueDateFromLast = (lastDate, frequency) => {
    const last = new Date(lastDate);
    if (isNaN(last.getTime())) {
        throw new Error('Invalid lastDate');
    }

    let nextDueDate = new Date(last);

    switch (frequency) {
        case 'daily':
            nextDueDate.setDate(nextDueDate.getDate() + 1);
            break;
        case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + 7);
            break;
        case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            break;
        case 'yearly':
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            break;
        default:
            throw new Error(`Unknown frequency: ${frequency}`);
    }

    return nextDueDate;
};

const isTransactionDue = (nextDueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(nextDueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate <= today;
};

const isReminderDue = (nextDueDate, reminderDays = 1) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(nextDueDate);
    dueDate.setHours(0, 0, 0, 0);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - reminderDays);
    return reminderDate <= today && dueDate > today;
};

module.exports = { 
    calculateNextDueDate, 
    calculateNextDueDateFromLast, 
    isTransactionDue, 
    isReminderDue 
};