interface ChartEmptyStateProps {
  message?: string;
  height?:  number;
}

export function ChartEmptyState({ message = 'No data for this period', height = 200 }: ChartEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground" style={{ height }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-30">
        <rect x="4"  y="28" width="8"  height="16" rx="2" fill="currentColor" />
        <rect x="16" y="18" width="8"  height="26" rx="2" fill="currentColor" />
        <rect x="28" y="22" width="8"  height="22" rx="2" fill="currentColor" />
        <rect x="40" y="10" width="8"  height="34" rx="2" fill="currentColor" />
        <line x1="2" y1="44" x2="46" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}
