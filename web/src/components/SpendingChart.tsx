import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, getCurrentMonth } from '@/lib/data';
import { getCategoryBgColor } from './CategoryBadge';

interface SpendingChartProps {
  month?: string;
}

export function SpendingChart({ month }: SpendingChartProps) {
  const { transactions, categories } = useFinance();
  const targetMonth = month || getCurrentMonth();

  const chartData = useMemo(() => {
    const monthTx = transactions.filter(tx => tx.date.startsWith(targetMonth));
    const byCategory: Record<string, number> = {};
    
    monthTx.forEach(tx => {
      byCategory[tx.categoryId] = (byCategory[tx.categoryId] || 0) + tx.amount;
    });

    return Object.entries(byCategory)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          name: category?.name || 'Unknown',
          value: amount,
          color: category ? getCategoryBgColor(category.color) : 'hsl(var(--muted))',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, targetMonth]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>No spending data this month</p>
        <p className="text-sm mt-1">Add transactions to see your breakdown</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                      <p className="font-medium text-sm">{data.name}</p>
                      <p className="text-muted-foreground text-xs">{formatCurrency(data.value)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 space-y-2 w-full max-w-xs">
        {chartData.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-foreground">{item.name}</span>
            </div>
            <div className="text-right">
              <span className="font-medium">{formatCurrency(item.value)}</span>
              <span className="text-muted-foreground ml-2">
                ({((item.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
        {chartData.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{chartData.length - 5} more categories
          </p>
        )}
      </div>
    </div>
  );
}
