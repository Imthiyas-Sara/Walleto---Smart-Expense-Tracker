'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  isToday, 
  isYesterday, 
  subDays, 
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Category Icons & Colors
const CATEGORY_ICONS: Record<string, string> = {
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

const CATEGORY_COLORS: Record<string, string> = {
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

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Insurance',
  'Personal Care',
  'Debt Payments',
  'Savings',
  'Gifts & Donations',
  'Travel',
  'Other',
];

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 w-40 bg-[#141414] rounded"></div>
              <div className="h-4 w-64 bg-[#141414] rounded mt-2"></div>
            </div>
          </div>
          <div className="h-24 bg-[#141414] rounded-xl mb-6"></div>
          <div className="h-64 bg-[#141414] rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

// Stats Summary Component
function StatsSummary({ expenses }: { expenses: any[] }) {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const count = expenses.length;
  const average = count > 0 ? total / count : 0;
  const categories = new Set(expenses.map(e => e.category)).size;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-[#141414] rounded-xl p-3 border border-[#0a6b7a]/20">
        <p className="text-xs text-gray-500">Total</p>
        <p className="text-lg font-bold text-[#00d4ff]">Rs{total.toFixed(2)}</p>
      </div>
      <div className="bg-[#141414] rounded-xl p-3 border border-[#0a6b7a]/20">
        <p className="text-xs text-gray-500">Transactions</p>
        <p className="text-lg font-bold text-white">{count}</p>
      </div>
      <div className="bg-[#141414] rounded-xl p-3 border border-[#0a6b7a]/20">
        <p className="text-xs text-gray-500">Average</p>
        <p className="text-lg font-bold text-white">Rs{average.toFixed(2)}</p>
      </div>
      <div className="bg-[#141414] rounded-xl p-3 border border-[#0a6b7a]/20">
        <p className="text-xs text-gray-500">Categories</p>
        <p className="text-lg font-bold text-white">{categories}</p>
      </div>
    </div>
  );
}

// Calendar View Component - Smaller Version
function CalendarView({ expenses, onDateSelect, selectedDate }: any) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayExpenses = (day: Date) => {
    return expenses.filter(exp => isSameDay(new Date(exp.date), day));
  };

  const getDayTotal = (day: Date) => {
    const dayExpenses = getDayExpenses(day);
    return dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getDayCount = (day: Date) => {
    return getDayExpenses(day).length;
  };

  const hasExpenses = (day: Date) => {
    return getDayCount(day) > 0;
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayColor = (day: Date) => {
    const total = getDayTotal(day);
    if (total === 0) return 'bg-[#141414] border-[#0a6b7a]/10';
    if (total < 500) return 'bg-green-500/15 border-green-500/30';
    if (total < 1000) return 'bg-blue-500/15 border-blue-500/30';
    if (total < 2000) return 'bg-yellow-500/15 border-yellow-500/30';
    if (total < 5000) return 'bg-orange-500/15 border-orange-500/30';
    return 'bg-red-500/15 border-red-500/30';
  };

  const getDayTextColor = (day: Date) => {
    const total = getDayTotal(day);
    if (total === 0) return 'text-gray-500';
    if (total < 500) return 'text-green-400';
    if (total < 1000) return 'text-blue-400';
    if (total < 2000) return 'text-yellow-400';
    if (total < 5000) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-[#141414] rounded-xl border border-[#0a6b7a]/20 overflow-hidden">
      {/* Calendar Header - Smaller */}
      <div className="px-4 py-2.5 border-b border-[#0a6b7a]/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#0a6b7a]/20 rounded-lg transition text-sm"
          >
            ←
          </button>
          <span className="text-sm font-semibold text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#0a6b7a]/20 rounded-lg transition text-sm"
          >
            →
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-2.5 py-1 text-xs bg-[#00d4ff] text-black rounded-lg hover:bg-[#00b8d4] transition"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid - Smaller */}
      <div className="p-3">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-[10px] font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, index) => {
            const dayTotal = getDayTotal(day);
            const dayCount = getDayCount(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const hasExpensesDay = hasExpenses(day);

            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onDateSelect(day)}
                className={`
                  relative aspect-square rounded-lg p-1.5 transition-all
                  ${isCurrentMonth ? 'text-white' : 'text-gray-600'}
                  ${isTodayDate ? 'ring-1.5 ring-[#00d4ff] ring-offset-1 ring-offset-[#141414]' : ''}
                  ${isSelected ? 'ring-1.5 ring-[#00d4ff] ring-offset-1 ring-offset-[#141414] bg-[#00d4ff]/10' : ''}
                  ${isCurrentMonth ? getDayColor(day) : 'bg-[#0a0a0a] border border-[#0a6b7a]/5'}
                  hover:bg-[#0a6b7a]/20 transition-all cursor-pointer
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`text-xs font-medium ${isTodayDate ? 'text-[#00d4ff]' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {hasExpensesDay && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <span className={`text-[8px] font-semibold ${getDayTextColor(day)}`}>
                        Rs{dayTotal.toFixed(0)}
                      </span>
                      <span className="text-[6px] text-gray-500">
                        ({dayCount})
                      </span>
                    </div>
                  )}
                  {isTodayDate && !hasExpensesDay && (
                    <span className="text-[6px] text-[#00d4ff] mt-0.5">●</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details - Smaller */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-[#0a6b7a]/10 px-4 py-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              {isToday(selectedDate) && (
                <span className="text-[10px] text-[#00d4ff]">Today</span>
              )}
            </div>
            <span className="text-sm font-bold text-[#00d4ff]">
              Total: Rs{getDayTotal(selectedDate).toFixed(2)}
            </span>
          </div>

          {getDayExpenses(selectedDate).length > 0 ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {getDayExpenses(selectedDate).map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-1.5 bg-[#0a0a0a] rounded-lg hover:bg-[#0a6b7a]/10 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{CATEGORY_ICONS[expense.category] || '📌'}</span>
                    <div>
                      <div className="text-xs text-white">{expense.title}</div>
                      <div className="text-[10px] text-gray-500">{expense.category}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-red-400">
                    -Rs{expense.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-gray-500 text-xs">
              No expenses on this day
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory();
    }
  }, [status]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/expenses?limit=200');
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(exp => exp.category === selectedCategory);
    }

    const now = new Date();
    if (dateRange === 'today') {
      filtered = filtered.filter(exp => isToday(new Date(exp.date)));
    } else if (dateRange === 'week') {
      const weekAgo = subDays(now, 7);
      filtered = filtered.filter(exp => new Date(exp.date) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthStart = startOfMonth(now);
      filtered = filtered.filter(exp => new Date(exp.date) >= monthStart);
    } else if (dateRange === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      filtered = filtered.filter(exp => new Date(exp.date) >= yearStart);
    }

    if (minAmount) {
      filtered = filtered.filter(exp => exp.amount >= parseFloat(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter(exp => exp.amount <= parseFloat(maxAmount));
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [expenses, searchTerm, selectedCategory, dateRange, minAmount, maxAmount, sortBy, sortOrder]);

  // Group expenses by date for list view
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredExpenses.forEach(exp => {
      const dateKey = format(new Date(exp.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(exp);
    });
    return groups;
  }, [filteredExpenses]);

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const getDateTotal = (dateStr: string) => {
    return groupedExpenses[dateStr].reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getCategoryBadge = (category: string) => {
    return CATEGORY_COLORS[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setDateRange('all');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('date');
    setSortOrder('desc');
    setSelectedDate(null);
  };

  const hasActiveFilters = searchTerm || selectedCategory || dateRange !== 'all' || minAmount || maxAmount;

  if (status === 'loading' || loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🕒 History</h1>
            <p className="text-sm text-gray-400">
              View and search through all your past expenses
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-[#141414] rounded-lg border border-[#0a6b7a]/20 p-0.5">
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedDate(null);
                }}
                className={`px-3 py-1.5 rounded-md text-sm transition ${
                  viewMode === 'list'
                    ? 'bg-[#00d4ff] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => {
                  setViewMode('calendar');
                  if (!selectedDate) setSelectedDate(new Date());
                }}
                className={`px-3 py-1.5 rounded-md text-sm transition ${
                  viewMode === 'calendar'
                    ? 'bg-[#00d4ff] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📅 Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <StatsSummary expenses={filteredExpenses} />

        {/* Filters */}
        <div className="bg-[#141414] rounded-xl p-4 border border-[#0a6b7a]/20 mb-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search expenses..."
              className="w-full px-4 py-2 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white placeholder-gray-500 outline-none text-sm"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white outline-none text-sm"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-4 py-2 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white outline-none text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-4 py-2 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white outline-none text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="title">Sort by Title</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-black/30 border border-[#0a6b7a]/20 rounded-lg text-white hover:bg-[#0a6b7a]/20 transition"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Min Amount"
              className="w-full px-4 py-2 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white placeholder-gray-500 outline-none text-sm"
            />
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Max Amount"
              className="w-full px-4 py-2 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white placeholder-gray-500 outline-none text-sm"
            />
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#00d4ff] hover:text-[#00b8d4] transition flex items-center gap-1"
              >
                ✕ Clear all filters
              </button>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-[#0a6b7a]/10 flex justify-between text-xs text-gray-500">
            <span>Found {filteredExpenses.length} transactions</span>
            <span>Total: <span className="text-[#00d4ff] font-semibold">
              Rs{filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
            </span></span>
          </div>
        </div>

        {/* View Content */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {sortedDates.length > 0 ? (
              sortedDates.map((dateKey) => {
                const dateExpenses = groupedExpenses[dateKey];
                const dayTotal = getDateTotal(dateKey);
                const isTodayDate = isToday(new Date(dateKey));

                return (
                  <motion.div
                    key={dateKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#141414] rounded-xl border border-[#0a6b7a]/20 overflow-hidden"
                  >
                    <div className={`px-4 sm:px-6 py-3 border-b border-[#0a6b7a]/20 flex justify-between items-center ${
                      isTodayDate ? 'bg-[#00d4ff]/5' : ''
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white">
                          {getDateLabel(dateKey)}
                        </span>
                        {isTodayDate && (
                          <span className="px-2 py-0.5 bg-[#00d4ff] text-black text-xs font-semibold rounded-full">
                            Today
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {dateExpenses.length} transactions
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#00d4ff]">
                        Rs{dayTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="divide-y divide-[#0a6b7a]/10">
                      {dateExpenses.map((expense) => (
                        <div key={expense._id} className="px-4 sm:px-6 py-3 flex items-center justify-between hover:bg-[#0a6b7a]/5 transition">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-2xl flex-shrink-0">
                              {CATEGORY_ICONS[expense.category] || '📌'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white text-sm truncate">
                                {expense.title}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className={`px-1.5 py-0.5 rounded-full border ${getCategoryBadge(expense.category)}`}>
                                  {expense.category}
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-500">
                                  {format(new Date(expense.date), 'h:mm a')}
                                </span>
                                {expense.description && (
                                  <>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-500 truncate max-w-[100px] sm:max-w-xs">
                                      {expense.description}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-red-400 flex-shrink-0">
                            -Rs{expense.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-[#141414] rounded-xl p-12 text-center border border-[#0a6b7a]/20">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-400">No expenses found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {hasActiveFilters ? 'Try adjusting your filters' : 'Start tracking your expenses'}
                </p>
              </div>
            )}
          </div>
        ) : (
          // Calendar View
          <CalendarView
            expenses={filteredExpenses}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        )}
      </div>
    </div>
  );
}