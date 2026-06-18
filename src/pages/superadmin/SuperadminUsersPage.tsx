import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { api } from '@/api/axios';
import { getErrorMessage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AdminUser {
  id:            string;
  name:          string;
  email:         string;
  role:          string;
  currency:      string;
  deleted_at:    string | null;
  last_login_at: string | null;
  created_at:    string;
  accounts_count?: number;
}

function SuperadminUsersPage() {
  const [users,     setUsers]     = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get<{ data: { data: AdminUser[] } }>('/superadmin/users');
      setUsers(res.data.data.data ?? res.data.data);
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { void fetchUsers(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/superadmin/users/${id}`);
      await fetchUsers();
      toast.success('User deactivated.');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const handleRestore = async (id: string) => {
    try {
      await api.post(`/superadmin/users/${id}/restore`);
      await fetchUsers();
      toast.success('User restored.');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/superadmin/users/${id}/toggle-status`);
      await fetchUsers();
      toast.success('User status updated.');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : 'Never';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground text-sm mt-1">{users.length} total users</p>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Accounts</th>
              <th className="text-left px-4 py-3 font-medium">Last Login</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted-foreground py-12">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className={`hover:bg-muted/30 transition-colors ${u.deleted_at ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === 'superadmin'
                      ? <Badge variant="secondary" className="text-xs">Superadmin</Badge>
                      : <span className="text-muted-foreground capitalize">{u.role}</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.accounts_count ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(u.last_login_at)}</td>
                  <td className="px-4 py-3">
                    {u.deleted_at
                      ? <Badge variant="destructive" className="text-xs">Inactive</Badge>
                      : <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">Active</Badge>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        title={u.deleted_at ? 'Activate' : 'Deactivate'}
                        onClick={() => u.deleted_at ? void handleRestore(u.id) : void handleToggle(u.id)}
                      >
                        {u.deleted_at
                          ? <ToggleLeft size={16} className="text-muted-foreground" />
                          : <ToggleRight size={16} className="text-emerald-600" />
                        }
                      </Button>
                      {u.role !== 'superadmin' && !u.deleted_at && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          title="Delete user"
                          onClick={() => void handleDelete(u.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SuperadminUsersPage;
