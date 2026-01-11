import { useState, useEffect } from 'react';
import { Transaction, Budget, RecurringTransaction, FinancialGoal, Debt } from './types';
import { getTransactions, getBudgets, getRecurringTransactions, getGoals, getDebts } from './services/firestoreService';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Statistics from './components/Statistics';
import Balance from './components/Balance';
import SearchAndFilter from './components/SearchAndFilter';
import Charts from './components/Charts';
import BudgetManager from './components/BudgetManager';
import RecurringTransactions from './components/RecurringTransactions';
import FinancialGoals from './components/FinancialGoals';
import DebtsManager from './components/DebtsManager';
import CalendarView from './components/CalendarView';
import Settings from './components/Settings';
import { useTheme } from './hooks/useTheme';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'statistics' | 'budget' | 'recurring' | 'goals' | 'debts' | 'calendar' | 'settings'>('transactions');
  const [statisticsPeriod, setStatisticsPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [theme] = useTheme();

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [transData, budgetData, recurringData, goalsData, debtsData] = await Promise.all([
        getTransactions(),
        getBudgets(),
        getRecurringTransactions(),
        getGoals(),
        getDebts(),
      ]);
      setTransactions(transData);
      setFilteredTransactions(transData);
      setBudgets(budgetData);
      setRecurringTransactions(recurringData);
      setGoals(goalsData);
      setDebts(debtsData);
    } catch (error) {
      console.error('Klaida kraunant duomenis:', error);
      alert('Nepavyko užkrauti duomenų. Patikrinkite Firestore konfigūraciją.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const tabs = [
    { id: 'transactions' as const, label: 'Transakcijos' },
    { id: 'statistics' as const, label: 'Statistika' },
    { id: 'budget' as const, label: 'Biudžetas' },
    { id: 'recurring' as const, label: 'Periodinės' },
    { id: 'goals' as const, label: 'Tikslai' },
    { id: 'debts' as const, label: 'Skolos' },
    { id: 'calendar' as const, label: 'Kalendorius' },
    { id: 'settings' as const, label: 'Nustatymai' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Kraunama...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Finansų Valdymas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Valdykite savo pajamas ir išlaidas
          </p>
        </header>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'transactions' && (
          <>
            <Balance transactions={transactions} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <TransactionForm onTransactionAdded={loadAllData} />
              <Statistics transactions={filteredTransactions} />
            </div>
            <SearchAndFilter transactions={transactions} onFiltered={setFilteredTransactions} />
            <TransactionList
              transactions={filteredTransactions}
              onTransactionDeleted={loadAllData}
              onTransactionUpdated={loadAllData}
            />
          </>
        )}

        {activeTab === 'statistics' && (
          <>
            <div className="mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex gap-2">
                  {(['week', 'month', 'year'] as const).map(period => (
                    <button
                      key={period}
                      onClick={() => setStatisticsPeriod(period)}
                      className={`px-4 py-2 rounded-md ${
                        statisticsPeriod === period
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {period === 'week' ? 'Savaitė' : period === 'month' ? 'Mėnuo' : 'Metai'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Charts transactions={transactions} period={statisticsPeriod} />
            <Statistics transactions={transactions} />
          </>
        )}

        {activeTab === 'budget' && (
          <BudgetManager transactions={transactions} onBudgetUpdated={loadAllData} />
        )}

        {activeTab === 'recurring' && (
          <RecurringTransactions onTransactionAdded={loadAllData} />
        )}

        {activeTab === 'goals' && (
          <FinancialGoals transactions={transactions} />
        )}

        {activeTab === 'debts' && (
          <DebtsManager onDebtUpdated={loadAllData} />
        )}

        {activeTab === 'calendar' && (
          <CalendarView transactions={transactions} />
        )}

        {activeTab === 'settings' && (
          <Settings
            transactions={transactions}
            budgets={budgets}
            recurringTransactions={recurringTransactions}
            goals={goals}
            debts={debts}
            onDataImported={loadAllData}
          />
        )}
      </div>
    </div>
  );
}

export default App;
