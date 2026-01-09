import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Settings as SettingsIcon, Trash2, RotateCcw, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_CATEGORIES, SAMPLE_TRANSACTIONS, DEFAULT_BUDGET } from '@/lib/data';

export default function Settings() {
  const { budget, updateBudget, transactions, categories } = useFinance();
  const { toast } = useToast();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleClearTransactions = () => {
    localStorage.setItem('spendsmart-transactions', JSON.stringify([]));
    window.location.reload();
  };

  const stats = {
    totalTransactions: transactions.length,
    totalCategories: categories.length,
    totalSpent: transactions.reduce((sum, tx) => sum + tx.amount, 0),
    monthlyBudget: budget.totalMonthly,
  };

  return (
    <AppLayout
      title="Settings"
      subtitle="Manage your preferences"
    >
      <div className="max-w-2xl space-y-6">
        {/* Stats Overview */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Account Overview</h2>
              <p className="text-sm text-muted-foreground">Your SpendSmart statistics</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
              <p className="text-xl font-bold text-foreground">{stats.totalTransactions}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Categories</p>
              <p className="text-xl font-bold text-foreground">{stats.totalCategories}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Total Tracked</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(stats.totalSpent)}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Monthly Budget</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(stats.monthlyBudget)}</p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-muted text-muted-foreground">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Data Management</h2>
              <p className="text-sm text-muted-foreground">Manage your app data</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Clear All Transactions</p>
                <p className="text-sm text-muted-foreground">Delete all transactions but keep categories and budgets</p>
              </div>
              <Button variant="outline" onClick={() => setClearConfirm(true)} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div>
                <p className="font-medium text-foreground">Reset Everything</p>
                <p className="text-sm text-muted-foreground">Restore app to default state with sample data</p>
              </div>
              <Button variant="destructive" onClick={() => setResetConfirm(true)} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <h2 className="font-semibold text-foreground mb-2">About SpendSmart</h2>
          <p className="text-sm text-muted-foreground mb-4">
            SpendSmart helps you track expenses, understand where your money goes, and make better spending decisions. 
            Built for students and young adults who want a simple, practical way to manage their finances.
          </p>
          <p className="text-xs text-muted-foreground">
            All data is stored locally in your browser. Nothing is sent to any server.
          </p>
        </div>
      </div>

      {/* Clear Transactions Confirm */}
      <Dialog open={clearConfirm} onOpenChange={setClearConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Clear All Transactions?</DialogTitle>
            <DialogDescription>
              This will delete all {stats.totalTransactions} transactions. Categories and budgets will be kept.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleClearTransactions}>Clear Transactions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirm */}
      <Dialog open={resetConfirm} onOpenChange={setResetConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Everything?</DialogTitle>
            <DialogDescription>
              This will delete all your data and restore the app to its default state with sample data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReset}>Reset App</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
