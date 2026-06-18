interface CustomTooltipProps {
  active?:  boolean;
  payload?: { name: string; value: number; color: string }[];
  label?:   string;
  prefix?:  string;
}

export function CustomTooltip({ active, payload, label, prefix = '' }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background shadow-md px-3 py-2 text-sm">
      {label && <p className="font-medium text-foreground mb-1">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-muted-foreground">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span>{entry.name}:</span>
          <span className="font-medium text-foreground">
            {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
