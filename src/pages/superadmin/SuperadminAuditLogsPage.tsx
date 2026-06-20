import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-picker';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { getAuditLogs, type AuditLogFilters } from '@/api/superadmin';
import { formatDate, getErrorMessage } from '@/lib/utils';
import type { AuditLog } from '@/types';

export default function SuperadminAuditLogsPage() {
  const [logs,    setLogs]    = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState('');
  const [filters, setFilters] = useState<AuditLogFilters>({});

  const load = async (p = page, pp = perPage, q = search) => {
    setLoading(true);
    try {
      const params: AuditLogFilters = { ...filters, page: p, per_page: pp };
      if (q) params.action = q;
      const res = await getAuditLogs(params);
      setLogs(res.data ?? []);
      setTotal(res.total ?? res.meta?.total ?? 0);
      setPage(p);
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(1); }, []);

  const handleSearch = (q: string) => {
    setSearch(q);
    void load(1, perPage, q);
  };

  const handlePageChange = (p: number) => void load(p);

  const handlePerPageChange = (pp: number) => {
    setPerPage(pp);
    void load(1, pp);
  };

  const handleFilter = () => void load(1);

  const columns: DataTableColumn<AuditLog>[] = [
    {
      key: 'action',
      header: 'Action',
      render: (log) => (
        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{log.action}</span>
      ),
    },
    {
      key: 'user_id',
      header: 'User',
      render: (log) => <span className="text-muted-foreground">{log.user_id ?? '—'}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      className: 'max-w-xs',
      render: (log) => <span className="text-muted-foreground truncate block max-w-xs">{log.description ?? '—'}</span>,
    },
    {
      key: 'ip_address',
      header: 'IP',
      render: (log) => <span className="text-muted-foreground font-mono text-xs">{log.ip_address ?? '—'}</span>,
    },
    {
      key: 'created_at',
      header: 'Time',
      render: (log) => <span className="text-muted-foreground text-xs">{formatDate(log.created_at)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">Track all system activity and user actions.</p>
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap items-center gap-3">
        <DateRangePicker
          startDate={filters.start_date}
          endDate={filters.end_date}
          onStartChange={(v) => setFilters((f) => ({ ...f, start_date: v }))}
          onEndChange={(v) => setFilters((f) => ({ ...f, end_date: v }))}
          disableFuture
        />
        <Button onClick={handleFilter} size="sm">Filter</Button>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        skeletonRows={8}
        emptyMessage="No audit logs found."
        searchValue={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Filter by action..."
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />
    </div>
  );
}
