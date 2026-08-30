'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', flag: '🇱🇰' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
];

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-6 sm:py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-[#141414] rounded mb-2"></div>
          <div className="h-4 w-64 bg-[#141414] rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-48 bg-[#141414] rounded-xl"></div>
            <div className="h-32 bg-[#141414] rounded-xl"></div>
            <div className="h-24 bg-[#141414] rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast Notification
function Toast({ message, type, onClose }: any) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl max-w-sm ${
        type === 'success' 
          ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
          : 'bg-red-500/20 border border-red-500/30 text-red-400'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{type === 'success' ? '✅' : '❌'}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition">
          ✕
        </button>
      </div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [budgetStatsLoading, setBudgetStatsLoading] = useState(true);
  const [settings, setSettings] = useState({ 
    monthlyBudget: 0, 
    currency: 'LKR',
    name: '',
    email: '',
  });
  const [budgetStats, setBudgetStats] = useState({
    spent: 0,
    remaining: 0,
    percentage: 0,
    count: 0,
    monthName: '',
    isOverBudget: false,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user) {
      loadSettings();
      loadBudgetStats();
      setSettings(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || '',
      }));
    }
  }, [status, session]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          monthlyBudget: data.monthlyBudget || 0,
          currency: data.currency || 'LKR',
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadBudgetStats = async () => {
    setBudgetStatsLoading(true);
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setBudgetStats({
          spent: data.spent || 0,
          remaining: data.remaining || 0,
          percentage: data.budgetPercentage || 0,
          count: data.todayCount || 0,
          monthName: data.monthName || format(new Date(), 'MMMM yyyy'),
          isOverBudget: data.remaining < 0,
        });
      }
    } catch (error) {
      console.error('Error loading budget stats:', error);
    } finally {
      setBudgetStatsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyBudget: settings.monthlyBudget,
          currency: settings.currency,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        setShowToast(true);
        await loadSettings();
        await loadBudgetStats();
      } else {
        setMessage({ type: 'error', text: 'Failed to update settings' });
        setShowToast(true);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const getCurrencySymbol = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency?.symbol || 'Rs';
  };

  const getCurrencyFlag = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency?.flag || '🌍';
  };

  const formatAmount = (amount: number) => {
    const symbol = getCurrencySymbol(settings.currency);
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Get progress bar color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-[#00d4ff]';
  };

  // Get status text and color
  const getStatusInfo = () => {
    if (budgetStats.isOverBudget) {
      return { text: '⚠️ Over Budget', color: 'text-red-400' };
    }
    if (budgetStats.percentage >= 80) {
      return { text: '⚠️ Approaching Limit', color: 'text-orange-400' };
    }
    if (budgetStats.percentage >= 50) {
      return { text: '📊 On Track', color: 'text-yellow-400' };
    }
    if (budgetStats.spent > 0) {
      return { text: '✅ Healthy', color: 'text-green-400' };
    }
    return { text: '📝 No Spending Yet', color: 'text-gray-400' };
  };

  if (status === 'loading') {
    return <LoadingSkeleton />;
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-6 sm:py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">⚙️ Settings</h1>
          <p className="text-sm text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Toast Notification */}
        {showToast && message && (
          <Toast
            message={message.text}
            type={message.type}
            onClose={() => setShowToast(false)}
          />
        )}

        {/* Profile Section */}
        <div className="bg-[#141414] rounded-xl p-6 border border-[#0a6b7a]/20 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#00d4ff]/20 flex items-center justify-center text-2xl font-bold text-[#00d4ff]">
              {settings.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{settings.name}</h3>
              <p className="text-sm text-gray-400">{settings.email}</p>
            </div>
            <div className="px-3 py-1 bg-[#00d4ff]/10 text-[#00d4ff] text-xs rounded-full border border-[#00d4ff]/20">
              {settings.currency}
            </div>
          </div>
        </div>

        {/* Budget & Currency Settings */}
        <div className="bg-[#141414] rounded-xl p-6 border border-[#0a6b7a]/20 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">💰 Budget & Currency</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Monthly Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Monthly Budget ({getCurrencySymbol(settings.currency)})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  {getCurrencySymbol(settings.currency)}
                </span>
                <input
                  type="number"
                  value={settings.monthlyBudget}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    monthlyBudget: parseFloat(e.target.value) || 0 
                  })}
                  className="w-full pl-10 pr-4 py-3 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white placeholder-gray-500 outline-none"
                  placeholder="Enter your monthly budget"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Set a monthly budget to track your spending against it
              </p>
            </div>

            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white outline-none"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.symbol} ({currency.name})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1.5">
                Select your preferred currency for displaying amounts
              </p>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00d4ff] text-black font-semibold rounded-lg hover:bg-[#00b8d4] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </form>
        </div>

        {/* Budget Status - Updated with Real Data */}
        <div className="bg-[#141414] rounded-xl p-6 border border-[#0a6b7a]/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">📊 Budget Status</h2>
            <span className="text-xs text-gray-500">{budgetStats.monthName}</span>
          </div>

          {budgetStatsLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-[#0a0a0a] rounded w-3/4"></div>
              <div className="h-4 bg-[#0a0a0a] rounded w-1/2"></div>
              <div className="h-2 bg-[#0a0a0a] rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Budget Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0a0a0a] rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="text-lg font-bold text-white">
                    {formatAmount(settings.monthlyBudget)}
                  </p>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Spent</p>
                  <p className="text-lg font-bold text-[#00d4ff]">
                    {formatAmount(budgetStats.spent)}
                  </p>
                </div>
                <div className={`bg-[#0a0a0a] rounded-lg p-3 text-center ${
                  budgetStats.isOverBudget ? 'border border-red-500/30' : ''
                }`}>
                  <p className="text-xs text-gray-500">Remaining</p>
                  <p className={`text-lg font-bold ${
                    budgetStats.isOverBudget ? 'text-red-400' : 'text-white'
                  }`}>
                    {formatAmount(budgetStats.remaining)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">
                    {budgetStats.percentage.toFixed(1)}% used
                  </span>
                  <span className={`font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
                <div className="w-full h-3 bg-[#0a0a0a] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budgetStats.percentage, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full transition-all ${getProgressColor(budgetStats.percentage)}`}
                  />
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#0a6b7a]/10">
                <div>
                  <p className="text-xs text-gray-500">Transactions</p>
                  <p className="text-sm font-medium text-white">{budgetStats.count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </p>
                </div>
              </div>

              {/* Warning Messages */}
              {budgetStats.isOverBudget && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-center gap-2">
                  <span>⚠️</span>
                  You have exceeded your monthly budget by {formatAmount(Math.abs(budgetStats.remaining))}!
                </div>
              )}
              {budgetStats.percentage >= 80 && !budgetStats.isOverBudget && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-xs text-orange-400 flex items-center gap-2">
                  <span>⚠️</span>
                  You're approaching your monthly budget limit ({budgetStats.percentage.toFixed(0)}% used)!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="bg-[#141414] rounded-xl p-6 border border-[#0a6b7a]/20">
          <h2 className="text-lg font-semibold text-white mb-4">🔐 Account</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/history')}
              className="w-full flex items-center justify-between px-4 py-3 bg-black/30 border border-[#0a6b7a]/10 rounded-lg hover:bg-[#0a6b7a]/10 transition group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🕒</span>
                <span className="text-sm text-gray-300">View Transaction History</span>
              </div>
              <span className="text-gray-500 group-hover:text-[#00d4ff] transition">→</span>
            </button>

            <button
              onClick={() => router.push('/expenses')}
              className="w-full flex items-center justify-between px-4 py-3 bg-black/30 border border-[#0a6b7a]/10 rounded-lg hover:bg-[#0a6b7a]/10 transition group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">💳</span>
                <span className="text-sm text-gray-300">Manage Transactions</span>
              </div>
              <span className="text-gray-500 group-hover:text-[#00d4ff] transition">→</span>
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center justify-between px-4 py-3 bg-black/30 border border-[#0a6b7a]/10 rounded-lg hover:bg-[#0a6b7a]/10 transition group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🏠</span>
                <span className="text-sm text-gray-300">Go to Dashboard</span>
              </div>
              <span className="text-gray-500 group-hover:text-[#00d4ff] transition">→</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-[#141414] rounded-xl p-6 border border-red-500/20">
          <h2 className="text-lg font-semibold text-red-400 mb-4">⚠️ Danger Zone</h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Once you logout, you'll need to sign in again to access your account.
            </p>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition border border-red-500/20 flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          
          <p className="text-[10px] text-gray-700 mt-1">
            © {new Date().getFullYear()} Walleto. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}