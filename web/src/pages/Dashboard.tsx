import { useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { SpendingChart } from '@/components/SpendingChart';
import { TransactionList } from '@/components/TransactionList';
import { BudgetProgress } from '@/components/BudgetProgress';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, getCurrentMonth, getMonthName } from '@/lib/data';
import { Wallet, TrendingUp, Receipt, PiggyBank, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";

async function fetchTotal() {
  const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const res = await fetch(`${apiUrl}/api/expenses/total-spent`);
  if (!res.ok) return null;
  return res.json();
}

export default function Dashboard() {
  const {
    transactions,
    budget,
    categories,
    getMonthlySpending,
    getCategorySpending,
    getRemainingBudget,
  } = useFinance();

  const totalSpentQuery = useQuery({
    queryKey: ["get-total-spent"],
    queryFn: fetchTotal,
  });

  const currentMonth = getCurrentMonth();
  const monthlySpending = getMonthlySpending(currentMonth);
  const remaining = getRemainingBudget(currentMonth);

  const currentMonthTx = useMemo(
    () => transactions.filter(tx => tx.date.startsWith(currentMonth)),
    [transactions, currentMonth]
  );

  const topCategory = useMemo(() => {
    const spending: Record<string, number> = {};
    currentMonthTx.forEach(tx => {
      spending[tx.categoryId] = (spending[tx.categoryId] || 0) + tx.amount;
    });
    
    const topId = Object.entries(spending).sort((a, b) => b[1] - a[1])[0]?.[0];
    return categories.find(c => c.id === topId);
  }, [currentMonthTx, categories]);

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

  return (
    <AppLayout
      title="Dashboard"
      subtitle={getMonthName(currentMonth)}
      actions={<AddTransactionDialog />}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Stats Grid */}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Spent"
            value={totalSpentQuery.isLoading ? "..." : formatCurrency(totalSpentQuery.data?.total || monthlySpending)}
            subtitle="This month"
            icon={<Wallet className="h-5 w-5" />}
            variant="primary"
          />
          <StatCard
            title="Top Category"
            value={topCategory?.name || 'None'}
            subtitle={topCategory ? formatCurrency(getCategorySpending(topCategory.id)) : 'No spending yet'}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Transactions"
            value={currentMonthTx.length.toString()}
            subtitle="This month"
            icon={<Receipt className="h-5 w-5" />}
          />
          <StatCard
            title="Remaining"
            value={formatCurrency(Math.max(0, remaining))}
            subtitle={remaining < 0 ? 'Over budget!' : `of ${formatCurrency(budget.totalMonthly)}`}
            icon={<PiggyBank className="h-5 w-5" />}
            variant={remaining < 0 ? 'warning' : remaining < budget.totalMonthly * 0.2 ? 'warning' : 'success'}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Breakdown */}
          <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Where your money goes</h2>
            </div>
            <SpendingChart month={currentMonth} />
          </div>

          {/* Budget Overview */}
          <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Budget Overview</h2>
              <Link to="/budgets">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Manage <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-muted/50">
                <BudgetProgress
                  spent={monthlySpending}
                  total={budget.totalMonthly}
                  label="Total Budget"
                  size="lg"
                />
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-muted-foreground">Spent: {formatCurrency(monthlySpending)}</span>
                  <span className="text-muted-foreground">Budget: {formatCurrency(budget.totalMonthly)}</span>
                </div>
              </div>
              
              {categories.slice(0, 4).map(category => {
                const spent = getCategorySpending(category.id);
                const categoryBudget = budget.categoryBudgets[category.id] || 0;
                if (!categoryBudget) return null;
                
                return (
                  <BudgetProgress
                    key={category.id}
                    spent={spent}
                    total={categoryBudget}
                    label={category.name}
                    size="sm"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            <Link to="/transactions">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <TransactionList transactions={recentTransactions} limit={5} />
        </div>
      </div>
    </AppLayout>
  );
}
