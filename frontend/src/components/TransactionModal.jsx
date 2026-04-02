import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, FileText, Filter, TrendingDown, TrendingUp, X } from 'lucide-react';

const VIEW_MODE = {
  EXPENSE_FORM: 'expenseForm',
  INCOME_FORM: 'incomeForm',
};

const getInitialFormData = (categories) => ({
  name: '',
  category: categories[0] || '',
  cost: '',
  addedOn: new Date().toISOString().split('T')[0],
  isIncome: false,
  note: ''
});

const TransactionModal = ({ isOpen, onClose, onSubmit, transaction, expenseCategories = [], incomeCategories = [], onNewCategory, currentBalance = 0 }) => {
  const [modalView, setModalView] = useState(VIEW_MODE.EXPENSE_FORM);
  const [submittedAnyway, setSubmittedAnyway] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cost: '',
    addedOn: new Date().toISOString().split('T')[0],
    isIncome: false,
    note: ' '
  });

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (transaction) {
      setFormData({
        name: transaction.name,
        category: transaction.category,
        cost: transaction.cost,
        addedOn: new Date(transaction.addedOn).toISOString().split('T')[0],
        isIncome: transaction.isIncome,
        notes: transaction.note || ''
      });
      setModalView(transaction.isIncome ? VIEW_MODE.INCOME_FORM : VIEW_MODE.EXPENSE_FORM);
    } else {
      setFormData({
        name: '',
        category: expenseCategories[0] || '', // Default to the first category or empty
        cost: '',
        addedOn: new Date().toISOString().split('T')[0],
        isIncome: false,
      });
      if (modalView === VIEW_MODE.EXPENSE_FORM) {
        setFormData(prev => ({ ...prev, category: expenseCategories[0] || '' }));
      } else {
        setFormData(prev => ({ ...prev, category: incomeCategories[0] || '' }));
      }
    }
  }, [transaction, isOpen, expenseCategories, incomeCategories]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle the "Add New" option for category
    if (name === 'category' && value === '__add_new__') {
      const newCategory = window.prompt("Enter new category name:");

      if (newCategory) {
        const isIncome = modalView === VIEW_MODE.INCOME_FORM;
        onNewCategory(newCategory, isIncome);

        setFormData(prev => ({ ...prev, category: newCategory }));
      }
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isIncomeTransaction = modalView === VIEW_MODE.INCOME_FORM;
    const costValue = parseFloat(formData.cost);
    if (!isIncomeTransaction && !transaction && costValue > currentBalance && !submittedAnyway) {
      const confirmation = window.confirm(
        `Warning: This expense (${costValue}) exceeds your current balance (${currentBalance}). Proceeding will result in a negative balance. Do you wish to submit anyway?`
      );

      if (confirmation) {
        setSubmittedAnyway(true);
        setTimeout(() => {
          e.target.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }, 0);
      }
      return;
    }
    setSubmittedAnyway(false);
    let transactionName = formData.name.trim();
    if (isIncomeTransaction && transactionName === '') {
      transactionName = (formData.category ? formData.category : 'General') + ' Income';
    }
    const finalFormData = {
      ...formData,
      name: transactionName,
      isIncome: modalView === VIEW_MODE.INCOME_FORM
    };
    onSubmit(finalFormData, transaction?._id);
  };

  const handleSwitchToIncome = (e) => {
    e.preventDefault();
    setFormData(getInitialFormData(incomeCategories));
    setModalView(VIEW_MODE.INCOME_FORM);
  }

  const handleSwitchToExpense = (e) => {
    e.preventDefault();
    setFormData(getInitialFormData(expenseCategories));
    setModalView(VIEW_MODE.EXPENSE_FORM);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex justify-center items-center z-50" style={{
      backgroundImage: `
        linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    }}>
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-16 h-16 border-2 border-lime-400 rounded-2xl transform rotate-12 animate-float opacity-40">
          <div className="w-full h-full border-2 border-lime-400 rounded-xl m-1">
            <div className="w-full h-full border-2 border-lime-400 rounded-lg m-1"></div>
          </div>
        </div>
        <div className="absolute bottom-20 left-20 w-12 h-12 border-2 border-lime-400 rounded-2xl transform -rotate-12 animate-float-delayed opacity-30">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-lime-400 rounded"></div>
            <div className="w-3 h-3 border-2 border-lime-400 rounded ml-1"></div>
            <div className="w-2 h-2 border-2 border-lime-400 rounded ml-1"></div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/4 w-10 h-10 border-2 border-lime-400 rounded-2xl transform rotate-45 animate-float-slow opacity-20">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-4 border-2 border-lime-400 rounded"></div>
            <div className="w-2 h-3 border-2 border-lime-400 rounded ml-1"></div>
            <div className="w-2 h-2 border-2 border-lime-400 rounded ml-1"></div>
          </div>
        </div>
      </div>

      <div className="relative bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl w-full max-w-md border-2 border-lime-400/30 hover:border-lime-400/50 transition-all duration-500 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-lime-400/60 rounded-full animate-bounce"></div>
        <div className="absolute top-4 left-4 w-1 h-1 bg-lime-400/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-4 right-4 w-1 h-1 bg-lime-400/30 rounded-full animate-pulse"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-4 text-white text-center relative">
            {modalView === VIEW_MODE.EXPENSE_FORM ? (
              <>
                <TrendingDown className="inline-block w-5 h-5 text-cyan-400 mr-2" />
                {transaction ? 'Edit' : 'Add'} Expense
              </>
            ) : (
              <>
                <TrendingUp className="inline-block w-5 h-5 text-cyan-400 mr-2" />
                {transaction ? 'Edit' : 'Add'} Income
              </>
            )}
          </h2>
        <form onSubmit={handleSubmit}>
          {/* ... other form fields (name, cost, etc.) remain the same ... */}
          {modalView === VIEW_MODE.EXPENSE_FORM && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  <FileText className="inline-block w-4 h-4 text-cyan-400 mr-2" />
                  Description
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border-2 border-lime-400/30 rounded-xl focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 bg-gray-700/50 text-white font-medium transition-all duration-300 placeholder-gray-400 text-sm" 
                  placeholder="What did you spend on?"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  <Filter className="inline-block w-4 h-4 text-cyan-400 mr-2" />
                  Category
                </label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border-2 border-lime-400/30 rounded-xl focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 bg-gray-700/50 text-white font-medium transition-all duration-300 text-sm" 
                  required
                >
                  <option value="" disabled className="text-gray-400">Select a category</option>
                  {expenseCategories.map(cat => <option key={cat} value={cat} className="bg-gray-700">{cat}</option>)}
                  <option value="__add_new__" className="font-bold text-lime-400 bg-gray-700">-- Add New Category --</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  <DollarSign className="inline-block w-4 h-4 text-cyan-400 mr-2" />
                  Amount (Expense)
                </label>
                <input 
                  type="number" 
                  name="cost" 
                  value={formData.cost} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border-2 border-lime-400/30 rounded-xl focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 bg-gray-700/50 text-white font-medium transition-all duration-300 placeholder-gray-400 text-sm" 
                  placeholder="0.00"
                  required 
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  <Calendar className="inline-block w-4 h-4 text-cyan-400 mr-2" />
                  Date
                </label>
                <input 
                  type="date" 
                  name="addedOn" 
                  value={formData.addedOn} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border-2 border-lime-400/30 rounded-xl focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 bg-gray-700/50 text-white font-medium transition-all duration-300 text-sm" 
                  required 
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  <FileText className="inline-block w-4 h-4 text-cyan-400 mr-2" />
                  Notes (Optional)
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-lime-400/30 rounded-xl focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 bg-gray-700/50 text-white font-medium transition-all duration-300 resize-y placeholder-gray-400 text-sm"
                  rows="2"
                  placeholder="E.g., Dinner at favorite restaurant, Monthly bills..."
                />
              </div>

              <div className="mb-4 text-center">
                <button 
                  type="button"
                  className="text-cyan-400 hover:text-cyan-300 font-bold text-sm underline transition-colors duration-300"
                  onClick={handleSwitchToIncome}
                >
                  <TrendingUp className="inline-block w-4 h-4 mr-2" />
                  Switch to Add Income
                </button>
              </div>
            </>
          )}

          {modalView === VIEW_MODE.INCOME_FORM && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  <Filter className="inline-block w-4 h-4 text-cyan-400 mr-2" />
                  Category
                </label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border-2 border-lime-400/30 rounded-xl focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 bg-gray-700/50 text-white font-medium transition-all duration-300 text-sm" 
                  required
                >
                  <option value="" disabled className="text-gray-400">Select a category</option>
                  {incomeCategories.map(cat => <option key={cat} value={cat} className="bg-gray-700">{cat}</option>)}
                  <option value="__add_new__" className="font-bold text-lime-400 bg-gray-700">-- Add New Category --</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  <DollarSign className="inline-block w-4 h-4 text-cyan-400 mr-2" />
                  Amount (Income)
                </label>
                <input 
                  type="number" 
                  name="cost" 
                  value={formData.cost} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border-2 border-lime-400/30 rounded-xl focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 bg-gray-700/50 text-white font-medium transition-all duration-300 placeholder-gray-400 text-sm" 
                  placeholder="0.00"
                  required 
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  <Calendar className="inline-block w-4 h-4 text-cyan-400 mr-2" />
                  Date
                </label>
                <input 
                  type="date" 
                  name="addedOn" 
                  value={formData.addedOn} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border-2 border-lime-400/30 rounded-xl focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 bg-gray-700/50 text-white font-medium transition-all duration-300 text-sm" 
                  required 
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">
                  <FileText className="inline-block w-4 h-4 text-cyan-400 mr-2" />
                  Notes (Optional)
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-lime-400/30 rounded-xl focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 bg-gray-700/50 text-white font-medium transition-all duration-300 resize-y placeholder-gray-400 text-sm"
                  rows="2"
                  placeholder="E.g., Salary, Freelance work, Investment returns..."
                />
              </div>

              <div className="mb-4 text-center">
                <button 
                  type="button"
                  className="text-cyan-400 hover:text-cyan-300 font-bold text-sm underline transition-colors duration-300"
                  onClick={handleSwitchToExpense}
                >
                  <TrendingDown className="inline-block w-4 h-4 mr-2" />
                  Switch to Add Expense
                </button>
              </div>
            </>
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-600/50 text-white rounded-xl hover:bg-gray-600/70 font-bold transition-all duration-300 transform hover:scale-105 border border-gray-500/30 hover:border-gray-400/50 text-sm"
            >
              <X className="inline-block w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-lime-400 text-gray-900 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:bg-lime-300 focus:ring-2 focus:ring-lime-400/20 shadow-lg hover:shadow-xl text-sm"
            >
              {modalView === VIEW_MODE.EXPENSE_FORM ? (
                <>
                  <TrendingDown className="inline-block w-4 h-4 mr-2" />
                  Save Expense
                </>
              ) : (
                <>
                  <TrendingUp className="inline-block w-4 h-4 mr-2" />
                  Save Income
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;