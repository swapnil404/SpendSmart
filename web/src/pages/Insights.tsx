import { useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, getCurrentMonth, getMonthName } from '@/lib/data';
import { CategoryIcon } from '@/components/CategoryIcon';
import { getCategoryBgColor } from '@/components/CategoryBadge';
import { TrendingUp, TrendingDown, Repeat, PiggyBank, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: 'default' | 'positive' | 'negative' | 'neutral';
}

function InsightCard({ icon, title, description, variant = 'default' }: InsightCardProps) {
  return (
    <div className={cn(
      'bg-card rounded-xl border border-border/50 p-5 shadow-card',
      'animate-fade-in'
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          'p-2.5 rounded-lg',
          variant === 'positive' && 'bg-success/10 text-success',
          variant === 'negative' && 'bg-destructive/10 text-destructive',
          variant === 'neutral' && 'bg-info/10 text-info',
          variant === 'default' && 'bg-primary/10 text-primary'
        )}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function Insights() {
  const { transactions, categories, budget, getMonthlySpending, getCategorySpending, getSubscriptionTotal } = useFinance();

  const currentMonth = getCurrentMonth();
  const lastMonth = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 7);
  }, []);

  const currentSpending = getMonthlySpending(currentMonth);
  const lastMonthSpending = getMonthlySpending(lastMonth);
  const subscriptionTotal = getSubscriptionTotal();

  const insights = useMemo(() => {
    const result: InsightCardProps[] = [];

    // Top category this month
    const categorySpending: Record<string, number> = {};
    transactions
      .filter(tx => tx.date.startsWith(currentMonth))
      .forEach(tx => {
        categorySpending[tx.categoryId] = (categorySpending[tx.categoryId] || 0) + tx.amount;
      });

    const topCategoryEntry = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
    if (topCategoryEntry) {
      const category = categories.find(c => c.id === topCategoryEntry[0]);
      if (category) {
        result.push({
          icon: <span style={{ color: getCategoryBgColor(category.color) }}>
            <CategoryIcon name={category.icon} size={20} />
          </span>,
          title: `${category.name} is your top spend`,
          description: `You've spent ${formatCurrency(topCategoryEntry[1])} on ${category.name} this month — that's ${((topCategoryEntry[1] / currentSpending) * 100).toFixed(0)}% of your total spending.`,
          variant: 'default',
        });
      }
    }

    // Subscription percentage
    if (subscriptionTotal > 0 && budget.totalMonthly > 0) {
      const subPercentage = (subscriptionTotal / budget.totalMonthly) * 100;
      result.push({
        icon: <Repeat className="h-5 w-5" />,
        title: `Subscriptions: ${formatCurrency(subscriptionTotal)}/month`,
        description: subPercentage > 30
          ? `That's ${subPercentage.toFixed(0)}% of your budget going to recurring expenses. Consider reviewing if you still need all of them.`
          : `Subscriptions take ${subPercentage.toFixed(0)}% of your monthly budget — that's pretty reasonable!`,
        variant: subPercentage > 30 ? 'negative' : 'positive',
      });
    }

    // Month-over-month comparison
    if (lastMonthSpending > 0) {
      const change = currentSpending - lastMonthSpending;
      const changePercent = (change / lastMonthSpending) * 100;
      
      if (change > 0) {
        result.push({
          icon: <TrendingUp className="h-5 w-5" />,
          title: `Spending is up ${changePercent.toFixed(0)}%`,
          description: `You've spent ${formatCurrency(change)} more than last month. Keep an eye on your budget!`,
          variant: 'negative',
        });
      } else {
        result.push({
          icon: <TrendingDown className="h-5 w-5" />,
          title: `Spending is down ${Math.abs(changePercent).toFixed(0)}%`,
          description: `Great job! You've spent ${formatCurrency(Math.abs(change))} less compared to last month.`,
          variant: 'positive',
        });
      }
    }

    // Budget usage
    if (budget.totalMonthly > 0) {
      const remaining = budget.totalMonthly - currentSpending;
      const usagePercent = (currentSpending / budget.totalMonthly) * 100;
      
      if (remaining > 0) {
        result.push({
          icon: <PiggyBank className="h-5 w-5" />,
          title: `${formatCurrency(remaining)} left to spend`,
          description: `You've used ${usagePercent.toFixed(0)}% of your ${formatCurrency(budget.totalMonthly)} monthly budget. ${usagePercent > 80 ? 'Time to slow down!' : 'Keep it up!'}`,
          variant: usagePercent > 80 ? 'neutral' : 'positive',
        });
      } else {
        result.push({
          icon: <PiggyBank className="h-5 w-5" />,
          title: `Over budget by ${formatCurrency(Math.abs(remaining))}`,
          description: 'You\'ve exceeded your monthly budget. Consider cutting back on non-essential spending.',
          variant: 'negative',
        });
      }
    }

    return result;
  }, [transactions, categories, currentMonth, currentSpending, lastMonthSpending, subscriptionTotal, budget]);

  return (
    <AppLayout
      title="Insights"
      subtitle={getMonthName(currentMonth)}
    >
      <div className="max-w-2xl">
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} style={{ animationDelay: `${index * 100}ms` }}>
                <InsightCard {...insight} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border/50 p-12 shadow-card text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-muted">
                <Lightbulb className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="font-semibold text-foreground mb-2">No insights yet</h3>
            <p className="text-sm text-muted-foreground">
              Add more transactions to get personalized spending insights.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
