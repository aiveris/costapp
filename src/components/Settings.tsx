import { useState, useRef } from 'react';
import { Theme } from '../types';
import { useTheme } from '../hooks/useTheme';
import { exportTransactionsToCSV } from '../utils/exportCSV';
import { exportAllData, importAllData, AppData } from '../utils/importExport';
import { Transaction, Budget, RecurringTransaction, FinancialGoal, Debt } from '../types';
import { addTransaction, addBudget, addRecurringTransaction, addGoal, addDebt } from '../services/firestoreService';

interface SettingsProps {
  transactions: Transaction[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  goals: FinancialGoal[];
  debts: Debt[];
  onDataImported: () => void;
}

export default function Settings({
  transactions,
  budgets,
  recurringTransactions,
  goals,
  debts,
  onDataImported,
}: SettingsProps) {
  const [theme, setTheme] = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions);
  };

  const handleExportAll = async () => {
    await exportAllData(transactions, budgets, recurringTransactions, goals, debts);
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
          });
        } catch (error) {
          console.error('Klaida importuojant transakciją:', error);
        }
      }

      // Import budgets
      for (const budget of data.budgets || []) {
        try {
          await addBudget(budget);
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
          });
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
          });
        } catch (error) {
          console.error('Klaida importuojant tikslą:', error);
        }
      }

      // Import debts
      for (const debt of data.debts || []) {
        try {
          await addDebt({
            type: debt.type,
            person: debt.person,
            amount: debt.amount,
            description: debt.description,
            date: new Date(debt.date),
            paidDate: debt.paidDate ? new Date(debt.paidDate) : undefined,
            currency: 'EUR',
          });
        } catch (error) {
          console.error('Klaida importuojant skolą:', error);
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
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Nustatymai</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Tema</h3>
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
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Duomenų valdymas</h3>
          <div className="space-y-3">
            <button
              onClick={handleExportCSV}
              className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mr-2"
            >
              Eksportuoti CSV
            </button>
            <button
              onClick={handleExportAll}
              className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2"
            >
              Eksportuoti visus duomenis (JSON)
            </button>
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
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 cursor-pointer"
              >
                Importuoti duomenis (JSON)
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
