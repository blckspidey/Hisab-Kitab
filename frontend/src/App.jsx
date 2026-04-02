import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import ReceiptsPage from './pages/ReceiptsPage';
import WelcomePage from './pages/WelcomePage';
import SettingsPage from './pages/SettingsPage';
import Budgets from './pages/Budgets';
import ContactUs from './pages/ContactUs';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SetupProtectedRoute from './components/SetupProtectedRoute';
import RecurringTransactions from './pages/RecurringTransactions';
import AIInsightsPage from './pages/AIInsightsPage';
import BudgetAlertToast from './components/BudgetAlertToast';
import UpcomingPaymentsNotification from './components/UpcomingPaymentsNotification';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/contact" element={<ContactUs />} />
        {/* Protected Routes */}
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <SetupPage />
            </ProtectedRoute>
          }
        />
        {/* Protected Routes Wrapper */}
        <Route
          element={
            <SetupProtectedRoute>
              <Layout />
            </SetupProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/receipts" element={<ReceiptsPage />} />
          <Route path="/insights" element={<AIInsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route
            path="/recurring-transactions"
            element={<RecurringTransactions />}
          />
        </Route>
      </Routes>
      <ToastContainer />
      <BudgetAlertToast />
      <UpcomingPaymentsNotification />
      </div>
    </ErrorBoundary>
  );
}

export default App;
