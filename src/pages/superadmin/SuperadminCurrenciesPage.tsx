import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/api/axios';
import { getErrorMessage } from '@/lib/utils';
import type { Currency } from '@/types';

function SuperadminCurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: '', symbol: '', name: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchCurrencies = async () => {
    try {
      const res = await api.get<{ data: Currency[] }>('/superadmin/currencies');
      setCurrencies(res.data.data);
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { void fetchCurrencies(); }, []);

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      await api.post('/superadmin/currencies', form);
      await fetchCurrencies();
      setDialogOpen(false);
      setForm({ code: '', symbol: '', name: '' });
      toast.success('Currency added.');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setIsSaving(false); }
  };

  const handleToggle = async (id: string, is_active: boolean) => {
    try {
      await api.put(`/superadmin/currencies/${id}`, { is_active: !is_active });
      await fetchCurrencies();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Currencies</h1>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus size={16} /> Add Currency
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 rounded bg-muted animate-pulse" />)}</div>
        ) : (
          <div className="divide-y">
            {currencies.map((c) => (
              <div key={c.id} className={`flex items-center justify-between px-5 py-3 ${!c.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold w-8">{c.symbol}</span>
                  <div>
                    <p className="text-sm font-medium">{c.code}</p>
                    <p className="text-xs text-muted-foreground">{c.name}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs"
                  onClick={() => void handleToggle(c.id, c.is_active)}>
                  {c.is_active ? 'Disable' : 'Enable'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Currency</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Code (e.g. USD)</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="USD" maxLength={10} />
            </div>
            <div className="space-y-1">
              <Label>Symbol</Label>
              <Input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="$" />
            </div>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="US Dollar" />
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Add Currency'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SuperadminCurrenciesPage;
