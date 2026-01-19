import { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, subMonths, addMonths } from 'date-fns';

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}

// Mėnesių vardininkai lietuvių kalba
const MONTH_NAMES: Record<number, string> = {
  0: 'Sausis',
  1: 'Vasaris',
  2: 'Kovas',
  3: 'Balandis',
  4: 'Gegužė',
  5: 'Birželis',
  6: 'Liepa',
  7: 'Rugpjūtis',
  8: 'Rugsėjis',
  9: 'Spalis',
  10: 'Lapkritis',
  11: 'Gruodis',
};

const formatMonthName = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return `${year} ${MONTH_NAMES[month]}`;
};

export default function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => {
    if (!showDropdown) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown]);

  // Generuoti paskutinius 12 mėnesių
  const availableMonths = useMemo(() => {
    const months: Date[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      months.push(startOfMonth(subMonths(now, i)));
    }
    return months;
  }, []);

  const handlePreviousMonth = () => {
    const prevMonth = subMonths(selectedMonth, 1);
    onMonthChange(startOfMonth(prevMonth));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(selectedMonth, 1);
    const now = new Date();
    // Neleisti pasirinkti ateities mėnesių
    if (nextMonth <= startOfMonth(now)) {
      onMonthChange(startOfMonth(nextMonth));
    }
  };

  const isCurrentMonth = format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');
  const canGoNext = !isCurrentMonth;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={handlePreviousMonth}
          className="px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-semibold min-h-[44px] touch-manipulation active:scale-95"
          title="Ankstesnis mėnuo"
        >
          ←
        </button>
        
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-3 sm:px-4 py-2.5 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 dark:active:bg-gray-500 transition-colors min-w-[140px] sm:min-w-[180px] font-medium text-sm sm:text-base min-h-[44px] touch-manipulation"
        >
          {formatMonthName(selectedMonth)}
        </button>

        <button
          onClick={handleNextMonth}
          disabled={!canGoNext}
          className={`px-3 py-2.5 rounded-md transition-colors font-semibold min-h-[44px] touch-manipulation ${
            canGoNext
              ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 active:scale-95'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
          title="Kitas mėnuo"
        >
          →
        </button>
      </div>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 max-h-64 overflow-y-auto min-w-[200px]">
            {availableMonths.map((month) => {
              const isSelected = format(month, 'yyyy-MM') === format(selectedMonth, 'yyyy-MM');
              
              return (
                <button
                  key={month.toISOString()}
                  onClick={() => {
                    onMonthChange(month);
                    setShowDropdown(false);
                  }}
                  autoFocus={isSelected}
                  className={`w-full text-left px-4 py-2 transition-colors ${
                    isSelected 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{formatMonthName(month)}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
