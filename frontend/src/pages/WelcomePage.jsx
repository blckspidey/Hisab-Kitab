import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle';
import { DollarSign, Download, Settings } from 'lucide-react';

export default function WelcomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gray-900 relative overflow-hidden">
      {/* Dark Grid Background */}
      <div className="absolute inset-0 bg-gray-900" style={{
        backgroundImage: `
          linear-gradient(rgba(20, 184, 166, 0.12) 1px, transparent 1px),
          linear-gradient(90deg, rgba(20, 184, 166, 0.12) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-lime-400 rounded-2xl transform rotate-12 opacity-60">
          <div className="w-full h-full border-2 border-lime-400 rounded-xl m-2">
            <div className="w-full h-full border-2 border-lime-400 rounded-lg m-2"></div>
          </div>
        </div>
        <div className="absolute bottom-32 left-16 w-24 h-24 border-2 border-lime-400 rounded-2xl transform -rotate-12 opacity-40">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-lime-400 rounded"></div>
            <div className="w-6 h-6 border-2 border-lime-400 rounded ml-1"></div>
            <div className="w-4 h-4 border-2 border-lime-400 rounded ml-1"></div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 border-2 border-lime-400 rounded-2xl transform rotate-45 opacity-30">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-4 h-8 border-2 border-lime-400 rounded"></div>
            <div className="w-4 h-6 border-2 border-lime-400 rounded ml-1"></div>
            <div className="w-4 h-4 border-2 border-lime-400 rounded ml-1"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-4 px-8 flex justify-between items-center">
        <Link to="/" className="font-black text-3xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
          Hisab-Kitab
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/dashboard" className="text-white hover:text-lime-400 font-semibold transition-colors duration-300">Dashboard</Link>
              <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-lime-400 font-semibold transition-colors duration-300">Login</Link>
              <Link to="/register" className="bg-lime-400 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-lime-500 transition-all duration-300">Sign Up</Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 text-center py-20 px-4">
        <h1 className="text-4xl sm:text-5xl md:text-5xl font-black text-white mb-6">
          Track every rupee with Hisab-Kitab
        </h1>
        <p className="text-white/80 text-base sm:text-lg font-medium max-w-2xl mx-auto mb-8">
          Track your spending, manage your budget, and achieve your financial goals with ease.
        </p>
        {user ? (
          <Link to="/dashboard" className="inline-block px-8 py-4 font-black bg-cyan-400 text-gray-900 rounded-2xl shadow-2xl hover:shadow-xl hover:scale-110 transition-all duration-300">
            Go to Dashboard
          </Link>
        ) : (
          <Link to="/register" className="inline-block px-8 py-4 font-black bg-cyan-400 text-gray-900 rounded-2xl shadow-2xl hover:shadow-xl hover:scale-110 transition-all duration-300">
            Get Started for Free
          </Link>
        )}
      </main>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Finance tools that stay out of your way</h2>
            <p className="text-white/80 text-base sm:text-lg font-medium">Easily track spending, manage budgets, and reach financial goals</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="relative group bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-lime-400/20 hover:border-lime-400/40 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-2xl font-black text-white">Goal Setting</h4>
                </div>
                <p className="text-white/80 leading-relaxed">
                  Set and track your financial goals easily with our intuitive budget management system.
                </p>
              </div>
            </div>

            <div className="relative group bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-2xl font-black text-white">Financial Reports</h4>
                </div>
                <p className="text-white/80 leading-relaxed">
                  Generate comprehensive financial reports to understand your spending patterns and trends.
                </p>
              </div>
            </div>

            <div className="relative group bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-2xl font-black text-white">Expense Tracking</h4>
                </div>
                <p className="text-white/80 leading-relaxed">
                  Easily track all your expenses in one place with smart categorization and insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-white/60">
        <p>&copy; {new Date().getFullYear()} Hisab-Kitab. All Rights Reserved.</p>
      </footer>
    </div>
  );
}