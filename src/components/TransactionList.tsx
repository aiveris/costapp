import { useState } from 'react';
import { Transaction } from '../types';
import { deleteTransaction } from '../services/firestoreService';
import { format } from 'date-fns';
import { lt } from 'date-fns/locale/lt';
import EditTransactionModal from './EditTransactionModal';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionDeleted: () => void;
  onTransactionUpdated: () => void;
}

export default function TransactionList({ transactions, onTransactionDeleted, onTransactionUpdated }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Ar tikrai norite ištrinti šią transakciją?')) {
      try {
        await deleteTransaction(id);
        onTransactionDeleted();
      } catch (error) {
        console.error('Klaida trinant transakciją:', error);
        alert('Nepavyko ištrinti transakcijos');
      }
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center text-gray-500 dark:text-gray-400">
        <p>Nėra transakcijų</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Transakcijų sąrašas</h2>
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
              transaction.type === 'income'
                ? 'bg-green-50 dark:bg-green-900 border-green-500 dark:border-green-400'
                : 'bg-red-50 dark:bg-red-900 border-red-500 dark:border-red-400'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {transaction.amount.toFixed(2)} €
                </span>
                {transaction.category && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded capitalize">
                    {transaction.category}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{transaction.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {format(transaction.date, 'yyyy-MM-dd', { locale: lt })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingTransaction(transaction)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Redaguoti"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(transaction.id)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Ištrinti"
              >
              <svg
                className="w-5 h-5"
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
        ))}
      </div>
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
