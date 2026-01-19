import { useState, useEffect, useRef } from 'react';
import { RecurringTransaction, TransactionType, ExpenseCategory, Transaction } from '../types';
import { addRecurringTransaction, getRecurringTransactions, deleteRecurringTransaction, updateRecurringTransaction, getTransactions } from '../services/firestoreService';
import { addTransaction } from '../services/firestoreService';
import { addDays, addWeeks, addMonths, addYears, isBefore, isSameDay, format } from 'date-fns';

interface RecurringTransactionsProps {
  onTransactionAdded: () => void;
  userId: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'būstas', 'mokesčiai', 'maistas', 'drabužiai', 'automobilis',
  'pramogos', 'sveikata', 'grožis', 'vaikas', 'kitos'
];

export default function RecurringTransactions({ onTransactionAdded, userId }: RecurringTransactionsProps) {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('kitos');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!openMenuId) return;

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-recurring-menu]')) return;
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

  useEffect(() => {
    loadRecurring();
  }, []);

  const loadRecurring = async () => {
    try {
      const data = await getRecurringTransactions(userId);
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
    // Apsauga nuo vienu metu vykstančių kvietimų
    if (isProcessingRef.current) {
      console.log('⚠️ ProcessRecurringTransactions jau vyksta, praleidžiama');
      return;
    }
    
    isProcessingRef.current = true;
    
    try {
      const now = new Date();
      now.setHours(23, 59, 59, 999); // Nustatyti iki dienos pabaigos
      
      console.log('=== ProcessRecurringTransactions pradžia ===');
      console.log('Dabar:', now.toISOString());
      console.log('Periodinių transakcijų skaičius:', list.length);
      
      // Gauti esamas transakcijas, kad patikrintume duplikatus
      const existingTransactions = await getTransactions(userId);
      console.log('Esamų transakcijų skaičius:', existingTransactions.length);
      
      for (const item of list) {
      try {
        console.log(`\nApdorojama periodinė transakcija: ${item.description} (${item.type})`);
        console.log('Item data:', {
          id: item.id,
          type: item.type,
          amount: item.amount,
          description: item.description,
          category: item.category,
          frequency: item.frequency,
          startDate: item.startDate.toISOString(),
          endDate: item.endDate?.toISOString()
        });
        
        // Praleisti, jei endDate yra praėjęs
        if (item.endDate) {
          const endDate = new Date(item.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (isBefore(endDate, now)) {
            console.log('Praleista: endDate praėjęs');
            continue;
          }
        }
        
        // Praleisti, jei startDate yra ateityje
        const startDate = new Date(item.startDate);
        startDate.setHours(0, 0, 0, 0);
        const nowStart = new Date();
        nowStart.setHours(0, 0, 0, 0);
        
        if (isBefore(nowStart, startDate)) {
          console.log('Praleista: startDate ateityje');
          continue;
        }
        
        console.log('Transakcija tinkama apdorojimui');
        
        const lastTransactionStr = localStorage.getItem(`recurring_${item.id}_last`);
        console.log('Paskutinė sukurtos transakcijos data (localStorage):', lastTransactionStr || 'Nėra');
        
        // Nustatyti pradinę datą
        let nextDate = new Date(startDate);
        nextDate.setHours(0, 0, 0, 0);
        
        // Jei jau buvo sukurtos transakcijos, pradėti nuo paskutinės sukurtos + periodas
        if (lastTransactionStr) {
          const lastDate = new Date(lastTransactionStr);
          lastDate.setHours(0, 0, 0, 0);
          console.log('Paskutinė sukurtos transakcijos data:', lastDate.toISOString());
          
          // Apskaičiuoti kitą datą nuo paskutinės sukurtos
          switch (item.frequency) {
            case 'daily':
              nextDate = addDays(lastDate, 1);
              break;
            case 'weekly':
              nextDate = addWeeks(lastDate, 1);
              break;
            case 'monthly':
              nextDate = addMonths(lastDate, 1);
              break;
            case 'yearly':
              nextDate = addYears(lastDate, 1);
              break;
          }
          nextDate.setHours(0, 0, 0, 0);
          console.log('Kita data nuo paskutinės:', nextDate.toISOString());
        } else {
          console.log('Pirmas kartas - naudojama startDate:', nextDate.toISOString());
        }
        
        // Sukurti visas trūkstamas transakcijas
        let maxIterations = 100; // Apsauga nuo begalinio ciklo
        let transactionsCreated = 0;
        
        const nowForComparison = new Date();
        nowForComparison.setHours(0, 0, 0, 0);
        
        console.log('Ciklo pradžia. nextDate:', nextDate.toISOString(), 'now:', nowForComparison.toISOString());
        console.log('Sąlyga:', isBefore(nextDate, nowForComparison) || isSameDay(nextDate, nowForComparison));
        
        while ((isBefore(nextDate, nowForComparison) || isSameDay(nextDate, nowForComparison)) && maxIterations > 0) {
          maxIterations--;
          transactionsCreated++;
          
          console.log(`\nIteracija ${transactionsCreated}. nextDate: ${nextDate.toISOString()}`);
          
          // Patikrinti, ar neviršytas endDate
          if (item.endDate) {
            const endDate = new Date(item.endDate);
            endDate.setHours(23, 59, 59, 999);
            if (isBefore(endDate, nextDate)) {
              console.log('Praleista: viršytas endDate');
              break;
            }
          }
          
          // Patikrinti, ar transakcija jau egzistuoja (duplikato patikrinimas)
          const transactionDate = new Date(nextDate);
          transactionDate.setHours(0, 0, 0, 0);
          
          const duplicate = existingTransactions.find(t => {
            const tDate = new Date(t.date);
            tDate.setHours(0, 0, 0, 0);
            
            return (
              t.type === item.type &&
              t.amount === item.amount &&
              t.description === item.description &&
              tDate.getTime() === transactionDate.getTime() &&
              (item.category ? t.category === item.category : !t.category)
            );
          });
          
          if (duplicate) {
            console.log('⚠️ Transakcija jau egzistuoja, praleidžiama:', {
              date: transactionDate.toISOString(),
              description: item.description,
              amount: item.amount
            });
            // Atnaujinti localStorage, bet nekuriant transakcijos
            localStorage.setItem(`recurring_${item.id}_last`, nextDate.toISOString());
          } else {
            try {
              const transactionData: any = {
                type: item.type,
                amount: item.amount,
                description: item.description,
                date: new Date(nextDate),
              };
              
              // Pridėti kategoriją tik jei ji yra (išlaidos)
              if (item.category) {
                transactionData.category = item.category;
              }
              
              console.log('Bandoma sukurti transakciją:', transactionData);
              
              const transactionId = await addTransaction(transactionData, userId);
              console.log('✅ Transakcija sėkmingai sukurta! ID:', transactionId);
              
              // Pridėti į esamų transakcijų sąrašą, kad kitos iteracijos matytų
              existingTransactions.push({
                id: transactionId,
                ...transactionData,
                date: new Date(nextDate),
              } as Transaction);
              
              localStorage.setItem(`recurring_${item.id}_last`, nextDate.toISOString());
              onTransactionAdded();
            } catch (error: any) {
            console.error('❌ Klaida kuriant periodinę transakciją:', error);
            console.error('Klaidos tipas:', error?.constructor?.name);
            console.error('Klaidos pranešimas:', error?.message);
            console.error('Klaidos stack:', error?.stack);
            console.error('Transakcijos duomenys:', { 
              type: item.type, 
              amount: item.amount, 
              description: item.description, 
              category: item.category,
              date: nextDate.toISOString()
            });
            // Nepertraukti ciklo, bet tęsti su kitomis transakcijomis
            }
          }
          
          // Perkelti į kitą periodą
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
          nextDate.setHours(0, 0, 0, 0);
        }
        
        console.log(`Sukurta transakcijų: ${transactionsCreated}`);
        
        if (maxIterations === 0) {
          console.warn(`⚠️ Pasiektas maksimalus iteracijų skaičius periodinei transakcijai: ${item.description}`);
        }
      } catch (error: any) {
        console.error('❌ Klaida apdorojant periodinę transakciją:', error);
        console.error('Periodinės transakcijos duomenys:', item);
      }
    }
    
    console.log('=== ProcessRecurringTransactions pabaiga ===\n');
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== Pridedama periodinė transakcija ===');
    console.log('Formos duomenys:', {
      type,
      amount: parseFloat(amount),
      description,
      category: type === 'expense' ? category : undefined,
      frequency,
      startDate,
      endDate: endDate || undefined,
    });
    
    try {
      const recurringData = {
        type,
        amount: parseFloat(amount),
        description,
        category: type === 'expense' ? category : undefined,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        currency: 'EUR',
      };
      
      console.log('Siunčiami duomenys į Firestore:', recurringData);
      
      if (editingRecurring) {
        await updateRecurringTransaction(editingRecurring.id, recurringData);
        console.log('✅ Periodinė transakcija atnaujinta! ID:', editingRecurring.id);
      } else {
        const id = await addRecurringTransaction(recurringData, userId);
        console.log('✅ Periodinė transakcija pridėta! ID:', id);
      }
      
      resetForm();
      
      console.log('Kviečiama loadRecurring()...');
      await loadRecurring();
      console.log('loadRecurring() baigta');
    } catch (error: any) {
      console.error('❌ Klaida pridedant periodinę transakciją:', error);
      console.error('Klaidos detalės:', error.message, error.stack);
      alert(`Nepavyko pridėti periodinės transakcijos: ${error.message}`);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRecurring(null);
    setType('expense');
    setAmount('');
    setDescription('');
    setCategory('kitos');
    setFrequency('monthly');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
  };

  const handleEdit = (item: RecurringTransaction) => {
    setEditingRecurring(item);
    setType(item.type);
    setAmount(item.amount.toString());
    setDescription(item.description);
    setCategory(item.category || 'kitos');
    setFrequency(item.frequency);
    setStartDate(format(item.startDate, 'yyyy-MM-dd'));
    setEndDate(item.endDate ? format(item.endDate, 'yyyy-MM-dd') : '');
    setShowForm(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Ar tikrai norite ištrinti šią periodinę transakciją?')) {
      try {
        await deleteRecurringTransaction(id);
        localStorage.removeItem(`recurring_${id}_last`);
        loadRecurring();
        setOpenMenuId(null);
      } catch (error) {
        alert('Nepavyko ištrinti');
      }
    }
  };

  if (loading) return <div className="text-center p-4">Kraunama...</div>;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Periodinės transakcijos</h2>
          <button onClick={() => setShowForm(true)} className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-md border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 min-h-[44px] touch-manipulation">
            +
          </button>
        </div>

      <div className="space-y-1.5 sm:space-y-2">
        {recurring.map(item => (
          <div
            key={item.id}
            className={`p-1.5 sm:p-2 md:p-3 rounded-lg border-l-4 ${
              item.type === 'income'
                ? 'bg-green-50 dark:bg-green-900 border-green-500 dark:border-green-400'
                : 'bg-red-50 dark:bg-red-900 border-red-500 dark:border-red-400'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={`font-semibold text-sm sm:text-base md:text-lg whitespace-nowrap ${
                    item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'}
                  {Math.round(item.amount)} €
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden sm:inline">
                  {format(item.startDate, 'yyyy-MM-dd')}
                </span>
                {item.category && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded capitalize whitespace-nowrap hidden sm:inline">
                    {item.category}
                  </span>
                )}
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                  {item.description}
                  {item.endDate && (
                    <span className="hidden sm:inline">{` · iki ${format(item.endDate, 'yyyy-MM-dd')}`}</span>
                  )}
                </span>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                  {
                    item.frequency === 'daily' ? 'Kasdien' :
                    item.frequency === 'weekly' ? 'Kas savaitę' :
                    item.frequency === 'monthly' ? 'Kas mėnesį' : 'Kasmet'
                  }
                </span>
              </div>
              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                <div className="relative md:hidden" data-recurring-menu>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    className="text-gray-600 dark:text-gray-300 transition-colors p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation active:scale-95"
                    title="Veiksmai"
                    aria-haspopup="menu"
                    aria-expanded={openMenuId === item.id}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="6" cy="12" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="18" cy="12" r="2" />
                    </svg>
                  </button>
                  {openMenuId === item.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Redaguoti
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Ištrinti
                      </button>
                    </div>
                  )}
                </div>
                <div className="hidden md:flex gap-1 sm:gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1.5 sm:p-2 min-w-[36px] sm:min-w-[44px] min-h-[36px] sm:min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95"
                    title="Redaguoti"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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
        {recurring.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nėra periodinių transakcijų</p>
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
              {editingRecurring ? 'Redaguoti periodinę transakciją' : 'Pridėti periodinę transakciją'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipas</label>
                <select value={type} onChange={(e) => setType(e.target.value as TransactionType)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation" required>
                  <option value="income">Pajamos</option>
                  <option value="expense">Išlaidos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suma (€)</label>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aprašymas</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation" required />
              </div>
              {type === 'expense' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategorija</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation" required>
                    {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dažnis</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation" required>
                  <option value="daily">Kasdien</option>
                  <option value="weekly">Kas savaitę</option>
                  <option value="monthly">Kas mėnesį</option>
                  <option value="yearly">Kasmet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pradžios data</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pabaigos data (nebūtina)</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation" />
              </div>
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
                {editingRecurring ? 'Atnaujinti' : 'Pridėti'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
