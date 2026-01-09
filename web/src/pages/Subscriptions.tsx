import { useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, formatDate } from '@/lib/data';
import { CategoryBadge, getCategoryBgColor } from '@/components/CategoryBadge';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Repeat, AlertTriangle } from 'lucide-react';

export default function Subscriptions() {
  const { transactions, categories, budget } = useFinance();

  const subscriptions = useMemo(() => {
    return transactions.filter(tx => tx.isRecurring);
  }, [transactions]);

  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [subscriptions]);

  const percentOfBudget = budget.totalMonthly > 0 
    ? (totalMonthly / budget.totalMonthly) * 100 
    : 0;

  const groupedByCategory = useMemo(() => {
    const grouped: Record<string, typeof subscriptions> = {};
    subscriptions.forEach(tx => {
      if (!grouped[tx.categoryId]) {
        grouped[tx.categoryId] = [];
      }
      grouped[tx.categoryId].push(tx);
    });
    return grouped;
  }, [subscriptions]);

  return (
    <AppLayout
      title="Subscriptions"
      subtitle={`${subscriptions.length} recurring expenses`}
    >
      <div className="max-w-3xl space-y-6">
        {/* Summary Card */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Repeat className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Monthly Subscriptions</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalMonthly)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Of monthly budget</p>
              <p className={`text-xl font-semibold ${percentOfBudget > 30 ? 'text-warning' : 'text-foreground'}`}>
                {percentOfBudget.toFixed(0)}%
              </p>
            </div>
          </div>

          {percentOfBudget > 30 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-warning bg-warning/10 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4" />
              <span>Subscriptions are taking a significant portion of your budget</span>
            </div>
          )}
        </div>

        {/* Subscriptions List */}
        {subscriptions.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedByCategory).map(([categoryId, subs]) => {
              const category = categories.find(c => c.id === categoryId);
              const categoryTotal = subs.reduce((sum, tx) => sum + tx.amount, 0);

              return (
                <div key={categoryId} className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-muted/30">
                    <div className="flex items-center gap-3">
                      {category && (
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-lg"
                          style={{ backgroundColor: getCategoryBgColor(category.color) + '20' }}
                        >
                          <span style={{ color: getCategoryBgColor(category.color) }}>
                            <CategoryIcon name={category.icon} size={16} />
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-foreground">{category?.name || 'Unknown'}</span>
                    </div>
                    <span className="font-semibold text-foreground">{formatCurrency(categoryTotal)}/mo</span>
                  </div>
                  <div className="divide-y divide-border/50">
                    {subs.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between p-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{sub.notes || 'Subscription'}</p>
                          <p className="text-xs text-muted-foreground">Added {formatDate(sub.date)}</p>
                        </div>
                        <span className="font-medium text-foreground">{formatCurrency(sub.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border/50 p-12 shadow-card text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-muted">
                <Repeat className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="font-semibold text-foreground mb-2">No subscriptions tracked</h3>
            <p className="text-sm text-muted-foreground">
              Mark transactions as recurring to track your subscriptions here.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
