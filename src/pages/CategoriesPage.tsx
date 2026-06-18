import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { createCategory, deleteCategory, getCategories } from '@/api/categories';
import { getErrorMessage } from '@/lib/utils';
import type { Category } from '@/types';

const schema = z.object({
  name:  z.string().min(1, 'Required').max(255),
  type:  z.enum(['income', 'expense']),
  color: z.string().optional(),
  icon:  z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'expense', color: '#6366f1' },
  });

  useEffect(() => {
    void (async () => {
      try { setCategories(await getCategories()); }
      catch (e) { toast.error(getErrorMessage(e)); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      const cat = await createCategory(data);
      setCategories((prev) => [...prev, cat]);
      setDialogOpen(false);
      reset({ type: 'expense', color: '#6366f1' });
      toast.success('Category created.');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category deleted.');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const income  = categories.filter((c) => c.type === 'income');
  const expense = categories.filter((c) => c.type === 'expense');

  const CategoryGroup = ({ title, items }: { title: string; items: Category[] }) => (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">{title}</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 group">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: cat.color }}>
                {cat.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                {cat.is_system && <span className="text-xs text-muted-foreground">System</span>}
              </div>
            </div>
            {!cat.is_system && (
              <button onClick={() => void handleDelete(cat.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="space-y-8">
          <CategoryGroup title="Income" items={income} />
          <CategoryGroup title="Expense" items={expense} />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...register('name')} placeholder="Category name" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select onValueChange={(v) => setValue('type', v as 'income' | 'expense')} defaultValue="expense">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Color</Label>
              <Input type="color" {...register('color')} className="h-9 px-1 py-1" />
            </div>
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Create Category'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CategoriesPage;
