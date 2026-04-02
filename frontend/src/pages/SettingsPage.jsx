import React, { useState } from 'react';
import { User, Shield, Trash2, AlertTriangle, Settings as SettingsIcon, Mail, Key } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');
      await api.delete('/users/account');
      logout(); 
    } catch (err) {
      console.error(err);
      setError('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match');
      return;
    }
    try {
      setPwdLoading(true);
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPwdSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors">
      {/* Dark Grid Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900" style={{
        backgroundImage: `
          linear-gradient(rgba(34, 197, 94, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 197, 94, 0.06) 1px, transparent 1px)
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
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            <SettingsIcon className="inline-block w-7 h-7 text-cyan-500 dark:text-cyan-400 mr-3" />
            Settings & Preferences
          </h1>
          <p className="text-gray-700 dark:text-white/80 text-base sm:text-lg font-medium max-w-2xl mx-auto">
            Manage your account settings and preferences with precision and control.
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-8">
        {/* Account Information Card */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-lime-400/10 dark:border-lime-400/20 hover:border-lime-400/40 transition-all duration-500 mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl flex items-center justify-center">
              <User className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Account Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-100 dark:bg-gray-700/50 p-6 rounded-2xl border border-lime-400/10 dark:border-lime-400/20">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-lime-400" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">Email Address</span>
              </div>
              <p className="text-lime-400 font-bold text-xl">{user?.email}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Your primary account email</p>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700/50 p-6 rounded-2xl border border-lime-400/10 dark:border-lime-400/20">
              <div className="flex items-center gap-3 mb-4">
                <Key className="w-6 h-6 text-lime-400" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">Account Status</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse"></div>
                <p className="text-lime-400 font-bold text-xl">Active</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Your account is in good standing</p>
            </div>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-lime-400/10 dark:border-lime-400/20 hover:border-lime-400/40 transition-all duration-500 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl flex items-center justify-center">
              <Shield className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Security & Privacy</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-700/50 p-6 rounded-2xl border border-lime-400/10 dark:border-lime-400/20">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Change Password</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Update your account password</p>
              {pwdSuccess && (
                <div className="mb-4 p-3 rounded bg-green-900/30 border border-green-400/50 text-green-300 text-sm">{pwdSuccess}</div>
              )}
              {pwdError && (
                <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-400/50 text-red-300 text-sm">{pwdError}</div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="currentPassword">Current Password</label>
                  <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="newPassword">New Password</label>
                    <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="confirmPassword">Confirm New Password</label>
                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
                  </div>
                </div>
                <button type="submit" disabled={pwdLoading} className="px-4 py-2 bg-lime-400 text-gray-900 rounded-xl font-bold hover:bg-lime-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50">
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Danger Zone Card */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-red-200 dark:border-red-400/20 hover:border-red-400/40 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Danger Zone</h2>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-400/30">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Account</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-400 mb-6">
              Once you delete your account, there is no going back. Please be certain. All your data, transactions, and settings will be permanently removed.
            </p>
            
            {error && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-400/50 rounded-xl">
                <p className="text-red-400 font-medium">{error}</p>
              </div>
            )}
            
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Delete Account Permanently
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
