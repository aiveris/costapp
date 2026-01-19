import { useState, useEffect } from 'react';
import { Transaction, ExpenseCategory, TransactionType } from '../types';
import { updateTransaction } from '../services/firestoreService';

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onUpdated: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'būstas', 'mokesčiai', 'maistas', 'drabužiai', 'automobilis',
  'pramogos', 'sveikata', 'grožis', 'vaikas', 'kitos'
];

export default function EditTransactionModal({ transaction, onClose, onUpdated }: EditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [date, setDate] = useState(new Date(transaction.date).toISOString().split('T')[0]);
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState<ExpenseCategory>(transaction.category || 'kitos');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateTransaction(transaction.id, {
        type,
        amount: parseFloat(amount),
        date: new Date(date),
        description,
        category: type === 'expense' ? category : undefined,
      });
      onUpdated();
      onClose();
    } catch (error: any) {
      alert(`Nepavyko atnaujinti: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Redaguoti transakciją</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipas</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer min-h-[44px] touch-manipulation">
                <input type="radio" value="income" checked={type === 'income'} onChange={(e) => setType(e.target.value as TransactionType)} className="mr-2 w-5 h-5" />
                <span className="text-green-600 dark:text-green-400 font-medium text-base">Pajamos</span>
              </label>
              <label className="flex items-center cursor-pointer min-h-[44px] touch-manipulation">
                <input type="radio" value="expense" checked={type === 'expense'} onChange={(e) => setType(e.target.value as TransactionType)} className="mr-2 w-5 h-5" />
                <span className="text-red-600 dark:text-red-400 font-medium text-base">Išlaidos</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suma (€)</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aprašymas</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation" required />
          </div>
          {type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategorija</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 py-3 px-4 rounded-md border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 disabled:opacity-50 text-base font-medium min-h-[44px] touch-manipulation active:scale-95">
              {isSubmitting ? 'Atnaujinama...' : 'Išsaugoti'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 text-base font-medium min-h-[44px] touch-manipulation active:scale-95">
              Atšaukti
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
