import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download, Mail, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DateRangePicker } from '@/components/ui/date-picker';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { getEmailLogs, getEmailLog, exportEmailLogsCsv, exportEmailLogsPdf, type EmailLogFilters } from '@/api/superadmin';
import { formatDate, getErrorMessage } from '@/lib/utils';
import type { EmailLog } from '@/types';

export default function SuperadminEmailLogsPage() {
  const [logs,    setLogs]    = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState('');
  const [filters, setFilters] = useState<EmailLogFilters>({});

  const [detailLog, setDetailLog] = useState<EmailLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async (p = page, pp = perPage, q = search) => {
    setLoading(true);
    try {
      const params: EmailLogFilters = { ...filters, page: p, per_page: pp };
      if (q) params.q = q;
      const result = await getEmailLogs(params);
      setLogs(result.data ?? []);
      setTotal((result as any).total ?? result.meta?.total ?? 0);
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

  const handleClear = () => {
    setSearch('');
    setFilters({});
    void load(1, perPage, '');
  };

  const openDetail = async (row: EmailLog) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      setDetailLog(await getEmailLog(row.id));
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setDetailLoading(false); }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvExport = async () => {
    try {
      const params: EmailLogFilters = { ...filters };
      if (search) params.q = search;
      downloadBlob(await exportEmailLogsCsv(params), 'email_logs.csv');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const handlePdfExport = async () => {
    try {
      const params: EmailLogFilters = { ...filters };
      if (search) params.q = search;
      downloadBlob(await exportEmailLogsPdf(params), 'email_logs.pdf');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const hasFilters = filters.status || filters.template || filters.channel || filters.start_date || filters.end_date;

  const columns: DataTableColumn<EmailLog>[] = [
    { key: 'recipient', header: 'Recipient', render: (log) => <span className="font-medium">{log.recipient}</span> },
    { key: 'subject', header: 'Subject', className: 'max-w-[200px]', render: (log) => <span className="text-muted-foreground truncate block max-w-[200px]">{log.subject}</span> },
    {
      key: 'template', header: 'Template',
      render: (log) => log.template
        ? <Badge variant="secondary" className="text-xs capitalize">{log.template.replace(/_/g, ' ')}</Badge>
        : <span className="text-muted-foreground">—</span>,
    },
    { key: 'channel', header: 'Channel', render: (log) => <span className="capitalize text-muted-foreground">{log.channel}</span> },
    {
      key: 'status', header: 'Status',
      render: (log) => log.status === 'sent'
        ? <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">Sent</Badge>
        : <Badge variant="destructive" className="text-xs">Failed</Badge>,
    },
    { key: 'sent_at', header: 'Sent At', render: (log) => <span className="text-muted-foreground text-xs">{formatDate(log.sent_at)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">Track all outgoing email notifications</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-end">
          <Select value={filters.status ?? ''} onValueChange={(v) => setFilters((f) => ({ ...f, status: v || undefined }))}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.template ?? ''} onValueChange={(v) => setFilters((f) => ({ ...f, template: v || undefined }))}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Template" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="password_changed">Password Changed</SelectItem>
              <SelectItem value="transaction_alert">Transaction Alert</SelectItem>
              <SelectItem value="budget_exceeded">Budget Exceeded</SelectItem>
              <SelectItem value="account_deactivated">Account Deactivated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.channel ?? ''} onValueChange={(v) => setFilters((f) => ({ ...f, channel: v || undefined }))}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Channel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <DateRangePicker
            startDate={filters.start_date}
            endDate={filters.end_date}
            onStartChange={(v) => setFilters((f) => ({ ...f, start_date: v }))}
            onEndChange={(v) => setFilters((f) => ({ ...f, end_date: v }))}
            disableFuture
          />

          <Button onClick={handleFilter} size="sm">Filter</Button>

          {hasFilters && (
            <Button onClick={handleClear} variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <X size={14} /> Clear
            </Button>
          )}

          <div className="ml-auto flex gap-2">
            <Button onClick={handleCsvExport} variant="outline" size="sm" className="gap-1.5">
              <Download size={14} /> CSV
            </Button>
            <Button onClick={handlePdfExport} variant="outline" size="sm" className="gap-1.5">
              <Download size={14} /> PDF
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        skeletonRows={8}
        minWidth="700px"
        emptyIcon={<Mail className="size-10 text-muted-foreground/30" />}
        emptyMessage="No email logs found."
        onRowClick={openDetail}
        searchValue={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Search recipient or subject..."
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Email Log Details</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : detailLog ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Recipient</p>
                  <p className="font-medium">{detailLog.recipient}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Status</p>
                  {detailLog.status === 'sent'
                    ? <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">Sent</Badge>
                    : <Badge variant="destructive" className="text-xs">Failed</Badge>
                  }
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs mb-0.5">Subject</p>
                  <p className="font-medium">{detailLog.subject}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Template</p>
                  <p className="capitalize">{detailLog.template?.replace(/_/g, ' ') ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Channel</p>
                  <p className="capitalize">{detailLog.channel}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs mb-0.5">Sent At</p>
                  <p>{detailLog.sent_at ? formatDate(detailLog.sent_at) : '—'}</p>
                </div>
              </div>

              {detailLog.error_message && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-xs font-medium text-destructive mb-1">Error</p>
                  <p className="text-xs text-destructive/80 break-all">{detailLog.error_message}</p>
                </div>
              )}

              {detailLog.metadata && Object.keys(detailLog.metadata).length > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1.5">Metadata</p>
                  <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto">
                    {JSON.stringify(detailLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
