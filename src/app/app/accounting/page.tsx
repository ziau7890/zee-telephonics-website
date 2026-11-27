"use client";
import { useMemo, useState } from "react";
import { Bar, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, PiggyBank, Banknote, Download, ArrowDownLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import { invoices } from "@/lib/mock/data";
import type { Transaction } from "@/lib/mock/types";
import { PageHeader, StatCard, ChartCard, ChartTooltip, axisProps, DataTable, FilterSelect, type Column } from "@/components/dashboard/kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress, Skeleton, Avatar } from "@/components/ui/misc";
import { NativeSelect } from "@/components/ui/input";
import { timeAgo } from "@/components/dashboard/format";
import { cn, downloadFile, formatCompact, formatCurrency, formatDate, toCSV } from "@/lib/utils";

export default function AccountingPage() {
  const summary = useService(() => services.finance.summary());
  const txns = useService(() => services.finance.transactions());
  const audit = useService(() => services.finance.audit());
  const [type, setType] = useState("");
  const [cat, setCat] = useState("");
  const [currency, setCurrency] = useState("USD");
  const rate = { USD: 1, PKR: 280.4, GBP: 0.79, EUR: 0.92 }[currency] ?? 1;
  const fmt = (v: number) => formatCurrency(v * rate, currency);

  const m = summary.data?.monthly ?? [];
  const cur = m[m.length - 1];
  const prev = m[m.length - 2];
  const cashflow = m.map((x, i) => ({ month: x.month, inflow: Math.round(x.revenue * 0.94), outflow: -x.expenses, balance: 0 })).map((x, i, arr) => ({ ...x, balance: 140000 + arr.slice(0, i + 1).reduce((a, y) => a + y.inflow + y.outflow, 0) }));
  const rows = useMemo(() => (txns.data ?? []).filter((t) => (!type || t.type === type) && (!cat || t.category === cat)), [txns.data, type, cat]);

  const ar = useMemo(() => {
    const open = invoices.filter((i) => i.status !== "Paid" && i.status !== "Draft");
    const age = (d: string) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    const buckets = [["Current", (d: number) => d <= 0], ["1–30 days", (d: number) => d > 0 && d <= 30], ["31–60 days", (d: number) => d > 30 && d <= 60], ["60+ days", (d: number) => d > 60]] as const;
    return buckets.map(([label, f]) => ({ label, amount: open.filter((i) => f(age(i.dueDate))).reduce((a, i) => a + i.amount - i.paid, 0) }));
  }, []);

  const columns: Column<Transaction>[] = [
    { key: "date", header: "Date", sortValue: (t) => t.date, cell: (t) => formatDate(t.date, { month: "short", day: "numeric" }) },
    { key: "desc", header: "Description", sortValue: (t) => t.description, cell: (t) => <div><p className="font-medium">{t.description}</p><p className="text-xs text-muted-foreground">{t.reference}</p></div> },
    { key: "account", header: "Account", sortValue: (t) => t.account, cell: (t) => t.account, hideBelow: "md" },
    { key: "cat", header: "Category", sortValue: (t) => t.category, cell: (t) => t.category, hideBelow: "lg" },
    { key: "amount", header: "Amount", sortValue: (t) => (t.type === "Credit" ? t.amount : -t.amount), align: "right", cell: (t) => <span className={cn("inline-flex items-center gap-1 font-medium", t.type === "Credit" ? "text-emerald-600 dark:text-emerald-400" : "")}>{t.type === "Credit" ? <ArrowDownLeft className="size-3.5" aria-label="Credit" /> : <ArrowUpRight className="size-3.5 text-muted-foreground" aria-label="Debit" />}{t.type === "Credit" ? "+" : "−"}{fmt(t.amount)}</span> },
  ];

  return (
    <>
      <PageHeader title="Accounting & finance" description="Profit and loss, cash flow, receivables, budgets and the general ledger."
        actions={<>
          <label className="flex items-center gap-2 text-sm text-muted-foreground"><span className="hidden sm:inline">Currency</span><NativeSelect value={currency} onChange={(e) => setCurrency(e.target.value)} className="h-9 w-24" aria-label="Display currency">{["USD", "PKR", "GBP", "EUR"].map((c) => <option key={c}>{c}</option>)}</NativeSelect></label>
          <Button variant="outline" size="sm" onClick={() => { downloadFile("profit-and-loss.csv", toCSV(m)); toast.success("P&L exported"); }}><Download /> Export P&L</Button>
        </>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (MTD)" value={cur ? fmt(cur.revenue) : "—"} icon={TrendingUp} tone="blue" loading={summary.loading} delta={cur && prev ? +(((cur.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : undefined} />
        <StatCard label="Expenses (MTD)" value={cur ? fmt(cur.expenses) : "—"} icon={TrendingDown} tone="violet" loading={summary.loading} invert delta={cur && prev ? +(((cur.expenses - prev.expenses) / prev.expenses) * 100).toFixed(1) : undefined} />
        <StatCard label="Net profit" value={cur ? fmt(cur.profit) : "—"} icon={PiggyBank} tone="emerald" loading={summary.loading} deltaLabel={cur ? `${((cur.profit / cur.revenue) * 100).toFixed(1)}% margin` : undefined} delta={cur && prev ? +(((cur.profit - prev.profit) / Math.abs(prev.profit)) * 100).toFixed(1) : undefined} />
        <StatCard label="Cash balance" value={cashflow.length ? fmt(cashflow[cashflow.length - 1].balance) : "—"} icon={Banknote} tone="cyan" loading={summary.loading} hint="Operating accounts, reconciled nightly." />
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ledger">General ledger</TabsTrigger>
          <TabsTrigger value="arap">Receivables & payables</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="tax">Tax summary</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-6 xl:grid-cols-3">
            <ChartCard className="xl:col-span-2" title="Profit and loss" description="Revenue and expenses with net profit, 12 months" summary={cur ? `This month: revenue ${fmt(cur.revenue)}, expenses ${fmt(cur.expenses)}, profit ${fmt(cur.profit)}.` : ""}>
              {summary.loading ? <Skeleton className="h-[300px]" /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={m}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="month" {...axisProps} /><YAxis {...axisProps} width={52} tickFormatter={(v) => formatCompact(v * rate)} /><RTooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} content={<ChartTooltip format={(v) => fmt(v)} />} />
                    <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={14} /><Bar dataKey="expenses" name="Expenses" fill="#A78BFA" radius={[4, 4, 0, 0]} barSize={14} /><Line dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2.5} dot={false} /></ComposedChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
            <ChartCard title="Expense breakdown" description="This month by category" summary={(summary.data?.categories ?? []).map((c) => `${c.name} ${formatCurrency(c.value)}`).join(", ")}>
              {summary.loading ? <Skeleton className="h-[300px]" /> : (
                <>
                  <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={summary.data!.categories} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="none">{summary.data!.categories.map((c) => <Cell key={c.name} fill={c.color} />)}</Pie><RTooltip content={<ChartTooltip format={(v) => fmt(v)} />} /></PieChart></ResponsiveContainer>
                  <ul className="mt-2 space-y-2 px-2 text-sm">{summary.data!.categories.map((c) => <li key={c.name} className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: c.color }} /><span className="flex-1 text-muted-foreground">{c.name}</span><span className="font-medium tabular">{fmt(c.value)}</span></li>)}</ul>
                </>
              )}
            </ChartCard>
            <ChartCard className="xl:col-span-3" title="Cash flow" description="Operating cash balance with monthly inflows and outflows" summary={cashflow.length ? `Cash balance is ${fmt(cashflow[cashflow.length - 1].balance)}.` : ""}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={cashflow}><defs><linearGradient id="cb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#22D3EE" stopOpacity={0.3} /><stop offset="1" stopColor="#22D3EE" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="month" {...axisProps} /><YAxis {...axisProps} width={52} tickFormatter={(v) => formatCompact(v * rate)} /><RTooltip content={<ChartTooltip format={(v) => fmt(v)} />} /><Area dataKey="balance" name="Cash balance" stroke="#22D3EE" strokeWidth={2} fill="url(#cb)" /></AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>
        <TabsContent value="ledger">
          <DataTable rows={rows} columns={columns} loading={txns.loading} caption="General ledger" rowKey={(t) => t.id} searchKeys={(t) => `${t.description} ${t.reference} ${t.account}`} searchPlaceholder="Search transactions…" initialSort={{ key: "date", dir: "desc" }}
            filters={<><FilterSelect label="Types" value={type} onChange={setType} options={["Credit", "Debit"]} /><FilterSelect label="Categories" value={cat} onChange={setCat} options={Array.from(new Set((txns.data ?? []).map((t) => t.category)))} /></>}
            toolbar={<Button variant="outline" size="sm" onClick={() => { downloadFile("general-ledger.csv", toCSV(rows)); toast.success("Ledger exported"); }}><Download /> CSV</Button>} />
        </TabsContent>
        <TabsContent value="arap">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>Accounts receivable aging</CardTitle><CardDescription>Open client invoices by days past due.</CardDescription></CardHeader><CardContent>
              <ul className="space-y-4">{ar.map((b, i) => { const max = Math.max(...ar.map((x) => x.amount), 1); return <li key={b.label}><div className="mb-1.5 flex justify-between text-sm"><span>{b.label}</span><span className="font-medium tabular">{fmt(b.amount)}</span></div><Progress value={(b.amount / max) * 100} tone={i === 0 ? "success" : i === 1 ? "primary" : i === 2 ? "warning" : "danger"} label={`${b.label} receivables`} /></li>; })}</ul>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Accounts payable</CardTitle><CardDescription>Upcoming bills to vendors.</CardDescription></CardHeader><CardContent>
              <ul className="divide-y">{[["Five9 seat licenses", 4180, 4], ["Karachi HQ rent", 6200, 6], ["PTCL leased lines", 1870, 9], ["AWS", 2040, 12], ["Lahore Center rent", 3900, 15]].map(([v, a, d]) => <li key={v as string} className="flex items-center justify-between py-3 text-sm"><div><p className="font-medium">{v}</p><p className="text-xs text-muted-foreground">Due in {d} days</p></div><span className="tabular">{fmt(a as number)}</span></li>)}</ul>
            </CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="budgets">
          <Card><CardHeader><CardTitle>Budget tracking · this month</CardTitle><CardDescription>Spend against approved budget by category.</CardDescription></CardHeader><CardContent>
            <ul className="space-y-5">{(summary.data?.budgets ?? []).map((b) => { const pct = (b.spent / b.budget) * 100; return <li key={b.category}><div className="mb-1.5 flex flex-wrap justify-between gap-2 text-sm"><span className="font-medium">{b.category}</span><span className="tabular text-muted-foreground"><span className={cn("font-medium", pct > 100 ? "text-rose-600 dark:text-rose-400" : "text-foreground")}>{fmt(b.spent)}</span> of {fmt(b.budget)} · {pct > 100 ? `${(pct - 100).toFixed(0)}% over` : `${(100 - pct).toFixed(0)}% left`}</span></div><Progress value={pct} tone={pct > 100 ? "danger" : pct > 90 ? "warning" : "success"} label={`${b.category} budget used`} /></li>; })}</ul>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="tax">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[["Withholding tax (payroll)", 9840, "Due Dec 15"], ["Sales tax on services", 14760, "Due Dec 18"], ["Advance income tax", 6200, "Quarterly · Dec 25"], ["Tax paid YTD", 168400, "Filed and reconciled"]].map(([l, v, n]) => <Card key={l as string} className="p-5"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-2 text-2xl font-semibold tabular">{fmt(v as number)}</p><p className="mt-2 text-xs text-muted-foreground">{n}</p></Card>)}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Figures are estimates for planning. Confirm filings with your tax advisor.</p>
        </TabsContent>
        <TabsContent value="audit">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-4" /> Audit log</CardTitle><CardDescription>Every sensitive action, who did it and from where. Retained for 1 year on Growth.</CardDescription></CardHeader><CardContent>
            <ul className="divide-y">{(audit.data ?? []).map((a) => <li key={a.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4"><div className="flex items-center gap-3 sm:w-44"><Avatar name={a.actor} size={26} /><span className="text-sm font-medium">{a.actor}</span></div><p className="flex-1 text-sm"><span className="font-medium">{a.action}</span> <span className="text-muted-foreground">· {a.target}</span></p><span className="font-mono text-xs text-muted-foreground">{a.ip}</span><span className="w-20 text-right text-xs text-muted-foreground">{timeAgo(a.at)}</span></li>)}</ul>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
