import { useState, useEffect } from 'react';
import { Transaction, ExpenseCategory, TransactionType } from '../types';

interface SearchAndFilterProps {
  transactions: Transaction[];
  onFiltered: (filtered: Transaction[]) => void;
  selectedMonth?: Date;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'būstas', 'mokesčiai', 'maistas', 'drabužiai', 'automobilis',
  'pramogos', 'sveikata', 'grožis', 'vaikas', 'kitos'
];

export default function SearchAndFilter({ transactions, onFiltered, selectedMonth }: SearchAndFilterProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');

  const applyFilters = () => {
    let filtered = [...transactions];

    // Type filter - pirmiausia filtruoti pagal tipą
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Category filter - tik jei filtruojama išlaidos (pajamos neturi kategorijos)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => {
        // Jei filtruojama pagal kategoriją, bet transakcija neturi kategorijos, praleisti
        if (!t.category) return false;
        return t.category === categoryFilter;
      });
    }

    // Search
    if (search) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    onFiltered(filtered);
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    onFiltered(transactions);
  };

  // Auto-apply filters when they change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, categoryFilter, transactions, selectedMonth]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paieška</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ieškoti pagal aprašymą..."
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipas</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              const newType = e.target.value as TransactionType | 'all';
              setTypeFilter(newType);
              // Jei pasirinkta pajamos, išvalyti kategorijos filtrą (pajamos neturi kategorijos)
              if (newType === 'income') {
                setCategoryFilter('all');
              }
            }}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation"
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
            onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'all')}
            disabled={typeFilter === 'income'}
            className={`w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation ${
              typeFilter === 'income' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="all">Visos</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            onClick={clearFilters}
            className="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 text-base font-medium min-h-[44px] touch-manipulation active:scale-95"
          >
            Valyti
          </button>
        </div>
      </div>
    </div>
  );
}
