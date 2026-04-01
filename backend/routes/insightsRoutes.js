const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMonthlyInsight } = require('../controllers/insightsController');

router.use(protect);

router.get('/monthly', getMonthlyInsight);

module.exports = router;



