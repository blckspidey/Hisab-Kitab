import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { HiMail, HiArrowRight } from 'react-icons/hi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 relative overflow-hidden">
      {/* Off-White Grid Background */}
      <div className="absolute inset-0 bg-gray-50" style={{
        backgroundImage: `
          linear-gradient(rgba(34, 197, 94, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-lime-400 rounded-2xl transform rotate-12 opacity-30">
          <div className="w-full h-full border-2 border-lime-400 rounded-xl m-2">
            <div className="w-full h-full border-2 border-lime-400 rounded-lg m-2"></div>
          </div>
        </div>
        <div className="absolute bottom-32 left-16 w-24 h-24 border-2 border-lime-400 rounded-2xl transform -rotate-12 opacity-20">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-lime-400 rounded"></div>
            <div className="w-6 h-6 border-2 border-lime-400 rounded ml-1"></div>
            <div className="w-4 h-4 border-2 border-lime-400 rounded ml-1"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-lime-100 to-lime-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-lime-200/50 to-lime-300/30"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
            <div className="mb-8 w-[600px] h-[600px] relative">
              <img 
                src="/pexels-karola-g-5412135.jpg" 
                alt="Financial illustration" 
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute top-4 right-4 w-16 h-16 bg-lime-400/20 rounded-2xl backdrop-blur-sm border border-lime-400/30"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-lime-400/20 rounded-2xl backdrop-blur-sm border border-lime-400/30"></div>
            </div>
            
            <div className="text-center">
              <h2 className="text-3xl font-black text-gray-800 mb-4">
                Welcome to Hisab-Kitab
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Your personal finance management platform that helps you track expenses, manage budgets, and achieve your financial goals.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-12 bg-white/80 backdrop-blur-sm">
          <div className="max-w-md mx-auto w-full">
            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <Link 
                to="/" 
                className="text-5xl font-black bg-gradient-to-r from-lime-500 via-lime-600 to-lime-700 bg-clip-text text-transparent drop-shadow-lg mb-2 block"
                title="Go to home"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}
              >
                Hisab-Kitab
              </Link>
              <p className="text-gray-700 text-xl font-semibold">Welcome back</p>
            </div>

            {/* Error Message */}
            {serverError && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 text-center font-medium">{serverError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiMail aria-hidden="true" className="h-5 w-5 text-lime-500" />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="Enter your password" 
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300" 
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-lime-600 hover:text-lime-700 font-medium transition-colors duration-200"
                    >
                      Forgot?
                    </Link>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full px-6 py-4 text-white font-bold bg-gradient-to-r from-lime-500 to-lime-600 rounded-xl hover:from-lime-600 hover:to-lime-700 focus:outline-none focus:ring-4 focus:ring-lime-400/30 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <HiArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account? <Link 
                    to="/register" 
                    className="text-lime-600 hover:text-lime-700 font-semibold underline transition-colors duration-200"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}