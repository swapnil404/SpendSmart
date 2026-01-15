import { AppLayout } from '@/components/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Wallet, Key, User } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute('/settings')({
  component: Settings,
})

function Settings() {
  const { budget, transactions, categories, resetData } = useFinance();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const user = session?.user;

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

        {/* Account Information */}
      <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Account Information</h2>
              <p className="text-sm text-muted-foreground">Manage your profile details</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 mb-6">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={user?.image || ''} alt={user?.name} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold text-foreground">{user?.name || 'User'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border group hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Key className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Password Security</p>
                  <p className="text-xs text-muted-foreground">Reset your account password via email</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  if (user?.email) {
                    await (authClient as any).requestPasswordReset({
                      email: user.email,
                      redirectTo: "/reset-password"
                    });
                    alert("Instructions to reset your password have been sent to your email.");
                  }
                }}
              >
                Reset Password
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card rounded-xl border border-destructive/20 p-6 shadow-card">
          <h2 className="font-semibold text-destructive mb-2">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Irreversible actions for your account.
          </p>
          
          <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
            <div>
              <Label className="font-medium text-foreground">Delete Account</Label>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      try {
                        await apiFetch("/api/account", { method: "DELETE" });
                        await authClient.signOut();
                        resetData();
                        router.navigate({ to: '/' });
                      } catch (error) {
                        console.error("Failed to delete account", error);
                        alert("Failed to delete account. Please try again.");
                      }
                    }}
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* About */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <h2 className="font-semibold text-foreground mb-2">About SpendSmart</h2>
          <p className="text-sm text-muted-foreground mb-4">
            SpendSmart helps you track expenses, understand where your money goes, and make better spending decisions. 
            Built for students and young adults who want a simple, practical way to manage their finances.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Your data is synced securely to the cloud.
          </p>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <Label className="font-medium text-foreground">Log Out</Label>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={async () => {
                  await authClient.signOut();
                  resetData();
                  router.navigate({ to: '/' });
              }}
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

    
