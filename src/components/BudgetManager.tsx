import { useState, useEffect } from 'react';
import { Budget, ExpenseCategory, PeriodFilter, Transaction } from '../types';
import { addBudget, getBudgets, updateBudget, deleteBudget } from '../services/firestoreService';

interface BudgetManagerProps {
  transactions: Transaction[];
  onBudgetUpdated: () => void;
  userId: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'būstas', 'mokesčiai', 'maistas', 'drabužiai', 'automobilis',
  'pramogos', 'sveikata', 'grožis', 'vaikas', 'kitos'
];

export default function BudgetManager({ transactions, onBudgetUpdated, userId }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [category, setCategory] = useState<ExpenseCategory>('kitos');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<PeriodFilter>('month');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const data = await getBudgets(userId);
      setBudgets(data);
    } catch (error) {
      console.error('Klaida kraunant biudžetus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateBudget(editing.id, { category, amount: parseFloat(amount), period, currency: 'EUR' });
      } else {
        await addBudget({ category, amount: parseFloat(amount), period, currency: 'EUR' }, userId);
      }
      setShowForm(false);
      setEditing(null);
      setAmount('');
      loadBudgets();
      onBudgetUpdated();
    } catch (error) {
      alert('Nepavyko išsaugoti biudžeto');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Ar tikrai norite ištrinti šį biudžetą?')) {
      try {
        await deleteBudget(id);
        loadBudgets();
        onBudgetUpdated();
      } catch (error) {
        alert('Nepavyko ištrinti biudžeto');
      }
    }
  };

  const getCategorySpending = (cat: ExpenseCategory, period: PeriodFilter): number => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (period) {
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

    return transactions
      .filter(t => t.category === cat && t.type === 'expense' && t.date >= start && t.date <= end)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  if (loading) return <div className="text-center p-4">Kraunama...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Biudžetas</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            setAmount('');
          }}
          className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-md border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 min-h-[44px] touch-manipulation"
        >
          {showForm ? 'Atšaukti' : '+'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategorija</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suma</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Laikotarpis</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodFilter)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                <option value="week">Savaitė</option>
                <option value="month">Mėnuo</option>
                <option value="year">Metai</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                {editing ? 'Atnaujinti' : 'Pridėti'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {budgets.map(budget => {
          const spent = getCategorySpending(budget.category, budget.period);
          const remaining = budget.amount - spent;
          const percentage = (spent / budget.amount) * 100;

          return (
            <div key={budget.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 capitalize">{budget.category}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {budget.period === 'week' ? 'Savaitė' : budget.period === 'month' ? 'Mėnuo' : 'Metai'} - {Math.round(budget.amount)} €
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(budget); setCategory(budget.category); setAmount(budget.amount.toString()); setPeriod(budget.period); setShowForm(true); }} className="text-blue-600 hover:text-blue-800">Redaguoti</button>
                  <button onClick={() => handleDelete(budget.id)} className="text-red-600 hover:text-red-800">Ištrinti</button>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Išleista: {Math.round(spent)} €</span>
                  <span className={remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {remaining >= 0 ? 'Liko: ' : 'Viršyta: '}{Math.round(Math.abs(remaining))} €
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${percentage > 100 ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
