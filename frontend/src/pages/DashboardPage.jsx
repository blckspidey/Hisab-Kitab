import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import CategoryPieChart from '../components/CategoryPieChart';
import ActivityBarChart from '../components/ActivityBarChart';
import LineChart from '../components/LineChart';
import TransactionModal from '../components/TransactionModal';
import useCurrency from '../hooks/useCurrency';
import useTheme from '../hooks/useTheme';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { IoWarning } from "react-icons/io5";
import { FiDollarSign, FiMinus, FiPlus } from "react-icons/fi";
import { Calendar, DollarSign, Filter, TrendingDown, TrendingUp } from 'lucide-react';



// A reusable card component for the dashboard summary
const SummaryCard = ({ title, value, bgColor, textColor, icon, loading, sticker }) => {
  const { currency } = useCurrency();
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
  }).format(value);
  const cardBg = bgColor || 'bg-white dark:bg-gray-800/50';

  return (
    <div className={`relative group overflow-hidden rounded-3xl ${cardBg} backdrop-blur-sm border border-cyan-400/15 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:border-cyan-400/35`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/7 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce"></div>
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-cyan-400/40 rounded-full animate-ping"></div>
      
      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-cyan-400">{sticker}</span>
            <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white">{title}</h3>
          </div>
          <div className="text-4xl text-cyan-400/80 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
        
        {loading ? (
          <div className="h-12 bg-cyan-400/20 rounded-2xl animate-pulse"></div>
        ) : (
          <div className="space-y-2">
            <p className={`text-3xl md:text-4xl font-black ${textColor || 'text-cyan-400'} group-hover:scale-105 transition-transform duration-300`}>
              {formattedValue}
            </p>
            <div className="w-full h-1 bg-cyan-400/20 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400/60 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [chartData, setChartData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const { currency } = useCurrency();
  const { theme } = useTheme();
  const dashboardQuotes = [
    "Small expenses, big impact.",
    "Plan today. Prosper tomorrow.",
    "Budgeting is money clarity.",
    "Track. Learn. Improve your habits.",
  ];
  const dailyQuote = dashboardQuotes[new Date().getDate() % dashboardQuotes.length];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, chartRes, expenseCategoriesRes, // New API call
        incomeCategoriesRes] = await Promise.all([
          api.get('/transactions/summary'),
          api.get('/transactions/charts'),
          api.get('/transactions/categories/expense'),
          api.get('/transactions/categories/income')
        ]);
      console.log(chartRes)
      setSummaryData(summaryRes.data);
      setChartData(chartRes.data);
      setExpenseCategories(expenseCategoriesRes.data);
      setIncomeCategories(incomeCategoriesRes.data);
      setRecentTransactions(summaryRes.data.recentTransactions || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormSubmit = async (formData) => {
    if (!formData.name || formData.name.trim() === "") {
      alert("Please enter a name for the transaction");
      return;
    }
    if (!formData.cost || isNaN(formData.cost) || Number(formData.cost) <= 0) {
      alert("Please enter a valid cost greater than 0");
      return;
    }
    if (!formData.category || formData.category.trim() === "") {
      alert("Please select a category");
      return;
    }

    try {
      await api.post("/transactions", formData);
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save transaction", error);
    }
  };

  const handleNewCategory = (newCategory, isIncome) => {
    if (isIncome) {
      setIncomeCategories(prev => [...prev, newCategory].sort());
    } else {
      setExpenseCategories(prev => [...prev, newCategory].sort());
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors">
      {/* Dark Grid Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900" style={{
        backgroundImage: `
          linear-gradient(rgba(20, 184, 166, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(20, 184, 166, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}></div>
      
      {/* Dynamic Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-lime-400 rounded-2xl transform rotate-12 animate-float opacity-60">
          <div className="w-full h-full border-2 border-lime-400 rounded-xl m-2">
            <div className="w-full h-full border-2 border-lime-400 rounded-lg m-2"></div>
          </div>
        </div>
        <div className="absolute bottom-32 left-16 w-24 h-24 border-2 border-lime-400 rounded-2xl transform -rotate-12 animate-float-delayed opacity-40">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-lime-400 rounded"></div>
            <div className="w-6 h-6 border-2 border-lime-400 rounded ml-1"></div>
            <div className="w-4 h-4 border-2 border-lime-400 rounded ml-1"></div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 border-2 border-lime-400 rounded-2xl transform rotate-45 animate-float-slow opacity-30">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-4 h-8 border-2 border-lime-400 rounded"></div>
            <div className="w-4 h-6 border-2 border-lime-400 rounded ml-1"></div>
            <div className="w-4 h-4 border-2 border-lime-400 rounded ml-1"></div>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 p-4 md:p-8 mb-6 md:mb-8 mx-2 md:mx-4">
        <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6">
          <div className="space-y-2 md:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-black text-gray-900 dark:text-white mb-1 md:mb-2 leading-tight">
              Track every rupee, effortlessly
            </h1>
            <p className="text-gray-700 dark:text-white/80 text-sm sm:text-base md:text-lg font-medium max-w-2xl">
              Hisab-Kitab helps you plan, monitor income & expenses, and stay ahead of your goals.
            </p>
            <div className="pt-2">
              <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-600 dark:text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-3 py-2 rounded-full">
                Track every rupee. Plan every month.
              </p>
              <blockquote className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 italic">
                “{dailyQuote}”
              </blockquote>
            </div>
          </div>
          <button
            onClick={handleOpenModal}
            className="group relative px-6 py-3 md:px-8 md:py-4 font-black bg-cyan-400 text-gray-900 rounded-2xl shadow-2xl hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50 transform hover:scale-110 transition-all duration-300 flex items-center gap-2 md:gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FiPlus className="text-xl md:text-2xl relative z-10" />
            <span className="relative z-10 text-sm md:text-lg">Start now</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12 px-2 md:px-4">
        <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <SummaryCard 
            title="Total Income" 
            value={summaryData.totalIncome} 
            bgColor="bg-white dark:bg-gray-800/50" 
            textColor="text-cyan-400"
            icon={<TrendingUp />}
            sticker={<TrendingUp className="w-6 h-6" />}
            loading={loading} 
          />
        </div>
        <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <SummaryCard 
            title="Total Expense" 
            value={summaryData.totalExpenses} 
            bgColor="bg-white dark:bg-gray-800/50" 
            textColor="text-cyan-400"
            icon={<TrendingDown />}
            sticker={<TrendingDown className="w-6 h-6" />}
            loading={loading} 
          />
        </div>
        <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <SummaryCard 
            title="Current Balance" 
            value={summaryData.balance} 
            bgColor="bg-white dark:bg-gray-800/50" 
            textColor="text-cyan-400"
            icon={<DollarSign />}
            sticker={<DollarSign className="w-6 h-6" />}
            loading={loading} 
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12 px-2 md:px-4">
        {/* Expenses by Category */}
        <div className="relative group bg-white dark:bg-gray-800/50 backdrop-blur-sm p-4 md:p-8 rounded-3xl shadow-2xl border border-cyan-400/10 dark:border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Expenses by Category</h2>
            </div>
            {loading ? <Spinner /> : chartData?.expensesByCategory.length > 0 ? (
              <CategoryPieChart data={chartData.expensesByCategory} theme={theme} />
            ) : (
              <EmptyState message="No expense data to display." icon={<IoWarning className="w-6 h-6 text-lime-400" />} />
            )}
          </div>
        </div>

        {/* Recent Activity & Transactions */}
        <div className="relative group bg-white dark:bg-gray-800/50 backdrop-blur-sm p-4 md:p-8 rounded-3xl shadow-2xl border border-cyan-400/10 dark:border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
            <div className="relative h-64 sm:h-72 md:h-80">
              {loading ? <Spinner /> : (chartData?.expensesOverTime.length > 0 || chartData?.incomeOverTime.length > 0) ? (
                <ActivityBarChart
                  expensesData={chartData.expensesOverTime}
                  incomeData={chartData.incomeOverTime}
                  theme={theme}
                />
              ) : (
                <EmptyState message="No recent activity to display." />
              )}
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Recent Transactions</h3>
              </div>
              {loading ? <p className="text-gray-400 mt-2">Loading transactions...</p> : recentTransactions.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-lime-400/20 scrollbar-track-transparent">
                  {recentTransactions.map(tx => (
                    <div key={tx._id} className="flex justify-between items-center p-4 bg-cyan-400/5 rounded-2xl backdrop-blur-sm border border-cyan-400/10 hover:bg-cyan-400/10 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${tx.isIncome ? 'bg-lime-400' : 'bg-red-400'} animate-pulse`}></div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{tx.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(tx.addedOn).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className={`font-black text-lg ${tx.isIncome ? 'text-lime-400' : 'text-red-400'}`}>
                        {tx.isIncome ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(tx.cost)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 mt-2">No recent transactions.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 px-2 md:px-4 pb-6 md:pb-8">
        <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm p-4 md:p-8 rounded-3xl shadow-2xl border border-cyan-400/10 dark:border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Income Over Time</h2>
            </div>
            {loading ? <Spinner /> : chartData?.incomeOverTime.length > 0 ? (
              <LineChart label={"Income"} data={chartData.incomeOverTime} theme={theme} />
            ) : (
              <EmptyState message="No income data to display." icon={<IoWarning className="w-6 h-6 text-lime-400" />} />
            )}
          </div>
        </div>
        
        <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm p-4 md:p-8 rounded-3xl shadow-2xl border border-cyan-400/10 dark:border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Expenses Over Time</h2>
            </div>
            {loading ? <Spinner /> : chartData?.expensesOverTime.length > 0 ? (
              <LineChart label={"Expenses"} data={chartData.expensesOverTime} theme={theme} />
            ) : (
              <EmptyState message="No expense data to display." icon={<IoWarning className="w-6 h-6 text-lime-400" />} />
            )}
          </div>
        </div>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleFormSubmit} expenseCategories={expenseCategories}
        incomeCategories={incomeCategories} onNewCategory={handleNewCategory} currentBalance={summaryData.balance} />
    </div>
  );
};

export default DashboardPage;
