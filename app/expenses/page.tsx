'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, isToday, isYesterday, subDays } from 'date-fns';
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

// Quick Amount Options
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 w-48 bg-[#141414] rounded"></div>
              <div className="h-4 w-64 bg-[#141414] rounded mt-2"></div>
            </div>
            <div className="h-10 w-32 bg-[#141414] rounded"></div>
          </div>
          <div className="h-24 bg-[#141414] rounded-xl mb-6"></div>
          <div className="space-y-3">
            <div className="h-16 bg-[#141414] rounded-xl"></div>
            <div className="h-16 bg-[#141414] rounded-xl"></div>
            <div className="h-16 bg-[#141414] rounded-xl"></div>
          </div>
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
  const highest = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;

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
        <p className="text-xs text-gray-500">Highest</p>
        <p className="text-lg font-bold text-red-400">Rs{highest.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchExpenses();
    }
  }, [status]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/expenses?limit=100');
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      date: new Date(expense.date).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
      };

      const url = editingExpense 
        ? `/api/expenses/${editingExpense._id}` 
        : '/api/expenses';
      const method = editingExpense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save expense');

      setIsModalOpen(false);
      await fetchExpenses();
      
      alert(editingExpense ? '✅ Expense updated!' : '✅ Expense added!');
    } catch (error: any) {
      alert(error.message || 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete expense');

      await fetchExpenses();
      alert('✅ Expense deleted!');
    } catch (error: any) {
      alert(error.message || 'Failed to delete expense');
    }
  };

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(exp => exp.category === selectedCategory);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter(exp => isToday(new Date(exp.date)));
    } else if (dateFilter === 'week') {
      const weekAgo = subDays(now, 7);
      filtered = filtered.filter(exp => new Date(exp.date) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthStart = startOfMonth(now);
      filtered = filtered.filter(exp => new Date(exp.date) >= monthStart);
    }

    // Sort
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
  }, [expenses, searchTerm, selectedCategory, dateFilter, sortBy, sortOrder]);

  const getCategoryBadge = (category: string) => {
    return CATEGORY_COLORS[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getDateLabel = (date: string) => {
    const dateObj = new Date(date);
    if (isToday(dateObj)) return 'Today';
    if (isYesterday(dateObj)) return 'Yesterday';
    return format(dateObj, 'MMM d, yyyy');
  };

  // Quick add amount
  const handleQuickAmount = (amount: number) => {
    setFormData({ ...formData, amount: amount.toString() });
  };

  // Increment/Decrement amount
  const incrementAmount = () => {
    const current = parseFloat(formData.amount) || 0;
    setFormData({ ...formData, amount: (current + 100).toString() });
  };

  const decrementAmount = () => {
    const current = parseFloat(formData.amount) || 0;
    if (current > 0) {
      setFormData({ ...formData, amount: Math.max(0, current - 100).toString() });
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">💳 Transactions</h1>
            <p className="text-sm text-gray-400">
              Manage all your expenses in one place
            </p>
          </div>
          <button
            onClick={handleAddExpense}
            className="px-6 py-2.5 bg-[#00d4ff] text-black font-semibold rounded-lg hover:bg-[#00b8d4] transition-all transform hover:scale-105 shadow-lg shadow-[#00d4ff]/20 flex items-center gap-2"
          >
            <span className="text-xl leading-none">+</span>
            Add Expense
          </button>
        </div>

        {/* Stats Summary */}
        <StatsSummary expenses={filteredExpenses} />

        {/* Filters */}
        <div className="bg-[#141414] rounded-xl p-4 border border-[#0a6b7a]/20 mb-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Search expenses..."
                className="w-full px-4 py-2 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white placeholder-gray-500 outline-none text-sm"
              />
            </div>

            {/* Category Filter */}
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

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-4 py-2 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white outline-none text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Sort */}
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

          {/* Clear Filters */}
          {(searchTerm || selectedCategory || dateFilter !== 'all') && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setDateFilter('all');
                  setSortBy('date');
                  setSortOrder('desc');
                }}
                className="text-xs text-[#00d4ff] hover:text-[#00b8d4] transition"
              >
                ✕ Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Expense List */}
        <div className="bg-[#141414] rounded-xl border border-[#0a6b7a]/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#0a6b7a]/10 flex justify-between items-center">
            <span className="text-sm text-gray-400">
              {filteredExpenses.length} transactions
            </span>
            <span className="text-sm text-gray-400">
              Total: <span className="text-[#00d4ff] font-semibold">
                Rs{filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
              </span>
            </span>
          </div>

          {filteredExpenses.length > 0 ? (
            <div className="divide-y divide-[#0a6b7a]/10">
              <AnimatePresence>
                {filteredExpenses.map((expense, index) => (
                  <motion.div
                    key={expense._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="px-4 sm:px-6 py-3 flex items-center justify-between hover:bg-[#0a6b7a]/5 transition group"
                  >
                    {/* Left: Icon + Details */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl flex-shrink-0">
                        {CATEGORY_ICONS[expense.category] || '📌'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm sm:text-base truncate">
                          {expense.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`px-1.5 py-0.5 rounded-full border ${getCategoryBadge(expense.category)}`}>
                            {expense.category}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">{getDateLabel(expense.date)}</span>
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

                    {/* Right: Amount + Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-400">
                          -Rs{expense.amount.toFixed(2)}
                        </div>
                      </div>
                      
                      {/* Action Buttons - Always Visible */}
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="p-1.5 text-[#00d4ff] hover:text-[#00b8d4] rounded hover:bg-[#00d4ff]/10 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-1.5 text-red-400 hover:text-red-500 rounded hover:bg-red-500/10 transition-colors"
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
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-400">No transactions found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || selectedCategory || dateFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Add your first expense'}
              </p>
              {!searchTerm && !selectedCategory && dateFilter === 'all' && (
                <button
                  onClick={handleAddExpense}
                  className="mt-4 px-4 py-2 bg-[#00d4ff] text-black font-semibold rounded-lg hover:bg-[#00b8d4] transition text-sm"
                >
                  Add Expense
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/70" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-[#141414] rounded-2xl p-6 w-full max-w-md border border-[#0a6b7a]/20 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#141414] z-10 pb-2">
                <h3 className="text-lg font-semibold text-white">
                  {editingExpense ? '✏️ Edit Expense' : 'Add Expense'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#0a6b7a]/20 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white placeholder-gray-500 outline-none"
                    placeholder="e.g., Lunch at Cafe"
                    required
                  />
                </div>

                {/* Amount with Custom Controls */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Amount (Rs) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-500 z-10">Rs</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-10 pr-12 py-2.5 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white placeholder-gray-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0.00"
                      required
                    />
                    {/* Custom Amount Controls */}
                    <div className="absolute right-1 flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={incrementAmount}
                        className="px-1.5 py-0.5 text-xs text-gray-400 hover:text-white hover:bg-[#0a6b7a]/20 rounded transition"
                        title="Increase by 100"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={decrementAmount}
                        className="px-1.5 py-0.5 text-xs text-gray-400 hover:text-white hover:bg-[#0a6b7a]/20 rounded transition"
                        title="Decrease by 100"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  {/* Quick Amount Buttons */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {QUICK_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleQuickAmount(amount)}
                        className="px-3 py-1 text-xs bg-[#0a6b7a]/20 text-[#00d4ff] rounded-lg hover:bg-[#0a6b7a]/30 transition border border-[#0a6b7a]/20"
                      >
                        Rs{amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white outline-none"
                    required
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
                    ))}
                  </select>
                </div>

                {/* Date with Custom Calendar */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white outline-none [color-scheme:dark]"
                      required
                      style={{
                        colorScheme: 'dark',
                      }}
                    />
                    {/* Custom Calendar Icon */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <style jsx>{`
                    input[type="date"]::-webkit-calendar-picker-indicator {
                      filter: invert(1);
                      cursor: pointer;
                      opacity: 0.6;
                      padding: 4px;
                    }
                    input[type="date"]::-webkit-calendar-picker-indicator:hover {
                      opacity: 1;
                    }
                  `}</style>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Description
                    <span className="text-gray-500 text-xs ml-1">(optional)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-black/30 border border-[#0a6b7a]/20 rounded-lg focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-white placeholder-gray-500 outline-none resize-none"
                    placeholder="Add a note..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-2 sticky bottom-0 bg-[#141414] pb-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-[#00d4ff] text-black font-semibold rounded-lg hover:bg-[#00b8d4] transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : editingExpense ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 bg-[#0a6b7a]/20 text-gray-300 font-semibold rounded-lg hover:bg-[#0a6b7a]/30 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}