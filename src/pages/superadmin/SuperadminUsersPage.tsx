import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { api } from '@/api/axios';
import { formatDate, getErrorMessage } from '@/lib/utils';

interface AdminUser {
  id:              string;
  name:            string;
  email:           string;
  role:            string;
  currency:        string;
  profile_picture: string | null;
  deleted_at:      string | null;
  last_login_at:   string | null;
  created_at:      string;
  accounts_count?: number;
}

function SuperadminUsersPage() {
  const [users,     setUsers]     = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page,      setPage]      = useState(1);
  const [perPage,   setPerPage]   = useState(20);
  const [total,     setTotal]     = useState(0);
  const [search,    setSearch]    = useState('');

  const fetchUsers = async (p = page, pp = perPage, q = search) => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page: p, per_page: pp };
      if (q) params.q = q;
      const res = await api.get('/superadmin/users', { params });
      const payload = res.data?.data;
      setUsers(payload?.data ?? payload ?? []);
      setTotal(payload?.total ?? 0);
      setPage(p);
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { void fetchUsers(); }, []);

  const handleSearch = (q: string) => {
    setSearch(q);
    void fetchUsers(1, perPage, q);
  };

  const handlePageChange = (p: number) => void fetchUsers(p);

  const handlePerPageChange = (pp: number) => {
    setPerPage(pp);
    void fetchUsers(1, pp);
  };

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

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          {u.profile_picture ? (
            <img src={u.profile_picture} alt={u.name} className="size-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-semibold text-muted-foreground select-none">
              {u.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{u.name}</p>
            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => u.role === 'superadmin'
        ? <Badge variant="secondary" className="text-xs">Superadmin</Badge>
        : <span className="text-muted-foreground capitalize">{u.role}</span>,
    },
    {
      key: 'accounts_count',
      header: 'Accounts',
      render: (u) => <span className="text-muted-foreground">{u.accounts_count ?? '—'}</span>,
    },
    {
      key: 'last_login_at',
      header: 'Last Login',
      render: (u) => <span className="text-muted-foreground text-xs">{u.last_login_at ? formatDate(u.last_login_at) : 'Never'}</span>,
    },
    {
      key: 'deleted_at',
      header: 'Status',
      render: (u) => u.deleted_at
        ? <Badge variant="destructive" className="text-xs">Inactive</Badge>
        : <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">Active</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Switch
            checked={!u.deleted_at}
            onCheckedChange={() => u.deleted_at ? void handleRestore(u.id) : void handleToggle(u.id)}
            disabled={u.role === 'superadmin'}
            className="cursor-pointer data-[state=checked]:bg-emerald-500"
            aria-label={u.deleted_at ? 'Activate user' : 'Deactivate user'}
          />
          {u.role !== 'superadmin' && !u.deleted_at && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
              title="Delete user"
              onClick={(e) => { e.stopPropagation(); void handleDelete(u.id); }}
            >
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground text-sm mt-1">{total} total users</p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        skeletonRows={5}
        emptyMessage="No users found."
        searchValue={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Search by name or email..."
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />
    </div>
  );
}

export default SuperadminUsersPage;
