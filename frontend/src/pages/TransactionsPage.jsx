import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Edit, Trash2, ChevronLeft, ChevronRight, Plus, Download, Settings, Search, Filter, X, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../api/axios';
import TransactionModal from '../components/TransactionModal';
import TransactionDetailModal from '../components/TransactionDetailModal'
import ManageCategoriesModal from '../components/ManageCategoriesModal';
import Spinner from '../components/Spinner';
import useCurrency from '../hooks/useCurrency';
import EmptyState from '../components/EmptyState';
import { handleExportCSV } from '../utils/transactions';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  const [viewingDetails, setViewingDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedTransactionIds, setSelectedTransactionIds] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debounceTimer = useRef(null); // Changed to useRef


  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const { currency } = useCurrency();
  const isInitialMount = useRef(true);
  const allCategories = [...new Set([...expenseCategories, ...incomeCategories])]; 

  const fetchData = useCallback(async (currentSearchTerm = searchTerm) => {
    if (isInitialMount.current) {
      setLoading(true);
    } else {
      setIsFiltering(true);
    }

    try {
      console.log('=== FRONTEND: Fetching data ===');
      console.log('User token:', localStorage.getItem('token'));
      
      const [summaryRes, expenseCategoriesRes, incomeCategoriesRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions/categories/expense'),
        api.get('/transactions/categories/income')
      ]);
      
      console.log('Summary data:', summaryRes.data);
      console.log('Expense categories:', expenseCategoriesRes.data);
      console.log('Income categories:', incomeCategoriesRes.data);
      
      setSummaryData(summaryRes.data);
      setExpenseCategories(expenseCategoriesRes.data);
      setIncomeCategories(incomeCategoriesRes.data);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (currentSearchTerm) {
        params.append('search', currentSearchTerm);
      }
      if (typeFilter !== 'all') {
        params.append('isIncome', typeFilter === 'income' ? 'true' : 'false');
      }
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (dateFrom) {
        params.append('startDate', dateFrom);
      }
      if (dateTo) {
        params.append('endDate', dateTo);
      }

      console.log('Fetching transactions with params:', params.toString());
      const transactionsRes = await api.get(`/transactions?${params.toString()}`);
      console.log('Transactions response:', transactionsRes.data);
      
      setTransactions(transactionsRes.data.transactions);
      setTotalPages(transactionsRes.data.totalPages);
      setSelectedTransactionIds([]); // Clear selection on data change

    } catch (error) {
      console.error("Failed to fetch transactions data", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
    } finally {
      setLoading(false);
      setIsFiltering(false);
      isInitialMount.current = false;
    }
  }, [page, typeFilter, categoryFilter, dateFrom, dateTo, searchTerm]);

  // Fetch transactions when fetchData changes
  useEffect(() => {
    // This effect handles all data fetching except for debounced search
    if (isInitialMount.current) {
      fetchData(); // Fetch on initial mount
    } else {
       // Debounced search is handled separately in handleSearchChange
      if (!debounceTimer.current) {
        fetchData();
      }
    }
  }, [fetchData]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchData(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const clearAllFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };
  
  const hasActiveFilters = searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || dateFrom || dateTo;

  const handleOpenTransactionModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const handleOpenDetailsModal = (transaction) => {
    setViewingDetails(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewingDetails(null);
  };

  const handleFormSubmit = async (formData, id) => {
    try {
      console.log('=== FRONTEND: Submitting transaction ===');
      console.log('Form data:', formData);
      console.log('Transaction ID:', id);
      console.log('User token:', localStorage.getItem('token'));
      
      if (id) {
        console.log('Updating existing transaction');
        await api.put(`/transactions/${id}`, formData);
      } else {
        console.log('Creating new transaction');
        const response = await api.post('/transactions', formData);
        console.log('Transaction created successfully:', response.data);
      }
      fetchData();
      handleCloseTransactionModal();
    } catch (error) {
      console.error("Failed to save transaction", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert(`Failed to save transaction: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await api.delete(`/transactions/${id}`);
        // Compute the new transactions array after deletion
        setTransactions(prev => {
          const updatedTransactions = prev.filter(t => t._id !== id);
          if (updatedTransactions.length === 0 && page > 1) {
            setPage(page - 1); // useEffect will trigger fetchData
          } else {
            fetchData();
          }
          return updatedTransactions;
        });
      } catch (error) {
        console.error("Failed to delete transaction", error);
      }
    }
  };

  const toggleSelect = (id) => {
    setSelectedTransactionIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  
  const handleBulkDelete = async () => {
    if (!selectedTransactionIds.length) return;
    
    const confirmMessage = `Are you sure you want to permanently delete these ${selectedTransactionIds.length} transactions? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      try {
        await api.delete('/transactions/bulk', { 
          data: { transactionIds: selectedTransactionIds } 
        });
        setSelectedTransactionIds([]);
        fetchData(); // Refetch data
      } catch (error) {
        console.error('Failed to bulk delete transactions', error);
        alert('Failed to delete transactions. Please try again.');
      }
    }
  };
  const handleNewCategory = (newCategory, isIncome) => {
    if (isIncome) {
      setIncomeCategories(prev => [...prev, newCategory].sort());
    } else {
      setExpenseCategories(prev => [...prev, newCategory].sort());
    }

  };

  const handleDeleteCategory = async (categoryToDelete) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryToDelete}"? All associated transactions will be moved to "Miscellaneous".`)) {
      try {
        await api.delete('/transactions/category', { data: { categoryToDelete } });
        fetchData();
      } catch (error) {
        console.error("Failed to delete category", error);
      }
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
      <div className="relative z-10 p-8 mb-8 mx-4">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <DollarSign className="w-7 h-7 text-cyan-500 dark:text-cyan-400" />
              Transaction Manager
            </h1>
            <p className="text-gray-700 dark:text-white/80 text-sm sm:text-base md:text-lg font-medium max-w-2xl">
              Track, manage, and analyze your transactions with clarity and confidence.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedTransactionIds.length > 0 && (
              <button 
                onClick={handleBulkDelete} 
                className="group relative px-6 py-3 font-bold bg-red-500 text-white rounded-2xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-red-300 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Trash2 className="text-xl relative z-10" />
                <span className="relative z-10">Delete ({selectedTransactionIds.length})</span>
              </button>
            )}
            <button 
              onClick={() => setIsCategoryModalOpen(true)} 
              className="group relative px-6 py-3 font-bold bg-gray-600/50 text-white rounded-2xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-gray-300 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 overflow-hidden border border-gray-500/30 hover:border-gray-400/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Settings className="text-xl relative z-10" />
              <span className="relative z-10">Categories</span>
            </button>
            <button 
              onClick={() => handleOpenTransactionModal()} 
              className="group relative px-6 py-3 font-bold bg-lime-400 text-gray-900 rounded-2xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-lime-300 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-lime-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="text-xl relative z-10" />
              <span className="relative z-10">Add Transaction</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="group relative px-6 py-3 font-bold bg-lime-400 text-gray-900 rounded-2xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-lime-300 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 overflow-hidden"
              title="Export all transactions to CSV"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-lime-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Download className="text-xl relative z-10" />
              <span className="relative z-10">Export CSV</span>
            </button>
          </div>
        </div>
      </div>
      {/* Enhanced Search and Filters */}
      <div className="relative z-10 mb-8 mx-4">
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-lime-400/10 dark:border-lime-400/20 hover:border-lime-400/40 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl flex items-center justify-center">
              <Filter className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Search & Filter</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 dark:border-lime-400/30 rounded-2xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-400"
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="relative">
                <TrendingUp className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 dark:border-lime-400/30 rounded-2xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 appearance-none"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 dark:border-lime-400/30 rounded-2xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 appearance-none"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="lg:col-span-2 relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <span className="absolute left-12 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 pointer-events-none">From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  className="w-full pl-20 pr-4 py-3 text-sm border border-gray-300 dark:border-lime-400/30 rounded-2xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                />
            </div>
            <div className="lg:col-span-2 relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <span className="absolute left-12 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 pointer-events-none">To:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full pl-16 pr-4 py-3 text-sm border border-gray-300 dark:border-lime-400/30 rounded-2xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
              />
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="flex flex-wrap justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Active Filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    <Search className="w-4 h-4 mr-2" />
                    "{searchTerm}"
                  </span>
                )}
                {typeFilter !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    {typeFilter === 'income' ? (
                      <TrendingUp className="w-4 h-4 mr-2" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-2" />
                    )}
                    {typeFilter === 'income' ? 'Income' : 'Expense'}
                  </span>
                )}
                {categoryFilter !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    <Filter className="w-4 h-4 mr-2" />
                    {categoryFilter}
                  </span>
                )}
                {dateFrom && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                    <Calendar className="w-4 h-4 mr-2" />
                    From: {new Date(dateFrom).toLocaleDateString()}
                  </span>
                )}
                {dateTo && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                    <Calendar className="w-4 h-4 mr-2" />
                    To: {new Date(dateTo).toLocaleDateString()}
                  </span>
                )}
              </div>
              <button 
                onClick={clearAllFilters} 
                className="group flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Enhanced Transactions Display */}
      <div className="relative z-10 mx-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        ) : (
          <div className={`transition-all duration-500 ${isFiltering ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {/* Select All Header */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded focus:ring-2 focus:ring-blue-600 hover:ring-4 hover:ring-blue-200 transition-all duration-200 cursor-pointer"
                        checked={transactions.length > 0 && selectedTransactionIds.length === transactions.length}
                        disabled={transactions.length === 0}
                        onChange={() => setSelectedTransactionIds(selectedTransactionIds.length ? [] : transactions.map(t => t._id))}
                      />
                      <span className="text-lg font-bold text-gray-800 dark:text-white">
                        {selectedTransactionIds.length > 0 ? `${selectedTransactionIds.length} selected` : 'Select all transactions'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                </div>

                {/* Transaction Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {transactions.map((tx, index) => (
                    <div 
                      key={tx._id} 
                      className="group relative bg-white dark:bg-gray-700 p-6 rounded-3xl shadow-xl hover:shadow-2xl border border-gray-200 dark:border-gray-600 transition-all duration-500 hover:scale-105 animate-fade-in-up"
                      style={{animationDelay: `${0.3 + index * 0.1}s`}}
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                      
                      {/* Floating Elements */}
                      <div className="absolute top-4 right-4 w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="absolute bottom-4 left-4 w-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full animate-ping"></div>
                      
                      <div className="relative z-10">
                        {/* Header with Checkbox and Type Indicator */}
                        <div className="flex items-center justify-between mb-4">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded focus:ring-2 focus:ring-blue-600 hover:ring-4 hover:ring-blue-200 transition-all duration-200 cursor-pointer"
                            checked={selectedTransactionIds.includes(tx._id)}
                            onChange={() => toggleSelect(tx._id)}
                          />
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                            tx.isIncome 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {tx.isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {tx.isIncome ? 'Income' : 'Expense'}
                          </div>
                        </div>

                        {/* Transaction Name */}
                        <h3 className="text-xl font-black text-gray-800 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {tx.name}
                        </h3>

                        {/* Amount */}
                        <div className="mb-4">
                          <p className={`text-3xl font-black ${tx.isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} group-hover:scale-105 transition-transform duration-300`}>
                            {tx.isIncome ? '+' : '-'}{new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: currency.code,
                            }).format(tx.cost)}
                          </p>
                        </div>

                        {/* Category and Date */}
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Category:</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-lg">
                              {tx.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date:</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">
                              {new Date(tx.addedOn).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleOpenDetailsModal(tx)}
                            className="group/btn flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 font-bold text-sm"
                          >
                            <span>Details</span>
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenTransactionModal(tx)}
                              className="p-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all duration-300 transform hover:scale-110"
                              title="Edit transaction"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(tx._id)}
                              className="p-3 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-300 transform hover:scale-110"
                              title="Delete transaction"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-700 p-12 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-600 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <EmptyState message="No transactions found. Start by adding your first transaction!" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {!loading && totalPages > 1 && (
        <div className="relative z-10 mx-4 mt-8">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-600 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setPage(p => Math.max(p - 1, 1))} 
                disabled={page === 1} 
                className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                title="Previous page"
              >
                <ChevronLeft size={20} className="group-hover:translate-x-[-2px] transition-transform duration-300" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-600 px-6 py-3 rounded-2xl">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Page</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-black text-lg shadow-lg">
                    {page}
                  </span>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">of {totalPages}</span>
                </div>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 ${
                          pageNum === page
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <button 
                onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
                disabled={page === totalPages} 
                className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                title="Next page"
              >
                <ChevronRight size={20} className="group-hover:translate-x-[2px] transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        onSubmit={handleFormSubmit}
        transaction={editingTransaction}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        onNewCategory={handleNewCategory}
        currentBalance={summaryData.balance}
      />
      <ManageCategoriesModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        onDelete={handleDeleteCategory}
      />

      <TransactionDetailModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        transaction={viewingDetails}
        currency={currency}
      />
    </div>
  );
};

export default TransactionsPage;