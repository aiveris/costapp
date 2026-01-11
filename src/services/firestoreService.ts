import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  doc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Transaction, Budget, RecurringTransaction, FinancialGoal, Debt, Category } from '../types';

const TRANSACTIONS_COLLECTION = 'transactions';
const BUDGETS_COLLECTION = 'budgets';
const RECURRING_COLLECTION = 'recurring';
const GOALS_COLLECTION = 'goals';
const DEBTS_COLLECTION = 'debts';
const CATEGORIES_COLLECTION = 'categories';

// Transactions
export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: Timestamp.fromDate(transaction.date),
      currency: transaction.currency || 'EUR',
      ...(transaction.category && { category: transaction.category }),
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Firestore klaida:', error);
    throw new Error(`Firestore klaida: ${error?.message || 'Nežinoma klaida'}`);
  }
};

export const updateTransaction = async (id: string, transaction: Partial<Omit<Transaction, 'id'>>): Promise<void> => {
  try {
    const updateData: any = {};
    if (transaction.amount !== undefined) updateData.amount = transaction.amount;
    if (transaction.description !== undefined) updateData.description = transaction.description;
    if (transaction.date !== undefined) updateData.date = Timestamp.fromDate(transaction.date);
    if (transaction.category !== undefined) updateData.category = transaction.category;
    if (transaction.currency !== undefined) updateData.currency = transaction.currency;
    if (transaction.type !== undefined) updateData.type = transaction.type;

    await updateDoc(doc(db, TRANSACTIONS_COLLECTION, id), updateData);
  } catch (error: any) {
    console.error('Firestore klaida:', error);
    throw new Error(`Firestore klaida: ${error?.message || 'Nežinoma klaida'}`);
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const q = query(collection(db, TRANSACTIONS_COLLECTION), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      } as Transaction;
    });
  } catch (error: any) {
    if (error?.code === 'failed-precondition') {
      const querySnapshot = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
      const transactions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
        } as Transaction;
      });
      return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
    throw error;
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, id));
};

// Budgets
export const addBudget = async (budget: Omit<Budget, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, BUDGETS_COLLECTION), budget);
  return docRef.id;
};

export const getBudgets = async (): Promise<Budget[]> => {
  const querySnapshot = await getDocs(collection(db, BUDGETS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
};

export const updateBudget = async (id: string, budget: Partial<Omit<Budget, 'id'>>): Promise<void> => {
  await updateDoc(doc(db, BUDGETS_COLLECTION, id), budget);
};

export const deleteBudget = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, BUDGETS_COLLECTION, id));
};

// Recurring Transactions
export const addRecurringTransaction = async (recurring: Omit<RecurringTransaction, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, RECURRING_COLLECTION), {
    ...recurring,
    startDate: Timestamp.fromDate(recurring.startDate),
    endDate: recurring.endDate ? Timestamp.fromDate(recurring.endDate) : null,
  });
  return docRef.id;
};

export const getRecurringTransactions = async (): Promise<RecurringTransaction[]> => {
  const querySnapshot = await getDocs(collection(db, RECURRING_COLLECTION));
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate),
      endDate: data.endDate?.toDate ? data.endDate.toDate() : undefined,
    } as RecurringTransaction;
  });
};

export const deleteRecurringTransaction = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, RECURRING_COLLECTION, id));
};

// Financial Goals
export const addGoal = async (goal: Omit<FinancialGoal, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, GOALS_COLLECTION), {
    ...goal,
    targetDate: Timestamp.fromDate(goal.targetDate),
  });
  return docRef.id;
};

export const getGoals = async (): Promise<FinancialGoal[]> => {
  const querySnapshot = await getDocs(collection(db, GOALS_COLLECTION));
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      targetDate: data.targetDate?.toDate ? data.targetDate.toDate() : new Date(data.targetDate),
    } as FinancialGoal;
  });
};

export const updateGoal = async (id: string, goal: Partial<Omit<FinancialGoal, 'id'>>): Promise<void> => {
  const updateData: any = { ...goal };
  if (goal.targetDate) updateData.targetDate = Timestamp.fromDate(goal.targetDate);
  await updateDoc(doc(db, GOALS_COLLECTION, id), updateData);
};

export const deleteGoal = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, GOALS_COLLECTION, id));
};

// Debts
export const addDebt = async (debt: Omit<Debt, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, DEBTS_COLLECTION), {
    ...debt,
    date: Timestamp.fromDate(debt.date),
    paidDate: debt.paidDate ? Timestamp.fromDate(debt.paidDate) : null,
  });
  return docRef.id;
};

export const getDebts = async (): Promise<Debt[]> => {
  const querySnapshot = await getDocs(collection(db, DEBTS_COLLECTION));
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      paidDate: data.paidDate?.toDate ? data.paidDate.toDate() : undefined,
    } as Debt;
  });
};

export const updateDebt = async (id: string, debt: Partial<Omit<Debt, 'id'>>): Promise<void> => {
  const updateData: any = { ...debt };
  if (debt.date) updateData.date = Timestamp.fromDate(debt.date);
  if (debt.paidDate !== undefined) updateData.paidDate = debt.paidDate ? Timestamp.fromDate(debt.paidDate) : null;
  await updateDoc(doc(db, DEBTS_COLLECTION, id), updateData);
};

export const deleteDebt = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, DEBTS_COLLECTION, id));
};

// Categories
export const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), category);
  return docRef.id;
};

export const getCategories = async (): Promise<Category[]> => {
  const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

export const deleteCategory = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
};
