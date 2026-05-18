Hisab KITAB

Hisab-Kitab
Hisab-Kitab is a full-stack personal finance management app built with React (frontend), Node.js/Express (backend), MongoDB (database), and enhanced with Google Gemini AI for OCR-based receipt scanning. It helps users track income, expenses, receipts, and visualize financial analytics via charts.

Features
Authentication – JWT-based login & signup
Transactions Management – Add income and expenses with categories
Analytics & Charts – Visual breakdown by category, income/expense trends
Receipt Management – Upload receipts and automatically extract expense details using Google Gemini OCR
Account Settings – View your profile and delete your account permanently from the app.
Tech Stack
Frontend:

React + Vite
TailwindCSS
Backend:

Node.js + Express
MongoDB + Mongoose
JWT Authentication
Multer (for file uploads)
Google Gemini AI SDK (for OCR)
Dev Tools:

Nodemon
dotenv
Hosting:

Frontend → Netlify
Backend → Render
Database → MongoDB Atlas (Hisab-Kitab database)
Project Structure
.
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   ├── insightsController.js
│   │   ├── receiptController.js
│   │   ├── recurringTransactionController.js
│   │   ├── transactionController.js
│   │   └── userController.js
│   ├── cron.js
│   ├── Dockerfile
│   ├── eng.traineddata
│   ├── jest.config.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── sanitizeMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── Budget.js
│   │   ├── IncomeExpense.js
│   │   ├── Receipt.js
│   │   ├── RecurringTransactions.js
│   │   └── User.js
│   ├── nodemon.json
│   ├── package-lock.json
│   ├── package.json
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── insightsRoutes.js
│   │   ├── receiptRoutes.js
│   │   ├── recurringTransactionRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   ├── seed.js
│   ├── server.js
│   ├── uploads/
│   ├── utils/
│   │   ├── mailer.js
│   │   └── utils.js
├── docker-compose.yml
├── docs/
├── frontend/
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/
│   ├── src/
│   ├── tailwind.config.js
│   └── vite.config.js
├── package-lock.json
└── README.md
Getting Started
Fork the repository
Before cloning, make sure to fork the repository to your GitHub account.

Go to the GitHub repo page:
Click Fork in the top-right corner.
Clone your fork
git clone 
cd Hisab-Kitab
Backend Setup
cd backend
npm install
Create a .env file in the backend/ folder:

PORT=5000
MONGO_URI=your-mongodb-atlas-uri/hisab-kitab
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
KEEP_ALIVE_URL=http://localhost:5000
# Public URL of the frontend used to build reset links
APP_URL=http://localhost:5173

# SMTP (enable real email for password reset)
# Example for a typical SMTP provider; adjust to yours
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
# Optional sender; defaults to SMTP_USER if omitted
SMTP_FROM="Hisab-Kitab <no-reply@example.com>"
Start the backend:

npm run dev
Backend will run on → http://localhost:5000

Frontend Setup
cd frontend
npm install
Create a .env file in the frontend/ folder:

VITE_API_URL=http://localhost:5000
Start the frontend:

npm run dev
Frontend will run on → http://localhost:5173

Core API Endpoints
Auth
POST /api/auth/signup → Register new user
POST /api/auth/login → Login user
GET /api/auth/me → Fetch profile of current user
PUT /api/auth/setup → Complete initial user setup
POST /api/auth/forgot-password → Request a password reset link
POST /api/auth/reset-password/:token → Reset user password
POST /api/auth/change-password → Change password (authenticated)
Transactions
GET /api/transactions → List all transactions (paginated)
POST /api/transactions → Add a new transaction
PUT /api/transactions/:id → Update an existing transaction
DELETE /api/transactions/:id → Remove a transaction
GET /api/transactions/summary → Get summary (income, expense, recent)
GET /api/transactions/charts → Data for analytics charts
GET /api/transactions/categories → All categories
GET /api/transactions/categories/expense → Expense categories
GET /api/transactions/categories/income → Income categories
DELETE /api/transactions/category → Delete custom category
GET /api/transactions/export → Export all transactions
DELETE /api/transactions/bulk → Bulk delete transactions
Budgets
POST /api/budgets → Create a new budget
GET /api/budgets → List all budgets
PUT /api/budgets/:id → Update a budget
DELETE /api/budgets/:id → Delete a budget
GET /api/budgets/summary → Get budget summary (totals, remaining, etc.)
GET /api/budgets/alerts → View upcoming/triggered budget alerts
Insights
GET /api/insights/monthly → Get monthly financial insights
Receipts
POST /api/receipts/upload → Upload receipt, trigger OCR, create transaction
Recurring Transactions
POST /api/recurring-transactions/create → Create a new recurring transaction
GET /api/recurring-transactions → List recurring transactions
GET /api/recurring-transactions/upcoming → List upcoming recurring payments
DELETE /api/recurring-transactions/:id → Delete a recurring transaction
PUT /api/recurring-transactions/:id → Update a recurring transaction
PATCH /api/recurring-transactions/:id/toggle → Pause/activate a recurring transaction
GET /api/recurring-transactions/:id/history → Get history for a recurring transaction
Users
DELETE /api/users/account → Delete your account permanently
