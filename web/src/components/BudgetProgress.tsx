import { cn } from '@/lib/utils';

interface BudgetProgressProps {
  spent: number;
  total: number;
  label?: string;
  showAmount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BudgetProgress({ 
  spent, 
  total, 
  label, 
  showAmount = true, 
  size = 'md' 
}: BudgetProgressProps) {
  const percentage = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
  const isOver = spent > total;
  const isWarning = percentage >= 80 && !isOver;
  
  const getColor = () => {
    if (isOver) return 'bg-destructive';
    if (isWarning) return 'bg-warning';
    return 'bg-primary';
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="space-y-1.5">
      {(label || showAmount) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showAmount && (
            <span className={cn(
              'text-xs font-medium',
              isOver ? 'text-destructive' : isWarning ? 'text-warning' : 'text-muted-foreground'
            )}>
              {percentage.toFixed(0)}% used
            </span>
          )}
        </div>
      )}
      <div className={cn('budget-progress', sizeClasses[size])}>
        <div
          className={cn('budget-progress-bar', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
