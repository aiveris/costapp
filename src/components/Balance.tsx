import { useMemo } from 'react';
import { Transaction } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';
import MonthSelector from './MonthSelector';

interface BalanceProps {
  transactions: Transaction[];
  selectedMonth?: Date;
  onMonthChange?: (month: Date) => void;
}

export default function Balance({ transactions, selectedMonth, onMonthChange }: BalanceProps) {
  const currentMonth = selectedMonth || startOfMonth(new Date());
  const handleMonthChange = onMonthChange || (() => {});

  const monthlyBalance = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const monthlyTransactions = transactions.filter(
      (t) => t.date >= monthStart && t.date <= monthEnd
    );

    const income = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions, currentMonth]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md px-4 pb-4 pt-1 sm:p-6 border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
      <div className="sm:flex sm:flex-row justify-between items-start sm:items-center mb-2 gap-3">
        <div className="hidden md:block bg-white dark:bg-gray-700 rounded-lg px-3 py-2 w-full sm:w-auto">
          <MonthSelector selectedMonth={currentMonth} onMonthChange={handleMonthChange} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-green-50 dark:bg-green-900 rounded-lg px-2 py-1.5 sm:px-4 sm:py-3 border border-green-200 dark:border-green-700 md:flex md:flex-col md:justify-center">
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-0.5">Pajamos</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(monthlyBalance.income)} €
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900 rounded-lg px-2 py-1.5 sm:px-4 sm:py-3 border border-red-200 dark:border-red-700 md:flex md:flex-col md:justify-center">
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-0.5">Išlaidos</p>
          <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
            {Math.round(monthlyBalance.expenses)} €
          </p>
        </div>
        <div className={`rounded-lg px-2 py-1.5 sm:px-4 sm:py-3 border md:flex md:flex-col md:justify-center ${
          monthlyBalance.balance >= 0 
            ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700' 
            : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
        }`}>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-0.5">Likutis</p>
          <p
            className={`text-lg sm:text-2xl font-bold ${
              monthlyBalance.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {Math.round(monthlyBalance.balance)} €
          </p>
        </div>
      </div>
    </div>
  );
}
