const express = require('express');
const router = express.Router();
const { 
    createBudget, 
    getBudgets, 
    updateBudget, 
    deleteBudget, 
    getBudgetSummary, 
    getBudgetAlerts 
} = require('../controllers/budgetController.js');
const { protect } = require('../middleware/authMiddleware');

// Budget CRUD operations
router.post('/', protect, createBudget);
router.get('/', protect, getBudgets);
router.put('/:id', protect, updateBudget);
router.delete('/:id', protect, deleteBudget);

// Budget dashboard and analytics
router.get('/summary', protect, getBudgetSummary);
router.get('/alerts', protect, getBudgetAlerts);

module.exports = router;
