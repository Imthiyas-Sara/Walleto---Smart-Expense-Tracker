'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import ExpenseForm from './ExpenseForm';
import { Expense, ExpenseFormData } from '@/lib/types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Expense | null;
  isLoading?: boolean;
}

export default function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}: ExpenseModalProps) {
  const isEditing = !!initialData;

  const formData: Partial<ExpenseFormData> = initialData
    ? {
        title: initialData.title || '',
        amount: initialData.amount?.toString() || '',
        category: initialData.category || '',
        description: initialData.description || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        isRecurring: initialData.isRecurring || false,
        recurringFrequency: initialData.recurringFrequency || 'monthly',
      }
    : {};

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {isEditing ? '✏️ Edit Expense' : '➕ Add New Expense'}
                </Dialog.Title>

                <ExpenseForm
                  initialData={formData}
                  onSubmit={onSubmit}
                  onCancel={onClose}
                  isEditing={isEditing}
                  isLoading={isLoading}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}