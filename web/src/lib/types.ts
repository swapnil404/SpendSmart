export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  categoryId: string;
  paymentMethod: 'cash' | 'upi' | 'card' | 'netbanking';
  notes?: string;
  isRecurring: boolean;
}

export interface Budget {
  totalMonthly: number;
  categoryBudgets: Record<string, number>;
}

export interface MonthlyData {
  month: string;
  totalSpent: number;
  byCategory: Record<string, number>;
}

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'netbanking';

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'netbanking', label: 'Net Banking' },
];
