import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, getCurrentMonth } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, XCircle, AlertCircle, HelpCircle, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

type AffordabilityResult = {
  canAfford: boolean;
  message: string;
  details: string[];
  severity: 'success' | 'warning' | 'error';
};

export default function CanIAffordIt() {
  const { budget, categories, getRemainingBudget, getCategorySpending, getSubscriptionTotal } = useFinance();
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [result, setResult] = useState<AffordabilityResult | null>(null);

  const currentMonth = getCurrentMonth();

  const checkAffordability = () => {
    const amount = parseFloat(price);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    const remaining = getRemainingBudget(currentMonth);
    const categorySpent = categoryId ? getCategorySpending(categoryId) : 0;
    const categoryBudget = categoryId ? budget.categoryBudgets[categoryId] || 0 : 0;
    const categoryRemaining = categoryBudget - categorySpent;
    const subscriptionTotal = getSubscriptionTotal();

    const details: string[] = [];
    let canAfford = true;
    let severity: 'success' | 'warning' | 'error' = 'success';

    // Check overall budget
    if (amount > remaining) {
      canAfford = false;
      severity = 'error';
      details.push(`This exceeds your remaining budget by ${formatCurrency(amount - remaining)}`);
    } else if (amount > remaining * 0.5) {
      severity = 'warning';
      details.push(`This would use ${((amount / remaining) * 100).toFixed(0)}% of your remaining budget`);
    } else {
      details.push(`You'll still have ${formatCurrency(remaining - amount)} left in your budget`);
    }

    // Check category budget
    if (categoryId && categoryBudget > 0) {
      if (amount > categoryRemaining) {
        canAfford = false;
        severity = 'error';
        const category = categories.find(c => c.id === categoryId);
        details.push(`This exceeds your ${category?.name} budget by ${formatCurrency(amount - categoryRemaining)}`);
      } else if (amount > categoryRemaining * 0.8) {
        if (severity !== 'error') severity = 'warning';
        const category = categories.find(c => c.id === categoryId);
        details.push(`This uses most of your remaining ${category?.name} budget`);
      }
    }

    // Check if recurring
    if (isRecurring) {
      const newSubscriptionTotal = subscriptionTotal + amount;
      const subscriptionPercentage = (newSubscriptionTotal / budget.totalMonthly) * 100;
      
      if (subscriptionPercentage > 40) {
        if (severity !== 'error') severity = 'warning';
        details.push(`Your subscriptions would be ${subscriptionPercentage.toFixed(0)}% of your monthly budget`);
      }
      
      details.push(`This adds ${formatCurrency(amount)} to your monthly commitments`);
    }

    let message: string;
    if (canAfford && severity === 'success') {
      message = "Yes, you can afford this! 🎉";
    } else if (canAfford && severity === 'warning') {
      message = "You can afford it, but be careful";
    } else {
      message = "This might not be the best idea right now";
    }

    setResult({ canAfford, message, details, severity });
  };

  const resetForm = () => {
    setPrice('');
    setCategoryId('');
    setIsRecurring(false);
    setResult(null);
  };

  return (
    <AppLayout
      title="Can I Afford It?"
      subtitle="Make smarter purchase decisions"
    >
      <div className="max-w-xl mx-auto">
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Purchase Decision Helper</h2>
              <p className="text-sm text-muted-foreground">
                Enter what you're thinking of buying
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="afford-price">Price (₹)</Label>
              <Input
                id="afford-price"
                type="number"
                placeholder="Enter the price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="afford-category">Category (optional)</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="afford-recurring" className="font-medium">
                  Recurring Purchase
                </Label>
                <p className="text-xs text-muted-foreground">
                  Is this a subscription or regular expense?
                </p>
              </div>
              <Switch
                id="afford-recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={checkAffordability} className="flex-1 gap-2">
                <Wallet className="h-4 w-4" />
                Check Affordability
              </Button>
              {result && (
                <Button variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div
            className={cn(
              'mt-6 rounded-xl border p-6 animate-scale-in',
              result.severity === 'success' && 'bg-success/5 border-success/30',
              result.severity === 'warning' && 'bg-warning/5 border-warning/30',
              result.severity === 'error' && 'bg-destructive/5 border-destructive/30'
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'p-2 rounded-full',
                  result.severity === 'success' && 'bg-success/10 text-success',
                  result.severity === 'warning' && 'bg-warning/10 text-warning',
                  result.severity === 'error' && 'bg-destructive/10 text-destructive'
                )}
              >
                {result.severity === 'success' && <CheckCircle2 className="h-6 w-6" />}
                {result.severity === 'warning' && <AlertCircle className="h-6 w-6" />}
                {result.severity === 'error' && <XCircle className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{result.message}</h3>
                <ul className="mt-3 space-y-2">
                  {result.details.map((detail, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-muted-foreground/50 mt-1">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
