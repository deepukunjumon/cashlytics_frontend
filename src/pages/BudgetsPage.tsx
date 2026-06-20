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
import { createBudget, deleteBudget, getBudgets } from '@/api/budgets';
import { getCategories } from '@/api/categories';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, getErrorMessage } from '@/lib/utils';
import type { Budget, Category } from '@/types';

const schema = z.object({
  category_id: z.string().min(1, 'Required'),
  amount:      z.coerce.number().positive('Must be positive'),
});
type FormValues = z.infer<typeof schema>;

function BudgetsPage() {
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency ?? 'INR';
  const now = new Date();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  });

  const fetchBudgets = async () => {
    try {
      const [b, c] = await Promise.all([
        getBudgets(now.getFullYear(), now.getMonth() + 1),
        getCategories(),
      ]);
      setBudgets(b);
      setCategories(c.filter((c) => c.type === 'expense'));
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { void fetchBudgets(); }, []);

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      await createBudget({
        ...data,
        period: 'monthly',
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      });
      await fetchBudgets();
      setDialogOpen(false);
      reset();
      toast.success('Budget created.');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      toast.success('Budget deleted.');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus size={16} /> Add Budget
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : budgets.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-14 text-center text-sm text-muted-foreground">
          No budgets set for this month.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {budgets.map((b) => (
            <div key={b.id} className="rounded-xl border bg-card p-5 space-y-3 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: b.category?.color ?? '#6366f1' }}>
                    {(b.category?.name ?? 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{b.category?.name ?? 'Unknown'}</span>
                </div>
                <button onClick={() => void handleDelete(b.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Spent: {formatCurrency(b.spent ?? 0, currency)}</span>
                  <span>Budget: {formatCurrency(b.amount, currency)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${(b.percent ?? 0) >= 100 ? 'bg-destructive' : (b.percent ?? 0) >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, b.percent ?? 0)}%` }}
                  />
                </div>
                <p className="text-xs text-right text-muted-foreground">{b.percent ?? 0}% used</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Budget</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Category</Label>
              <Select onValueChange={(v) => setValue('category_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select expense category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Amount ({currency})</Label>
              <Input type="number" step="0.01" min="0.01" {...register('amount')} placeholder="0.00" />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Create Budget'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BudgetsPage;
