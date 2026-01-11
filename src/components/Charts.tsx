import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Transaction, PeriodFilter } from '../types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format, subDays } from 'date-fns';

interface ChartsProps {
  transactions: Transaction[];
  period: PeriodFilter;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1'];

export default function Charts({ transactions, period }: ChartsProps) {
  const chartData = useMemo(() => {
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

    const filtered = transactions.filter(t => t.date >= start && t.date <= end);

    // Category pie chart data
    const categoryData = filtered
      .filter(t => t.type === 'expense' && t.category)
      .reduce((acc, t) => {
        const cat = t.category!;
        acc[cat] = (acc[cat] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const pieData = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));

    // Income vs Expense bar chart
    const incomeExpenseData = filtered.reduce((acc, t) => {
      const key = format(t.date, period === 'year' ? 'MMM' : period === 'month' ? 'dd' : 'EEE');
      if (!acc[key]) {
        acc[key] = { date: key, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        acc[key].income += t.amount;
      } else {
        acc[key].expense += t.amount;
      }
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>);

    const barData = Object.values(incomeExpenseData).map(d => ({
      ...d,
      income: parseFloat(d.income.toFixed(2)),
      expense: parseFloat(d.expense.toFixed(2)),
    }));

    // Line chart for trends
    const lineData = filtered.reduce((acc, t) => {
      const key = format(t.date, period === 'year' ? 'yyyy-MM' : period === 'month' ? 'dd' : 'yyyy-MM-dd');
      if (!acc[key]) {
        acc[key] = { date: key, balance: 0 };
      }
      if (t.type === 'income') {
        acc[key].balance += t.amount;
      } else {
        acc[key].balance -= t.amount;
      }
      return acc;
    }, {} as Record<string, { date: string; balance: number }>);

    const sortedLineData = Object.values(lineData)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d, i, arr) => ({
        ...d,
        balance: arr.slice(0, i + 1).reduce((sum, item) => sum + item.balance, 0),
      }));

    return { pieData, barData, lineData: sortedLineData };
  }, [transactions, period]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {chartData.pieData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Išlaidų kategorijos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.barData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Pajamos vs Išlaidos</h3>
          <ResponsiveContainer width="100%" height={300}>
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

      {chartData.lineData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Likučio tendencija</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="balance" stroke="#8884d8" name="Likutis" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
