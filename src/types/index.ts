export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 
  | 'būstas'
  | 'mokesčiai'
  | 'maistas'
  | 'drabužiai'
  | 'automobilis'
  | 'pramogos'
  | 'sveikata'
  | 'grožis'
  | 'kitos';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: Date;
  description: string;
  category?: ExpenseCategory;
  currency?: string;
}

export type PeriodFilter = 'week' | 'month' | 'year';

export type Theme = 'light' | 'dark';

export interface Budget {
  id: string;
  category: ExpenseCategory;
  amount: number;
  period: PeriodFilter;
  currency: string;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category?: ExpenseCategory;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  currency: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  description?: string;
  currency: string;
}

export interface Debt {
  id: string;
  type: 'owed' | 'lent'; // owed = skoluoju, lent = paskolinau
  person: string;
  amount: number;
  description?: string;
  date: Date;
  paidDate?: Date;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type: 'expense' | 'income';
}
