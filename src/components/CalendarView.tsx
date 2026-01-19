import { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { lt } from 'date-fns/locale/lt';

interface CalendarViewProps {
  transactions: Transaction[];
}

export default function CalendarView({ transactions }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const transactionsByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    transactions.forEach(t => {
      const key = format(t.date, 'yyyy-MM-dd');
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(t);
    });
    return map;
  }, [transactions]);

  const getTransactionsForDay = (date: Date): Transaction[] => {
    const key = format(date, 'yyyy-MM-dd');
    return transactionsByDate.get(key) || [];
  };

  const getDayTotal = (date: Date): { income: number; expense: number } => {
    const dayTransactions = getTransactionsForDay(date);
    return dayTransactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  };

  const weekDays = ['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št', 'Sk'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          ←
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300">
          {format(currentDate, 'yyyy MMMM', { locale: lt })}
        </h2>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map(day => {
          const dayTransactions = getTransactionsForDay(day);
          const totals = getDayTotal(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square border border-gray-200 dark:border-gray-700 rounded p-1 ${
                isToday ? 'ring-2 ring-blue-500' : ''
              } ${dayTransactions.length > 0 ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
            >
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {format(day, 'd')}
              </div>
              {dayTransactions.length > 0 && (
                <div className="text-xs space-y-0.5">
                  {totals.income > 0 && (
                    <div className="text-green-600 dark:text-green-400">+{totals.income.toFixed(0)}</div>
                  )}
                  {totals.expense > 0 && (
                    <div className="text-red-600 dark:text-red-400">-{totals.expense.toFixed(0)}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Spalvos: Mėlyna = yra transakcijų, Žalia = pajamos, Raudona = išlaidos</p>
      </div>
    </div>
  );
}
