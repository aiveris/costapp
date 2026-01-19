import { useState, useEffect, useRef } from 'react';
import { Transaction, ExpenseCategory, TransactionType } from '../types';
import { deleteTransaction } from '../services/firestoreService';
import { format } from 'date-fns';
import { lt } from 'date-fns/locale/lt';
import EditTransactionModal from './EditTransactionModal';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionDeleted: () => void;
  onTransactionUpdated: () => void;
  selectedMonth?: Date;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'būstas', 'mokesčiai', 'maistas', 'drabužiai', 'automobilis',
  'pramogos', 'sveikata', 'grožis', 'vaikas', 'kitos'
];

export default function TransactionList({ transactions, onTransactionDeleted, onTransactionUpdated, selectedMonth }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setFilteredTransactions(transactions);
  };

  // Auto-apply filters when they change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, categoryFilter, transactions, selectedMonth]);

  useEffect(() => {
    if (showSearchMobile) {
      searchInputRef.current?.focus();
    }
  }, [showSearchMobile]);

  useEffect(() => {
    if (!openMenuId) return;

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-transaction-menu]')) return;
      setOpenMenuId(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuId]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Ar tikrai norite ištrinti šią transakciją?')) {
      try {
        await deleteTransaction(id);
        onTransactionDeleted();
        setOpenMenuId(null);
      } catch (error) {
        console.error('Klaida trinant transakciją:', error);
        alert('Nepavyko ištrinti transakcijos');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Transakcijų sąrašas</h2>
        <button
          type="button"
          onClick={() => setShowSearchMobile((prev) => !prev)}
          className="sm:hidden text-gray-600 dark:text-gray-300 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation"
          aria-label="Paieška"
          title="Paieška"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      
      {/* Paieška ir filtrai */}
      <div className="mb-4 sm:mb-6">
        <div className={`${showSearchMobile ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paieška</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              ref={searchInputRef}
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

      {filteredTransactions.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-6">
          <p>Nėra transakcijų</p>
        </div>
      ) : (
        <div className="space-y-1.5 sm:space-y-2">
          {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`p-1.5 sm:p-2 md:p-3 rounded-lg border-l-4 ${
              transaction.type === 'income'
                ? 'bg-green-50 dark:bg-green-900 border-green-500 dark:border-green-400'
                : 'bg-red-50 dark:bg-red-900 border-red-500 dark:border-red-400'
            }`}
          >
            {/* Mobile: viskas vienoje eilutėje */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={`font-semibold text-sm sm:text-base md:text-lg whitespace-nowrap ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {Math.round(transaction.amount)} €
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {format(transaction.date, 'yyyy-MM-dd', { locale: lt })}
                </span>
                {transaction.category && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded capitalize whitespace-nowrap">
                    {transaction.category}
                  </span>
                )}
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                  {transaction.description}
                </span>
              </div>
              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                <div className="relative md:hidden" data-transaction-menu>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === transaction.id ? null : transaction.id)}
                    className="text-gray-600 dark:text-gray-300 transition-colors p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation active:scale-95"
                    title="Veiksmai"
                    aria-haspopup="menu"
                    aria-expanded={openMenuId === transaction.id}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="6" cy="12" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="18" cy="12" r="2" />
                    </svg>
                  </button>
                  {openMenuId === transaction.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                      <button
                        onClick={() => {
                          setEditingTransaction(transaction);
                          setOpenMenuId(null);
                        }}
                        autoFocus
                        className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Redaguoti
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Ištrinti
                      </button>
                    </div>
                  )}
                </div>
                <div className="hidden md:flex gap-1 sm:gap-2">
                  <button
                    onClick={() => setEditingTransaction(transaction)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1.5 sm:p-2 min-w-[36px] sm:min-w-[44px] min-h-[36px] sm:min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95"
                    title="Redaguoti"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1.5 sm:p-2 min-w-[36px] sm:min-w-[44px] min-h-[36px] sm:min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95"
                    title="Ištrinti"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onUpdated={() => {
            setEditingTransaction(null);
            onTransactionUpdated();
          }}
        />
      )}
    </div>
  );
}
