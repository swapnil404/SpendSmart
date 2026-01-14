import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, Transaction, Budget } from '@/lib/types';
import { DEFAULT_CATEGORIES, DEFAULT_BUDGET, getCurrentMonth } from '@/lib/data';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface FinanceContextType {
  categories: Category[];
  transactions: Transaction[];
  budget: Budget;
  totalSpent: number;
  isLoading: boolean;
  addCategory: (category: Omit<Category, 'id' | 'isDefault'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (budget: Budget) => void;
  getMonthlySpending: (month?: string) => number;
  getCategorySpending: (categoryId: string, month?: string) => number;
  getSubscriptionTotal: () => number;
  getRemainingBudget: (month?: string) => number;
  getCategoryById: (id: string) => Category | undefined;
  refreshTransactions: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  categories: 'spendsmart-categories',
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [budget, setBudget] = useState<Budget>(() =>
    loadFromStorage(STORAGE_KEYS.budget, DEFAULT_BUDGET)
  );

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/expenses`);
      if (response.ok) {
        const data = await response.json();
        // Map DB response to Transaction type
        const txs: Transaction[] = (data.expense || []).map((tx: any) => ({
          id: String(tx.id),
          amount: tx.amount,
          date: tx.date,
          categoryId: tx.categoryId,
          paymentMethod: tx.paymentMethod,
          notes: tx.notes || undefined,
          isRecurring: tx.isRecurring || false,
        }));
        setTransactions(txs);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  // Fetch total spent from API
  const fetchTotalSpent = async () => {
    try {
      const response = await fetch(`${API_URL}/api/expenses/total-spent`);
      if (response.ok) {
        const data = await response.json();
        setTotalSpent(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch total spent:', error);
    }
  };

  // Refresh both transactions and total
  const refreshTransactions = async () => {
    await Promise.all([fetchTransactions(), fetchTotalSpent()]);
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await refreshTransactions();
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.categories, categories);
  }, [categories]);

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

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });
      
      if (response.ok) {
        // Refresh from DB to get the actual ID and update totals
        await refreshTransactions();
      }
    } catch (error) {
      console.error('Failed to save transaction to API:', error);
    }
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
        totalSpent,
        isLoading,
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
        refreshTransactions,
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
