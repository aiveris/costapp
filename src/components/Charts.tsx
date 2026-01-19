import { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../types';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface ChartsProps {
  transactions: Transaction[];
  selectedYear?: number;
  selectedMonth?: number | 'all'; // Mėnesio numeris (0-11) arba 'all'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1'];

export default function Charts({ transactions, selectedYear: propSelectedYear, selectedMonth: propSelectedMonth }: ChartsProps) {
  const [selectedYear, setSelectedYear] = useState<number>(propSelectedYear || new Date().getFullYear());
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(max-width: 639px)').matches;
  });
  
  // Atnaujinti selectedYear, jei prop pasikeitė
  useEffect(() => {
    if (propSelectedYear !== undefined) {
      setSelectedYear(propSelectedYear);
    }
  }, [propSelectedYear]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const media = window.matchMedia('(max-width: 639px)');
    const handleChange = () => setIsMobile(media.matches);
    handleChange();
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const chartData = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    // Išlaidų kategorijų duomenys - naudoti pasirinktus metus ir mėnesį (jei pasirinktas)
    start = startOfYear(new Date(selectedYear, 0, 1));
    end = endOfYear(new Date(selectedYear, 0, 1));
    let categoryFiltered = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });

    // Jei pasirinktas konkretus mėnuo (ne 'all'), filtruoti pagal mėnesį
    if (propSelectedMonth !== undefined && propSelectedMonth !== 'all') {
      const monthStart = startOfMonth(new Date(selectedYear, propSelectedMonth, 1));
      const monthEnd = endOfMonth(new Date(selectedYear, propSelectedMonth, 1));
      monthStart.setHours(0, 0, 0, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      categoryFiltered = categoryFiltered.filter(t => {
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        return tDate >= monthStart && tDate <= monthEnd;
      });
    }

    // Category pie chart data
    const categoryData = categoryFiltered
      .filter(t => t.type === 'expense' && t.category)
      .reduce((acc, t) => {
        const cat = t.category!;
        acc[cat] = (acc[cat] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const pieData = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    // Income vs Expense bar chart
    let barData: Array<{ date: string; income: number; expense: number; previousIncome?: number; previousExpense?: number }> = [];
    
    if (period === 'year') {
      // Metų režimas - rodyti metus, naudojant selectedYear kaip centrą
      const centerYear = selectedYear || now.getFullYear();
      const yearsToShow = [centerYear - 4, centerYear - 3, centerYear - 2, centerYear - 1, centerYear];
      
      barData = yearsToShow.map(year => {
        const yearStart = startOfYear(new Date(year, 0, 1));
        const yearEnd = endOfYear(new Date(year, 0, 1));
        const yearTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= yearStart && tDate <= yearEnd;
        });
        
        const income = yearTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = yearTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          date: year.toString(),
          income: Math.round(income),
          expense: Math.round(expense),
        };
      });
    } else {
      // Mėnesio režimas - rodyti mėnesių numerius per pasirinktus metus
      const yearToUse = selectedYear || now.getFullYear();
      const monthsToShow = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      
      barData = monthsToShow.map(month => {
        const monthStart = startOfMonth(new Date(yearToUse, month - 1, 1));
        const monthEnd = endOfMonth(new Date(yearToUse, month - 1, 1));
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= monthStart && tDate <= monthEnd;
        });
        
        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          date: month.toString(),
          income: Math.round(income),
          expense: Math.round(expense),
        };
      });
    }

    return { pieData, barData };
  }, [transactions, period, selectedYear, propSelectedMonth]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
      {chartData.pieData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Išlaidų kategorijos</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 250} className="sm:h-[300px]">
            <PieChart>
              <Pie
                data={chartData.pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={isMobile ? 60 : 80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {chartData.pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.barData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 pr-20 sm:pr-0">
              Pajamos vs Išlaidos
            </h3>
            <div className="flex gap-2 absolute right-0 top-0 sm:static">
              {(['month', 'year'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1.5 text-sm rounded-md transition-colors min-h-[32px] sm:px-4 sm:py-2 sm:text-base sm:min-h-[44px] touch-manipulation border ${
                    period === p
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {p === 'month' ? 'Mėn' : 'Metai'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <BarChart data={chartData.barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#00C49F" name="Pajamos" />
              <Bar dataKey="expense" fill="#FF8042" name="Išlaidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}
