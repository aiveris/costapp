import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase/config';
import { Transaction, Budget, RecurringTransaction, FinancialGoal, SavingsAccount, SavingsTransaction } from './types';
import { getTransactions, getBudgets, getRecurringTransactions, getGoals, getSavingsAccounts, getSavingsTransactions } from './services/firestoreService';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Statistics from './components/Statistics';
import Balance from './components/Balance';
import Charts from './components/Charts';
import BudgetManager from './components/BudgetManager';
import RecurringTransactions from './components/RecurringTransactions';
import FinancialGoals from './components/FinancialGoals';
import SavingsManager from './components/SavingsManager';
import CalendarView from './components/CalendarView';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import { startOfMonth, endOfMonth } from 'date-fns';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthFilteredTransactions, setMonthFilteredTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'statistics' | 'budget' | 'recurring' | 'savings' | 'calendar' | 'settings'>('transactions');
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
  const [statisticsYear, setStatisticsYear] = useState<number>(new Date().getFullYear());
  const [statisticsMonth, setStatisticsMonth] = useState<number | 'all'>(new Date().getMonth());
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadAllData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [transData, budgetData, recurringData, goalsData, savingsAccountsData, savingsTransactionsData] = await Promise.all([
        getTransactions(user.uid),
        getBudgets(user.uid),
        getRecurringTransactions(user.uid),
        getGoals(user.uid),
        getSavingsAccounts(user.uid),
        getSavingsTransactions(user.uid),
      ]);
      setTransactions(transData);
      // Pradžioje filtruoti pagal einamąjį mėnesį
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      monthStart.setHours(0, 0, 0, 0);
      monthEnd.setHours(23, 59, 59, 999);
      const initialFiltered = transData.filter(t => {
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        return tDate >= monthStart && tDate <= monthEnd;
      });
      setMonthFilteredTransactions(initialFiltered);
      setBudgets(budgetData);
      setRecurringTransactions(recurringData);
      setGoals(goalsData);
      setSavingsAccounts(savingsAccountsData);
      setSavingsTransactions(savingsTransactionsData);
    } catch (error: any) {
      console.error('Klaida kraunant duomenis:', error);
      console.error('Klaidos detalės:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack
      });
      
      let errorMessage = 'Nepavyko užkrauti duomenų.';
      
      if (error?.code === 'failed-precondition') {
        errorMessage = 'Trūksta Firestore indekso. Patikrinkite konsolę dėl daugiau informacijos.';
      } else if (error?.code === 'permission-denied') {
        errorMessage = 'Nėra prieigos prie duomenų. Patikrinkite Firestore taisykles.';
      } else if (error?.message) {
        errorMessage = `Klaida: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Uždaryti dropdown meniu, kai paspaudžiama už jo ribų
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showUserMenu]);

  // Automatiškai filtruoti transakcijas pagal pasirinktą mėnesį
  useEffect(() => {
    if (transactions.length === 0) return;
    
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    monthStart.setHours(0, 0, 0, 0);
    monthEnd.setHours(23, 59, 59, 999);
    
    const monthFiltered = transactions.filter(t => {
      const tDate = new Date(t.date);
      tDate.setHours(0, 0, 0, 0);
      return tDate >= monthStart && tDate <= monthEnd;
    });
    
    setMonthFilteredTransactions(monthFiltered);
  }, [selectedMonth, transactions]);

  const tabs = [
    {
      id: 'transactions' as const,
      label: 'Transakcijos',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7.11111C17.775 5.21864 15.8556 4 13.6979 4C9.99875 4 7 7.58172 7 12C7 16.4183 9.99875 20 13.6979 20C15.8556 20 17.775 18.7814 19 16.8889M5 10H14M5 14H14" />
        </svg>
      ),
    },
    {
      id: 'statistics' as const,
      label: 'Statistika',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 15v3m4-7v7m4-11v11m4-6v6" />
        </svg>
      ),
    },
    {
      id: 'budget' as const,
      label: 'Biudžetas',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.23,2H5.77A3.77,3.77,0,0,0,2,5.77V18.23A3.77,3.77,0,0,0,5.77,22H18.23A3.77,3.77,0,0,0,22,18.23V5.77A3.77,3.77,0,0,0,18.23,2ZM20,18.23A1.77,1.77,0,0,1,18.23,20H5.77A1.77,1.77,0,0,1,4,18.23V5.77A1.77,1.77,0,0,1,5.77,4H18.23A1.77,1.77,0,0,1,20,5.77Z"/>
          <path d="M8,11H7a1,1,0,0,0,0,2H8a1,1,0,0,0,0-2Z"/>
          <path d="M8,14H7a1,1,0,0,0,0,2H8a1,1,0,0,0,0-2Z"/>
          <path d="M13,11H11a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z"/>
          <path d="M13,14H11a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z"/>
          <path d="M8,17H7a1,1,0,0,0,0,2H8a1,1,0,0,0,0-2Z"/>
          <path d="M13,17H11a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z"/>
          <path d="M17,11H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Z"/>
          <path d="M18,5H6A1,1,0,0,0,5,6V9a1,1,0,0,0,1,1H18a1,1,0,0,0,1-1V6A1,1,0,0,0,18,5ZM17,8H7V7H17Z"/>
          <rect height="5" rx="1" width="3" x="15" y="14"/>
        </svg>
      ),
    },
    {
      id: 'recurring' as const,
      label: 'Periodinės',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M44,7.1V14a2,2,0,0,1-2,2H35a2,2,0,0,1-2-2.3A2.1,2.1,0,0,1,35.1,12h2.3A18,18,0,0,0,6.1,22.2a2,2,0,0,1-2,1.8h0a2,2,0,0,1-2-2.2A22,22,0,0,1,40,8.9V7a2,2,0,0,1,2.3-2A2.1,2.1,0,0,1,44,7.1Z"/>
          <path d="M4,40.9V34a2,2,0,0,1,2-2h7a2,2,0,0,1,2,2.3A2.1,2.1,0,0,1,12.9,36H10.6A18,18,0,0,0,41.9,25.8a2,2,0,0,1,2-1.8h0a2,2,0,0,1,2,2.2A22,22,0,0,1,8,39.1V41a2,2,0,0,1-2.3,2A2.1,2.1,0,0,1,4,40.9Z"/>
          <path d="M24.7,22c-3.5-.7-3.5-1.3-3.5-1.8s.2-.6.5-.9a3.4,3.4,0,0,1,1.8-.4,6.3,6.3,0,0,1,3.3.9,1.8,1.8,0,0,0,2.7-.5,1.9,1.9,0,0,0-.4-2.8A9.1,9.1,0,0,0,26,15.3V13a2,2,0,0,0-4,0v2.2c-3,.5-5,2.5-5,5.2s3.3,4.9,6.5,5.5,3.3,1.3,3.3,1.8-1.1,1.4-2.5,1.4h0a6.7,6.7,0,0,1-4.1-1.3,2,2,0,0,0-2.8.6,1.8,1.8,0,0,0,.3,2.6A10.9,10.9,0,0,0,22,32.8V35a2,2,0,0,0,4,0V32.8a6.3,6.3,0,0,0,3-1.3,4.9,4.9,0,0,0,2-4h0C31,23.8,27.6,22.6,24.7,22Z"/>
        </svg>
      ),
    },
    {
      id: 'savings' as const,
      label: 'Santaupos',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 512.002 512.002" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M243.654,0.001c-37.122,0-67.322,30.201-67.322,67.322s30.2,67.323,67.322,67.323s67.323-30.201,67.323-67.322C310.977,30.203,280.776,0.001,243.654,0.001z M243.654,104.229c-20.35,0-36.905-16.556-36.905-36.905s16.555-36.905,36.905-36.905s36.906,16.556,36.906,36.905S264.004,104.229,243.654,104.229z"/>
          <rect x="187.704" y="187.543" width="111.895" height="30.417"/>
          <path d="M114.287,233.725c-8.93,0-16.193,7.265-16.193,16.193c0,8.93,7.265,16.194,16.193,16.194c8.929,0,16.193-7.265,16.193-16.194C130.482,240.989,123.217,233.725,114.287,233.725z"/>
          <path d="M481.582,224.804v22.691c0,17.189-10.838,31.887-26.035,37.641c-8.878-79.026-76.1-140.659-157.458-140.659H196.316c-2.525,0-5.061,0.061-7.6,0.182c-11.794-24.319-36.754-40.43-64.475-40.43h-15.209v66.444c-25.158,16.638-45.136,40.186-57.424,67.655H0v129.226h51.591c9.252,20.664,22.955,39.294,40.048,54.339c16.851,14.832,36.733,25.937,58.066,32.509v57.598h87.653v-50.595h19.691v50.595h87.653v-57.582c29.854-9.207,56.698-27.283,76.535-51.747c19.897-24.539,31.983-54.672,34.72-86.05c31.971-6.751,56.045-35.176,56.045-69.127v-22.691H481.582z M397.609,383.514c-18.142,22.372-43.512,38.133-71.438,44.38l-11.889,2.659v51.031h-26.819v-50.595h-80.525v50.595h-26.819v-51.048l-11.888-2.659c-20.843-4.663-40.38-14.627-56.498-28.814c-16.011-14.091-28.338-32.059-35.65-51.961l-3.66-9.964H30.417v-68.392h42.026l3.661-9.962c10.252-27.891,30.068-51.518,55.799-66.527l7.545-4.401v-50.284c11.717,4.676,20.998,14.611,24.502,27.263l3.501,12.64l13.018-1.605c5.25-0.647,10.581-0.975,15.846-0.975h101.772c70.605,0,128.047,57.442,128.047,128.047C426.135,332.213,416.005,360.828,397.609,383.514z"/>
        </svg>
      ),
    },
    {
      id: 'calendar' as const,
      label: 'Kalendorius',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9H21M7 3V5M17 3V5M6 13H8M6 17H8M11 13H13M11 17H13M16 13H18M16 17H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" />
        </svg>
      ),
    },
    {
      id: 'settings' as const,
      label: 'Nustatymai',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M10.65 3L9.93163 3.53449L9.32754 5.54812L7.47651 4.55141L6.5906 4.68143L4.68141 6.59062L4.55139 7.47652L5.5481 9.32755L3.53449 9.93163L3 10.65V13.35L3.53449 14.0684L5.54811 14.6725L4.55142 16.5235L4.68144 17.4094L6.59063 19.3186L7.47653 19.4486L9.32754 18.4519L9.93163 20.4655L10.65 21H13.35L14.0684 20.4655L14.6725 18.4519L16.5235 19.4486L17.4094 19.3185L19.3186 17.4094L19.4486 16.5235L18.4519 14.6724L20.4655 14.0684L21 13.35V10.65L20.4655 9.93163L18.4519 9.32754L19.4486 7.47654L19.3186 6.59063L17.4094 4.68144L16.5235 4.55142L14.6725 5.54812L14.0684 3.53449L13.35 3H10.65ZM10.4692 6.96284L11.208 4.5H12.792L13.5308 6.96284L13.8753 7.0946C13.9654 7.12908 14.0543 7.16597 14.142 7.2052L14.4789 7.35598L16.7433 6.13668L17.8633 7.25671L16.644 9.52111L16.7948 9.85803C16.834 9.9457 16.8709 10.0346 16.9054 10.1247L17.0372 10.4692L19.5 11.208V12.792L17.0372 13.5308L16.9054 13.8753C16.8709 13.9654 16.834 14.0543 16.7948 14.1419L16.644 14.4789L17.8633 16.7433L16.7433 17.8633L14.4789 16.644L14.142 16.7948C14.0543 16.834 13.9654 16.8709 13.8753 16.9054L13.5308 17.0372L12.792 19.5H11.208L10.4692 17.0372L10.1247 16.9054C10.0346 16.8709 9.94569 16.834 9.85803 16.7948L9.52111 16.644L7.25671 17.8633L6.13668 16.7433L7.35597 14.4789L7.2052 14.142C7.16597 14.0543 7.12908 13.9654 7.0946 13.8753L6.96284 13.5308L4.5 12.792L4.5 11.208L6.96284 10.4692L7.0946 10.1247C7.12907 10.0346 7.16596 9.94571 7.20519 9.85805L7.35596 9.52113L6.13666 7.2567L7.25668 6.13667L9.5211 7.35598L9.85803 7.2052C9.9457 7.16597 10.0346 7.12908 10.1247 7.0946L10.4692 6.96284ZM14.25 12C14.25 13.2426 13.2426 14.25 12 14.25C10.7574 14.25 9.75 13.2426 9.75 12C9.75 10.7574 10.7574 9.75 12 9.75C13.2426 9.75 14.25 10.7574 14.25 12ZM15.75 12C15.75 14.0711 14.0711 15.75 12 15.75C9.92893 15.75 8.25 14.0711 8.25 12C8.25 9.92893 9.92893 8.25 12 8.25C14.0711 8.25 15.75 9.92893 15.75 12Z" />
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    try {
      setShowUserMenu(false);
      await signOut(auth);
    } catch (error) {
      console.error('Klaida atsijungiant:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Kraunama...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onAuthStateChange={setUser} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Kraunama...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <header className="text-center mb-4 sm:mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white flex-1 text-left">
              CostAPP
            </h1>
            <div className="flex-1 flex justify-end items-center user-menu-container relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-center px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors min-h-[36px] touch-manipulation"
                aria-label="User menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-2">
                    <div className="px-4 h-[40px] flex items-center justify-center text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                      {user.displayName?.trim().split(/\s+/)[0] || 'Vartotojas'}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 h-[40px] text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Atsijungti
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tabs - Desktop */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden mb-4 sm:mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-1">
            <div className="grid grid-cols-7 gap-1 w-full">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center w-full aspect-square rounded-md border min-h-[32px] touch-manipulation transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                  title={tab.label}
                  aria-label={tab.label}
                >
                  {tab.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'transactions' && (
          <>
            <Balance 
              transactions={transactions} 
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Desktop: visada rodomas, Mobile: paslėptas */}
              <div className="hidden md:block">
                <TransactionForm onTransactionAdded={loadAllData} userId={user.uid} />
              </div>
              <Statistics 
                transactions={monthFilteredTransactions}
                selectedMonth={selectedMonth}
                showSummary={false}
              />
            </div>
            
            {/* Mobile Modal */}
            {showTransactionModal && (
              <TransactionForm 
                onTransactionAdded={loadAllData} 
                userId={user.uid}
                isModal={true}
                onClose={() => setShowTransactionModal(false)}
              />
            )}
            
            {/* Floating Action Button - Mobile Only */}
            <button
              onClick={() => setShowTransactionModal(true)}
              className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-blue-50/90 dark:bg-blue-900/90 border-2 border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 hover:bg-blue-100/90 dark:hover:bg-blue-800/90 z-40 touch-manipulation backdrop-blur-sm"
              aria-label="Pridėti transakciją"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <TransactionList
              transactions={monthFilteredTransactions}
              onTransactionDeleted={loadAllData}
              onTransactionUpdated={loadAllData}
              selectedMonth={selectedMonth}
            />
          </>
        )}

        {activeTab === 'statistics' && (
          <>
            <div className="mb-4 sm:mb-6">
              {/* Laikotarpio pasirinkimas */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">Laikotarpio pasirinkimas</h2>
                  <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
                    {/* Metų pasirinkimas */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setStatisticsYear(prev => prev - 1)}
                        className="px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-semibold min-h-[44px] touch-manipulation active:scale-95"
                        title="Ankstesni metai"
                      >
                        ←
                      </button>
                      
                      <div className="px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md min-w-[80px] sm:min-w-[100px] text-center font-medium text-sm sm:text-base">
                        {statisticsYear}
                      </div>

                      <button
                        onClick={() => {
                          const currentYear = new Date().getFullYear();
                          if (statisticsYear < currentYear) {
                            setStatisticsYear(prev => prev + 1);
                          }
                        }}
                        disabled={statisticsYear >= new Date().getFullYear()}
                        className={`px-3 py-2.5 rounded-md transition-colors font-semibold min-h-[44px] touch-manipulation ${
                          statisticsYear < new Date().getFullYear()
                            ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 active:scale-95'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                        title="Kiti metai"
                      >
                        →
                      </button>
                    </div>

                    {/* Mėnesio pasirinkimas */}
                    <div className="flex-1 sm:flex-none sm:w-48">
                      <select
                        value={statisticsMonth}
                        onChange={(e) => setStatisticsMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base min-h-[44px] touch-manipulation"
                      >
                        <option value="all">Visi</option>
                        <option value="0">Sausis</option>
                        <option value="1">Vasaris</option>
                        <option value="2">Kovas</option>
                        <option value="3">Balandis</option>
                        <option value="4">Gegužė</option>
                        <option value="5">Birželis</option>
                        <option value="6">Liepa</option>
                        <option value="7">Rugpjūtis</option>
                        <option value="8">Rugsėjis</option>
                        <option value="9">Spalis</option>
                        <option value="10">Lapkritis</option>
                        <option value="11">Gruodis</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Charts transactions={transactions} selectedYear={statisticsYear} selectedMonth={statisticsMonth} />
            <Statistics transactions={transactions} selectedYear={statisticsYear} statisticsMonth={statisticsMonth} />
          </>
        )}

        {activeTab === 'budget' && (
          <>
            <BudgetManager transactions={transactions} onBudgetUpdated={loadAllData} userId={user.uid} />
            <FinancialGoals transactions={transactions} userId={user.uid} />
          </>
        )}

        {activeTab === 'recurring' && (
          <RecurringTransactions onTransactionAdded={loadAllData} userId={user.uid} />
        )}


        {activeTab === 'savings' && (
          <SavingsManager userId={user.uid} />
        )}

        {activeTab === 'calendar' && (
          <CalendarView transactions={transactions} />
        )}

        {activeTab === 'settings' && (
          <Settings
            transactions={transactions}
            budgets={budgets}
            recurringTransactions={recurringTransactions}
            goals={goals}
            savingsAccounts={savingsAccounts}
            savingsTransactions={savingsTransactions}
            onDataImported={loadAllData}
            userId={user.uid}
            user={user}
          />
        )}
      </div>
    </div>
  );
}

export default App;
