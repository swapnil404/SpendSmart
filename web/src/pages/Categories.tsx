import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { CategoryIcon, AVAILABLE_ICONS } from '@/components/CategoryIcon';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS = [
  { id: 'category-food', name: 'Orange' },
  { id: 'category-transport', name: 'Blue' },
  { id: 'category-shopping', name: 'Purple' },
  { id: 'category-bills', name: 'Yellow' },
  { id: 'category-subscriptions', name: 'Pink' },
  { id: 'category-entertainment', name: 'Teal' },
  { id: 'category-health', name: 'Red' },
  { id: 'category-education', name: 'Indigo' },
  { id: 'category-other', name: 'Gray' },
];

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [color, setColor] = useState('category-other');
  const [icon, setIcon] = useState('Circle');

  const resetForm = () => {
    setName('');
    setColor('category-other');
    setIcon('Circle');
  };

  const handleAdd = () => {
    if (!name.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    addCategory({ name: name.trim(), color, icon });
    toast({ title: 'Category created' });
    resetForm();
    setIsAdding(false);
  };

  const handleEdit = () => {
    if (editingId && name.trim()) {
      updateCategory(editingId, { name: name.trim(), color, icon });
      toast({ title: 'Category updated' });
      resetForm();
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    toast({ title: 'Category deleted' });
    setDeleteConfirm(null);
  };

  const openEditDialog = (cat: typeof categories[0]) => {
    setName(cat.name);
    setColor(cat.color);
    setIcon(cat.icon);
    setEditingId(cat.id);
  };

  return (
    <AppLayout
      title="Categories"
      subtitle="Organize your expenses"
      actions={
        <Button onClick={() => { resetForm(); setIsAdding(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      }
    >
      <div className="max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group rounded-xl border p-4 shadow-card hover:shadow-md transition-all"
              style={{ 
                backgroundColor: `hsl(var(--${category.color}) / 0.1)`,
                borderColor: `hsl(var(--${category.color}) / 0.3)`
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{ backgroundColor: getCategoryBgColor(category.color) + '20' }}
                  >
                    <span style={{ color: getCategoryBgColor(category.color) }}>
                      <CategoryIcon name={category.icon} size={20} />
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.isDefault ? 'Default' : 'Custom'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(category)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {!category.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirm(category.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAdding || !!editingId} onOpenChange={() => { setIsAdding(false); setEditingId(null); resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      color === c.id ? 'ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'
                    )}
                    style={{ backgroundColor: getCategoryBgColor(c.id) }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                {AVAILABLE_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      'p-2 rounded-lg transition-all',
                      icon === iconName
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    )}
                  >
                    <CategoryIcon name={iconName} size={18} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={editingId ? handleEdit : handleAdd}>
              {editingId ? 'Save Changes' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. Transactions using this category won't be deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
