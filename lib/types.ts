export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: Date | string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  user: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseFormData {
  title: string;
  amount: string;
  category: string;
  description?: string;
  date: string;
  isRecurring: boolean;
  recurringFrequency?: string;
}

export const CATEGORIES = [
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

export const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': '🍔',
  'Transportation': '🚗',
  'Shopping': '🛍️',
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

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'bg-orange-100 text-orange-800',
  'Transportation': 'bg-blue-100 text-blue-800',
  'Shopping': 'bg-pink-100 text-pink-800',
  'Housing': 'bg-purple-100 text-purple-800',
  'Utilities': 'bg-yellow-100 text-yellow-800',
  'Entertainment': 'bg-red-100 text-red-800',
  'Healthcare': 'bg-green-100 text-green-800',
  'Education': 'bg-cyan-100 text-cyan-800',
  'Insurance': 'bg-indigo-100 text-indigo-800',
  'Personal Care': 'bg-pink-100 text-pink-800',
  'Debt Payments': 'bg-red-100 text-red-800',
  'Savings': 'bg-emerald-100 text-emerald-800',
  'Gifts & Donations': 'bg-rose-100 text-rose-800',
  'Travel': 'bg-sky-100 text-sky-800',
  'Other': 'bg-gray-100 text-gray-800',
};