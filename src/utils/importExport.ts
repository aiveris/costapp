import { Transaction, Budget, RecurringTransaction, FinancialGoal, Debt } from '../types';

export interface AppData {
  transactions: Transaction[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  goals: FinancialGoal[];
  debts: Debt[];
  version: string;
  exportDate: string;
}

export const exportAllData = async (
  transactions: Transaction[],
  budgets: Budget[],
  recurring: RecurringTransaction[],
  goals: FinancialGoal[],
  debts: Debt[]
): Promise<void> => {
  const data: AppData = {
    transactions,
    budgets,
    recurringTransactions: recurring,
    goals,
    debts,
    version: '1.0',
    exportDate: new Date().toISOString(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `costapp_backup_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importAllData = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as AppData;
        
        // Convert date strings back to Date objects
        data.transactions.forEach(t => {
          t.date = new Date(t.date);
        });
        data.recurringTransactions.forEach(r => {
          r.startDate = new Date(r.startDate);
          if (r.endDate) r.endDate = new Date(r.endDate);
        });
        data.goals.forEach(g => {
          g.targetDate = new Date(g.targetDate);
        });
        data.debts.forEach(d => {
          d.date = new Date(d.date);
          if (d.paidDate) d.paidDate = new Date(d.paidDate);
        });

        resolve(data);
      } catch (error) {
        reject(new Error('Nepavyko nuskaityti failo. Patikrinkite, ar failas yra teisingas.'));
      }
    };
    reader.onerror = () => reject(new Error('Nepavyko nuskaityti failo.'));
    reader.readAsText(file);
  });
};
