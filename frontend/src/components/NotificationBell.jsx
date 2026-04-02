import React, { useState, useEffect } from 'react';
import { FiBell, FiX } from 'react-icons/fi';
import { AlertTriangle } from 'lucide-react';
import api from '../api/axios';

const NotificationBell = () => {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/budgets/alerts');
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const getAlertColor = (type) => {
    return type === 'exceeded' ? 'text-red-400' : 'text-yellow-400';
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-lime-400 transition-colors duration-300"
      >
        <FiBell className="h-6 w-6" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {alerts.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Budget Alerts</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <FiBell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No alerts at the moment
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors duration-200`}
                >
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${getAlertColor(alert.type)}`} />
                    <div className="flex-1">
                      <div className={`font-semibold ${getAlertColor(alert.type)}`}>
                        {alert.category} Budget {alert.type === 'exceeded' ? 'Exceeded' : 'Warning'}
                      </div>
                      <div className="text-sm text-gray-300 mt-1">
                        {alert.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {alert.period} • {alert.percentageUsed}% used
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {alerts.length > 0 && (
            <div className="p-3 border-t border-gray-700">
              <button
                onClick={() => {
                  // Navigate to budgets page
                  window.location.href = '/budgets';
                }}
                className="w-full text-center text-lime-400 hover:text-lime-300 text-sm font-medium"
              >
                View All Budgets
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;














