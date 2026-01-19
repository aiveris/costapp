import { useState, useEffect, useMemo } from 'react';
import { SavingsAccount } from '../types';
import {
  addSavingsAccount,
  getSavingsAccounts,
  updateSavingsAccount,
  deleteSavingsAccount,
} from '../services/firestoreService';

interface SavingsManagerProps {
  userId: string;
}

export default function SavingsManager({ userId }: SavingsManagerProps) {
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form states
  const [accountName, setAccountName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!showAccountForm && !showEditForm) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showAccountForm) {
          resetAccountForm();
        }
        if (showEditForm) {
          resetEditForm();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAccountForm, showEditForm]);

  useEffect(() => {
    if (!openMenuId) return;

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-savings-menu]')) return;
      setOpenMenuId(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const accountsData = await getSavingsAccounts(userId);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Klaida kraunant duomenis:', error);
      alert('Nepavyko užkrauti duomenų');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amount = parseFloat(initialAmount) || 0;
      await addSavingsAccount({
        name: accountName,
        currentAmount: amount,
        createdAt: new Date(),
      }, userId);
      resetAccountForm();
      loadData();
    } catch (error) {
      alert('Nepavyko išsaugoti sąskaitos');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccountId) return;

    try {
      const amount = parseFloat(transactionAmount);
      if (isNaN(amount) || amount < 0) {
        alert('Įveskite teisingą sumą');
        return;
      }

      const account = accounts.find(a => a.id === editingAccountId);
      if (!account) return;

      await updateSavingsAccount(editingAccountId, {
        name: accountName,
        currentAmount: amount,
      });

      resetEditForm();
      loadData();
    } catch (error) {
      alert('Nepavyko atnaujinti sumos');
    }
  };

  const handleQuickAdd = async (accountId: string, amount: number) => {
    try {
      const account = accounts.find(a => a.id === accountId);
      if (!account) return;

      await updateSavingsAccount(accountId, {
        currentAmount: account.currentAmount + amount,
      });

      loadData();
    } catch (error) {
      alert('Nepavyko pridėti sumos');
    }
  };

  const handleQuickWithdraw = async (accountId: string, amount: number) => {
    try {
      const account = accounts.find(a => a.id === accountId);
      if (!account) return;

      if (account.currentAmount < amount) {
        alert('Nepakanka pinigų sąskaitoje');
        return;
      }

      await updateSavingsAccount(accountId, {
        currentAmount: account.currentAmount - amount,
      });

      loadData();
    } catch (error) {
      alert('Nepavyko išimti sumos');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm('Ar tikrai norite ištrinti šią sąskaitą?')) {
      try {
        await deleteSavingsAccount(id);
        loadData();
      } catch (error) {
        alert('Nepavyko ištrinti sąskaitos');
      }
    }
  };

  const openEditFormForAccount = (account: SavingsAccount) => {
    setEditingAccountId(account.id);
    setAccountName(account.name);
    setTransactionAmount(account.currentAmount.toString());
    setShowEditForm(true);
    setOpenMenuId(null);
  };

  const resetAccountForm = () => {
    setShowAccountForm(false);
    setAccountName('');
    setInitialAmount('');
  };

  const resetEditForm = () => {
    setShowEditForm(false);
    setEditingAccountId(null);
    setTransactionAmount('');
    setAccountName('');
  };

  const totalSavings = useMemo(() => {
    return accounts.reduce((sum, account) => sum + account.currentAmount, 0);
  }, [accounts]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Kraunama...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Bendras santaupų likutis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2.5 sm:p-3 border border-gray-200 dark:border-gray-700 flex items-start justify-between gap-1.5">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-0.5">
            Bendros santaupos
          </h2>
          <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(totalSavings)} €
          </p>
        </div>
        <button
          onClick={() => setShowAccountForm(true)}
          className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-md border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 min-h-[44px] touch-manipulation"
        >
          +
        </button>
      </div>

      {/* Sąskaitų sąrašas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {accounts.map((account) => {
          return (
            <div
              key={account.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 pr-12 sm:pr-4 relative"
            >
              <div className="absolute top-3 right-3" data-savings-menu>
                <button
                  onClick={() => setOpenMenuId(openMenuId === account.id ? null : account.id)}
                  className="text-gray-600 dark:text-gray-300 transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation active:scale-95"
                  title="Veiksmai"
                  aria-haspopup="menu"
                  aria-expanded={openMenuId === account.id}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="6" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="18" cy="12" r="2" />
                  </svg>
                </button>
                {openMenuId === account.id && (
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => openEditFormForAccount(account)}
                      className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Redaguoti
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Ištrinti
                    </button>
                  </div>
                )}
              </div>
              <div className="mb-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {account.name}
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(account.currentAmount)} €
                </p>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickWithdraw(account.id, 10)}
                    className="text-sm sm:text-xs bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 border border-red-500 dark:border-red-400 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded hover:bg-red-100 dark:hover:bg-red-800 min-h-[32px] sm:min-h-[28px] touch-manipulation active:scale-95"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickWithdraw(account.id, 50)}
                    className="text-sm sm:text-xs bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 border border-red-500 dark:border-red-400 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded hover:bg-red-100 dark:hover:bg-red-800 min-h-[32px] sm:min-h-[28px] touch-manipulation active:scale-95"
                  >
                    -50
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickWithdraw(account.id, 100)}
                    className="text-sm sm:text-xs bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 border border-red-500 dark:border-red-400 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded hover:bg-red-100 dark:hover:bg-red-800 min-h-[32px] sm:min-h-[28px] touch-manipulation active:scale-95"
                  >
                    -100
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(account.id, 10)}
                    className="text-sm sm:text-xs bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 border border-green-500 dark:border-green-400 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded hover:bg-green-100 dark:hover:bg-green-800 min-h-[32px] sm:min-h-[28px] touch-manipulation active:scale-95"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(account.id, 50)}
                    className="text-sm sm:text-xs bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 border border-green-500 dark:border-green-400 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded hover:bg-green-100 dark:hover:bg-green-800 min-h-[32px] sm:min-h-[28px] touch-manipulation active:scale-95"
                  >
                    +50
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(account.id, 100)}
                    className="text-sm sm:text-xs bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 border border-green-500 dark:border-green-400 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded hover:bg-green-100 dark:hover:bg-green-800 min-h-[32px] sm:min-h-[28px] touch-manipulation active:scale-95"
                  >
                    +100
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {accounts.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center text-gray-500 dark:text-gray-400">
          <p>Nėra santaupų sąskaitų. Sukurkite pirmąją sąskaitą!</p>
        </div>
      )}

      {/* Sąskaitos formos modalas */}
      {showAccountForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetAccountForm();
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Nauja sąskaita
            </h3>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pavadinimas *
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Suma *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetAccountForm}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-medium min-h-[44px] touch-manipulation active:scale-95"
                >
                  Atšaukti
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors font-medium min-h-[44px] touch-manipulation active:scale-95"
                >
                  Pridėti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redagavimo modalas */}
      {showEditForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetEditForm();
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Redaguoti
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pavadinimas *
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Suma *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetEditForm}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-medium min-h-[44px] touch-manipulation active:scale-95"
                >
                  Atšaukti
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium min-h-[44px] touch-manipulation active:scale-95 border bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800"
                >
                  Išsaugoti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
