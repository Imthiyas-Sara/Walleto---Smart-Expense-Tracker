'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/types';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Filters {
  category: string;
  search: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  sortOrder: string;
}

interface ExpenseFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

// ✅ Default filters
const DEFAULT_FILTERS: Filters = {
  category: '',
  search: '',
  startDate: '',
  endDate: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

export default function ExpenseFilters({ filters, onFilterChange }: ExpenseFiltersProps) {
  // ✅ Ensure filters is defined
  const currentFilters = filters || DEFAULT_FILTERS;
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const handleChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  };

  // ✅ Check if any filters are active
  const hasActiveFilters = Object.entries(localFilters).some(
    ([key, value]) => value !== '' && key !== 'sortBy' && key !== 'sortOrder'
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={localFilters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={localFilters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="flex gap-2">
          <input
            type="date"
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={localFilters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            placeholder="From"
          />
          <input
            type="date"
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={localFilters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            placeholder="To"
          />
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <select
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={localFilters.sortBy || 'date'}
            onChange={(e) => handleChange('sortBy', e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="title">Sort by Title</option>
          </select>
          <select
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={localFilters.sortOrder || 'desc'}
            onChange={(e) => handleChange('sortOrder', e.target.value)}
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <XMarkIcon className="h-4 w-4" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}