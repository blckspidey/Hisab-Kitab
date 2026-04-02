import React, { useState, useEffect } from 'react';
import { FiX, FiDollarSign, FiCalendar, FiTarget } from 'react-icons/fi';

const BudgetModal = ({ isOpen, onClose, onSubmit, budget, categories }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
      });
    } else {
      setFormData({
        category: categories[0] || '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
    }
  }, [budget, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'month') {
      const num = parseInt(value, 10);
      if (num < 1) return setFormData((prev) => ({ ...prev, month: 1 }));
      if (num > 12) return setFormData((prev) => ({ ...prev, month: 12 }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, budget?._id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="relative bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-lime-400/20 max-h-[90vh] overflow-y-auto">
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
            <FiTarget className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-1">
            {budget ? 'Edit Budget' : 'Add Budget'}
          </h2>
          <p className="text-gray-600 text-sm">
            {budget ? 'Update your budget settings' : 'Set a new budget for tracking expenses'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm text-gray-800 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300 appearance-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
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
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter budget amount"
                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Month and Year Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Month */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-4 w-4 text-lime-500" />
                </div>
                <input
                  type="number"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  min="1"
                  max="12"
                  required
                  placeholder="MM"
                  className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-4 w-4 text-lime-500" />
                </div>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="2000"
                  max="2100"
                  placeholder="YYYY"
                  className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300"
                />
              </div>
            </div>
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
              {budget ? 'Update Budget' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
