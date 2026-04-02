import React, { useState, useEffect } from 'react';
import useCurrency from '../hooks/useCurrency';
import useAuth from '../hooks/useAuth';

const CurrencySelector = () => {
  const { currency, changeCurrency, supportedCurrencies } = useCurrency();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (user?.defaultCurrency) {
      const userCurrency = supportedCurrencies.find(c => c.code === user.defaultCurrency);
      changeCurrency(userCurrency);
    }
  }, [user]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleSelect = (code) => {
    changeCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/30 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-teal-500/25"
      >
        <span className="text-lg">{currency.flag}</span>
        <span className="font-semibold text-sm text-teal-700 dark:text-teal-300">{currency.code}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-teal-200 dark:border-teal-800 z-20">
          <ul className="py-1">
            {supportedCurrencies.map(curr => (
              <li 
                key={curr.code} 
                onClick={() => handleSelect(curr.code)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/20 cursor-pointer transition-colors duration-200"
              >
                <span className="text-lg">{curr.flag}</span>
                <span className="font-medium">{curr.name} ({curr.code})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;