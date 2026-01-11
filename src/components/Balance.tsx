import { useMemo } from 'react';
import { Transaction } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';

interface BalanceProps {
  transactions: Transaction[];
}

export default function Balance({ transactions }: BalanceProps) {
  const monthlyBalance = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

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
  }, [transactions]);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-lg p-6 text-white mb-6">
      <h2 className="text-2xl font-bold mb-4">Mėnesio likutis</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-sm opacity-90 mb-1">Pajamos</p>
          <p className="text-3xl font-bold text-green-200">
            {monthlyBalance.income.toFixed(2)} €
          </p>
        </div>
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-sm opacity-90 mb-1">Išlaidos</p>
          <p className="text-3xl font-bold text-red-200">
            {monthlyBalance.expenses.toFixed(2)} €
          </p>
        </div>
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-sm opacity-90 mb-1">Likutis</p>
          <p
            className={`text-3xl font-bold ${
              monthlyBalance.balance >= 0 ? 'text-green-200' : 'text-red-200'
            }`}
          >
            {monthlyBalance.balance.toFixed(2)} €
          </p>
        </div>
      </div>
    </div>
  );
}
