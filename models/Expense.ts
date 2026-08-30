import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
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
      ],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    receipt: {
      type: String,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: function () {
        return this.isRecurring;
      },
    },
  },
  {
    timestamps: true,
  }
);

ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ user: 1, category: 1 });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);