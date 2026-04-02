import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import useCurrency from '../hooks/useCurrency';
import BudgetModal from '../components/BudgetModal';
import EmptyState from '../components/EmptyState';
import { FiPlus, FiDollarSign, FiTrendingUp, FiCalendar } from "react-icons/fi";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetsRes, categoriesRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/transactions/categories/expense'),
      ]);
      console.log('Budget API Response:', budgetsRes.data);
      setBudgets(budgetsRes.data);
      setCategories(categoriesRes.data);
      // No need to fetch transactions separately - budget API now includes spent amounts
    } catch (error) {
      console.error('Failed to fetch budgets or transactions', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenBudgetModal = (budget = null) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleCloseBudgetModal = () => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
  };

  const handleFormSubmit = async (formData, id) => {
    try {
      if (id) await api.put(`/budgets/${id}`, formData);
      else await api.post('/budgets', formData);
      fetchData();
      handleCloseBudgetModal();
    } catch (error) {
      console.error('Failed to save budget', error);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await api.delete(`/budgets/${id}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete budget', error);
      }
    }
  };

  // No need for manual calculation - backend now provides spent amounts

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors">
      {/* Dark Grid Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900" style={{
        backgroundImage: `
          linear-gradient(rgba(34, 197, 94, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 197, 94, 0.06) 1px, transparent 1px)
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
      <div className="relative z-10 p-8 mb-8 mx-4">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Budget Management
            </h1>
            <p className="text-gray-700 dark:text-white/80 text-base sm:text-lg font-medium max-w-2xl">
              Track your spending against your budgets and stay on top of your financial goals.
            </p>
          </div>
          <button
            onClick={() => handleOpenBudgetModal()}
            className="group relative px-8 py-4 font-black bg-cyan-400 text-gray-900 rounded-2xl shadow-2xl hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50 transform hover:scale-110 transition-all duration-300 flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FiPlus className="text-2xl relative z-10" />
            <span className="relative z-10 text-lg">Add Budget</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 px-4 pb-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : budgets.length > 0 ? (
          <div className="relative group bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-lime-400/10 dark:border-lime-400/20 hover:border-lime-400/40 transition-all duration-500 animate-fade-in-up">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl flex items-center justify-center">
                  <FiDollarSign className="text-2xl text-gray-900" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Your Budgets</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-lime-400/20">
                      <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                        Spent
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                        Remaining
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-lime-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lime-400/10">
                    {budgets.map((b) => {
                      // Use data from backend API
                      const spent = b.spent || 0;
                      const remaining = b.remaining || (b.amount - spent);
                      const percent = b.percentageUsed || Math.min((spent / b.amount) * 100, 100).toFixed(1);
                      
                      console.log(`Budget ${b.category}:`, {
                        amount: b.amount,
                        spent: spent,
                        remaining: remaining,
                        percent: percent,
                        alertStatus: b.alertStatus
                      });

                      return (
                        <tr key={b._id} className="hover:bg-lime-400/5 transition-all duration-300">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">
                            {b.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">{`${b.month}/${b.year}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-lime-400 font-bold">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: currency.code,
                            }).format(b.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-red-400 font-bold">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: currency.code,
                            }).format(spent)}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap font-bold ${
                              remaining >= 0 ? 'text-lime-400' : 'text-red-400'
                            }`}
                          >
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: currency.code,
                            }).format(remaining)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap w-1/3">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    b.alertStatus === 'exceeded' ? 'bg-red-500' :
                                    b.alertStatus === 'warning' ? 'bg-yellow-500' : 'bg-lime-500'
                                  }`}
                                  style={{ width: `${Math.min(percent, 100)}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-semibold ${
                                b.alertStatus === 'exceeded' ? 'text-red-400' :
                                b.alertStatus === 'warning' ? 'text-yellow-400' : 'text-lime-400'
                              }`}>
                                {percent}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteBudget(b._id)}
                              className="text-red-400 hover:text-red-300 font-bold transition-colors duration-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative group bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-lime-400/10 dark:border-lime-400/20 hover:border-lime-400/40 transition-all duration-500 animate-fade-in-up">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <EmptyState message="No budgets found" />
            </div>
          </div>
        )}
      </div>

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={handleCloseBudgetModal}
        onSubmit={handleFormSubmit}
        budget={editingBudget}
        categories={categories}
      />
    </div>
  );
};

export default Budgets;
