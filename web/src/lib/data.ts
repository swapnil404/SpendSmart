import { Category, Transaction, Budget } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', color: 'category-food', icon: 'UtensilsCrossed', isDefault: true },
  { id: 'transport', name: 'Transport', color: 'category-transport', icon: 'Car', isDefault: true },
  { id: 'shopping', name: 'Shopping', color: 'category-shopping', icon: 'ShoppingBag', isDefault: true },
  { id: 'bills', name: 'Bills & Utilities', color: 'category-bills', icon: 'Receipt', isDefault: true },
  { id: 'subscriptions', name: 'Subscriptions', color: 'category-subscriptions', icon: 'Repeat', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', color: 'category-entertainment', icon: 'Gamepad2', isDefault: true },
  { id: 'health', name: 'Health', color: 'category-health', icon: 'Heart', isDefault: true },
  { id: 'education', name: 'Education', color: 'category-education', icon: 'GraduationCap', isDefault: true },
  { id: 'other', name: 'Other', color: 'category-other', icon: 'MoreHorizontal', isDefault: true },
];

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: '1', amount: 450, date: '2026-01-02', categoryId: 'food', paymentMethod: 'upi', notes: 'Lunch at cafe', isRecurring: false },
  { id: '2', amount: 2500, date: '2026-01-01', categoryId: 'transport', paymentMethod: 'upi', notes: 'Metro card recharge', isRecurring: false },
  { id: '3', amount: 799, date: '2025-12-30', categoryId: 'subscriptions', paymentMethod: 'card', notes: 'Netflix subscription', isRecurring: true },
  { id: '4', amount: 1200, date: '2025-12-29', categoryId: 'shopping', paymentMethod: 'card', notes: 'New headphones', isRecurring: false },
  { id: '5', amount: 500, date: '2025-12-28', categoryId: 'entertainment', paymentMethod: 'upi', notes: 'Movie tickets', isRecurring: false },
  { id: '6', amount: 3500, date: '2025-12-27', categoryId: 'bills', paymentMethod: 'netbanking', notes: 'Electricity bill', isRecurring: false },
  { id: '7', amount: 199, date: '2025-12-26', categoryId: 'subscriptions', paymentMethod: 'card', notes: 'Spotify premium', isRecurring: true },
  { id: '8', amount: 850, date: '2025-12-25', categoryId: 'food', paymentMethod: 'cash', notes: 'Groceries', isRecurring: false },
  { id: '9', amount: 2000, date: '2025-12-24', categoryId: 'health', paymentMethod: 'upi', notes: 'Pharmacy', isRecurring: false },
  { id: '10', amount: 1500, date: '2025-12-23', categoryId: 'education', paymentMethod: 'card', notes: 'Online course', isRecurring: false },
];

export const DEFAULT_BUDGET: Budget = {
  totalMonthly: 30000,
  categoryBudgets: {
    food: 8000,
    transport: 4000,
    shopping: 5000,
    bills: 5000,
    subscriptions: 2000,
    entertainment: 3000,
    health: 2000,
    education: 3000,
    other: 2000,
  },
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getMonthName(monthString: string): string {
  const [year, month] = monthString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}
