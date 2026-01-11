import { useState, useEffect } from 'react';
import { Transaction, ExpenseCategory, TransactionType, PeriodFilter } from '../types';

interface SearchAndFilterProps {
  transactions: Transaction[];
  onFiltered: (filtered: Transaction[]) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'būstas', 'mokesčiai', 'maistas', 'drabužiai', 'automobilis',
  'pramogos', 'sveikata', 'grožis', 'kitos'
];

export default function SearchAndFilter({ transactions, onFiltered }: SearchAndFilterProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter | 'all'>('all');

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search
    if (search) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Period filter
    if (periodFilter !== 'all') {
      const now = new Date();
      let start: Date;
      let end: Date;

      switch (periodFilter) {
        case 'week':
          start = new Date(now);
          start.setDate(now.getDate() - 7);
          end = now;
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31);
          break;
      }

      filtered = filtered.filter(t => t.date >= start && t.date <= end);
    }

    onFiltered(filtered);
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPeriodFilter('all');
    onFiltered(transactions);
  };

  // Auto-apply filters when they change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, categoryFilter, periodFilter, transactions]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paieška</label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setTimeout(applyFilters, 100);
            }}
            placeholder="Ieškoti pagal aprašymą..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipas</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as TransactionType | 'all');
              setTimeout(applyFilters, 100);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Visi</option>
            <option value="income">Pajamos</option>
            <option value="expense">Išlaidos</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategorija</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as ExpenseCategory | 'all');
              setTimeout(applyFilters, 100);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Visos</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Laikotarpis</label>
          <select
            value={periodFilter}
            onChange={(e) => {
              setPeriodFilter(e.target.value as PeriodFilter | 'all');
              setTimeout(applyFilters, 100);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Visi</option>
            <option value="week">Savaitė</option>
            <option value="month">Mėnuo</option>
            <option value="year">Metai</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Valyti
          </button>
        </div>
      </div>
    </div>
  );
}
