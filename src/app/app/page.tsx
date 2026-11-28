"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { CircleDollarSign, Users, Building2, Clock, Wallet, FileWarning, Target, Smile, UserPlus, FilePlus2, CalendarCheck, Download, ArrowRight, AlertTriangle, AlertCircle, Info as InfoIcon, Gauge } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import { PageHeader, StatCard, ChartCard, ChartTooltip, axisProps, StatGridSkeleton, ErrorState } from "@/components/dashboard/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, Progress, Skeleton } from "@/components/ui/misc";
import { timeAgo } from "@/components/dashboard/format";
import { cn, downloadFile, formatCompact, formatCurrency, toCSV } from "@/lib/utils";

export default function OverviewPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useService(() => services.dashboard.overview());
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; })();

  const exportSummary = () => {
    if (!data) return;
    downloadFile("zee-telephonics-pnl.csv", toCSV(data.finance));
    toast.success("Exported monthly P&L", { description: "zee-telephonics-pnl.csv" });
  };

  return (
    <>
      <PageHeader title={`${greeting}, Zia`} description="Here's how Zee Telephonics is running today across 3 sites, 36 clients and 248 people."
        actions={<>
          <Button variant="outline" size="sm" onClick={exportSummary} disabled={!data}><Download /> Export</Button>
          <Button size="sm" onClick={() => router.push("/app/reports")}>View reports</Button>
        </>}
      />
      {error ? <ErrorState onRetry={reload} /> : (
        <div className="space-y-4 sm:space-y-6">
          {loading || !data ? <StatGridSkeleton /> : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Monthly revenue" value={formatCurrency(data.kpis.monthlyRevenue)} delta={8.2} icon={CircleDollarSign} tone="blue" hint="Invoiced revenue for the current month across all clients." />
              <StatCard label="Active clients" value={String(data.kpis.activeClients)} delta={5.9} icon={Building2} tone="violet" deltaLabel="2 new this month" />
              <StatCard label="Total employees" value={String(data.kpis.activeEmployees)} delta={5.1} icon={Users} tone="cyan" deltaLabel="12 net hires" />
              <StatCard label="Attendance rate" value={`${data.kpis.attendanceRate}%`} delta={0.6} icon={Clock} tone="emerald" deltaLabel="pts vs last month" hint="Scheduled shifts attended, excluding approved leave." />
            </div>
          )}

          <div className="grid gap-4 sm:gap-6 xl:grid-cols-3">
            <ChartCard className="xl:col-span-2" title="Revenue, expenses and profit" description="Last 12 months" summary={data ? `Revenue grew from ${formatCurrency(data.finance[0].revenue)} to ${formatCurrency(data.finance[11].revenue)} over 12 months. This month's profit is ${formatCurrency(data.finance[11].profit)}.` : "Loading"}
              actions={<div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex"><Legend color="#3B82F6" label="Revenue" /><Legend color="#8B5CF6" label="Expenses" /><Legend color="#10B981" label="Profit" /></div>}>
              {loading || !data ? <Skeleton className="h-[280px] w-full" /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.finance} margin={{ left: 0, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gPro" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.25} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" {...axisProps} />
                    <YAxis {...axisProps} width={48} tickFormatter={(v) => formatCompact(v)} />
                    <RTooltip content={<ChartTooltip format={(v) => formatCurrency(v)} />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#gRev)" />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#8B5CF6" strokeWidth={2} fill="none" strokeDasharray="4 3" />
                    <Area type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2} fill="url(#gPro)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <Card>
              <CardHeader><CardTitle>Needs your attention</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {loading || !data ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />) : data.alerts.map((a) => {
                  const Icon = a.tone === "danger" ? AlertTriangle : a.tone === "warning" ? AlertCircle : InfoIcon;
                  return (
                    <Link key={a.id} href={a.href} className={cn("flex gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50", a.tone === "danger" ? "border-rose-500/25 bg-rose-500/[0.04]" : a.tone === "warning" ? "border-amber-500/25 bg-amber-500/[0.04]" : "border-cyan-500/25 bg-cyan-500/[0.04]")}>
                      <Icon className={cn("mt-0.5 size-4 shrink-0", a.tone === "danger" ? "text-rose-500" : a.tone === "warning" ? "text-amber-500" : "text-cyan-500")} aria-hidden />
                      <div><p className="text-sm font-medium">{a.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{a.body}</p></div>
                    </Link>
                  );
                })}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <QuickAction icon={UserPlus} label="Add employee" href="/app/team?new=1" />
                  <QuickAction icon={FilePlus2} label="New invoice" href="/app/invoices?new=1" />
                  <QuickAction icon={CalendarCheck} label="Approve leave" href="/app/attendance?tab=leave" />
                  <QuickAction icon={Target} label="Add lead" href="/app/leads?new=1" />
                </div>
              </CardContent>
            </Card>
          </div>

          {data && !loading && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Payroll this month" value={formatCurrency(data.kpis.payrollThisMonth)} delta={2.4} invert icon={Wallet} tone="amber" deltaLabel="pending approval" />
              <StatCard label="Outstanding invoices" value={formatCurrency(data.kpis.outstandingInvoices)} delta={-6.1} invert icon={FileWarning} tone="rose" deltaLabel="vs last month" hint="Sent, partially paid and overdue invoices." />
              <StatCard label="Lead conversion" value={`${data.kpis.leadConversion}%`} delta={3.2} icon={Target} tone="violet" deltaLabel="pts, trailing 90 days" />
              <StatCard label="Client satisfaction" value={`${data.kpis.clientSatisfaction}%`} delta={1.1} icon={Smile} tone="emerald" deltaLabel="pts vs last quarter" />
            </div>
          )}

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <ChartCard title="Team productivity" description="Utilization by department vs 85% target" summary={data ? data.productivity.map((p) => `${p.full}: ${p.utilization}%`).join(", ") : "Loading"}>
              {loading || !data ? <Skeleton className="h-[240px] w-full" /> : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.productivity} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" domain={[60, 100]} {...axisProps} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="department" width={92} {...axisProps} />
                    <RTooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} content={<ChartTooltip format={(v) => `${v}%`} />} />
                    <ReferenceLine x={85} stroke="#F59E0B" strokeDasharray="4 4" />
                    <Bar dataKey="utilization" name="Utilization" radius={[0, 4, 4, 0]} barSize={16}>
                      {data.productivity.map((p) => <Cell key={p.department} fill={p.utilization >= p.target ? "#3B82F6" : "#94A3B8"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Client satisfaction & SLA" description="Monthly CSAT and SLA attainment" summary={data ? `CSAT is ${data.csat[11].csat}% and SLA attainment is ${data.csat[11].sla}% this month.` : "Loading"}>
              {loading || !data ? <Skeleton className="h-[240px] w-full" /> : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.csat} margin={{ left: 0, right: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" {...axisProps} />
                    <YAxis domain={[88, 100]} {...axisProps} width={36} tickFormatter={(v) => `${v}`} />
                    <RTooltip content={<ChartTooltip format={(v) => `${v}%`} />} />
                    <Line type="monotone" dataKey="csat" name="CSAT" stroke="#10B981" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="sla" name="SLA" stroke="#22D3EE" strokeWidth={2} dot={false} strokeDasharray="5 4" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Lead sources" description="Share of new pipeline, last 90 days" className="lg:col-span-2 xl:col-span-1" summary={data ? data.leadSources.map((s) => `${s.name} ${s.value}%`).join(", ") : "Loading"}>
              {loading || !data ? <Skeleton className="h-[240px] w-full" /> : (
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div className="relative h-[200px] w-[200px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.leadSources} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="none">
                          {data.leadSources.map((s) => <Cell key={s.name} fill={s.color} />)}
                        </Pie>
                        <RTooltip content={<ChartTooltip format={(v) => `${v}%`} />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-2xl font-semibold tabular">28.4%</p><p className="text-[11px] text-muted-foreground">conversion</p></div></div>
                  </div>
                  <ul className="w-full space-y-2.5 text-sm">
                    {data.leadSources.map((s) => (
                      <li key={s.name} className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: s.color }} /><span className="flex-1 text-muted-foreground">{s.name}</span><span className="font-medium tabular">{s.value}%</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </ChartCard>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.3fr_1fr]">
            <Card>
              <CardHeader className="flex-row items-center justify-between"><CardTitle>Monthly profit & loss</CardTitle><Link href="/app/accounting" className="text-sm font-medium text-primary hover:underline">Open accounting</Link></CardHeader>
              <CardContent>
                {loading || !data ? <Skeleton className="h-40 w-full" /> : (
                  <dl className="grid gap-4 sm:grid-cols-3">
                    {[["Revenue", data.finance[11].revenue, "text-foreground"], ["Expenses", data.finance[11].expenses, "text-foreground"], ["Net profit", data.finance[11].profit, "text-emerald-600 dark:text-emerald-400"]].map(([l, v, c]) => (
                      <div key={l as string} className="rounded-lg border p-4"><dt className="text-xs text-muted-foreground">{l as string}</dt><dd className={cn("mt-1 text-xl font-semibold tabular", c as string)}>{formatCurrency(v as number)}</dd></div>
                    ))}
                    <div className="sm:col-span-3">
                      <div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>Net margin</span><span className="font-medium tabular text-foreground">{((data.finance[11].profit / data.finance[11].revenue) * 100).toFixed(1)}%</span></div>
                      <Progress value={(data.finance[11].profit / data.finance[11].revenue) * 100 * 3} tone="success" label="Net margin relative to 33% goal" />
                      <p className="mt-2 text-xs text-muted-foreground">Goal: 33% margin · payroll is {((data.finance[11].payroll / data.finance[11].revenue) * 100).toFixed(0)}% of revenue</p>
                    </div>
                  </dl>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between"><CardTitle>Recent activity</CardTitle><Link href="/app/notifications" className="text-sm font-medium text-primary hover:underline">View all</Link></CardHeader>
              <CardContent>
                {loading || !data ? <Skeleton className="h-40 w-full" /> : (
                  <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-border">
                    {data.activity.map((a) => (
                      <li key={a.id} className="relative flex gap-3">
                        <Avatar name={a.who} size={30} />
                        <p className="text-sm"><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span> <span className="font-medium">{a.target}</span><span className="block text-xs text-muted-foreground">{timeAgo(a.at)}</span></p>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="flex flex-col items-start gap-4 border-dashed p-5 sm:flex-row sm:items-center">
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Gauge className="size-5" /></span>
            <div className="flex-1"><p className="font-medium">Performance trend is up 3 months in a row</p><p className="text-sm text-muted-foreground">Average QA score rose from 84.1 to 87.3 since the new scorecard launched. Voice Team A leads at 91.2.</p></div>
            <Button variant="outline" size="sm" onClick={() => router.push("/app/reports")}>See performance report <ArrowRight /></Button>
          </Card>
        </div>
      )}
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: color }} />{label}</span>;
}

function QuickAction({ icon: Icon, label, href }: { icon: React.ComponentType<{ className?: string }>; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors hover:border-primary/40 hover:bg-primary/5">
      <Icon className="size-4 text-primary" /> {label}
    </Link>
  );
}
