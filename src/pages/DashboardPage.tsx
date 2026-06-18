import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
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
import { Input } from "@/components/ui/input";
import { AddAccountDialog } from "@/components/AddAccountDialog";
import { ChartEmptyState } from "@/components/ChartEmptyState";
import { CustomTooltip } from "@/components/CustomTooltip";
import { FAB } from "@/components/FAB";
import { getDashboardStats } from "@/api/dashboard";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
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
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
      <div
        className={`flex size-10 items-center justify-center rounded-lg ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-xl font-bold tracking-tight">{value}</p>
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

function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const currency = user?.currency ?? "INR";

  const load = async () => {
    setIsLoading(true);
    try {
      setStats(await getDashboardStats());
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const trendData = (() => {
    if (!stats) return [];
    const map: Record<
      string,
      { month: string; Income: number; Expense: number }
    > = {};
    stats.monthly_trend.forEach(({ month, type, total }) => {
      if (!map[month]) map[month] = { month, Income: 0, Expense: 0 };
      if (type === "income") map[month].Income = total;
      if (type === "expense") map[month].Expense = total;
    });
    return Object.values(map);
  })();

  const pieData =
    stats?.expense_by_category.map((e) => ({
      name: e.category?.name ?? "Uncategorised",
      value: e.total,
    })) ?? [];

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
      <div className="rounded-2xl bg-gradient-to-br from-teal-800 via-teal-800 to-teal-900 px-6 py-7 text-white relative overflow-hidden">
        {/* decorative blobs */}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Monthly Income"
          value={formatCurrency(stats?.monthly_income ?? 0, currency)}
          icon={<ArrowDownLeft size={18} className="text-emerald-600" />}
          color="bg-emerald-50 dark:bg-emerald-950"
        />
        <StatCard
          label="Monthly Expense"
          value={formatCurrency(stats?.monthly_expense ?? 0, currency)}
          icon={<ArrowUpRight size={18} className="text-rose-600" />}
          color="bg-rose-50 dark:bg-rose-950"
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

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense trend */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Income vs Expense</h3>
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-muted-foreground" />
              <Input
                type="month"
                className="h-7 w-36 text-xs"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
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
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expense by category — donut */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Expense by Category</h3>
          {pieData.length === 0 ? (
            <ChartEmptyState message="No expense data this month" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatCurrency(v, currency)}
                  contentStyle={{ borderRadius: "8px", fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
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
                    <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
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
        onCreated={() => void load()}
      />

      <FAB onCreated={() => void load()} />
    </div>
  );
}

export default DashboardPage;
