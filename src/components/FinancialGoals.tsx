import { useState, useEffect } from 'react';
import { FinancialGoal, Transaction } from '../types';
import { addGoal, getGoals, updateGoal, deleteGoal } from '../services/firestoreService';
import { format } from 'date-fns';

interface FinancialGoalsProps {
  transactions: Transaction[];
}

export default function FinancialGoals({ transactions }: FinancialGoalsProps) {
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

  const loadGoals = async () => {
    try {
      const data = await getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Klaida kraunant tikslus:', error);
    } finally {
      setLoading(false);
    }
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
        });
      }
      setShowForm(false);
      setEditing(null);
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
      setDescription('');
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Finansų tikslai</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            setTitle('');
            setTargetAmount('');
            setCurrentAmount('');
            setTargetDate('');
            setDescription('');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Atšaukti' : '+ Pridėti tikslą'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pavadinimas</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tikslo suma</label>
              <input type="number" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dabartinė suma</label>
              <input type="number" step="0.01" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tikslo data</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aprašymas</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={3} />
            </div>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            {editing ? 'Atnaujinti' : 'Pridėti'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;
          const daysLeft = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div key={goal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{goal.title}</h3>
                  {goal.description && <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(goal); setTitle(goal.title); setTargetAmount(goal.targetAmount.toString()); setCurrentAmount(goal.currentAmount.toString()); setTargetDate(format(goal.targetDate, 'yyyy-MM-dd')); setDescription(goal.description || ''); setShowForm(true); }} className="text-blue-600 hover:text-blue-800">Redaguoti</button>
                  <button onClick={() => handleDelete(goal.id)} className="text-red-600 hover:text-red-800">Ištrinti</button>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    {goal.currentAmount.toFixed(2)} / {goal.targetAmount.toFixed(2)} €
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {remaining > 0 ? `Liko: ${remaining.toFixed(2)} €` : 'Pasiektas!'}
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
  );
}
