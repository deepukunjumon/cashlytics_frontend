import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

/* ── Column definition ── */
export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

/* ── Props ── */
interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  skeletonRows?: number;
  minWidth?: string;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;

  // Pagination (all optional — omit to hide controls)
  page?: number;
  perPage?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];

  // Search (optional — omit to hide search bar)
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

const DEFAULT_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export function DataTable<T extends { id?: string; [key: string]: any }>({
  columns,
  data,
  loading = false,
  skeletonRows = 6,
  minWidth = '640px',
  emptyIcon,
  emptyMessage = 'No data found.',
  onRowClick,

  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,

  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
}: DataTableProps<T>) {
  const hasPagination = page !== undefined && total !== undefined && onPageChange;
  const hasSearch = onSearchChange !== undefined;

  // Debounced search
  const [localSearch, setLocalSearch] = useState(searchValue ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (searchValue !== undefined) setLocalSearch(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!onSearchChange) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(localSearch);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [localSearch]);

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange?.('');
  };

  const totalPages = hasPagination && perPage ? Math.max(1, Math.ceil(total / perPage)) : 1;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      {hasSearch && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9 pr-8"
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className={cn('w-full text-sm', `min-w-[${minWidth}]`)}>
            <thead className="bg-muted/50 text-muted-foreground sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={cn('text-left px-4 py-3 font-medium', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-14">
                    {emptyIcon && <div className="flex justify-center mb-3">{emptyIcon}</div>}
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIdx) => (
                  <tr
                    key={(row as any).id ?? rowIdx}
                    className={cn(
                      'hover:bg-muted/30 transition-colors',
                      onRowClick && 'cursor-pointer',
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3', col.className)}>
                        {col.render ? col.render(row, rowIdx) : (row[col.key] as React.ReactNode) ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {hasPagination && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{total} result{total !== 1 ? 's' : ''}</span>
            {onPerPageChange && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">Rows</span>
                  <Select
                    value={String(perPage)}
                    onValueChange={(v) => onPerPageChange(Number(v))}
                  >
                    <SelectTrigger className="h-7 w-[60px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {perPageOptions.map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
