import { useState, useEffect } from 'react';
import { FinancialGoal, Transaction } from '../types';
import { addGoal, getGoals, updateGoal, deleteGoal } from '../services/firestoreService';
import { format } from 'date-fns';

interface FinancialGoalsProps {
  transactions: Transaction[];
  userId: string;
}

export default function FinancialGoals({ transactions: _transactions, userId }: FinancialGoalsProps) {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FinancialGoal | null>(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    if (!showForm) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetForm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);

  const loadGoals = async () => {
    try {
      const data = await getGoals(userId);
      setGoals(data);
    } catch (error) {
      console.error('Klaida kraunant tikslus:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateGoal(editing.id, {
          title,
          targetAmount: parseFloat(targetAmount),
          currentAmount: parseFloat(currentAmount),
          targetDate: new Date(targetDate),
          description,
          currency: 'EUR',
        });
      } else {
        await addGoal({
          title,
          targetAmount: parseFloat(targetAmount),
          currentAmount: parseFloat(currentAmount || '0'),
          targetDate: new Date(targetDate),
          description,
          currency: 'EUR',
        }, userId);
      }
      resetForm();
      loadGoals();
    } catch (error) {
      alert('Nepavyko išsaugoti tikslo');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Ar tikrai norite ištrinti šį tikslą?')) {
      try {
        await deleteGoal(id);
        loadGoals();
      } catch (error) {
        alert('Nepavyko ištrinti');
      }
    }
  };

  const updateProgress = async (goal: FinancialGoal, amount: number) => {
    try {
      await updateGoal(goal.id, {
        currentAmount: goal.currentAmount + amount,
      });
      loadGoals();
    } catch (error) {
      alert('Nepavyko atnaujinti');
    }
  };

  if (loading) return <div className="text-center p-4">Kraunama...</div>;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Finansų tikslai</h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setTitle('');
              setTargetAmount('');
              setCurrentAmount('');
              setTargetDate('');
              setDescription('');
            }}
            className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-md border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 min-h-[44px] touch-manipulation"
          >
            +
          </button>
        </div>

      <div className="space-y-4">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;
          const daysLeft = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div key={goal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300">{goal.title}</h3>
                  {goal.description && <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(goal); setTitle(goal.title); setTargetAmount(goal.targetAmount.toString()); setCurrentAmount(goal.currentAmount.toString()); setTargetDate(format(goal.targetDate, 'yyyy-MM-dd')); setDescription(goal.description || ''); setShowForm(true); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">Redaguoti</button>
                  <button onClick={() => handleDelete(goal.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors">Ištrinti</button>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    {Math.round(goal.currentAmount)} / {Math.round(goal.targetAmount)} €
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {remaining > 0 ? `Liko: ${Math.round(remaining)} €` : 'Pasiektas!'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {progress.toFixed(1)}% baigta • {daysLeft > 0 ? `Liko ${daysLeft} dienų` : 'Terminas praėjo'}
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => updateProgress(goal, 10)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">+10</button>
                <button onClick={() => updateProgress(goal, 50)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">+50</button>
                <button onClick={() => updateProgress(goal, 100)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">+100</button>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nėra finansų tikslų</p>
        )}
      </div>
    </div>

    {showForm && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            resetForm();
          }
        }}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300">
              {editing ? 'Redaguoti tikslą' : 'Pridėti tikslą'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Uždaryti"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pavadinimas</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tikslo suma (€)</label>
                <input type="number" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dabartinė suma (€)</label>
                <input type="number" step="0.01" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tikslo data</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation" required />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-medium min-h-[44px] touch-manipulation active:scale-95"
              >
                Atšaukti
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors font-medium min-h-[44px] touch-manipulation active:scale-95"
              >
                {editing ? 'Atnaujinti' : 'Pridėti'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
