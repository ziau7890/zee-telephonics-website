"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, Legend } from "recharts";
import { Download, FileText, CalendarClock, Users, CalendarCheck, Wallet, LineChart as LineIcon, Target, Building2, Gauge, Wrench, Save, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import { departments, invoices as allInvoices } from "@/lib/mock/data";
import { PageHeader, ChartCard, ChartTooltip, axisProps, FilterSelect } from "@/components/dashboard/kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { Field, NativeSelect, Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn, downloadFile, formatCompact, formatCurrency, formatNumber, printHTML, toCSV } from "@/lib/utils";

type Row = Record<string, string | number>;
const REPORTS = [
  { key: "workforce", name: "Workforce", icon: Users, description: "Headcount, roles and status by department" },
  { key: "attendance", name: "Attendance", icon: CalendarCheck, description: "Daily presence, lateness and overtime" },
  { key: "payroll", name: "Payroll", icon: Wallet, description: "Gross, deductions and net pay per run" },
  { key: "financial", name: "Financial", icon: LineIcon, description: "Revenue, expenses and profit by month" },
  { key: "sales", name: "Sales", icon: Target, description: "Pipeline value and conversion by stage" },
  { key: "client", name: "Client", icon: Building2, description: "Account value, health, SLA and CSAT" },
  { key: "productivity", name: "Productivity", icon: Gauge, description: "Utilization against target by department" },
] as const;
type ReportKey = (typeof REPORTS)[number]["key"];
const RANGES = { "Last 3 months": 3, "Last 6 months": 6, "Last 12 months": 12 } as const;
const fmtMoney = (v: number) => formatCurrency(v);

function exportPDF(title: string, rows: Row[], meta: string) {
  if (!rows.length) return toast.error("Nothing to export for these filters");
  const cols = Object.keys(rows[0]);
  printHTML(title, `<div class="head"><div><div class="brand">Zee Telephonics BPO</div><div class="muted">${meta}</div></div><div style="text-align:right"><h1>${title}</h1><div class="muted">Generated ${new Date().toLocaleString()}</div></div></div>
  <table><thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${cols.map((c) => `<td>${typeof r[c] === "number" ? (r[c] as number).toLocaleString() : r[c]}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
}

export default function ReportsPage() {
  const params = useSearchParams();
  const initial = (REPORTS.find((r) => r.key === params.get("report"))?.key ?? "workforce") as ReportKey;
  const [active, setActive] = useState<ReportKey | "builder">(params.get("tab") === "builder" ? "builder" : initial);
  const [range, setRange] = useState<keyof typeof RANGES>("Last 12 months");
  const [dept, setDept] = useState("");
  const [client, setClient] = useState("");

  const team = useService(() => services.team.list());
  const fin = useService(() => services.finance.summary());
  const leads = useService(() => services.crm.leads());
  const clients = useService(() => services.clients.list());
  const runs = useService(() => services.payroll.runs());
  const att = useService(() => services.attendance.trend());
  const overview = useService(() => services.dashboard.overview());
  const loading = team.loading || fin.loading || leads.loading || clients.loading || runs.loading || att.loading || overview.loading;
  const months = RANGES[range];

  const report = useMemo(() => {
    const emps = (team.data ?? []).filter((e) => !dept || e.department === dept);
    const cls = (clients.data ?? []).filter((c) => !client || c.name === client);
    switch (active) {
      case "workforce": {
        const rows: Row[] = departments.filter((d) => !dept || d.name === dept).map((d) => {
          const list = emps.filter((e) => e.department === d.name);
          return { Department: d.name, Head: d.head, Headcount: list.length, Active: list.filter((e) => e.status === "Active").length, "On leave": list.filter((e) => e.status === "On leave").length, "Avg performance": list.length ? Math.round(list.reduce((a, e) => a + e.performance, 0) / list.length) : 0 };
        });
        return { rows, chart: rows.map((r) => ({ name: String(r.Department).split(" ")[0], value: r.Headcount as number })), summary: `${emps.length} employees across ${rows.length} departments.` };
      }
      case "attendance": {
        const rows: Row[] = (att.data ?? []).map((d) => ({ Date: d.label, "Attendance %": d.rate, "Late arrivals": d.late, "Overtime hrs": d.overtime }));
        const avg = rows.length ? (rows.reduce((a, r) => a + (r["Attendance %"] as number), 0) / rows.length).toFixed(1) : "0";
        return { rows, chart: (att.data ?? []).map((d) => ({ name: d.label, value: d.rate, late: d.late })), summary: `Average attendance ${avg}% over the last 30 days.` };
      }
      case "payroll": {
        const rows: Row[] = (runs.data ?? []).slice(0, months).map((r) => ({ Period: r.period, Employees: r.employees, Gross: r.gross, "Tax & deductions": r.gross - r.net, Net: r.net, Status: r.status }));
        return { rows, chart: [...rows].reverse().map((r) => ({ name: String(r.Period).split(" ")[0].slice(0, 3), value: r.Net as number, gross: r.Gross as number })), summary: `${rows.length} payroll runs, net total ${fmtMoney(rows.reduce((a, r) => a + (r.Net as number), 0))}.` };
      }
      case "financial": {
        const m = (fin.data?.monthly ?? []).slice(-months);
        const rows: Row[] = m.map((x) => ({ Month: x.month, Revenue: x.revenue, Expenses: x.expenses, Profit: x.profit, "Margin %": +((x.profit / x.revenue) * 100).toFixed(1) }));
        return { rows, chart: m.map((x) => ({ name: x.month, value: x.revenue, expenses: x.expenses, profit: x.profit })), summary: `Revenue ${fmtMoney(m.reduce((a, x) => a + x.revenue, 0))}, profit ${fmtMoney(m.reduce((a, x) => a + x.profit, 0))} over ${m.length} months.` };
      }
      case "sales": {
        const ls = (leads.data ?? []).filter((l) => !client || l.company === client);
        const stages = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
        const rows: Row[] = stages.map((s) => { const g = ls.filter((l) => l.stage === s); return { Stage: s, Leads: g.length, "Monthly value": g.reduce((a, l) => a + l.value, 0), Seats: g.reduce((a, l) => a + l.seats, 0) }; });
        const won = ls.filter((l) => l.stage === "Won").length, closed = won + ls.filter((l) => l.stage === "Lost").length;
        return { rows, chart: rows.map((r) => ({ name: r.Stage as string, value: r["Monthly value"] as number })), summary: `${ls.length} leads; win rate ${closed ? Math.round((won / closed) * 100) : 0}% on closed deals.` };
      }
      case "client": {
        const rows: Row[] = cls.map((c) => ({ Client: c.name, Industry: c.industry, Status: c.status, Seats: c.seats, "Monthly value": c.monthlyValue, Health: c.health, "CSAT %": c.csat, "SLA %": c.slaActual }));
        const top = [...rows].sort((a, b) => (b["Monthly value"] as number) - (a["Monthly value"] as number)).slice(0, 8);
        return { rows, chart: top.map((r) => ({ name: String(r.Client).split(" ")[0], value: r["Monthly value"] as number })), summary: `${rows.length} clients, ${fmtMoney(rows.reduce((a, r) => a + (r["Monthly value"] as number), 0))} monthly recurring value.` };
      }
      case "productivity": {
        const p = (overview.data?.productivity ?? []).filter((x) => !dept || x.full === dept);
        const rows: Row[] = p.map((x) => ({ Department: x.full, "Utilization %": x.utilization, "Target %": x.target, Variance: x.utilization - x.target }));
        return { rows, chart: p.map((x) => ({ name: x.department, value: x.utilization, target: x.target, color: x.color })), summary: `${p.filter((x) => x.utilization >= x.target).length} of ${p.length} departments at or above the 85% target.` };
      }
      default:
        return { rows: [] as Row[], chart: [] as { name: string; value: number }[], summary: "" };
    }
  }, [active, team.data, fin.data, leads.data, clients.data, runs.data, att.data, overview.data, dept, client, months]);

  const meta = REPORTS.find((r) => r.key === active);
  const filterMeta = [range, dept || "All departments", client || "All clients"].join(" · ");
  const doCSV = () => { if (!report.rows.length) return toast.error("Nothing to export for these filters"); downloadFile(`${active}-report.csv`, toCSV(report.rows)); toast.success(`${meta?.name} report exported as CSV`); };

  return (
    <>
      <PageHeader title="Reports" description="Standard reports across every module, plus a builder for your own. Export to CSV or PDF."
        actions={active !== "builder" && <>
          <Button variant="outline" size="sm" onClick={doCSV}><Download /> CSV</Button>
          <Button variant="outline" size="sm" onClick={() => exportPDF(`${meta?.name} report`, report.rows, filterMeta)}><FileText /> PDF</Button>
        </>} />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Report types" className="flex gap-2 relative overflow-x-auto no-scrollbar lg:flex-col lg:overflow-visible">
          {REPORTS.map((r) => (
            <button key={r.key} onClick={() => setActive(r.key)} aria-current={active === r.key ? "page" : undefined}
              className={cn("flex shrink-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors lg:w-full", active === r.key ? "border-primary/40 bg-primary/10 text-foreground" : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground")}>
              <r.icon className="size-4 shrink-0" /><span className="font-medium">{r.name}</span>
            </button>
          ))}
          <button onClick={() => setActive("builder")} aria-current={active === "builder" ? "page" : undefined}
            className={cn("flex shrink-0 items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left text-sm transition-colors lg:mt-2 lg:w-full", active === "builder" ? "border-primary/50 bg-primary/10" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
            <Wrench className="size-4 shrink-0" /><span className="font-medium">Custom builder</span>
          </button>
        </nav>

        <div className="min-w-0 space-y-6">
          {active === "builder" ? <ReportBuilder /> : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <NativeSelect aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value as keyof typeof RANGES)} className="h-9 w-auto min-w-[140px] text-[13px]">{Object.keys(RANGES).map((r) => <option key={r}>{r}</option>)}</NativeSelect>
                <FilterSelect label="Departments" value={dept} onChange={setDept} options={departments.map((d) => d.name)} />
                <FilterSelect label="Clients" value={client} onChange={setClient} options={(clients.data ?? []).map((c) => c.name)} />
                {(dept || client) && <Button variant="ghost" size="sm" onClick={() => { setDept(""); setClient(""); }}>Clear filters</Button>}
              </div>
              <ChartCard title={`${meta?.name} report`} description={meta?.description} summary={report.summary}>
                {loading ? <Skeleton className="h-[300px]" /> : report.chart.length === 0 ? <p className="grid h-[300px] place-items-center text-sm text-muted-foreground">No data for these filters.</p> : <ReportChart kind={active} data={report.chart} />}
              </ChartCard>
              <Card>
                <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
                  <div><CardTitle className="text-base">Report data</CardTitle><CardDescription>{report.summary}</CardDescription></div>
                  <Badge variant="secondary" className="shrink-0">{report.rows.length} rows</Badge>
                </CardHeader>
                <CardContent className="p-0"><PreviewTable rows={report.rows} loading={loading} caption={`${meta?.name} report data`} /></CardContent>
              </Card>
              <ScheduledReports />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ReportChart({ kind, data }: { kind: ReportKey; data: Record<string, string | number>[] }) {
  const h = 300;
  if (kind === "attendance") return (
    <ResponsiveContainer width="100%" height={h}><AreaChart data={data}><defs><linearGradient id="ra" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="name" {...axisProps} interval={4} /><YAxis {...axisProps} domain={[88, 100]} width={40} /><RTooltip content={<ChartTooltip format={(v) => `${v}%`} />} /><Area dataKey="value" name="Attendance" stroke="#3B82F6" strokeWidth={2} fill="url(#ra)" /></AreaChart></ResponsiveContainer>
  );
  if (kind === "financial") return (
    <ResponsiveContainer width="100%" height={h}><LineChart data={data}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="name" {...axisProps} /><YAxis {...axisProps} width={52} tickFormatter={(v) => formatCompact(v)} /><RTooltip content={<ChartTooltip format={fmtMoney} />} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /><Line dataKey="value" name="Revenue" stroke="#3B82F6" strokeWidth={2.5} dot={false} /><Line dataKey="expenses" name="Expenses" stroke="#A78BFA" strokeWidth={2} dot={false} /><Line dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
  );
  if (kind === "workforce") return (
    <ResponsiveContainer width="100%" height={h}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2} stroke="none">{data.map((_, i) => <Cell key={i} fill={departments[i % departments.length].color} />)}</Pie><RTooltip content={<ChartTooltip format={(v) => `${v} people`} />} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer>
  );
  const money = kind === "payroll" || kind === "sales" || kind === "client";
  return (
    <ResponsiveContainer width="100%" height={h}><BarChart data={data}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="name" {...axisProps} /><YAxis {...axisProps} width={52} tickFormatter={(v) => (money ? formatCompact(v) : `${v}`)} /><RTooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} content={<ChartTooltip format={(v) => (money ? fmtMoney(v) : `${v}%`)} />} />
      <Bar dataKey="value" name={kind === "productivity" ? "Utilization" : kind === "payroll" ? "Net pay" : "Monthly value"} radius={[4, 4, 0, 0]} barSize={26}>{data.map((d, i) => <Cell key={i} fill={(d.color as string) ?? (kind === "sales" && d.name === "Lost" ? "#F43F5E" : "#3B82F6")} />)}</Bar>
      {kind === "productivity" && <Bar dataKey="target" name="Target" fill="hsl(var(--muted-foreground))" fillOpacity={0.25} radius={[4, 4, 0, 0]} barSize={10} />}
    </BarChart></ResponsiveContainer>
  );
}

function PreviewTable({ rows, loading, caption, max = 50 }: { rows: Row[]; loading?: boolean; caption: string; max?: number }) {
  if (loading) return <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9" />)}</div>;
  if (!rows.length) return <p className="p-8 text-center text-sm text-muted-foreground">No rows match the current selection.</p>;
  const cols = Object.keys(rows[0]);
  const isMoney = (c: string) => /value|gross|net|deductions|revenue|expenses|profit|amount|salary|outstanding/i.test(c);
  return (
    <div className="max-h-[440px] overflow-auto scrollbar-thin">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-card"><tr className="border-b">{cols.map((c) => <th key={c} scope="col" className={cn("whitespace-nowrap px-4 py-2.5 text-xs font-medium text-muted-foreground", typeof rows[0][c] === "number" ? "text-right" : "text-left")}>{c}</th>)}</tr></thead>
        <tbody>{rows.slice(0, max).map((r, i) => <tr key={i} className="border-b last:border-0 hover:bg-muted/40">{cols.map((c) => <td key={c} className={cn("whitespace-nowrap px-4 py-2.5", typeof r[c] === "number" && "text-right tabular")}>{typeof r[c] === "number" ? (isMoney(c) ? fmtMoney(r[c] as number) : formatNumber(r[c] as number)) : r[c]}</td>)}</tr>)}</tbody>
      </table>
      {rows.length > max && <p className="border-t px-4 py-2 text-xs text-muted-foreground">Showing {max} of {rows.length} rows. Export to see everything.</p>}
    </div>
  );
}

/* ---------------- Custom report builder ---------------- */
const DATASETS = {
  Employees: { fields: ["name", "role", "department", "team", "location", "shift", "status", "salary", "performance", "attendanceRate"], group: ["department", "team", "location", "shift", "status"] },
  Clients: { fields: ["name", "industry", "country", "accountManager", "status", "monthlyValue", "seats", "health", "csat"], group: ["industry", "country", "accountManager", "status"] },
  Leads: { fields: ["company", "contact", "stage", "source", "owner", "industry", "value", "seats", "score"], group: ["stage", "source", "owner", "industry"] },
  Invoices: { fields: ["number", "client", "status", "currency", "amount", "paid", "issueDate", "dueDate"], group: ["client", "status", "currency"] },
} as const;
type Dataset = keyof typeof DATASETS;
const label = (k: string) => k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

function ReportBuilder() {
  const [dataset, setDataset] = useState<Dataset>("Employees");
  const [fields, setFields] = useState<string[]>(["name", "role", "department", "status", "salary"]);
  const [groupBy, setGroupBy] = useState("");
  const [name, setName] = useState("");
  const [saved, setSaved] = useState<{ name: string; dataset: Dataset; fields: string[]; groupBy: string }[]>([{ name: "Agents by shift", dataset: "Employees", fields: ["name", "team", "shift", "status"], groupBy: "shift" }]);
  const team = useService(() => services.team.list());
  const clients = useService(() => services.clients.list());
  const leads = useService(() => services.crm.leads());
  const source: Record<Dataset, Record<string, unknown>[]> = { Employees: (team.data ?? []) as unknown as Record<string, unknown>[], Clients: (clients.data ?? []) as unknown as Record<string, unknown>[], Leads: (leads.data ?? []) as unknown as Record<string, unknown>[], Invoices: allInvoices as unknown as Record<string, unknown>[] };
  const loading = team.loading || clients.loading || leads.loading;

  const rows: Row[] = useMemo(() => {
    const data = source[dataset];
    const pick = (o: Record<string, unknown>, k: string) => { const v = o[k]; return typeof v === "number" ? v : typeof v === "string" && /Date$/.test(k) ? v.slice(0, 10) : String(v ?? ""); };
    if (!groupBy) return data.map((o) => Object.fromEntries(fields.map((f) => [label(f), pick(o, f)])));
    const groups = new Map<string, Record<string, unknown>[]>();
    data.forEach((o) => { const k = String(o[groupBy]); groups.set(k, [...(groups.get(k) ?? []), o]); });
    const numeric = fields.filter((f) => typeof data[0]?.[f] === "number");
    return [...groups.entries()].map(([k, list]) => ({ [label(groupBy)]: k, Count: list.length, ...Object.fromEntries(numeric.map((f) => [`Total ${label(f).toLowerCase()}`, Math.round(list.reduce((a, o) => a + (o[f] as number), 0))])) })).sort((a, b) => (b.Count as number) - (a.Count as number));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, fields, groupBy, team.data, clients.data, leads.data]);

  const switchDataset = (d: Dataset) => { setDataset(d); setFields(DATASETS[d].fields.slice(0, 5) as unknown as string[]); setGroupBy(""); };
  const toggle = (f: string) => setFields((fs) => (fs.includes(f) ? (fs.length > 1 ? fs.filter((x) => x !== f) : fs) : [...fs, f]));
  const title = name.trim() || `${dataset} report`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Build a custom report</CardTitle><CardDescription>Pick a dataset, choose columns and optionally group rows. The preview updates as you go.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Dataset" htmlFor="rb-ds"><NativeSelect id="rb-ds" value={dataset} onChange={(e) => switchDataset(e.target.value as Dataset)}>{Object.keys(DATASETS).map((d) => <option key={d}>{d}</option>)}</NativeSelect></Field>
            <Field label="Group by" htmlFor="rb-group" hint="Grouping totals numeric columns."><NativeSelect id="rb-group" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}><option value="">No grouping</option>{DATASETS[dataset].group.map((g) => <option key={g} value={g}>{label(g)}</option>)}</NativeSelect></Field>
            <Field label="Report name" htmlFor="rb-name"><Input id="rb-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={`${dataset} report`} maxLength={60} /></Field>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Columns</legend>
            <div className="flex flex-wrap gap-2">
              {DATASETS[dataset].fields.map((f) => {
                const on = fields.includes(f);
                return <button key={f} type="button" aria-pressed={on} onClick={() => toggle(f)} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", on ? "border-primary/50 bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>{label(f)}</button>;
              })}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { downloadFile(`${title.toLowerCase().replace(/\s+/g, "-")}.csv`, toCSV(rows)); toast.success("Custom report exported"); }} disabled={!rows.length}><Download /> CSV</Button>
            <Button size="sm" variant="outline" onClick={() => exportPDF(title, rows, `${dataset}${groupBy ? ` grouped by ${label(groupBy)}` : ""}`)} disabled={!rows.length}><FileText /> PDF</Button>
            <Button size="sm" onClick={() => { setSaved((s) => [{ name: title, dataset, fields, groupBy }, ...s.filter((x) => x.name !== title)]); toast.success(`Saved “${title}”`); }}><Save /> Save report</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0"><div><CardTitle className="text-base">Preview</CardTitle><CardDescription>{title}</CardDescription></div><Badge variant="secondary">{rows.length} rows</Badge></CardHeader>
        <CardContent className="p-0"><PreviewTable rows={rows} loading={loading} caption={`${title} preview`} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Saved reports</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y">
            {saved.map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.dataset} · {s.fields.length} columns{s.groupBy ? ` · grouped by ${label(s.groupBy)}` : ""}</p></div>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setDataset(s.dataset); setFields(s.fields); setGroupBy(s.groupBy); setName(s.name); }}>Open</Button>
                  <Button size="icon-sm" variant="ghost" aria-label={`Delete ${s.name}`} onClick={() => setSaved((x) => x.filter((y) => y.name !== s.name))}><Trash2 /></Button>
                </div>
              </li>
            ))}
            {saved.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No saved reports yet.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ScheduledReports() {
  const [items, setItems] = useState([
    { id: "s1", name: "Weekly attendance summary", cadence: "Mondays 08:00", to: "Supervisors", on: true },
    { id: "s2", name: "Monthly P&L pack", cadence: "1st of month 09:00", to: "Finance, Leadership", on: true },
    { id: "s3", name: "Client SLA digest", cadence: "Fridays 17:00", to: "Account managers", on: false },
  ]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", cadence: "Weekly", to: "" });
  const [err, setErr] = useState("");
  const add = () => {
    if (form.name.trim().length < 3) return setErr("Give the schedule a name of at least 3 characters.");
    if (!form.to.trim()) return setErr("Add at least one recipient or team.");
    setItems((x) => [...x, { id: `s${Date.now()}`, name: form.name.trim(), cadence: form.cadence, to: form.to.trim(), on: true }]);
    setOpen(false); setForm({ name: "", cadence: "Weekly", to: "" }); setErr(""); toast.success("Schedule created");
  };
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div><CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="size-4 text-muted-foreground" /> Scheduled delivery</CardTitle><CardDescription>Reports emailed automatically as PDF and CSV.</CardDescription></div>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus /> New schedule</Button>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {items.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0"><p className="truncate text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.cadence} · to {s.to}</p></div>
              <Switch checked={s.on} onCheckedChange={(v) => { setItems((x) => x.map((y) => (y.id === s.id ? { ...y, on: v } : y))); toast(v ? "Schedule resumed" : "Schedule paused"); }} aria-label={`${s.on ? "Pause" : "Resume"} ${s.name}`} />
            </li>
          ))}
        </ul>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New scheduled report</DialogTitle><DialogDescription>Choose what to send, how often and to whom.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <Field label="Name" htmlFor="sr-name" required><Input id="sr-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Daily headcount" /></Field>
            <Field label="Frequency" htmlFor="sr-cad"><NativeSelect id="sr-cad" value={form.cadence} onChange={(e) => setForm({ ...form, cadence: e.target.value })}>{["Daily", "Weekly", "Monthly", "Quarterly"].map((c) => <option key={c}>{c}</option>)}</NativeSelect></Field>
            <Field label="Recipients" htmlFor="sr-to" required error={err || undefined}><Input id="sr-to" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="Team names or email addresses" /></Field>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={add}>Create schedule</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
