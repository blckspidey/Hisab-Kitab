const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const axios = require('axios');
const cron = require('node-cron');

// ✅ Import auto-generation function directly here (no need for separate cron.js)
const { generateDueTransactions } = require('./controllers/recurringTransactionController');

// Optional sanitization (disabled if it broke login earlier)
const { sanitizeMiddleware } = require('./middleware/sanitizeMiddleware');

// Load environment variables
dotenv.config({ path: './.env' });

// ✅ Check environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI environment variable is required but not set!');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'bento_jwt_secret_key_2024_secure_12345';
}

if (!process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = 'your_gemini_api_key_here';
}

console.log('✅ JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// ✅ Connect to MongoDB
connectDB();

const app = express();

// Allowed CORS origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175"
];


// ✅ Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

// ✅ Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ⚠️ Commented out sanitize if it breaks login
// app.use(sanitizeMiddleware);

// ✅ Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/receipts', require('./routes/receiptRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/recurring', require('./routes/recurringTransactionRoutes'));
app.use('/api/insights', require('./routes/insightsRoutes'));

// ✅ Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Root route
app.get('/', (req, res) => {
  res.send('🌱 API is Running...');
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));

// ============================================================
// 🔁 CRON JOBS
// ============================================================

// 🟢 (1) Keep-alive ping (every 10 min)
cron.schedule("*/10 * * * *", async () => {
  const keepAliveUrl = process.env.KEEP_ALIVE_URL;
  if (!keepAliveUrl) return;

  try {
    await axios.get(keepAliveUrl);
    console.log("✅ Keep-alive ping sent!");
  } catch (error) {
    console.error("⚠️ Keep-alive FAILED:", error.message);
  }
});

// 🟢 (2) Recurring Transaction Generator
// For testing: every 1 min
cron.schedule("* * * * *", async () => {
  console.log("⏰ Checking for due recurring transactions...");
  try {
    await generateDueTransactions();
  } catch (error) {
    console.error("⚠️ Error running recurring generator:", error.message);
  }
});

// 💤 Later, switch to once daily at midnight:
// cron.schedule("0 0 * * *", async () => {
//   console.log("🌙 Running daily recurring transaction generator..");
//   await generateDueTransactions();
// });

// ============================================================
module.exports = { app, server };
