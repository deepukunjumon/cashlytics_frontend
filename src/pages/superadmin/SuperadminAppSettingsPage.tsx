import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { getAppSettings, updateAppSettings } from '@/api/superadmin';
import { getErrorMessage } from '@/lib/utils';

type SettingEntry = { value: string; type: string; is_public: boolean };
type GroupedSettings = Record<string, Record<string, SettingEntry>>;

export default function SuperadminAppSettingsPage() {
  const [settings, setSettings] = useState<GroupedSettings>({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [local,    setLocal]    = useState<Record<string, string>>({});

  useEffect(() => {
    void (async () => {
      try {
        const data = await getAppSettings();
        setSettings(data);
        const flat: Record<string, string> = {};
        Object.values(data).forEach((group) => {
          Object.entries(group).forEach(([key, entry]) => {
            flat[key] = String(entry.value);
          });
        });
        setLocal(flat);
      } catch (e) { toast.error(getErrorMessage(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(local).map(([key, value]) => ({ key, value }));
      await updateAppSettings(payload);
      toast.success('Settings saved.');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const groupLabels: Record<string, string> = {
    general: 'General',
    sso:     'SSO / OAuth',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">App Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure system-wide application settings.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {Object.entries(settings).map(([group, entries]) => (
        <div key={group} className="rounded-lg border p-5 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            {groupLabels[group] ?? group}
          </h2>
          {Object.entries(entries).map(([key, entry]) => (
            <div key={key} className="space-y-1.5">
              <Label className="capitalize text-sm">{key.replace(/_/g, ' ')}</Label>
              {entry.type === 'boolean' ? (
                <select
                  value={local[key] ?? 'false'}
                  onChange={(e) => setLocal((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              ) : key.includes('secret') ? (
                <PasswordInput
                  value={local[key] ?? ''}
                  onChange={(e) => setLocal((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                />
              ) : (
                <Input
                  value={local[key] ?? ''}
                  onChange={(e) => setLocal((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                />
              )}
              {entry.is_public && (
                <p className="text-xs text-muted-foreground">Visible to public (frontend)</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
