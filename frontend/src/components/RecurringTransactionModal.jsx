import React, { useState, useEffect } from 'react';
import { FiX, FiDollarSign, FiCalendar, FiRefreshCw, FiTag, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const RecurringTransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  categories,
  onNewCategory,
}) => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    amount: '',
    isIncome: false,
    frequency: 'monthly',
    startDate: '',
    endDate: '',
    description: '',
  });

  useEffect(() => {
    if (transaction) {
      setForm({
        name: transaction.name,
        category: transaction.category,
        amount: transaction.amount,
        isIncome: transaction.isIncome,
        frequency: transaction.frequency,
        startDate: transaction.startDate?.slice(0, 10),
        endDate: transaction.endDate?.slice(0, 10) || '',
        description: transaction.description || '',
      });
    } else {
      setForm({
        name: '',
        category: '',
        amount: '',
        isIncome: false,
        frequency: 'monthly',
        startDate: '',
        endDate: '',
        description: '',
      });
    }
  }, [transaction]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle the "Add New" option for category
    if (name === 'category' && value === '__add_new__') {
      const newCategory = window.prompt("Enter new category name:");

      if (newCategory) {
        onNewCategory(newCategory, form.isIncome);
        setForm(prev => ({ ...prev, category: newCategory }));
      }
      return;
    }

    // Handle checkbox inputs
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, transaction?._id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl w-full max-w-md border border-lime-400/20 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <FiX className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FiRefreshCw className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-1">
            {transaction ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
          </h2>
          <p className="text-gray-600 text-sm">
            {transaction ? 'Update your recurring transaction' : 'Set up automatic recurring transactions'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiTag className="h-4 w-4 text-lime-500" />
              </div>
              <input
                type="text"
                placeholder="Enter transaction name"
                value={form.name}
                onChange={handleChange}
                name="name"
                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={handleChange}
                name="category"
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm text-gray-800 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300 appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__add_new__" className="font-bold text-lime-600">-- Add New Category --</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiDollarSign className="h-4 w-4 text-lime-500" />
              </div>
              <input
                type="number"
                placeholder="Enter amount"
                value={form.amount}
                onChange={handleChange}
                name="amount"
                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300"
                required
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
            <div className="relative">
              <select
                value={form.frequency}
                onChange={handleChange}
                name="frequency"
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm text-gray-800 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-4 w-4 text-lime-500" />
              </div>
              <input
                type="date"
                value={form.startDate}
                onChange={handleChange}
                name="startDate"
                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm text-gray-800 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300"
                required
              />
            </div>
            <p className="text-xs text-lime-600 mt-1 flex items-center gap-1">
              <FiCalendar className="h-3 w-3" />
              Next Due Date will be calculated automatically based on this start date and frequency.
            </p>
          </div>

          {/* End Date (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-4 w-4 text-lime-500" />
              </div>
              <input
                type="date"
                value={form.endDate}
                onChange={handleChange}
                name="endDate"
                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm text-gray-800 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for recurring transactions with no end date.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              placeholder="Enter description or notes..."
              value={form.description}
              onChange={handleChange}
              name="description"
              rows={3}
              className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300 resize-none"
            />
          </div>

          {/* Income/Expense Toggle */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-100">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.isIncome}
                  onChange={handleChange}
                  name="isIncome"
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition-all duration-300 ${form.isIncome ? 'bg-lime-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${form.isIncome ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {form.isIncome ? (
                  <FiTrendingUp className="h-5 w-5 text-lime-500" />
                ) : (
                  <FiTrendingDown className="h-5 w-5 text-gray-500" />
                )}
                <span className={`text-base font-semibold ${form.isIncome ? 'text-lime-600' : 'text-gray-600'}`}>
                  {form.isIncome ? 'Income' : 'Expense'}
                </span>
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 font-semibold bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-white font-bold bg-gradient-to-r from-lime-500 to-lime-600 rounded-lg hover:from-lime-600 hover:to-lime-700 focus:outline-none focus:ring-4 focus:ring-lime-400/30 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {transaction ? 'Update Transaction' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringTransactionModal;
