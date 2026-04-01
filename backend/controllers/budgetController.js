const mongoose = require("mongoose");
const Budget = require('../models/Budget.js');
const IncomeExpense = require('../models/IncomeExpense.js');

const createBudget = async (req, res) => {
    try {
        const { 
            category, 
            amount, 
            month, 
            year, 
            week, 
            budgetType = 'monthly', 
            alertThreshold = 80,
            description = '' 
        } = req.body;

        // Validate required fields based on budget type
        if (budgetType === 'monthly' && (!month || !year)) {
            return res.status(400).json({ message: 'Month and year are required for monthly budgets' });
        }
        if (budgetType === 'weekly' && (!week || !year)) {
            return res.status(400).json({ message: 'Week and year are required for weekly budgets' });
        }

        // Check if budget already exists for this category and period
        const existingBudget = await Budget.findOne({
            user: req.user.id,
            category,
            budgetType,
            ...(budgetType === 'monthly' ? { month, year } : { week, year }),
            isActive: true
        });

        if (existingBudget) {
            return res.status(400).json({ 
                message: `Budget already exists for ${category} in this ${budgetType} period` 
            });
        }

        const budget = new Budget({ 
            user: req.user.id, 
            category, 
            amount, 
            month, 
            year, 
            week,
            budgetType,
            alertThreshold,
            description
        });
        
        const savedBudget = await budget.save();
        res.status(201).json(savedBudget);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const getBudgets = async (req, res) => {
    try {
        const { budgetType, month, year, week } = req.query;
        const userId = req.user.id;

        // Build query based on filters
        let query = { user: userId, isActive: true };
        
        if (budgetType) query.budgetType = budgetType;
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);
        if (week) query.week = parseInt(week);

        const budgets = await Budget.find(query);

        const budgetsWithSpent = await Promise.all(
            budgets.map(async (b) => {
                let startDate, endDate;

                if (b.budgetType === 'monthly') {
                    startDate = new Date(b.year, b.month - 1, 1);
                    endDate = new Date(b.year, b.month, 0, 23, 59, 59);
                } else { // weekly
                    // Calculate start and end of week
                    const jan1 = new Date(b.year, 0, 1);
                    const daysToFirstMonday = (8 - jan1.getDay()) % 7;
                    const firstMonday = new Date(jan1.getTime() + daysToFirstMonday * 24 * 60 * 60 * 1000);
                    startDate = new Date(firstMonday.getTime() + (b.week - 1) * 7 * 24 * 60 * 60 * 1000);
                    endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
                    endDate.setHours(23, 59, 59, 999);
                }

                const result = await IncomeExpense.aggregate([
                    {
                        $match: {
                            user: new mongoose.Types.ObjectId(userId),
                            category: b.category,
                            isIncome: false,
                            isDeleted: false,
                            addedOn: { $gte: startDate, $lte: endDate },
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalSpent: { $sum: "$cost" }
                        }
                    }
                ]);

                const spent = result[0]?.totalSpent || 0;
                const remaining = b.amount - spent;
                const percentageUsed = (spent / b.amount) * 100;
                const isOverBudget = spent > b.amount;
                const isNearLimit = percentageUsed >= b.alertThreshold;

                return {
                    ...b.toObject(),
                    spent,
                    remaining,
                    percentageUsed: Math.round(percentageUsed * 100) / 100,
                    isOverBudget,
                    isNearLimit,
                    alertStatus: isOverBudget ? 'exceeded' : isNearLimit ? 'warning' : 'normal'
                };
            })
        );

        res.status(200).json(budgetsWithSpent);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const updateBudget = async (req, res) => {
    try {
        const { amount, alertThreshold, description, isActive } = req.body;
        const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        if (amount !== undefined) budget.amount = amount;
        if (alertThreshold !== undefined) budget.alertThreshold = alertThreshold;
        if (description !== undefined) budget.description = description;
        if (isActive !== undefined) budget.isActive = isActive;

        const updatedBudget = await budget.save();
        res.json(updatedBudget);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        await budget.deleteOne();
        res.json({ message: 'Budget deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get budget summary dashboard
const getBudgetSummary = async (req, res) => {
    try {
        const { budgetType = 'monthly', month, year, week } = req.query;
        const userId = req.user.id;
        const currentDate = new Date();
        
        // Default to current period if not specified
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();
        const targetWeek = week ? parseInt(week) : getWeekNumber(currentDate);

        let query = { user: userId, isActive: true };
        
        if (budgetType === 'monthly') {
            query.budgetType = 'monthly';
            query.month = targetMonth;
            query.year = targetYear;
        } else {
            query.budgetType = 'weekly';
            query.week = targetWeek;
            query.year = targetYear;
        }

        const budgets = await Budget.find(query);
        
        let totalBudget = 0;
        let totalSpent = 0;
        const categoryBreakdown = [];

        for (const budget of budgets) {
            let startDate, endDate;

            if (budget.budgetType === 'monthly') {
                startDate = new Date(budget.year, budget.month - 1, 1);
                endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);
            } else {
                const jan1 = new Date(budget.year, 0, 1);
                const daysToFirstMonday = (8 - jan1.getDay()) % 7;
                const firstMonday = new Date(jan1.getTime() + daysToFirstMonday * 24 * 60 * 60 * 1000);
                startDate = new Date(firstMonday.getTime() + (budget.week - 1) * 7 * 24 * 60 * 60 * 1000);
                endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
                endDate.setHours(23, 59, 59, 999);
            }

            const result = await IncomeExpense.aggregate([
                {
                    $match: {
                            user: new mongoose.Types.ObjectId(userId),
                            category: budget.category,
                            isIncome: false,
                            isDeleted: false,
                            addedOn: { $gte: startDate, $lte: endDate },
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSpent: { $sum: "$cost" }
                    }
                }
            ]);

            const spent = result[0]?.totalSpent || 0;
            const remaining = budget.amount - spent;
            const percentageUsed = (spent / budget.amount) * 100;

            totalBudget += budget.amount;
            totalSpent += spent;

            categoryBreakdown.push({
                category: budget.category,
                budgetAmount: budget.amount,
                spent,
                remaining,
                percentageUsed: Math.round(percentageUsed * 100) / 100,
                isOverBudget: spent > budget.amount,
                isNearLimit: percentageUsed >= budget.alertThreshold,
                alertStatus: spent > budget.amount ? 'exceeded' : percentageUsed >= budget.alertThreshold ? 'warning' : 'normal'
            });
        }

        const totalRemaining = totalBudget - totalSpent;
        const overallPercentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        res.json({
            period: {
                type: budgetType,
                month: targetMonth,
                year: targetYear,
                week: targetWeek
            },
            summary: {
                totalBudget,
                totalSpent,
                totalRemaining,
                overallPercentageUsed: Math.round(overallPercentageUsed * 100) / 100,
                isOverBudget: totalSpent > totalBudget,
                isNearLimit: overallPercentageUsed >= 80
            },
            categoryBreakdown,
            alerts: categoryBreakdown.filter(cat => cat.alertStatus !== 'normal')
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get budget alerts
const getBudgetAlerts = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();
        
        // Get all active budgets
        const budgets = await Budget.find({ user: userId, isActive: true });
        
        const alerts = [];

        for (const budget of budgets) {
            let startDate, endDate;

            if (budget.budgetType === 'monthly') {
                startDate = new Date(budget.year, budget.month - 1, 1);
                endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);
            } else {
                const jan1 = new Date(budget.year, 0, 1);
                const daysToFirstMonday = (8 - jan1.getDay()) % 7;
                const firstMonday = new Date(jan1.getTime() + daysToFirstMonday * 24 * 60 * 60 * 1000);
                startDate = new Date(firstMonday.getTime() + (budget.week - 1) * 7 * 24 * 60 * 60 * 1000);
                endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
                endDate.setHours(23, 59, 59, 999);
            }

            const result = await IncomeExpense.aggregate([
                {
                    $match: {
                            user: new mongoose.Types.ObjectId(userId),
                            category: budget.category,
                            isIncome: false,
                            isDeleted: false,
                            addedOn: { $gte: startDate, $lte: endDate },
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSpent: { $sum: "$cost" }
                    }
                }
            ]);

            const spent = result[0]?.totalSpent || 0;
            const percentageUsed = (spent / budget.amount) * 100;

            if (spent > budget.amount) {
                alerts.push({
                    type: 'exceeded',
                    category: budget.category,
                    budgetAmount: budget.amount,
                    spent,
                    overBy: spent - budget.amount,
                    percentageUsed: Math.round(percentageUsed * 100) / 100,
                    message: `Budget exceeded for ${budget.category} by ₹${(spent - budget.amount).toFixed(2)}`,
                    budgetType: budget.budgetType,
                    period: budget.budgetType === 'monthly' ? 
                        `${budget.month}/${budget.year}` : 
                        `Week ${budget.week}, ${budget.year}`
                });
            } else if (percentageUsed >= budget.alertThreshold) {
                alerts.push({
                    type: 'warning',
                    category: budget.category,
                    budgetAmount: budget.amount,
                    spent,
                    remaining: budget.amount - spent,
                    percentageUsed: Math.round(percentageUsed * 100) / 100,
                    message: `Budget warning: ${budget.category} is ${percentageUsed.toFixed(1)}% used`,
                    budgetType: budget.budgetType,
                    period: budget.budgetType === 'monthly' ? 
                        `${budget.month}/${budget.year}` : 
                        `Week ${budget.week}, ${budget.year}`
                });
            }
        }

        res.json({ alerts });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Helper function to get week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = { 
    createBudget, 
    getBudgets, 
    updateBudget, 
    deleteBudget, 
    getBudgetSummary, 
    getBudgetAlerts 
}
 