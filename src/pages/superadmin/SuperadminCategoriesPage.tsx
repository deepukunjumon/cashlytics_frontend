import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/api/axios';
import { getErrorMessage } from '@/lib/utils';
import type { Category } from '@/types';

function SuperadminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'expense' as 'income' | 'expense', color: '#6366f1', icon: 'tag' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get<{ data: Category[] }>('/superadmin/categories');
      setCategories(res.data.data);
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { void fetchCategories(); }, []);

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      await api.post('/superadmin/categories', form);
      await fetchCategories();
      setDialogOpen(false);
      setForm({ name: '', type: 'expense', color: '#6366f1', icon: 'tag' });
      toast.success('Category added.');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/superadmin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category deleted.');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const income  = categories.filter((c) => c.type === 'income');
  const expense = categories.filter((c) => c.type === 'expense');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Categories</h1>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="space-y-6">
          {[{ title: 'Income', items: income }, { title: 'Expense', items: expense }].map(({ title, items }) => (
            <div key={title}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{title}</h2>
              <div className="rounded-xl border bg-card divide-y">
                {items.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-5 py-3 group">
                    <div className="flex items-center gap-3">
                      <div className="size-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: c.color }}>{c.name[0].toUpperCase()}</div>
                      <span className="text-sm">{c.name}</span>
                    </div>
                    <button onClick={() => void handleDelete(c.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No {title.toLowerCase()} categories.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add System Category</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'income' | 'expense' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Color</Label>
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-9 px-1 py-1" />
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Add Category'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SuperadminCategoriesPage;
