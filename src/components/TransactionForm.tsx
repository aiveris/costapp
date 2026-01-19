import { useState, useEffect } from 'react';
import { TransactionType, ExpenseCategory } from '../types';
import { addTransaction } from '../services/firestoreService';

interface TransactionFormProps {
  onTransactionAdded: () => void;
  userId: string;
  isModal?: boolean;
  onClose?: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'būstas',
  'mokesčiai',
  'maistas',
  'drabužiai',
  'automobilis',
  'pramogos',
  'sveikata',
  'grožis',
  'vaikas',
  'kitos'
];

export default function TransactionForm({ onTransactionAdded, userId, isModal = false, onClose }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('kitos');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isModal || !onClose) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description) {
      alert('Prašome užpildyti visus laukus');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        date: new Date(date),
        description,
        category: type === 'expense' ? category : undefined,
      }, userId);
      
      // Reset form
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('kitos');
      
      onTransactionAdded();
      
      // Uždaryti modalą, jei tai modalas
      if (isModal && onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error('Klaida pridedant transakciją:', error);
      const errorMessage = error?.message || 'Nežinoma klaida';
      alert(`Nepavyko pridėti transakcijos: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300">Pridėti transakciją</h2>
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Uždaryti"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipas
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`min-h-[56px] rounded-md border text-base font-semibold transition-colors touch-manipulation active:scale-95 ${
                type === 'income'
                  ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                  : 'bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              Pajamos
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`min-h-[56px] rounded-md border text-base font-semibold transition-colors touch-manipulation active:scale-95 ${
                type === 'expense'
                  ? 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                  : 'bg-white dark:bg-gray-700 text-red-700 dark:text-red-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              Išlaidos
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Suma (€)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Aprašymas
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
            required
          />
        </div>

        {type === 'expense' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategorija
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 py-3 px-4 rounded-md border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-medium min-h-[44px] touch-manipulation active:scale-95"
        >
          {isSubmitting ? 'Pridedama...' : 'Pridėti'}
        </button>
      </form>
    </>
  );

  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose ? (e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        } : undefined}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      {formContent}
    </div>
  );
}
