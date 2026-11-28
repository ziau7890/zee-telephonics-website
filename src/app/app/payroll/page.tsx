"use client";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, Legend as RLegend } from "recharts";
import { Wallet, Receipt, Clock, Gift, CheckCircle2, Download, Printer, FileSpreadsheet, AlertCircle, Landmark } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import { departments } from "@/lib/mock/data";
import type { PayrollLine } from "@/lib/mock/types";
import { PageHeader, StatCard, DataTable, StatusBadge, FilterSelect, ConfirmDialog, ChartCard, ChartTooltip, axisProps, type Column } from "@/components/dashboard/kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn, downloadFile, formatCurrency, formatDate, printHTML, toCSV } from "@/lib/utils";

const fx: Record<string, number> = { PKR: 280.4, PHP: 57.9, USD: 1, GBP: 0.79 };

export default function PayrollPage() {
  const runs = useService(() => services.payroll.runs());
  const lines = useService(() => services.payroll.lines());
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [approving, setApproving] = useState(false);
  const [slip, setSlip] = useState<PayrollLine | null>(null);
  const current = runs.data?.[0];
  const rows = useMemo(() => (lines.data ?? []).filter((l) => (!dept || l.department === dept) && (!status || l.status === status)), [lines.data, dept, status]);
  const sum = (f: (l: PayrollLine) => number) => (lines.data ?? []).reduce((a, l) => a + f(l), 0);
  const review = (lines.data ?? []).filter((l) => l.status === "Needs review").length;

  const approve = async () => {
    if (!current) return;
    setApproving(true);
    await services.payroll.approve(current.id);
    runs.setData((d) => d?.map((r) => (r.id === current.id ? { ...r, status: "Approved" } : r)) ?? null);
    setApproving(false);
    setConfirm(false);
    toast.success(`${current.period} payroll approved`, { description: `Bank file generated. Payslips will be emailed on ${formatDate(current.payDate, { month: "short", day: "numeric" })}.` });
  };

  const byCurrency = useMemo(() => {
    const m: Record<string, { currency: string; employees: number; net: number }> = {};
    (lines.data ?? []).forEach((l) => { m[l.currency] ??= { currency: l.currency, employees: 0, net: 0 }; m[l.currency].employees++; m[l.currency].net += l.net; });
    return Object.values(m).sort((a, b) => b.net - a.net);
  }, [lines.data]);

  const byDept = useMemo(() => departments.map((d) => {
    const ls = (lines.data ?? []).filter((l) => l.department === d.name);
    return { dept: d.name.replace(" & Lead Gen", "").replace("Quality Assurance", "QA").replace("Customer ", "Cust. ").replace("Technical", "Tech"), base: ls.reduce((a, l) => a + l.base, 0), variable: ls.reduce((a, l) => a + l.overtime + l.bonus, 0) };
  }), [lines.data]);

  const columns: Column<PayrollLine>[] = [
    { key: "name", header: "Employee", sortValue: (l) => l.name, cell: (l) => <div className="flex items-center gap-3"><Avatar name={l.name} size={28} /><div><p className="font-medium">{l.name}</p><p className="text-xs text-muted-foreground">{l.department}</p></div></div> },
    { key: "base", header: "Base", sortValue: (l) => l.base, cell: (l) => formatCurrency(l.base), align: "right" },
    { key: "ot", header: "Overtime", sortValue: (l) => l.overtime, cell: (l) => (l.overtime ? formatCurrency(l.overtime) : "—"), align: "right", hideBelow: "md" },
    { key: "bonus", header: "Bonus", sortValue: (l) => l.bonus, cell: (l) => (l.bonus ? formatCurrency(l.bonus) : "—"), align: "right", hideBelow: "md" },
    { key: "ded", header: "Deductions", sortValue: (l) => l.deductions, cell: (l) => <span className="text-muted-foreground">−{formatCurrency(l.deductions)}</span>, align: "right", hideBelow: "lg" },
    { key: "tax", header: "Tax", sortValue: (l) => l.tax, cell: (l) => <span className="text-muted-foreground">−{formatCurrency(l.tax)}</span>, align: "right", hideBelow: "lg" },
    { key: "net", header: "Net pay", sortValue: (l) => l.net, cell: (l) => <span className="font-semibold">{formatCurrency(l.net)}</span>, align: "right" },
    { key: "cur", header: "Currency", sortValue: (l) => l.currency, cell: (l) => <Badge variant="outline" className="font-mono">{l.currency}</Badge>, hideBelow: "sm" },
    { key: "status", header: "Status", sortValue: (l) => l.status, cell: (l) => <StatusBadge status={l.status} /> },
  ];

  return (
    <>
      <PageHeader title="Payroll" description={current ? `${current.period} · pay date ${formatDate(current.payDate, { weekday: "short", month: "short", day: "numeric" })} · ${current.employees} employees in 4 currencies` : "Loading payroll period…"}
        actions={<>
          <Button variant="outline" size="sm" onClick={() => { downloadFile("payroll-bank-export.csv", toCSV(rows, ["employeeId", "name", "department", "net", "currency", "status"])); toast.success("Bank export downloaded", { description: `${rows.length} lines · CSV` }); }}><FileSpreadsheet /> Export</Button>
          {current?.status === "Pending approval" ? <Button size="sm" onClick={() => setConfirm(true)}><CheckCircle2 /> Approve payroll</Button> : current && <Badge variant="success" dot className="h-9 px-3">Approved</Badge>}
        </>} />
      {review > 0 && current?.status === "Pending approval" && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm"><AlertCircle className="mt-0.5 size-4 text-amber-500" /><div><p className="font-medium">{review} lines need review before approval</p><p className="text-muted-foreground">Mostly overtime above the weekly cap and new hires with partial months. Filter by “Needs review” to see them.</p></div><Button size="sm" variant="outline" className="ml-auto shrink-0" onClick={() => setStatus("Needs review")}>Show lines</Button></div>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross payroll" value={formatCurrency(sum((l) => l.base + l.overtime + l.bonus))} icon={Wallet} tone="blue" loading={lines.loading} delta={2.4} invert />
        <StatCard label="Net payroll" value={formatCurrency(sum((l) => l.net))} icon={Receipt} tone="emerald" loading={lines.loading} />
        <StatCard label="Overtime" value={formatCurrency(sum((l) => l.overtime))} icon={Clock} tone="amber" loading={lines.loading} hint="Calculated from approved attendance at 1.5× hourly rate." delta={-8.6} invert />
        <StatCard label="Bonuses" value={formatCurrency(sum((l) => l.bonus))} icon={Gift} tone="violet" loading={lines.loading} />
      </div>
      <Tabs defaultValue="lines">
        <TabsList>
          <TabsTrigger value="lines">Payroll lines</TabsTrigger>
          <TabsTrigger value="runs">Payroll runs</TabsTrigger>
          <TabsTrigger value="structure">Salary structures</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="lines">
          <DataTable rows={rows} columns={columns} loading={lines.loading} caption="Payroll lines for the current period" rowKey={(l) => l.employeeId} onRowClick={setSlip}
            searchKeys={(l) => `${l.name} ${l.employeeId}`} searchPlaceholder="Search employee…"
            filters={<><FilterSelect label="Departments" value={dept} onChange={setDept} options={departments.map((d) => d.name)} /><FilterSelect label="Statuses" value={status} onChange={setStatus} options={["Ready", "Needs review", "On hold"]} /></>} />
        </TabsContent>
        <TabsContent value="runs">
          <Card className="overflow-hidden">
            <div className="relative overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
              <caption className="sr-only">Payroll runs</caption>
              <thead><tr className="border-b bg-muted/40 text-xs text-muted-foreground"><th scope="col" className="px-5 py-3 text-left font-medium">Period</th><th scope="col" className="px-4 py-3 text-left font-medium">Pay date</th><th scope="col" className="px-4 py-3 text-right font-medium">Employees</th><th scope="col" className="px-4 py-3 text-right font-medium">Gross</th><th scope="col" className="px-4 py-3 text-right font-medium">Net</th><th scope="col" className="px-4 py-3 text-left font-medium">Status</th><th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{(runs.data ?? []).map((r) => <tr key={r.id} className="border-b last:border-0"><th scope="row" className="px-5 py-3 text-left font-medium">{r.period}</th><td className="px-4 py-3">{formatDate(r.payDate)}</td><td className="px-4 py-3 text-right tabular">{r.employees}</td><td className="px-4 py-3 text-right tabular">{formatCurrency(r.gross)}</td><td className="px-4 py-3 text-right font-medium tabular">{formatCurrency(r.net)}</td><td className="px-4 py-3"><StatusBadge status={r.status} /></td><td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => toast.success(`${r.period} register downloaded`)}><Download /> Register</Button></td></tr>)}</tbody>
            </table></div>
          </Card>
        </TabsContent>
        <TabsContent value="structure">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>Salary bands</CardTitle><CardDescription>Monthly, USD equivalent. Applied when adding or promoting employees.</CardDescription></CardHeader><CardContent>
              <ul className="divide-y">{[["Agent L1", "$260 – $360", "Customer Support, Back Office"], ["Agent L2 / Senior", "$360 – $480", "All delivery teams"], ["Specialist", "$430 – $700", "Tech Support, Sales"], ["Team Lead", "$700 – $1,500", "All departments"], ["Manager", "$1,200 – $2,500", "Department heads"]].map(([b, r, s]) => <li key={b} className="flex items-center justify-between py-3"><div><p className="text-sm font-medium">{b}</p><p className="text-xs text-muted-foreground">{s}</p></div><span className="text-sm tabular">{r}</span></li>)}</ul>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Rules</CardTitle><CardDescription>How variable pay and deductions are calculated.</CardDescription></CardHeader><CardContent>
              <ul className="space-y-3 text-sm">{[["Overtime", "1.5× hourly rate after 45 hrs/week; 2× on public holidays. Cap: 12 hrs/week without approval."], ["Night shift allowance", "+10% of base for shifts starting after 20:00."], ["Attendance bonus", "$15 for 100% attendance with zero late arrivals in the month."], ["Performance bonus", "Up to 10% of base for QA score ≥ 92."], ["Deductions", "Provident fund 3% of base; unpaid leave pro-rated by working days."], ["Tax", "Withheld per country slab; summary exported for filing."]].map(([k, v]) => <li key={k} className="rounded-lg border p-3"><p className="font-medium">{k}</p><p className="text-muted-foreground">{v}</p></li>)}</ul>
            </CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="reports">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <ChartCard title="Payroll cost by department" description="Base vs variable pay (overtime and bonuses)" summary={byDept.map((d) => `${d.dept}: ${formatCurrency(d.base + d.variable)}`).join(", ")}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byDept}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="dept" {...axisProps} interval={0} tick={{ fontSize: 11 }} /><YAxis {...axisProps} width={52} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} /><RTooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} content={<ChartTooltip format={(v) => formatCurrency(v)} />} /><RLegend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="base" name="Base" stackId="a" fill="#3B82F6" /><Bar dataKey="variable" name="Variable" stackId="a" fill="#22D3EE" radius={[4, 4, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Landmark className="size-4" /> Multi-currency payout</CardTitle><CardDescription>Converted at today&apos;s locked rate.</CardDescription></CardHeader><CardContent>
              <ul className="space-y-4">{byCurrency.map((c) => <li key={c.currency} className="flex items-center gap-3"><Badge variant="outline" className="w-12 justify-center font-mono">{c.currency}</Badge><div className="flex-1"><p className="text-sm font-medium tabular">{new Intl.NumberFormat("en-US", { style: "currency", currency: c.currency, maximumFractionDigits: 0 }).format(c.net * fx[c.currency])}</p><p className="text-xs text-muted-foreground">{c.employees} employees · {formatCurrency(c.net)} USD · rate {fx[c.currency]}</p></div></li>)}</ul>
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} loading={approving} title={`Approve ${current?.period ?? ""} payroll?`}
        description={`This locks ${current?.employees ?? 0} payroll lines (net ${formatCurrency(current?.net ?? 0)}), generates the bank file and schedules payslips. Lines on hold are excluded. This action is recorded in the audit log.`} confirmLabel="Approve and generate bank file" onConfirm={approve} />
      <PayslipDialog line={slip} onClose={() => setSlip(null)} period={current?.period ?? ""} />
    </>
  );
}

function PayslipDialog({ line, onClose, period }: { line: PayrollLine | null; onClose: () => void; period: string }) {
  const print = () => {
    if (!line) return;
    const row = (l: string, v: number, neg = false) => `<tr><td>${l}</td><td class="r">${neg ? "−" : ""}${formatCurrency(v, "USD", { minimumFractionDigits: 2 })}</td></tr>`;
    printHTML(`Payslip ${line.employeeId}`, `<div class="head"><div><div class="brand">Zee Telephonics BPO</div><div class="muted">Shahrah-e-Faisal, Karachi</div></div><div style="text-align:right"><h1>Payslip</h1><div class="muted">${period}</div></div></div>
      <p><strong>${line.name}</strong> · ${line.employeeId}<br><span class="muted">${line.department} · paid in ${line.currency}</span></p>
      <table><thead><tr><th>Earnings & deductions</th><th class="r">Amount (USD eq.)</th></tr></thead><tbody>${row("Base salary", line.base)}${row("Overtime", line.overtime)}${row("Bonus", line.bonus)}${row("Deductions", line.deductions, true)}${row("Income tax", line.tax, true)}<tr class="tot"><td>Net pay</td><td class="r">${formatCurrency(line.net, "USD", { minimumFractionDigits: 2 })}</td></tr></tbody></table>
      <p class="muted" style="margin-top:32px;font-size:12px">This is a system-generated payslip and does not require a signature.</p>`);
  };
  return (
    <Dialog open={!!line} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        {line && (
          <>
            <DialogHeader><DialogTitle>Payslip · {line.name}</DialogTitle><DialogDescription>{period} · {line.employeeId} · {line.department}</DialogDescription></DialogHeader>
            <dl className="divide-y rounded-lg border text-sm">
              {[["Base salary", line.base], ["Overtime", line.overtime], ["Bonus", line.bonus], ["Deductions", -line.deductions], ["Income tax", -line.tax]].map(([k, v]) => <div key={k as string} className="flex justify-between px-4 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd className={cn("tabular", (v as number) < 0 && "text-muted-foreground")}>{formatCurrency(v as number)}</dd></div>)}
              <div className="flex justify-between bg-muted/40 px-4 py-3 font-semibold"><dt>Net pay</dt><dd className="tabular">{formatCurrency(line.net)}</dd></div>
            </dl>
            <p className="text-xs text-muted-foreground">Paid in {line.currency} ≈ {new Intl.NumberFormat("en-US", { style: "currency", currency: line.currency, maximumFractionDigits: 0 }).format(line.net * fx[line.currency])}</p>
            <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button><Button onClick={print}><Printer /> Download PDF</Button></DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
