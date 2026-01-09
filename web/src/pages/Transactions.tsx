import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TransactionList } from '@/components/TransactionList';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { useFinance } from '@/contexts/FinanceContext';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

export default function Transactions() {
  const { transactions, categories } = useFinance();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  const availableMonths = useMemo(() => {
    const months = new Set(transactions.map(tx => tx.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;
        if (monthFilter !== 'all' && !tx.date.startsWith(monthFilter)) return false;
        if (search) {
          const searchLower = search.toLowerCase();
          const category = categories.find(c => c.id === tx.categoryId);
          return (
            tx.notes?.toLowerCase().includes(searchLower) ||
            category?.name.toLowerCase().includes(searchLower) ||
            tx.amount.toString().includes(search)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, categories, search, categoryFilter, monthFilter]);

  return (
    <AppLayout
      title="Transactions"
      subtitle={`${filteredTransactions.length} transactions`}
      actions={<AddTransactionDialog />}
    >
      <div className="space-y-6 max-w-4xl">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transaction List */}
        <TransactionList transactions={filteredTransactions} />
      </div>
    </AppLayout>
  );
}
