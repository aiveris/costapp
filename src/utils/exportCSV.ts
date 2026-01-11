import { Transaction } from '../types';
import { format } from 'date-fns';

export const exportTransactionsToCSV = (transactions: Transaction[]): void => {
  const headers = ['Data', 'Tipas', 'Suma (€)', 'Kategorija', 'Aprašymas'];
  
  const rows = transactions.map(t => [
    format(t.date, 'yyyy-MM-dd'),
    t.type === 'income' ? 'Pajamos' : 'Išlaidos',
    t.amount.toString(),
    t.category || '-',
    t.description,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `transakcijos_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
