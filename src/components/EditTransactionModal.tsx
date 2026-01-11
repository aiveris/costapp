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
  'pramogos', 'sveikata', 'grožis', 'kitos'
];

export default function EditTransactionModal({ transaction, onClose, onUpdated }: EditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [date, setDate] = useState(new Date(transaction.date).toISOString().split('T')[0]);
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState<ExpenseCategory>(transaction.category || 'kitos');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Redaguoti transakciją</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipas</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" value="income" checked={type === 'income'} onChange={(e) => setType(e.target.value as TransactionType)} className="mr-2" />
                <span className="text-green-600 dark:text-green-400 font-medium">Pajamos</span>
              </label>
              <label className="flex items-center">
                <input type="radio" value="expense" checked={type === 'expense'} onChange={(e) => setType(e.target.value as TransactionType)} className="mr-2" />
                <span className="text-red-600 dark:text-red-400 font-medium">Išlaidos</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suma (€)</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aprašymas</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          {type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategorija</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? 'Atnaujinama...' : 'Išsaugoti'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500">
              Atšaukti
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
