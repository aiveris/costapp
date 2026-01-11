import { useState, useMemo } from 'react';
import { Transaction, PeriodFilter } from '../types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears } from 'date-fns';

interface StatisticsProps {
  transactions: Transaction[];
}

export default function Statistics({ transactions }: StatisticsProps) {
  const [period, setPeriod] = useState<PeriodFilter>('month');

  const filteredData = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (period) {
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
    }

    const filtered = transactions.filter(
      (t) => t.date >= start && t.date <= end
    );

    const income = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Išlaidų kategorijų statistika
    const categoryStats = filtered
      .filter((t) => t.type === 'expense' && t.category)
      .reduce((acc, t) => {
        const cat = t.category!;
        acc[cat] = (acc[cat] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return {
      income,
      expenses,
      balance: income - expenses,
      categoryStats,
      transactionCount: filtered.length,
    };
  }, [transactions, period]);

  const periodLabels = {
    week: 'Savaitė',
    month: 'Mėnuo',
    year: 'Metai',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Statistika</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Pajamos</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {filteredData.income.toFixed(2)} €
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4 border border-red-200 dark:border-red-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Išlaidos</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {filteredData.expenses.toFixed(2)} €
          </p>
        </div>
        <div className={`rounded-lg p-4 border ${
          filteredData.balance >= 0 
            ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700' 
            : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
        }`}>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Likutis</p>
          <p className={`text-2xl font-bold ${
            filteredData.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {filteredData.balance.toFixed(2)} €
          </p>
        </div>
      </div>

      {Object.keys(filteredData.categoryStats).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Išlaidų kategorijos
          </h3>
          <div className="space-y-2">
            {Object.entries(filteredData.categoryStats)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {category}
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    {amount.toFixed(2)} €
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Transakcijų skaičius: {filteredData.transactionCount}
      </div>
    </div>
  );
}
