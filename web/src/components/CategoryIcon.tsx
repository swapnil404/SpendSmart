import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

type IconName = keyof typeof LucideIcons;

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({ name, className, size = 16 }: CategoryIconProps) {
  const IconComponent = LucideIcons[name as IconName] as LucideIcon;
  
  if (!IconComponent) {
    return <LucideIcons.Circle className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
}

export const AVAILABLE_ICONS = [
  'UtensilsCrossed',
  'Car',
  'ShoppingBag',
  'Receipt',
  'Repeat',
  'Gamepad2',
  'Heart',
  'GraduationCap',
  'MoreHorizontal',
  'Home',
  'Plane',
  'Gift',
  'Coffee',
  'Book',
  'Music',
  'Camera',
  'Smartphone',
  'Wifi',
  'Zap',
  'Droplet',
  'Dumbbell',
  'Baby',
  'Dog',
  'TreePine',
  'Scissors',
  'Palette',
  'Wrench',
] as const;
