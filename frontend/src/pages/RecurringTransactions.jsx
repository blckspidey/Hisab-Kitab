import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import RecurringTransactionModal from '../components/RecurringTransactionModal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import useCurrency from '../hooks/useCurrency';
import { FiPlus, FiRefreshCw, FiCalendar, FiDollarSign, FiPause, FiPlay, FiRepeat, FiClock } from "react-icons/fi";
import { FaHistory } from "react-icons/fa"; // if you want history


const RecurringTransactions = () => {
  const [recurring, setRecurring] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showUpcoming, setShowUpcoming] = useState(false);

  const { currency } = useCurrency();

  // Fallback currency if not available
  const currencyCode = currency?.code || 'USD';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('=== FRONTEND: Fetching recurring transactions ===');
      console.log('Token:', localStorage.getItem('token'));
      console.log('API base URL:', api.defaults.baseURL);
      
      const [recurringRes, categoriesRes, upcomingRes] = await Promise.all([
        api.get('/recurring'),
        api.get('/transactions/categories'),
        api.get('/recurring/upcoming?days=7'),
      ]);
      
      console.log('Recurring transactions response:', recurringRes.data);
      console.log('Categories response:', categoriesRes.data);
      console.log('Upcoming payments response:', upcomingRes.data);
      
      setRecurring(recurringRes.data || []);
      setCategories(categoriesRes.data || []);
      setUpcomingPayments(upcomingRes.data || []);
    } catch (err) {
      console.error('Failed to fetch recurring transactions', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (formData, id) => {
    try {
      console.log('=== FRONTEND: Submitting recurring transaction ===');
      console.log('Form data:', formData);
      console.log('ID:', id);
      console.log('Token:', localStorage.getItem('token'));
      
      if (id) {
        console.log('Updating existing recurring transaction');
        await api.put(`/recurring/${id}`, formData);
      } else {
        console.log('Creating new recurring transaction');
        const response = await api.post('/recurring/create', formData);
        console.log('Create response:', response.data);
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save recurring transaction', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
    }
  };

  const handleNewCategory = (newCategory) => {
    // Add the new category to the categories list
    setCategories(prev => {
      if (!prev.includes(newCategory)) {
        return [...prev, newCategory].sort();
      }
      return prev;
    });
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        'Are you sure you want to delete this recurring transaction?'
      )
    ) {
      try {
        await api.delete(`/recurring/${id}`);
        fetchData();
      } catch (err) {
        console.error('Failed to delete recurring transaction', err);
      }
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await api.patch(`/recurring/${id}/toggle`, { isActive: !isActive });
      fetchData();
    } catch (err) {
      console.error('Failed to toggle recurring transaction', err);
    }
  };

  const handleViewHistory = async (id) => {
    try {
      const response = await api.get(`/recurring/${id}/history`);
      console.log('Transaction history:', response.data);
      // You could open a modal or navigate to a history page here
      alert(`History for this transaction:\nTotal generated: ${response.data.totalGenerated}\nLast generated: ${response.data.history[0]?.date || 'None'}`);
    } catch (err) {
      console.error('Failed to fetch transaction history', err);
    }
  };

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
              Recurring Transactions
            </h1>
            <p className="text-gray-700 dark:text-white/80 text-base sm:text-lg font-medium max-w-2xl">
              Automate your finances with recurring transactions and never miss a payment again.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowUpcoming(!showUpcoming)}
              className="group relative px-6 py-4 font-bold bg-blue-500 text-white rounded-2xl shadow-xl hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FiClock className="text-xl relative z-10" />
              <span className="relative z-10">
                {showUpcoming ? 'Hide' : 'Show'} Upcoming
              </span>
              {upcomingPayments.length > 0 && (
                <span className="relative z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {upcomingPayments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="group relative px-8 py-4 font-black bg-lime-400 text-gray-900 rounded-2xl shadow-2xl hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-lime-300 focus:ring-opacity-50 transform hover:scale-110 transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-lime-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FiPlus className="text-2xl relative z-10" />
              <span className="relative z-10 text-lg">Add Recurring</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 px-4 pb-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : (
          <>
            {/* Upcoming Payments Section */}
            {showUpcoming && upcomingPayments.length > 0 && (
              <div className="relative group bg-blue-50 dark:bg-blue-800/50 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-blue-200 dark:border-blue-400/20 hover:border-blue-400/40 transition-all duration-500 animate-fade-in-up mb-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center">
                      <FiClock className="text-2xl text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Upcoming Payments (Next 7 Days)</h2>
                  </div>
                  
                  <div className="grid gap-4">
                    {upcomingPayments.map((payment) => (
                      <div key={payment._id} className="bg-blue-100 dark:bg-blue-700/30 rounded-xl p-4 border border-blue-200 dark:border-blue-400/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-gray-900 dark:text-white font-bold">{payment.name}</h3>
                            <p className="text-blue-700 dark:text-blue-200 text-sm">{payment.category}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${payment.isIncome ? 'text-green-400' : 'text-red-400'}`}>
                              {payment.isIncome ? '+' : '-'}
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: currencyCode,
                            }).format(payment.amount)}
                            </p>
                            <p className="text-blue-200 text-sm">
                              Due: {new Date(payment.nextDueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Recurring Transactions Table */}
            <div className="relative group bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-lime-400/10 dark:border-lime-400/20 hover:border-lime-400/40 transition-all duration-500 animate-fade-in-up">
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl flex items-center justify-center">
                    <FiRefreshCw className="text-2xl text-gray-900" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Your Recurring Transactions</h2>
                </div>
                
                {recurring.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-lime-400/20">
                          <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                            Frequency
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                            Next Due
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 uppercase tracking-wider">
                            Generated
                          </th>
                          <th className="px-6 py-4 text-right text-sm font-bold text-lime-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                    <tbody className="divide-y divide-lime-400/10">
                      {recurring.map((r) => (
                        <tr key={r._id} className="hover:bg-lime-400/5 transition-all duration-300">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">{r.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">
                            {r.category}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap font-bold ${
                              r.isIncome ? 'text-lime-400' : 'text-red-400'
                            }`}
                          >
                            {r.isIncome ? '+' : '-'}
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: currencyCode,
                            }).format(r.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">
                            {r.isIncome ? 'Income' : 'Expense'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-lime-600 dark:text-lime-400 font-semibold">
                            {r.frequency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">
                            {new Date(r.nextDueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              r.isActive 
                                ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                                : 'bg-red-500/20 text-red-400 border border-red-400/30'
                            }`}>
                              {r.isActive ? 'Active' : 'Paused'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">
                            {r.generatedCount || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handleToggleActive(r._id, r.isActive)}
                                className={`p-2 rounded-lg transition-colors duration-300 ${
                                  r.isActive 
                                    ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-400/10' 
                                    : 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                                }`}
                                title={r.isActive ? 'Pause' : 'Resume'}
                              >
                                {r.isActive ? <FiPause className="h-4 w-4" /> : <FiPlay className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleViewHistory(r._id)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-2 rounded-lg transition-colors duration-300"
                                title="View History"
                              >
                                <FaHistory className="h-4 w-4" />

                              </button>
                              <button
                                onClick={() => handleOpenModal(r)}
                                className="text-lime-400 hover:text-lime-300 hover:bg-lime-400/10 p-2 rounded-lg transition-colors duration-300"
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(r._id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-colors duration-300"
                                title="Delete"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState message="No recurring transactions" />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <RecurringTransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        transaction={editingTransaction}
        categories={categories}
        onNewCategory={handleNewCategory}
      />
    </div>
  );
};

export default RecurringTransactions;
