import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, Transaction, Budget } from '@/lib/types';
import { DEFAULT_CATEGORIES, DEFAULT_BUDGET, getCurrentMonth } from '@/lib/data';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, "");

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
  resetData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);


export function FinanceProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [budget, setBudget] = useState<Budget>(DEFAULT_BUDGET);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/expenses`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
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

  // Fetch custom categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/expenses/categories`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Merge default categories with user categories
        // Ensure no duplicates if IDs clash (though UUIDs shouldn't)
        const userCategories: Category[] = (data.categories || []).map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            color: cat.color || undefined,
            icon: cat.icon || undefined,
            isDefault: false
        }));
        setCategories([...DEFAULT_CATEGORIES, ...userCategories]);
      }
    } catch (error) {
       console.error('Failed to fetch categories:', error);
    }
  }

  // Fetch total spent from API
  const fetchTotalSpent = async () => {
    try {
      const response = await fetch(`${API_URL}/api/expenses/total-spent`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTotalSpent(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch total spent:', error);
    }
  };

  // Fetch budget from API
  const fetchBudget = async () => {
    try {
        const response = await fetch(`${API_URL}/api/expenses/budget`, {
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            if (data.budget) {
                setBudget(data.budget);
            }
        }
    } catch (error) {
        console.error('Failed to fetch budget:', error);
    }
  }

  // Refresh all data
  const refreshTransactions = async () => {
    await Promise.all([fetchTransactions(), fetchTotalSpent(), fetchCategories(), fetchBudget()]);
  };

  const resetData = () => {
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setBudget(DEFAULT_BUDGET);
    setTotalSpent(0);
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

  const addCategory = async (category: Omit<Category, 'id' | 'isDefault'>) => {
    try {
        const response = await fetch(`${API_URL}/api/expenses/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(category)
        });
        if (response.ok) {
            await fetchCategories();
        }
    } catch (error) {
        console.error("Failed to add category", error);
    }
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
        credentials: 'include',
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

  const updateBudget = async (newBudget: Budget) => {
    try {
        const response = await fetch(`${API_URL}/api/expenses/budget`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(newBudget)
        });
        if (response.ok) {
             setBudget(newBudget);
        }
    } catch (error) {
        console.error("Failed to update budget", error);
    }
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
        resetData,
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
