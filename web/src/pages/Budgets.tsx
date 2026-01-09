import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { BudgetProgress } from '@/components/BudgetProgress';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, getCurrentMonth, getMonthName } from '@/lib/data';
import { CategoryIcon } from '@/components/CategoryIcon';
import { getCategoryBgColor } from '@/components/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Budgets() {
  const { budget, categories, getCategorySpending, getMonthlySpending, updateBudget } = useFinance();
  const { toast } = useToast();
  const [editingTotal, setEditingTotal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  const currentMonth = getCurrentMonth();
  const monthlySpending = getMonthlySpending(currentMonth);

  const handleSaveTotal = () => {
    const newTotal = parseFloat(tempValue);
    if (!isNaN(newTotal) && newTotal > 0) {
      updateBudget({ ...budget, totalMonthly: newTotal });
      toast({ title: 'Budget updated', description: `Monthly budget set to ${formatCurrency(newTotal)}` });
    }
    setEditingTotal(false);
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      const newAmount = parseFloat(tempValue);
      if (!isNaN(newAmount) && newAmount >= 0) {
        updateBudget({
          ...budget,
          categoryBudgets: { ...budget.categoryBudgets, [editingCategory]: newAmount },
        });
        const category = categories.find(c => c.id === editingCategory);
        toast({ title: 'Category budget updated', description: `${category?.name} budget set to ${formatCurrency(newAmount)}` });
      }
    }
    setEditingCategory(null);
  };

  const remaining = budget.totalMonthly - monthlySpending;

  return (
    <AppLayout
      title="Budgets"
      subtitle={getMonthName(currentMonth)}
    >
      <div className="space-y-6 max-w-3xl">
        {/* Monthly Budget Card */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Monthly Budget</h2>
              <p className="text-sm text-muted-foreground">Your spending limit for this month</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setTempValue(budget.totalMonthly.toString());
                setEditingTotal(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{formatCurrency(budget.totalMonthly)}</span>
              <span className="text-muted-foreground text-sm">/ month</span>
            </div>

            <BudgetProgress spent={monthlySpending} total={budget.totalMonthly} size="lg" />

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Spent</p>
                <p className="font-semibold text-foreground">{formatCurrency(monthlySpending)}</p>
              </div>
              <div className={`p-3 rounded-lg ${remaining < 0 ? 'bg-destructive/10' : 'bg-success/10'}`}>
                <p className="text-xs text-muted-foreground mb-1">{remaining < 0 ? 'Over' : 'Remaining'}</p>
                <p className={`font-semibold ${remaining < 0 ? 'text-destructive' : 'text-success'}`}>
                  {formatCurrency(Math.abs(remaining))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Budgets */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Category Budgets</h2>
            <p className="text-sm text-muted-foreground">Set spending limits for each category</p>
          </div>

          <div className="space-y-4">
            {categories.map(category => {
              const spent = getCategorySpending(category.id);
              const categoryBudget = budget.categoryBudgets[category.id] || 0;

              return (
                <div
                  key={category.id}
                  className="group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{ backgroundColor: getCategoryBgColor(category.color) + '20' }}
                  >
                    <span style={{ color: getCategoryBgColor(category.color) }}>
                      <CategoryIcon
                        name={category.icon}
                        size={18}
                        className="opacity-80"
                      />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-foreground">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(spent)} / {formatCurrency(categoryBudget)}
                      </span>
                    </div>
                    <BudgetProgress spent={spent} total={categoryBudget} showAmount={false} size="sm" />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setTempValue(categoryBudget.toString());
                      setEditingCategory(category.id);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Total Budget Dialog */}
      <Dialog open={editingTotal} onOpenChange={setEditingTotal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Monthly Budget</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="total-budget">Amount (₹)</Label>
            <Input
              id="total-budget"
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTotal(false)}>Cancel</Button>
            <Button onClick={handleSaveTotal}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Budget Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Edit {categories.find(c => c.id === editingCategory)?.name} Budget
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="category-budget">Amount (₹)</Label>
            <Input
              id="category-budget"
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
            <Button onClick={handleSaveCategory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
