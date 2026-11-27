"use client";
import Link from "next/link";
import { use, useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, CalendarDays, Clock, FileText, Download, Upload, Award, UserX, MessageSquare } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import { employees, payrollLines } from "@/lib/mock/data";
import { StatusBadge, ChartCard, ChartTooltip, axisProps, ConfirmDialog } from "@/components/dashboard/kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, EmptyState, Progress, Skeleton } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate, seeded } from "@/lib/utils";

export default function EmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: e, loading, setData } = useService(() => services.team.get(id), [id]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="space-y-4"><Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-72 w-full rounded-xl" /></div>;
  if (!e) return <EmptyState icon={UserX} title="Employee not found" description="This profile may have been removed or the link is incorrect." action={<Link href="/app/team" className="text-sm font-medium text-primary">Back to team</Link>} />;

  const r = seeded(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const history = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"].map((m, i) => ({ month: m, score: Math.min(100, Math.round(e.performance - 6 + i * 1.2 + r() * 3)), qa: Math.round(80 + r() * 15) }));
  const days = Array.from({ length: 14 }, (_, i) => { const v = r(); return { d: i, s: v > 0.93 ? "Absent" : v > 0.82 ? "Late" : "Present" }; });
  const manager = employees.find((m) => m.id === e.managerId);
  const pay = payrollLines.find((p) => p.employeeId === e.id);
  const docs = [["Employment contract.pdf", "Signed", "2.1 MB"], ["CNIC copy.pdf", "Verified", "640 KB"], ["Bank details form.pdf", "Verified", "180 KB"], ["NDA - client programs.pdf", "Signed", "320 KB"]];

  const offboard = async () => {
    setBusy(true);
    await services.team.updateStatus(e.id, "Offboarding");
    setData({ ...e, status: "Offboarding" });
    setBusy(false);
    setConfirm(false);
    toast.success("Offboarding started", { description: "Access removal and asset return tasks were created." });
  };

  return (
    <>
      <Link href="/app/team" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Team</Link>
      <Card className="mb-6 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-blue-600/25 via-cyan-500/15 to-violet-500/20" aria-hidden />
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:px-6">
          <Avatar name={e.name} size={84} className="-mt-10 ring-4" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">{e.name}</h1><StatusBadge status={e.status} /></div>
            <p className="text-sm text-muted-foreground">{e.role} · {e.department} · {e.team}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success(`Message sent to ${e.name.split(" ")[0]}`)}><MessageSquare /> Message</Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Payslip downloaded", { description: `${e.id}-November.pdf` })}><Download /> Payslip</Button>
            {e.status !== "Offboarding" && <Button variant="destructive" size="sm" onClick={() => setConfirm(true)}><UserX /> Start offboarding</Button>}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Details</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid gap-5 sm:grid-cols-2">
                  {[[Mail, "Email", e.email], [Phone, "Phone", e.phone], [MapPin, "Work location", e.location], [Clock, "Shift", `${e.shift} shift`], [CalendarDays, "Joined", formatDate(e.joinDate)], [Award, "Access role", e.accessRole]].map(([I, l, v]) => {
                    const Icon = I as typeof Mail;
                    return <div key={l as string} className="flex gap-3"><Icon className="mt-0.5 size-4 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">{l as string}</dt><dd className="text-sm font-medium">{v as string}</dd></div></div>;
                  })}
                </dl>
                <div className="mt-6 border-t pt-5">
                  <p className="text-xs font-medium text-muted-foreground">Skills & certifications</p>
                  <div className="mt-2 flex flex-wrap gap-2">{e.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-6">
              <Card><CardHeader><CardTitle>Reports to</CardTitle></CardHeader><CardContent>
                {manager ? <Link href={`/app/team/${manager.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50"><Avatar name={manager.name} size={36} /><div><p className="text-sm font-medium">{manager.name}</p><p className="text-xs text-muted-foreground">{manager.role}</p></div></Link> : <div className="flex items-center gap-3 p-2"><Avatar name="Zia Ullah" size={36} /><div><p className="text-sm font-medium">Zia Ullah</p><p className="text-xs text-muted-foreground">Founder & CEO</p></div></div>}
              </CardContent></Card>
              <Card><CardHeader><CardTitle>This month</CardTitle></CardHeader><CardContent className="space-y-4">
                <div><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">Performance</span><span className="font-medium tabular">{e.performance}/100</span></div><Progress value={e.performance} tone="success" label="Performance" /></div>
                <div><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">Attendance</span><span className="font-medium tabular">{e.attendanceRate}%</span></div><Progress value={e.attendanceRate} label="Attendance" /></div>
              </CardContent></Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="performance">
          <ChartCard title="Performance history" description="Overall score and QA audit score, last 6 months" summary={`Performance moved from ${history[0].score} to ${history[5].score} over six months.`}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={history}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="month" {...axisProps} /><YAxis domain={[60, 100]} {...axisProps} width={32} /><RTooltip content={<ChartTooltip />} />
                <Line dataKey="score" name="Performance" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} /><Line dataKey="qa" name="QA score" stroke="#10B981" strokeWidth={2} strokeDasharray="5 4" dot={false} /></LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
        <TabsContent value="attendance">
          <Card><CardHeader><CardTitle>Last 14 working days</CardTitle></CardHeader><CardContent>
            <ul className="grid grid-cols-7 gap-2 lg:grid-cols-[repeat(14,minmax(0,1fr))]">
              {days.map((d) => <li key={d.d} className={cn("flex h-14 flex-col items-center justify-center rounded-lg border text-[11px] font-medium", d.s === "Present" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : d.s === "Late" ? "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300" : "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300")}><span className="text-muted-foreground">D{d.d + 1}</span>{d.s}</li>)}
            </ul>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="compensation">
          <Card><CardHeader><CardTitle>Compensation · November</CardTitle></CardHeader><CardContent>
            {pay ? (
              <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[["Base", pay.base], ["Overtime", pay.overtime], ["Bonus", pay.bonus], ["Deductions", -pay.deductions], ["Tax", -pay.tax], ["Net pay", pay.net]].map(([l, v]) => (
                  <div key={l as string} className={cn("rounded-lg border p-4", l === "Net pay" && "border-primary/30 bg-primary/5")}><dt className="text-xs text-muted-foreground">{l as string}</dt><dd className="mt-1 text-lg font-semibold tabular">{formatCurrency(v as number)}</dd></div>
                ))}
              </dl>
            ) : <p className="text-sm text-muted-foreground">No payroll line yet. New hires appear after their first full period.</p>}
            <p className="mt-4 text-xs text-muted-foreground">Paid in {e.currency}. Amounts shown in USD equivalent at the period rate.</p>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>Documents</CardTitle><Button size="sm" variant="outline" onClick={() => toast.success("Upload started", { description: "Files are virus-scanned and encrypted at rest." })}><Upload /> Upload</Button></CardHeader><CardContent>
            <ul className="divide-y">{docs.map(([n, s, sz]) => <li key={n} className="flex items-center gap-3 py-3"><FileText className="size-5 text-muted-foreground" /><div className="flex-1"><p className="text-sm font-medium">{n}</p><p className="text-xs text-muted-foreground">{sz}</p></div><Badge variant="success" dot>{s}</Badge><Button variant="ghost" size="icon-sm" aria-label={`Download ${n}`} onClick={() => toast.success(`Downloading ${n}`)}><Download /></Button></li>)}</ul>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} destructive loading={busy} title={`Start offboarding ${e.name}?`} description="We'll schedule access removal for their last day, create an asset return task and hold their final payroll line for review. You can cancel before the last day." confirmLabel="Start offboarding" onConfirm={offboard} />
    </>
  );
}
