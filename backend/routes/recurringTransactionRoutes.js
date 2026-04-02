const express = require('express');
const router = express.Router();
const { 
    createRecurringTransaction, 
    getRecurringTransactions, 
    deleteRecurringTransaction, 
    updateRecurringTransaction,
    toggleRecurringTransaction,
    getUpcomingPayments,
    getRecurringHistory
} = require('../controllers/recurringTransactionController');

const { protect } = require('../middleware/authMiddleware');
const { sanitizeMiddleware } = require('../middleware/sanitizeMiddleware');

// Apply sanitization only where user submits/updates text
router.route('/create').post(protect, sanitizeMiddleware(), createRecurringTransaction);
router.route('/').get(protect, getRecurringTransactions);
router.route('/upcoming').get(protect, getUpcomingPayments);
router.route('/:id').delete(protect, deleteRecurringTransaction);
router.route('/:id').put(protect, sanitizeMiddleware(), updateRecurringTransaction);
router.route('/:id/toggle').patch(protect, toggleRecurringTransaction);
router.route('/:id/history').get(protect, getRecurringHistory);

module.exports = router;
