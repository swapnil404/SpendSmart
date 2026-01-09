import { useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, getCurrentMonth } from '@/lib/data';
import { getCategoryBgColor } from '@/components/CategoryBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Reports() {
  const { transactions, categories } = useFinance();
  const { toast } = useToast();

  const last6Months = useMemo(() => {
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toISOString().slice(0, 7));
    }
    return months;
  }, []);

  const monthlyData = useMemo(() => {
    return last6Months.map(month => {
      const monthTx = transactions.filter(tx => tx.date.startsWith(month));
      const total = monthTx.reduce((sum, tx) => sum + tx.amount, 0);
      const [year, m] = month.split('-');
      const label = new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString('en-IN', { month: 'short' });
      
      return { month: label, total, fullMonth: month };
    });
  }, [transactions, last6Months]);

  const categoryData = useMemo(() => {
    const currentMonth = getCurrentMonth();
    const monthTx = transactions.filter(tx => tx.date.startsWith(currentMonth));
    const byCategory: Record<string, number> = {};
    
    monthTx.forEach(tx => {
      byCategory[tx.categoryId] = (byCategory[tx.categoryId] || 0) + tx.amount;
    });

    return Object.entries(byCategory)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          name: category?.name || 'Unknown',
          amount,
          color: category ? getCategoryBgColor(category.color) : 'hsl(var(--muted))',
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  const handleExport = () => {
    const csvRows = [
      ['Date', 'Amount', 'Category', 'Payment Method', 'Notes', 'Recurring'].join(','),
      ...transactions.map(tx => {
        const category = categories.find(c => c.id === tx.categoryId);
        return [
          tx.date,
          tx.amount,
          category?.name || 'Unknown',
          tx.paymentMethod,
          `"${tx.notes || ''}"`,
          tx.isRecurring ? 'Yes' : 'No',
        ].join(',');
      }),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendsmart-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Export complete', description: 'Your transactions have been downloaded as CSV.' });
  };

  return (
    <AppLayout
      title="Reports"
      subtitle="Analyze your spending patterns"
      actions={
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      }
    >
      <div className="max-w-4xl space-y-6">
        {/* Monthly Trend */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-6">Monthly Spending Trend</h2>
          {monthlyData.some(d => d.total > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barCategoryGap="20%">
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                            <p className="font-medium text-sm">{formatCurrency(payload[0].value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No spending data available
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-6">This Month by Category</h2>
          {categoryData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" barCategoryGap="15%">
                  <XAxis 
                    type="number"
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                            <p className="font-medium text-sm">{formatCurrency(payload[0].value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No spending data this month
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
