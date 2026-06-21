import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Download,
  Folder,
  PiggyBank,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/ui/date-picker";
import { AddAccountDialog } from "@/components/AddAccountDialog";
import { ChartEmptyState } from "@/components/ChartEmptyState";
import { CustomTooltip } from "@/components/CustomTooltip";
import { FAB } from "@/components/FAB";
import { getDashboardStats } from "@/api/dashboard";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatDate, formatTime, getErrorMessage } from "@/lib/utils";
import type { Account, AccountType, DashboardStats } from "@/types";

const ACCOUNT_TYPE_CONFIG: Record<
  AccountType,
  { label: string; Icon: React.ElementType; color: string; bg: string }
> = {
  cash: {
    label: "Cash",
    Icon: Wallet,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  credit_card: {
    label: "Credit Card",
    Icon: CreditCard,
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950",
  },
  savings_account: {
    label: "Savings Account",
    Icon: PiggyBank,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  investments: {
    label: "Investments",
    Icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950",
  },
  other: {
    label: "Other",
    Icon: Folder,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
};

const CHART_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
];

function StatCard({
  label,
  value,
  icon,
  color,
  onClick,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-3 sm:p-5 flex items-center gap-2.5 sm:gap-4 ${onClick ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div
        className={`flex size-8 sm:size-10 items-center justify-center rounded-lg shrink-0 ${color}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm sm:text-xl font-bold tracking-tight truncate">{value}</p>
      </div>
    </div>
  );
}

function AccountCard({
  account,
  currency,
}: {
  account: Account;
  currency: string;
}) {
  const config = ACCOUNT_TYPE_CONFIG[account.type];
  const { Icon } = config;
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className="flex size-10 items-center justify-center rounded-lg"
          style={
            account.color
              ? { backgroundColor: account.color + "22", color: account.color }
              : undefined
          }
        >
          <Icon className={`size-5 ${!account.color ? config.color : ""}`} />
        </div>
        <span className="text-xs text-muted-foreground rounded-full border px-2 py-0.5">
          {config.label}
        </span>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-0.5">{account.name}</p>
        <p className="text-xl font-bold tracking-tight">
          {formatCurrency(account.balance, currency)}
        </p>
      </div>
    </div>
  );
}

async function downloadCardAsImage(container: HTMLElement, filename: string) {
  const { toPng } = await import('html-to-image');
  try {
    const dataUrl = await toPng(container, {
      pixelRatio: 2,
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
        ? (document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#ffffff')
        : '#ffffff',
      filter: (node) => {
        if (node instanceof HTMLElement && node.hasAttribute('data-download-hide')) return false;
        return true;
      },
    });
    const a = document.createElement('a');
    a.download = filename;
    a.href = dataUrl;
    a.click();
  } catch {
    // fallback silently
  }
}

function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const currency = user?.currency ?? "INR";

  const barChartRef = useRef<HTMLDivElement>(null);
  const expensePieRef = useRef<HTMLDivElement>(null);
  const categoryPieRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (month?: string, showSkeleton = true) => {
    if (showSkeleton) setIsLoading(true);
    try {
      setStats(await getDashboardStats(month || undefined));
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleMonthChange = async (v: string) => {
    setSelectedMonth(v);
    setChartLoading(true);
    try {
      const monthStats = await getDashboardStats(v || undefined);
      setStats((prev) => prev ? {
        ...prev,
        monthly_income:       monthStats.monthly_income,
        monthly_expense:      monthStats.monthly_expense,
        monthly_trend:        monthStats.monthly_trend,
        expense_by_category:  monthStats.expense_by_category,
        all_by_category:      monthStats.all_by_category,
      } : monthStats);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setChartLoading(false);
    }
  };

  const trendData = (() => {
    if (!stats) return [];
    const map: Record<
      string,
      { month: string; Income: number; Expense: number }
    > = {};
    stats.monthly_trend.forEach(({ month, type, total }) => {
      if (!map[month]) map[month] = { month, Income: 0, Expense: 0 };
      if (type === "income") map[month].Income = Number(total);
      if (type === "expense") map[month].Expense = Number(total);
    });
    return Object.values(map);
  })();

  const expensePieData =
    stats?.expense_by_category.map((e) => ({
      name: e.category?.name ?? "Uncategorised",
      value: Number(e.total),
    })) ?? [];

  const incomeByCategoryData = (() => {
    if (!stats?.all_by_category) return [];
    return stats.all_by_category
      .filter((e) => e.type === 'income')
      .map((e) => ({ name: e.category?.name ?? 'Uncategorised', value: Number(e.total) }))
      .sort((a, b) => b.value - a.value);
  })();

  const expenseByCategoryData = (() => {
    if (!stats?.all_by_category) return [];
    return stats.all_by_category
      .filter((e) => e.type === 'expense')
      .map((e) => ({ name: e.category?.name ?? 'Uncategorised', value: Number(e.total) }))
      .sort((a, b) => b.value - a.value);
  })();

  const hasAnyCategoryData = incomeByCategoryData.length > 0 || expenseByCategoryData.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 rounded-xl bg-muted" />
          <div className="h-20 rounded-xl bg-muted" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 px-6 py-7 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0z\' fill=\'none\'/%3E%3Cpath d=\'M0 10h20M10 0v20\' stroke=\'%23fff\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }}
        />
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <p className="text-sm text-white/60 mb-1 relative">Total balance</p>
        <p className="text-3xl font-bold tracking-tight relative">
          {formatCurrency(stats?.total_balance ?? 0, currency)}
        </p>
        <p className="text-xs text-white/50 mt-2 relative">
          Across {stats?.accounts.length ?? 0}{" "}
          {stats?.accounts.length === 1 ? "account" : "accounts"}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Monthly Income"
          value={formatCurrency(stats?.monthly_income ?? 0, currency)}
          icon={<ArrowDownLeft size={18} className="text-emerald-600" />}
          color="bg-emerald-50 dark:bg-emerald-950"
          onClick={() => {
            const m = selectedMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
            navigate(`/transactions?type=income&month=${m}`);
          }}
        />
        <StatCard
          label="Monthly Expense"
          value={formatCurrency(stats?.monthly_expense ?? 0, currency)}
          icon={<ArrowUpRight size={18} className="text-rose-600" />}
          color="bg-rose-50 dark:bg-rose-950"
          onClick={() => {
            const m = selectedMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
            navigate(`/transactions?type=expense&month=${m}`);
          }}
        />
      </div>

      {/* Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">My Accounts</h2>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setDialogOpen(true)}
          >
            <Plus size={14} />
            Add account
          </Button>
        </div>
        {(stats?.accounts.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">No accounts yet.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={() => setDialogOpen(true)}
            >
              <Plus size={14} /> Add your first account
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {stats?.accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                currency={currency}
              />
            ))}
          </div>
        )}
      </div>

      {/* Month picker shared across charts */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Charts & Insights</h2>
        <MonthPicker
          value={selectedMonth}
          onChange={handleMonthChange}
          placeholder="This month"
          clearable
          disableFuture
          className="h-8 w-40 text-xs"
        />
      </div>

      {/* Charts row */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity ${chartLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Income vs Expense trend */}
        <div ref={barChartRef} className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Income vs Expense</h3>
            {trendData.length > 0 && (
              <Button
                data-download-hide
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-7 cursor-pointer"
                onClick={() => barChartRef.current && downloadCardAsImage(barChartRef.current, "income_vs_expense.png")}
              >
                <Download size={13} /> Download
              </Button>
            )}
          </div>
          {trendData.length === 0 ? (
            <ChartEmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} barSize={16} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={<CustomTooltip prefix="₹" />}
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expense by category — modern donut + breakdown */}
        <div ref={expensePieRef} className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Expense by Category</h3>
            {expensePieData.length > 0 && (
              <Button
                data-download-hide
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-7 cursor-pointer"
                onClick={() => expensePieRef.current && downloadCardAsImage(expensePieRef.current, "expense_by_category.png")}
              >
                <Download size={13} /> Download
              </Button>
            )}
          </div>
          {expensePieData.length === 0 ? (
            <ChartEmptyState message="No expense data this month" />
          ) : (
            <div>
              {/* Donut */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={72}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {expensePieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => formatCurrency(Number(v), currency)}
                        contentStyle={{ borderRadius: "8px", fontSize: 12, border: "1px solid var(--border)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] text-muted-foreground">Total</p>
                    <p className="text-sm font-bold">
                      {formatCurrency(expensePieData.reduce((s, d) => s + d.value, 0), currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category breakdown list */}
              <div className="space-y-2.5">
                {(() => {
                  const total = expensePieData.reduce((s, d) => s + d.value, 0);
                  return expensePieData.map((d, i) => {
                    const pct = total > 0 ? (d.value / total) * 100 : 0;
                    return (
                      <div key={d.name} className="flex items-center gap-3">
                        <div
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="text-xs flex-1 truncate">{d.name}</span>
                        <span className="text-xs font-medium tabular-nums">
                          {formatCurrency(d.value, currency)}
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-8 text-right tabular-nums">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transactions by Category — Income & Expense */}
      <div ref={categoryPieRef} className={`rounded-xl border bg-card p-5 transition-opacity ${chartLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Transactions by Category</h3>
          {hasAnyCategoryData && (
            <Button
              data-download-hide
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-7 cursor-pointer"
              onClick={() => categoryPieRef.current && downloadCardAsImage(categoryPieRef.current, "transactions_by_category.png")}
            >
              <Download size={13} /> Download
            </Button>
          )}
        </div>
        {!hasAnyCategoryData ? (
          <ChartEmptyState message="No transaction data this month" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-6">
            {/* Income section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-2 rounded-full bg-emerald-500" />
                <p className="text-xs font-semibold text-emerald-600">Income</p>
                <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                  {formatCurrency(incomeByCategoryData.reduce((s, d) => s + d.value, 0), currency)}
                </span>
              </div>
              {incomeByCategoryData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No income this month</p>
              ) : (
                <>
                  <div className="flex justify-center mb-3">
                    <div className="relative">
                      <ResponsiveContainer width={130} height={130}>
                        <PieChart>
                          <Pie data={incomeByCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={58} paddingAngle={3} strokeWidth={0}>
                            {incomeByCategoryData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={{ borderRadius: "8px", fontSize: 11, border: "1px solid var(--border)" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[9px] text-muted-foreground">Total</p>
                        <p className="text-xs font-bold">{formatCurrency(incomeByCategoryData.reduce((s, d) => s + d.value, 0), currency)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const total = incomeByCategoryData.reduce((s, d) => s + d.value, 0);
                      return incomeByCategoryData.map((d, i) => {
                        const pct = total > 0 ? (d.value / total) * 100 : 0;
                        return (
                          <div key={d.name} className="flex items-center gap-2">
                            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-xs flex-1 truncate">{d.name}</span>
                            <span className="text-[11px] font-medium tabular-nums">{formatCurrency(d.value, currency)}</span>
                            <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-7 text-right tabular-nums">{pct.toFixed(0)}%</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="hidden md:block bg-border" />
            <hr className="md:hidden border-border" />

            {/* Expense section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-2 rounded-full bg-rose-500" />
                <p className="text-xs font-semibold text-rose-600">Expense</p>
                <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                  {formatCurrency(expenseByCategoryData.reduce((s, d) => s + d.value, 0), currency)}
                </span>
              </div>
              {expenseByCategoryData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No expenses this month</p>
              ) : (
                <>
                  <div className="flex justify-center mb-3">
                    <div className="relative">
                      <ResponsiveContainer width={130} height={130}>
                        <PieChart>
                          <Pie data={expenseByCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={58} paddingAngle={3} strokeWidth={0}>
                            {expenseByCategoryData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={{ borderRadius: "8px", fontSize: 11, border: "1px solid var(--border)" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[9px] text-muted-foreground">Total</p>
                        <p className="text-xs font-bold">{formatCurrency(expenseByCategoryData.reduce((s, d) => s + d.value, 0), currency)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const total = expenseByCategoryData.reduce((s, d) => s + d.value, 0);
                      return expenseByCategoryData.map((d, i) => {
                        const pct = total > 0 ? (d.value / total) * 100 : 0;
                        return (
                          <div key={d.name} className="flex items-center gap-2">
                            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-xs flex-1 truncate">{d.name}</span>
                            <span className="text-[11px] font-medium tabular-nums">{formatCurrency(d.value, currency)}</span>
                            <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-7 text-right tabular-nums">{pct.toFixed(0)}%</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Recent Transactions</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/transactions")}
          >
            View all
          </Button>
        </div>
        {(stats?.recent_transactions.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No transactions yet.
          </p>
        ) : (
          <div className="space-y-3">
            {stats?.recent_transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${t.type === "income" ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700" : "bg-rose-100 dark:bg-rose-900 text-rose-700"}`}
                  >
                    {t.type === "income" ? "+" : "−"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {t.category?.name ?? "Uncategorised"}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.date)}{t.time ? ` · ${formatTime(t.time)}` : ''}</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {t.type === "income" ? "+" : "−"}
                  {formatCurrency(t.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddAccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={() => void load(selectedMonth, false)}
      />

      <FAB onCreated={() => void load(selectedMonth, false)} />
    </div>
  );
}

export default DashboardPage;
