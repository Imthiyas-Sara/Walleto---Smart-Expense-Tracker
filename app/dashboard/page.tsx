'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subDays, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Category Colors
const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#00d4ff',
  'Transportation': '#0a6b7a',
  'Shopping': '#8b5cf6',
  'Housing': '#f59e0b',
  'Utilities': '#ec4899',
  'Entertainment': '#ef4444',
  'Healthcare': '#10b981',
  'Education': '#6366f1',
  'Insurance': '#14b8a6',
  'Personal Care': '#f97316',
  'Debt Payments': '#dc2626',
  'Savings': '#22c55e',
  'Gifts & Donations': '#e11d48',
  'Travel': '#06b6d4',
  'Other': '#6b7280',
};

// Types
interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface DashboardData {
  budget: number;
  spent: number;
  remaining: number;
  todayTotal: number;
  todayCount: number;
  todayExpenses: Expense[];
  categoryBreakdown: { name: string; total: number; count: number; percentage: number }[];
  budgetPercentage: number;
  monthName: string;
  weeklyTrend: { day: string; total: number }[];
  previousMonthSpent: number;
  changePercentage: number;
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 w-64 bg-[#141414] rounded"></div>
              <div className="h-4 w-48 bg-[#141414] rounded mt-2"></div>
            </div>
            <div className="h-10 w-32 bg-[#141414] rounded"></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[#141414] rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            <div className="h-64 bg-[#141414] rounded-xl"></div>
            <div className="h-64 bg-[#141414] rounded-xl"></div>
          </div>
          <div className="h-96 bg-[#141414] rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const fetchDashboardData = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
      const interval = setInterval(() => fetchDashboardData(true), 60000);
      return () => clearInterval(interval);
    }
  }, [status, fetchDashboardData]);

  const handleAddExpense = () => router.push('/expenses');
  const handleEditExpense = (expense: Expense) => router.push(`/expenses?edit=${expense._id}`);
  
  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      await fetchDashboardData(false);
    } catch (error) {
      alert('Failed to delete expense');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper function to format amounts
  function formatAmount(amount: number): string {
    return amount.toFixed(2);
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Food & Dining': '🍔',
      'Transportation': '🚕',
      'Shopping': '🛒',
      'Housing': '🏠',
      'Utilities': '💡',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Education': '📚',
      'Insurance': '🛡️',
      'Personal Care': '💄',
      'Debt Payments': '💰',
      'Savings': '🏦',
      'Gifts & Donations': '🎁',
      'Travel': '✈️',
      'Other': '📌',
    };
    return icons[category] || '📌';
  };

  // Get category badge color
  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'Food & Dining': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Transportation': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Shopping': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Housing': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Utilities': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Entertainment': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Healthcare': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Education': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'Insurance': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'Personal Care': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Debt Payments': 'bg-red-600/20 text-red-400 border-red-600/30',
      'Savings': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'Gifts & Donations': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      'Travel': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      'Other': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  if (status === 'loading' || loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData(false)}
            className="px-6 py-2 bg-[#00d4ff] text-black font-semibold rounded-lg hover:bg-[#00b8d4] transition"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const { 
    budget = 0,
    spent = 0,
    remaining = 0,
    todayTotal = 0,
    todayCount = 0,
    todayExpenses = [],
    categoryBreakdown = [],
    budgetPercentage = 0,
    monthName = '',
    weeklyTrend = [],
    previousMonthSpent = 0,
    changePercentage = 0
  } = data || {};

  const displayTransactions = showAllTransactions ? todayExpenses : todayExpenses.slice(0, 5);
  const hasMoreTransactions = todayExpenses.length > 5;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {getGreeting()}, {session?.user?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              Here's your spending overview for {monthName}
              <span className="text-xs text-gray-600">
                • Updated {format(lastUpdated, 'h:mm a')}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardData(false)}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-white transition disabled:opacity-50"
              title="Refresh"
            >
              <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddExpense}
              className="px-5 py-2.5 bg-[#00d4ff] text-black font-semibold rounded-lg hover:bg-[#00b8d4] transition-all shadow-lg shadow-[#00d4ff]/20 flex items-center gap-2 text-sm sm:text-base"
            >
              <span className="text-xl leading-none">+</span>
              Add Expense
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          {/* Budget Card */}
          <motion.div variants={fadeInUp} className="bg-[#141414] rounded-xl p-5 border border-[#0a6b7a]/20 hover:border-[#0a6b7a]/40 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">💰 Monthly Budget</p>
                <p className="text-2xl font-bold text-white mt-1">Rs{formatAmount(budget)}</p>
              </div>
              <div className="w-12 h-12 bg-[#0a6b7a]/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                📊
              </div>
            </div>
          </motion.div>

          {/* Spent Card */}
          <motion.div variants={fadeInUp} className="bg-[#141414] rounded-xl p-5 border border-[#0a6b7a]/20 hover:border-[#0a6b7a]/40 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">💸 Spent This Month</p>
                <p className="text-2xl font-bold text-[#00d4ff] mt-1">Rs{formatAmount(spent)}</p>
              </div>
              <div className="w-12 h-12 bg-[#00d4ff]/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                💳
              </div>
            </div>
            {changePercentage !== 0 && (
              <div className={`mt-2 text-xs ${changePercentage > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {changePercentage > 0 ? '↑' : '↓'} {Math.abs(changePercentage).toFixed(1)}% vs last month
              </div>
            )}
          </motion.div>

          {/* Remaining Card */}
          <motion.div variants={fadeInUp} className={`rounded-xl p-5 border transition group ${
            remaining < 0 
              ? 'bg-red-500/10 border-red-500/30' 
              : 'bg-[#141414] border-[#0a6b7a]/20 hover:border-[#0a6b7a]/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">💵 Remaining</p>
                <p className={`text-2xl font-bold mt-1 ${
                  remaining < 0 ? 'text-red-400' : 'text-white'
                }`}>
                  Rs{formatAmount(remaining)}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#0a6b7a]/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                {remaining < 0 ? '🔴' : '✅'}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {remaining < 0 ? '⚠️ Over budget!' : 'Available this month'}
            </div>
          </motion.div>

          {/* Today Card */}
          <motion.div variants={fadeInUp} className="bg-[#141414] rounded-xl p-5 border border-[#0a6b7a]/20 hover:border-[#0a6b7a]/40 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">📅 Today's Spending</p>
                <p className="text-2xl font-bold text-white mt-1">Rs{formatAmount(todayTotal)}</p>
                <p className="text-xs text-gray-500">{todayCount} transactions today</p>
              </div>
              <div className="w-12 h-12 bg-[#0a6b7a]/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                📅
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Budget Progress + Weekly Trend Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {/* Budget Progress Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-[#141414] rounded-xl p-6 border border-[#0a6b7a]/20"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-white">Monthly Budget Progress</h3>
              <span className="text-sm text-gray-400">
                {budgetPercentage.toFixed(1)}% used
              </span>
            </div>
            <div className="relative w-full h-4 bg-[#0a0a0a] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full transition-all ${
                  budgetPercentage > 80 ? 'bg-red-500' : 
                  budgetPercentage > 60 ? 'bg-yellow-500' : 
                  'bg-[#00d4ff]'
                }`}
              />
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-gray-500">0%</span>
              <span className={`font-medium ${
                budgetPercentage > 80 ? 'text-red-400' : 
                budgetPercentage > 60 ? 'text-yellow-400' : 
                'text-[#00d4ff]'
              }`}>
                Rs{formatAmount(spent)} / Rs{formatAmount(budget)}
              </span>
              <span className="text-gray-500">100%</span>
            </div>
            {budgetPercentage > 80 && (
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-center gap-2">
                <span>⚠️</span> You're approaching your monthly budget limit!
              </div>
            )}
          </motion.div>

          {/* Weekly Trend Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-[#141414] rounded-xl p-6 border border-[#0a6b7a]/20"
          >
            <h3 className="font-medium text-white mb-4">📈 Weekly Spending Trend</h3>
            <div className="flex items-end justify-between h-32 gap-2">
              {weeklyTrend && weeklyTrend.length > 0 ? (
                weeklyTrend.map((day, index) => {
                  const maxValue = Math.max(...weeklyTrend.map(d => d.total), 1);
                  const height = (day.total / maxValue) * 100;
                  const isToday = day.day === format(new Date(), 'EEE');
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="relative w-full flex justify-center">
                        <div
                          className={`w-full max-w-[30px] rounded-t transition-all duration-500 ${
                            isToday ? 'bg-[#00d4ff]' : 'bg-[#0a6b7a]'
                          }`}
                          style={{ height: `${Math.max(height * 0.6, 4)}px` }}
                        />
                      </div>
                      <span className={`text-xs ${isToday ? 'text-[#00d4ff]' : 'text-gray-500'}`}>
                        {day.day}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        Rs{day.total.toFixed(0)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center text-gray-500 py-8">
                  No data for this week
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Today's Transactions + Category Breakdown Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Today's Transactions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="lg:col-span-2 bg-[#141414] rounded-xl border border-[#0a6b7a]/20 overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-b border-[#0a6b7a]/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  📅 Today's Transactions
                </h2>
                <p className="text-sm text-gray-400">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              {todayCount > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-lg font-bold text-[#00d4ff]">Rs{formatAmount(todayTotal)}</p>
                </div>
              )}
            </div>

            {todayExpenses.length > 0 ? (
              <div className="divide-y divide-[#0a6b7a]/10">
                <AnimatePresence>
                  {displayTransactions.map((expense, index) => (
                    <motion.div
                      key={expense._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-4 sm:px-6 py-3 flex items-center justify-between hover:bg-[#0a6b7a]/5 transition group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">
                          {getCategoryIcon(expense.category)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm sm:text-base truncate">
                            {expense.title}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className={`px-1.5 py-0.5 rounded-full border ${getCategoryBadge(expense.category)}`}>
                              {expense.category}
                            </span>
                            <span className="text-gray-500">
                              {format(new Date(expense.date), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-red-400">
                          -Rs{formatAmount(expense.amount)}
                        </span>
                        {/* Action Buttons - ALWAYS VISIBLE */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="p-1.5 text-[#00d4ff] hover:text-[#00b8d4] rounded-lg hover:bg-[#00d4ff]/10 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="p-1.5 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {hasMoreTransactions && (
                  <div className="px-4 sm:px-6 py-3 text-center">
                    <button
                      onClick={() => setShowAllTransactions(!showAllTransactions)}
                      className="text-sm text-[#00d4ff] hover:text-[#00b8d4] transition"
                    >
                      {showAllTransactions ? 'Show less' : `Show ${todayExpenses.length - 5} more transactions`}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-gray-400">No expenses today</p>
                <p className="text-sm text-gray-500 mt-1">You haven't added any expenses for today</p>
                <button
                  onClick={handleAddExpense}
                  className="mt-4 px-4 py-2 bg-[#00d4ff] text-black font-semibold rounded-lg hover:bg-[#00b8d4] transition text-sm"
                >
                  Add Expense
                </button>
              </div>
            )}
          </motion.div>

          {/* Category Breakdown */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-[#141414] rounded-xl p-6 border border-[#0a6b7a]/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              📊 Category Breakdown
              <span className="ml-2 text-sm font-normal text-gray-400">This month</span>
            </h3>
            
            {categoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {/* Donut Chart (Simplified Visual) */}
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {categoryBreakdown.map((category, index) => {
                      const startAngle = categoryBreakdown
                        .slice(0, index)
                        .reduce((sum, c) => sum + c.percentage, 0);
                      const endAngle = startAngle + category.percentage;
                      const startRad = (startAngle / 100) * 2 * Math.PI;
                      const endRad = (endAngle / 100) * 2 * Math.PI;
                      const x1 = 50 + 38 * Math.cos(startRad);
                      const y1 = 50 + 38 * Math.sin(startRad);
                      const x2 = 50 + 38 * Math.cos(endRad);
                      const y2 = 50 + 38 * Math.sin(endRad);
                      const largeArc = category.percentage > 50 ? 1 : 0;
                      
                      return (
                        <path
                          key={category.name}
                          d={`M 50 50 L ${x1} ${y1} A 38 38 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={CATEGORY_COLORS[category.name] || '#6b7280'}
                          opacity={0.9}
                        />
                      );
                    })}
                    <circle cx="50" cy="50" r="22" fill="#141414" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">Rs{formatAmount(spent)}</div>
                      <div className="text-[10px] text-gray-500">Total</div>
                    </div>
                  </div>
                </div>

                {/* Category List */}
                <div className="space-y-2">
                  {categoryBreakdown.slice(0, 5).map((category) => (
                    <div key={category.name}>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{getCategoryIcon(category.name)}</span>
                          <span className="text-gray-300">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Rs{formatAmount(category.total)}</span>
                          <span className="text-gray-500 text-xs w-12 text-right">
                            {category.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: CATEGORY_COLORS[category.name] || '#6b7280',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {categoryBreakdown.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{categoryBreakdown.length - 5} more categories
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-400">No spending data</p>
                <p className="text-sm text-gray-500">Add expenses to see breakdown</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}