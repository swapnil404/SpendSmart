import { useFinance } from '@/contexts/FinanceContext';
import { CategoryIcon } from './CategoryIcon';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  categoryId: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const colorMap: Record<string, string> = {
  'category-food': 'bg-category-food/15 text-category-food',
  'category-transport': 'bg-category-transport/15 text-category-transport',
  'category-shopping': 'bg-category-shopping/15 text-category-shopping',
  'category-bills': 'bg-category-bills/15 text-category-bills',
  'category-subscriptions': 'bg-category-subscriptions/15 text-category-subscriptions',
  'category-entertainment': 'bg-category-entertainment/15 text-category-entertainment',
  'category-health': 'bg-category-health/15 text-category-health',
  'category-education': 'bg-category-education/15 text-category-education',
  'category-other': 'bg-category-other/15 text-category-other',
};

export function CategoryBadge({ categoryId, showIcon = true, size = 'md' }: CategoryBadgeProps) {
  const { getCategoryById } = useFinance();
  const category = getCategoryById(categoryId);
  
  if (!category) {
    return null;
  }

  const colorClass = colorMap[category.color] || 'bg-muted text-muted-foreground';
  
  return (
    <span
      className={cn(
        'category-badge',
        colorClass,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      )}
    >
      {showIcon && <CategoryIcon name={category.icon} size={size === 'sm' ? 12 : 14} />}
      <span>{category.name}</span>
    </span>
  );
}

export function getCategoryColorClass(color: string): string {
  return colorMap[color] || 'bg-muted text-muted-foreground';
}

export function getCategoryBgColor(color: string): string {
  const bgMap: Record<string, string> = {
    'category-food': 'hsl(var(--category-food))',
    'category-transport': 'hsl(var(--category-transport))',
    'category-shopping': 'hsl(var(--category-shopping))',
    'category-bills': 'hsl(var(--category-bills))',
    'category-subscriptions': 'hsl(var(--category-subscriptions))',
    'category-entertainment': 'hsl(var(--category-entertainment))',
    'category-health': 'hsl(var(--category-health))',
    'category-education': 'hsl(var(--category-education))',
    'category-other': 'hsl(var(--category-other))',
  };
  return bgMap[color] || 'hsl(var(--muted))';
}
