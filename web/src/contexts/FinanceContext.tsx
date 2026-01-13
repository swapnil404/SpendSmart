import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, Transaction, Budget } from '@/lib/types';
import { DEFAULT_CATEGORIES, SAMPLE_TRANSACTIONS, DEFAULT_BUDGET, getCurrentMonth } from '@/lib/data';

interface FinanceContextType {
  categories: Category[];
  transactions: Transaction[];
  budget: Budget;
  addCategory: (category: Omit<Category, 'id' | 'isDefault'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (budget: Budget) => void;
  getMonthlySpending: (month?: string) => number;
  getCategorySpending: (categoryId: string, month?: string) => number;
  getSubscriptionTotal: () => number;
  getRemainingBudget: (month?: string) => number;
  getCategoryById: (id: string) => Category | undefined;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  categories: 'spendsmart-categories',
  transactions: 'spendsmart-transactions',
  budget: 'spendsmart-budget',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() =>
    loadFromStorage(STORAGE_KEYS.categories, DEFAULT_CATEGORIES)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage(STORAGE_KEYS.transactions, SAMPLE_TRANSACTIONS)
  );
  const [budget, setBudget] = useState<Budget>(() =>
    loadFromStorage(STORAGE_KEYS.budget, DEFAULT_BUDGET)
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.categories, categories);
  }, [categories]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.transactions, transactions);
  }, [transactions]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.budget, budget);
  }, [budget]);

  const addCategory = (category: Omit<Category, 'id' | 'isDefault'>) => {
    const newCategory: Category = {
      ...category,
      id: `custom-${Date.now()}`,
      isDefault: false,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id || cat.isDefault));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const updateBudget = (newBudget: Budget) => {
    setBudget(newBudget);
  };

  const getMonthlySpending = (month?: string) => {
    const targetMonth = month || getCurrentMonth();
    return transactions
      .filter((tx) => tx.date.startsWith(targetMonth))
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const getCategorySpending = (categoryId: string, month?: string) => {
    const targetMonth = month || getCurrentMonth();
    return transactions
      .filter((tx) => tx.categoryId === categoryId && tx.date.startsWith(targetMonth))
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const getSubscriptionTotal = () => {
    return transactions
      .filter((tx) => tx.isRecurring)
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const getRemainingBudget = (month?: string) => {
    return budget.totalMonthly - getMonthlySpending(month);
  };

  const getCategoryById = (id: string) => {
    return categories.find((cat) => cat.id === id);
  };

  return (
    <FinanceContext.Provider
      value={{
        categories,
        transactions,
        budget,
        addCategory,
        updateCategory,
        deleteCategory,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateBudget,
        getMonthlySpending,
        getCategorySpending,
        getSubscriptionTotal,
        getRemainingBudget,
        getCategoryById,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
