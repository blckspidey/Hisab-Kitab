import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import CurrencySelector from './CurrencySelector';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import useTheme from '../hooks/useTheme';

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105';
    if (isActive) {
      return `${baseClasses} bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25`;
    }
    return `${baseClasses} text-gray-600 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400`;
  };

  const handleClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-teal-200 dark:border-teal-800 flex items-center h-16">
        {/* Logo with a bit of left margin now */}
        <div
          onClick={handleClick}
          className="group cursor-pointer transition-all duration-500 hover:scale-110 mr-4 md:mr-6 ml-4 h-full flex items-center"
          title="Go to home"
          style={{ minWidth: '44px' }}
        >
          <div className="relative flex items-center">
              <img
                src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
                alt="Hisab-Kitab Logo"
                className="h-12 w-12 object-contain drop-shadow-xl"
              />
            <span className="ml-2 font-black text-2xl tracking-tight hidden sm:inline bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
              Hisab-Kitab
            </span>
            <div className="absolute left-0 -bottom-1 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
        </div>
        {/* Rest of navbar centered and spread */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 flex items-center justify-between h-16">
            <div className="hidden md:block">
              <div className="flex items-center space-x-3 md:space-x-5 overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar">
                <NavLink to="/dashboard" className={getNavLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/transactions" className={getNavLinkClass}>
                  Transactions
                </NavLink>
                <NavLink to="/receipts" className={getNavLinkClass}>
                  Receipts
                </NavLink>
                <NavLink to="/insights" className={getNavLinkClass}>
                  Insights
                </NavLink>
                <NavLink to="/settings" className={getNavLinkClass}>
                  Settings
                </NavLink>
                <NavLink to="/budgets" className={getNavLinkClass}>
                  Budgets
                </NavLink>
                <NavLink
                  to="/recurring-transactions"
                  className={getNavLinkClass}
                >
                  Recurring Transactions
                </NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <NotificationBell />
              <ThemeToggle />
              <CurrencySelector />
              {/* Mobile menu toggle */}
              <button
                className="md:hidden px-3 py-2 rounded-lg text-sm font-semibold bg-teal-600 text-white"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? 'Close' : 'Menu'}
              </button>
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile nav (collapsible) */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden bg-white dark:bg-gray-800 border-b border-teal-200 dark:border-teal-800">
          <div className="max-w-7xl mx-auto px-3 py-3 grid grid-cols-1 gap-2">
            <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-semibold ${isActive ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/20'}`}>Dashboard</NavLink>
            <NavLink to="/transactions" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-semibold ${isActive ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/20'}`}>Transactions</NavLink>
            <NavLink to="/receipts" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-semibold ${isActive ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/20'}`}>Receipts</NavLink>
            <NavLink to="/insights" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-semibold ${isActive ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/20'}`}>Insights</NavLink>
            <NavLink to="/settings" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-semibold ${isActive ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/20'}`}>Settings</NavLink>
            <NavLink to="/budgets" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-semibold ${isActive ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/20'}`}>Budgets</NavLink>
            <NavLink to="/recurring-transactions" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-semibold ${isActive ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/20'}`}>Recurring Transactions</NavLink>
          </div>
        </div>
      )}
      <main>
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
