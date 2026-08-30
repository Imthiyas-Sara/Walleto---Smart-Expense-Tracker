'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CATEGORIES } from '@/lib/types';

const expenseFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Amount must be a positive number'
  ),
  category: z.string().min(1, 'Category is required'),
  description: z.string().max(500, 'Description too long').optional(),
  date: z.string().min(1, 'Date is required'),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

export default function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false,
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      amount: initialData?.amount || '',
      category: initialData?.category || '',
      description: initialData?.description || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      isRecurring: initialData?.isRecurring || false,
      recurringFrequency: initialData?.recurringFrequency || 'monthly',
    },
  });

  const isRecurring = watch('isRecurring');

  const onFormSubmit = async (data: ExpenseFormData) => {
    const formattedData = {
      ...data,
      amount: parseFloat(data.amount),
    };
    await onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          {...register('title')}
          type="text"
          className="input-field mt-1"
          placeholder="e.g., Lunch at Cafe"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Amount *
        </label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            $
          </span>
          <input
            {...register('amount')}
            type="number"
            step="0.01"
            className="input-field pl-7"
            placeholder="0.00"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category *
        </label>
        <select
          {...register('category')}
          className="input-field mt-1"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Date *
        </label>
        <input
          {...register('date')}
          type="date"
          className="input-field mt-1"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
          <span className="text-gray-400 text-xs ml-1">(optional)</span>
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="input-field mt-1"
          placeholder="Add any additional details..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            {...register('isRecurring')}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Recurring expense
        </label>
      </div>

      {isRecurring && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Frequency
          </label>
          <select
            {...register('recurringFrequency')}
            className="input-field mt-1"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1"
        >
          {isLoading
            ? 'Saving...'
            : isEditing
            ? 'Update Expense'
            : 'Add Expense'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}