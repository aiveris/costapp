import { useState, useEffect } from 'react';
import { Debt } from '../types';
import { addDebt, getDebts, updateDebt, deleteDebt } from '../services/firestoreService';
import { format } from 'date-fns';

interface DebtsManagerProps {
  onDebtUpdated: () => void;
}

export default function DebtsManager({ onDebtUpdated }: DebtsManagerProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [type, setType] = useState<'owed' | 'lent'>('owed');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidDate, setPaidDate] = useState('');

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const data = await getDebts();
      setDebts(data);
    } catch (error) {
      console.error('Klaida kraunant skolas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateDebt(editing.id, {
          type,
          person,
          amount: parseFloat(amount),
          description,
          date: new Date(date),
          paidDate: paidDate ? new Date(paidDate) : undefined,
          currency: 'EUR',
        });
      } else {
        await addDebt({
          type,
          person,
          amount: parseFloat(amount),
          description,
          date: new Date(date),
          paidDate: paidDate ? new Date(paidDate) : undefined,
          currency: 'EUR',
        });
      }
      setShowForm(false);
      setEditing(null);
      setPerson('');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaidDate('');
      loadDebts();
      onDebtUpdated();
    } catch (error) {
      alert('Nepavyko išsaugoti skolos');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Ar tikrai norite ištrinti šią skolą?')) {
      try {
        await deleteDebt(id);
        loadDebts();
        onDebtUpdated();
      } catch (error) {
        alert('Nepavyko ištrinti');
      }
    }
  };

  const markAsPaid = async (debt: Debt) => {
    try {
      await updateDebt(debt.id, { paidDate: new Date() });
      loadDebts();
      onDebtUpdated();
    } catch (error) {
      alert('Nepavyko atnaujinti');
    }
  };

  if (loading) return <div className="text-center p-4">Kraunama...</div>;

  const owedDebts = debts.filter(d => d.type === 'owed' && !d.paidDate);
  const lentDebts = debts.filter(d => d.type === 'lent' && !d.paidDate);
  const paidDebts = debts.filter(d => d.paidDate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gautinos ir skolos</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            setPerson('');
            setAmount('');
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
            setPaidDate('');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Atšaukti' : '+ Pridėti'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipas</label>
              <select value={type} onChange={(e) => setType(e.target.value as 'owed' | 'lent')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                <option value="owed">Skoloju (skola man)</option>
                <option value="lent">Paskolinau (gautinos)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asmuo</label>
              <input type="text" value={person} onChange={(e) => setPerson(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suma</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aprašymas</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            {editing ? 'Atnaujinti' : 'Pridėti'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {owedDebts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">Skoloju (skola man)</h3>
            <div className="space-y-2">
              {owedDebts.map(debt => (
                <div key={debt.id} className="p-4 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{debt.person}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {debt.amount.toFixed(2)} € • {format(debt.date, 'yyyy-MM-dd')}
                    </p>
                    {debt.description && <p className="text-xs text-gray-500 dark:text-gray-500">{debt.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => markAsPaid(debt)} className="text-green-600 hover:text-green-800">Pažymėti kaip sumokėtą</button>
                    <button onClick={() => handleDelete(debt.id)} className="text-red-600 hover:text-red-800">Ištrinti</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lentDebts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">Paskolinau (gautinos)</h3>
            <div className="space-y-2">
              {lentDebts.map(debt => (
                <div key={debt.id} className="p-4 border border-green-200 dark:border-green-800 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{debt.person}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {debt.amount.toFixed(2)} € • {format(debt.date, 'yyyy-MM-dd')}
                    </p>
                    {debt.description && <p className="text-xs text-gray-500 dark:text-gray-500">{debt.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => markAsPaid(debt)} className="text-green-600 hover:text-green-800">Pažymėti kaip grąžintą</button>
                    <button onClick={() => handleDelete(debt.id)} className="text-red-600 hover:text-red-800">Ištrinti</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {debts.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nėra skolų</p>
        )}
      </div>
    </div>
  );
}
