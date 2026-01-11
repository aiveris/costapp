import { useState, useEffect } from 'react';
import { RecurringTransaction, TransactionType, ExpenseCategory } from '../types';
import { addRecurringTransaction, getRecurringTransactions, deleteRecurringTransaction } from '../services/firestoreService';
import { addTransaction } from '../services/firestoreService';
import { addDays, addWeeks, addMonths, addYears, isBefore, format } from 'date-fns';

interface RecurringTransactionsProps {
  onTransactionAdded: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'būstas', 'mokesčiai', 'maistas', 'drabužiai', 'automobilis',
  'pramogos', 'sveikata', 'grožis', 'kitos'
];

export default function RecurringTransactions({ onTransactionAdded }: RecurringTransactionsProps) {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('kitos');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadRecurring();
  }, []);

  const loadRecurring = async () => {
    try {
      const data = await getRecurringTransactions();
      setRecurring(data);
      // Automatiškai sukurti transakcijas, jei reikia
      await processRecurringTransactions(data);
    } catch (error) {
      console.error('Klaida kraunant periodines transakcijas:', error);
    } finally {
      setLoading(false);
    }
  };

  const processRecurringTransactions = async (list: RecurringTransaction[]) => {
    const now = new Date();
    for (const item of list) {
      if (item.endDate && isBefore(now, item.endDate)) continue;
      
      let nextDate = new Date(item.startDate);
      const lastTransaction = new Date(localStorage.getItem(`recurring_${item.id}_last`) || 0);
      
      while (isBefore(nextDate, now)) {
        switch (item.frequency) {
          case 'daily':
            nextDate = addDays(nextDate, 1);
            break;
          case 'weekly':
            nextDate = addWeeks(nextDate, 1);
            break;
          case 'monthly':
            nextDate = addMonths(nextDate, 1);
            break;
          case 'yearly':
            nextDate = addYears(nextDate, 1);
            break;
        }
        
        if (nextDate > lastTransaction && isBefore(nextDate, now)) {
          try {
            await addTransaction({
              type: item.type,
              amount: item.amount,
              description: item.description,
              date: nextDate,
              category: item.category,
            });
            localStorage.setItem(`recurring_${item.id}_last`, nextDate.toISOString());
            onTransactionAdded();
          } catch (error) {
            console.error('Klaida kuriant periodinę transakciją:', error);
          }
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRecurringTransaction({
        type,
        amount: parseFloat(amount),
        description,
        category: type === 'expense' ? category : undefined,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        currency: 'EUR',
      });
      setShowForm(false);
      setAmount('');
      setDescription('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      loadRecurring();
    } catch (error) {
      alert('Nepavyko pridėti periodinės transakcijos');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Ar tikrai norite ištrinti šią periodinę transakciją?')) {
      try {
        await deleteRecurringTransaction(id);
        localStorage.removeItem(`recurring_${id}_last`);
        loadRecurring();
      } catch (error) {
        alert('Nepavyko ištrinti');
      }
    }
  };

  if (loading) return <div className="text-center p-4">Kraunama...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Periodinės transakcijos</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          {showForm ? 'Atšaukti' : '+ Pridėti'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipas</label>
              <select value={type} onChange={(e) => setType(e.target.value as TransactionType)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                <option value="income">Pajamos</option>
                <option value="expense">Išlaidos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suma</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aprašymas</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            {type === 'expense' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategorija</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                  {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dažnis</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                <option value="daily">Kasdien</option>
                <option value="weekly">Kas savaitę</option>
                <option value="monthly">Kas mėnesį</option>
                <option value="yearly">Kasmet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pradžios data</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pabaigos data (nebūtina)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Pridėti
          </button>
        </form>
      )}

      <div className="space-y-3">
        {recurring.map(item => (
          <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">{item.description}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.amount.toFixed(2)} € - {
                  item.frequency === 'daily' ? 'Kasdien' :
                  item.frequency === 'weekly' ? 'Kas savaitę' :
                  item.frequency === 'monthly' ? 'Kas mėnesį' : 'Kasmet'
                }
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Nuo {format(item.startDate, 'yyyy-MM-dd')}
                {item.endDate && ` iki ${format(item.endDate, 'yyyy-MM-dd')}`}
              </p>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">Ištrinti</button>
          </div>
        ))}
        {recurring.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nėra periodinių transakcijų</p>
        )}
      </div>
    </div>
  );
}
