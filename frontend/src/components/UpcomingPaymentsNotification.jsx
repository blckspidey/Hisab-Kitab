import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FiClock, FiX, FiBell } from 'react-icons/fi';
import useCurrency from '../hooks/useCurrency';

const UpcomingPaymentsNotification = () => {
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { currency } = useCurrency();
  
  // Fallback currency if not available
  const currencyCode = currency?.code || 'USD';

  useEffect(() => {
    const fetchUpcomingPayments = async () => {
      try {
        const response = await api.get('/recurring/upcoming?days=3');
        const payments = response.data || [];
        setUpcomingPayments(payments);
        setIsVisible(payments.length > 0);
      } catch (err) {
        console.error('Failed to fetch upcoming payments:', err);
      }
    };

    fetchUpcomingPayments();
    
    // Check for upcoming payments every 30 minutes
    const interval = setInterval(fetchUpcomingPayments, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isVisible || upcomingPayments.length === 0) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl border border-blue-400/30 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-blue-400/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FiBell className="text-white text-sm" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Upcoming Payments</h3>
                <p className="text-blue-200 text-xs">
                  {upcomingPayments.length} payment{upcomingPayments.length !== 1 ? 's' : ''} due soon
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExpand}
                className="text-blue-200 hover:text-white transition-colors duration-200"
              >
                <FiClock className="h-4 w-4" />
              </button>
              <button
                onClick={handleDismiss}
                className="text-blue-200 hover:text-white transition-colors duration-200"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {upcomingPayments.map((payment) => {
              const daysUntilDue = Math.ceil(
                (new Date(payment.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div key={payment._id} className="bg-blue-500/30 rounded-lg p-3 border border-blue-400/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{payment.name}</h4>
                      <p className="text-blue-200 text-xs">{payment.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${payment.isIncome ? 'text-green-300' : 'text-red-300'}`}>
                        {payment.isIncome ? '+' : '-'}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: currencyCode,
                        }).format(payment.amount)}
                      </p>
                      <p className="text-blue-200 text-xs">
                        {daysUntilDue === 0 ? 'Today' : 
                         daysUntilDue === 1 ? 'Tomorrow' : 
                         `In ${daysUntilDue} days`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingPaymentsNotification;

