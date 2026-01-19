import { useRef } from 'react';
import { Theme } from '../types';
import { useTheme } from '../hooks/useTheme';
import { exportTransactionsToCSV } from '../utils/exportCSV';
import { importTransactionsFromCSV } from '../utils/importCSV';
import { exportAllData, importAllData, AppData } from '../utils/importExport';
import { Transaction, Budget, RecurringTransaction, FinancialGoal, SavingsAccount, SavingsTransaction } from '../types';
import { addTransaction, addBudget, addRecurringTransaction, addGoal, addSavingsAccount, addSavingsTransaction } from '../services/firestoreService';

interface SettingsProps {
  transactions: Transaction[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  goals: FinancialGoal[];
  savingsAccounts?: SavingsAccount[];
  savingsTransactions?: SavingsTransaction[];
  onDataImported: () => void;
  userId: string;
}

export default function Settings({
  transactions,
  budgets,
  recurringTransactions,
  goals,
  savingsAccounts = [],
  savingsTransactions = [],
  onDataImported,
  userId,
}: SettingsProps) {
  const [theme, setTheme] = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions);
  };

  const handleExportAll = async () => {
    await exportAllData(transactions, budgets, recurringTransactions, goals, savingsAccounts, savingsTransactions);
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const transactions = await importTransactionsFromCSV(file);
      
      // Importuoti transakcijas į Firestore
      let successCount = 0;
      let errorCount = 0;

      for (const transaction of transactions) {
        try {
          await addTransaction({
            type: transaction.type,
            amount: transaction.amount,
            date: transaction.date,
            description: transaction.description,
            category: transaction.category,
          }, userId);
          successCount++;
        } catch (error) {
          console.error('Klaida importuojant transakciją:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        alert(`Sėkmingai importuota ${successCount} transakcijų${errorCount > 0 ? `. ${errorCount} transakcijų nepavyko importuoti.` : ''}`);
        onDataImported();
      } else {
        alert('Nepavyko importuoti jokių transakcijų.');
      }
    } catch (error: any) {
      alert(`Klaida importuojant CSV: ${error.message}`);
    } finally {
      if (csvFileInputRef.current) {
        csvFileInputRef.current.value = '';
      }
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data: AppData = await importAllData(file);
      
      // Import transactions
      for (const transaction of data.transactions) {
        try {
          await addTransaction({
            type: transaction.type,
            amount: transaction.amount,
            date: new Date(transaction.date),
            description: transaction.description,
            category: transaction.category,
          }, userId);
        } catch (error) {
          console.error('Klaida importuojant transakciją:', error);
        }
      }

      // Import budgets
      for (const budget of data.budgets || []) {
        try {
          await addBudget(budget, userId);
        } catch (error) {
          console.error('Klaida importuojant biudžetą:', error);
        }
      }

      // Import recurring transactions
      for (const recurring of data.recurringTransactions || []) {
        try {
          await addRecurringTransaction({
            type: recurring.type,
            amount: recurring.amount,
            description: recurring.description,
            category: recurring.category,
            frequency: recurring.frequency,
            startDate: new Date(recurring.startDate),
            endDate: recurring.endDate ? new Date(recurring.endDate) : undefined,
            currency: 'EUR',
          }, userId);
        } catch (error) {
          console.error('Klaida importuojant periodinę transakciją:', error);
        }
      }

      // Import goals
      for (const goal of data.goals || []) {
        try {
          await addGoal({
            title: goal.title,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            targetDate: new Date(goal.targetDate),
            description: goal.description,
            currency: 'EUR',
          }, userId);
        } catch (error) {
          console.error('Klaida importuojant tikslą:', error);
        }
      }

      // Import savings accounts
      for (const account of data.savingsAccounts || []) {
        try {
          await addSavingsAccount({
            name: account.name,
            description: account.description,
            currentAmount: account.currentAmount,
            createdAt: new Date(account.createdAt),
            color: account.color,
          }, userId);
        } catch (error) {
          console.error('Klaida importuojant santaupų sąskaitą:', error);
        }
      }

      // Import savings transactions
      for (const transaction of data.savingsTransactions || []) {
        try {
          await addSavingsTransaction({
            savingsAccountId: transaction.savingsAccountId,
            type: transaction.type,
            amount: transaction.amount,
            date: new Date(transaction.date),
            description: transaction.description,
          }, userId);
        } catch (error) {
          console.error('Klaida importuojant santaupų transakciją:', error);
        }
      }

      alert('Duomenys sėkmingai importuoti!');
      onDataImported();
    } catch (error: any) {
      alert(`Klaida importuojant: ${error.message}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Nustatymai</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Tema</h3>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="light"
                checked={theme === 'light'}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Šviesi</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="dark"
                checked={theme === 'dark'}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Tamsi</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Duomenų valdymas</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportCSV}
                className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 min-h-[44px] touch-manipulation"
              >
                Eksportuoti CSV
              </button>
              <button
                onClick={handleExportAll}
                className="w-full md:w-auto bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-md border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 min-h-[44px] touch-manipulation"
              >
                Eksportuoti visus duomenis (JSON)
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <div>
                <input
                  ref={csvFileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                  id="import-csv-file"
                />
                <label
                  htmlFor="import-csv-file"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 cursor-pointer min-h-[44px] touch-manipulation flex items-center justify-center"
                >
                  Importuoti CSV
                </label>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 cursor-pointer min-h-[44px] touch-manipulation flex items-center justify-center"
                >
                  Importuoti duomenis (JSON)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
