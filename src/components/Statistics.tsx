import { useState, useMemo, useEffect } from 'react';
import { Transaction } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';

interface StatisticsProps {
  transactions: Transaction[];
  selectedMonth?: Date; // Senasis būdas (Transakcijų tabe)
  selectedYear?: number;
  statisticsMonth?: number | 'all'; // Mėnesio numeris (0-11) arba 'all' (Statistikos tabe)
  showSummary?: boolean; // Ar rodyti Pajamos/Išlaidos/Likutis langelius
}

export default function Statistics({ transactions, selectedMonth: propSelectedMonth, selectedYear: propSelectedYear, statisticsMonth: propStatisticsMonth, showSummary = true }: StatisticsProps) {
  const [selectedYear, setSelectedYear] = useState<number>(propSelectedYear || new Date().getFullYear());
  
  // Atnaujinti selectedYear, jei prop pasikeitė
  useEffect(() => {
    if (propSelectedYear !== undefined) {
      setSelectedYear(propSelectedYear);
    }
  }, [propSelectedYear]);

  const filteredData = useMemo(() => {
    let filtered: Transaction[];
    
    // Jei perduodamas selectedMonth (Date), filtruoti pagal mėnesį (senasis būdas)
    if (propSelectedMonth) {
      const monthStart = startOfMonth(propSelectedMonth);
      const monthEnd = endOfMonth(propSelectedMonth);
      monthStart.setHours(0, 0, 0, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      filtered = transactions.filter((t) => {
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        return tDate >= monthStart && tDate <= monthEnd;
      });
    } else {
      // Naudoti metų režimą
      const yearToUse = selectedYear || new Date().getFullYear();
      
      // Jei pasirinktas konkretus mėnuo (ne 'all'), filtruoti pagal metus ir mėnesį
      if (propStatisticsMonth !== undefined && propStatisticsMonth !== 'all') {
        const monthStart = startOfMonth(new Date(yearToUse, propStatisticsMonth, 1));
        const monthEnd = endOfMonth(new Date(yearToUse, propStatisticsMonth, 1));
        monthStart.setHours(0, 0, 0, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        filtered = transactions.filter((t) => {
          const tDate = new Date(t.date);
          tDate.setHours(0, 0, 0, 0);
          return tDate >= monthStart && tDate <= monthEnd;
        });
      } else {
        // Jei propStatisticsMonth === 'all', rodyti visus metus (visų metų duomenys)
        filtered = transactions.filter(
          (t) => {
            const tDate = new Date(t.date);
            const year = tDate.getFullYear();
            return year === yearToUse;
          }
        );
      }
    }

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
  }, [transactions, selectedYear, propSelectedMonth, propStatisticsMonth]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Statistika</h2>
      </div>

      {showSummary && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-green-50 dark:bg-green-900 rounded-lg px-2 py-1.5 sm:px-4 sm:py-3 border border-green-200 dark:border-green-700">
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-0.5">Pajamos</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(filteredData.income)} €
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900 rounded-lg px-2 py-1.5 sm:px-4 sm:py-3 border border-red-200 dark:border-red-700">
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-0.5">Išlaidos</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {Math.round(filteredData.expenses)} €
            </p>
          </div>
          <div className={`rounded-lg px-2 py-1.5 sm:px-4 sm:py-3 border ${
            filteredData.balance >= 0 
              ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700' 
              : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
          }`}>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-0.5">Likutis</p>
            <p className={`text-lg sm:text-2xl font-bold ${
              filteredData.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {Math.round(filteredData.balance)} €
            </p>
          </div>
        </div>
      )}

      {Object.keys(filteredData.categoryStats).length > 0 && (
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
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
                    {Math.round(amount)} €
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
