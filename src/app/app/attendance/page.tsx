"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Line, ComposedChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { UserCheck, Clock3, UserX, Plane, Laptop, LogIn, LogOut, Coffee, Check, X, Download, CalendarDays, Monitor, Smartphone, Building, Timer } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import { holidays } from "@/lib/mock/data";
import type { AttendanceRecord, LeaveRequest } from "@/lib/mock/types";
import { PageHeader, StatCard, DataTable, StatusBadge, FilterSelect, ChartCard, ChartTooltip, axisProps, ConfirmDialog, type Column } from "@/components/dashboard/kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, EmptyState } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { cn, downloadFile, formatDate, toCSV } from "@/lib/utils";

const deviceIcon = { "Desktop agent": Monitor, Mobile: Smartphone, "Office kiosk": Building } as const;

export default function AttendancePage() {
  const params = useSearchParams();
  const today = useService(() => services.attendance.today());
  const trend = useService(() => services.attendance.trend());
  const leave = useService(() => services.attendance.leave());
  const [status, setStatus] = useState("");
  const [site, setSite] = useState("");
  const [tab, setTab] = useState(params.get("tab") ?? "today");
  useEffect(() => { const t = params.get("tab"); if (t) setTab(t); }, [params]);

  const rows = useMemo(() => (today.data ?? []).filter((r) => (!status || r.status === status) && (!site || r.site === site)), [today.data, status, site]);
  const count = (s: AttendanceRecord["status"]) => (today.data ?? []).filter((r) => r.status === s).length;
  const pendingLeave = (leave.data ?? []).filter((l) => l.status === "Pending").length;

  const columns: Column<AttendanceRecord>[] = [
    { key: "name", header: "Employee", sortValue: (r) => r.name, cell: (r) => <div className="flex items-center gap-3"><Avatar name={r.name} size={28} /><div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.department}</p></div></div> },
    { key: "shift", header: "Shift", sortValue: (r) => r.shift, cell: (r) => r.shift, hideBelow: "md" },
    { key: "in", header: "Clock in", sortValue: (r) => r.clockIn ?? "99", cell: (r) => <span className="tabular">{r.clockIn ?? "—"}</span> },
    { key: "out", header: "Clock out", sortValue: (r) => r.clockOut ?? "99", cell: (r) => <span className="tabular">{r.clockOut ?? (r.clockIn ? <span className="text-emerald-600 dark:text-emerald-400">On shift</span> : "—")}</span> },
    { key: "break", header: "Breaks", sortValue: (r) => r.breakMinutes, cell: (r) => <span className="tabular">{r.breakMinutes ? `${r.breakMinutes}m` : "—"}</span>, hideBelow: "lg", align: "right" },
    { key: "hours", header: "Hours", sortValue: (r) => r.hours, cell: (r) => <span className="tabular">{r.hours ? r.hours.toFixed(1) : "—"}</span>, align: "right" },
    { key: "ot", header: "Overtime", sortValue: (r) => r.overtime, cell: (r) => r.overtime ? <span className="font-medium tabular text-amber-600 dark:text-amber-400">+{r.overtime}h</span> : <span className="text-muted-foreground">—</span>, align: "right", hideBelow: "md" },
    { key: "device", header: "Device · site", sortValue: (r) => r.device, cell: (r) => { const I = deviceIcon[r.device]; return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><I className="size-3.5" />{r.device} · {r.site}</span>; }, hideBelow: "lg" },
    { key: "status", header: "Status", sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <PageHeader title="Attendance & time" description={`Live presence for ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} across all sites and shifts.`}
        actions={<Button variant="outline" size="sm" onClick={() => { downloadFile("attendance-today.csv", toCSV(rows)); toast.success("Attendance report exported"); }}><Download /> Export report</Button>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Present" value={String(count("Present"))} icon={UserCheck} tone="emerald" loading={today.loading} />
        <StatCard label="Remote" value={String(count("Remote"))} icon={Laptop} tone="cyan" loading={today.loading} />
        <StatCard label="Late arrivals" value={String(count("Late"))} icon={Clock3} tone="amber" loading={today.loading} hint="Clocked in more than 5 minutes after shift start." />
        <StatCard label="Absent" value={String(count("Absent"))} icon={UserX} tone="rose" loading={today.loading} />
        <StatCard label="On leave" value={String(count("On leave"))} icon={Plane} tone="violet" loading={today.loading} />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="leave">Leave requests {pendingLeave > 0 && <Badge variant="warning" className="px-1.5 py-0">{pendingLeave}</Badge>}</TabsTrigger>
          <TabsTrigger value="overtime">Overtime approvals</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="calendar">Shift & holiday calendar</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="today">
          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <DataTable rows={rows} columns={columns} loading={today.loading} caption="Today's attendance" rowKey={(r) => r.id} searchKeys={(r) => `${r.name} ${r.department}`} searchPlaceholder="Search employee or department…"
              filters={<><FilterSelect label="Statuses" value={status} onChange={setStatus} options={["Present", "Remote", "Late", "Absent", "On leave"]} /><FilterSelect label="Sites" value={site} onChange={setSite} options={["Karachi HQ", "Lahore Center", "Islamabad Hub", "Manila Site", "Remote"]} /></>} />
            <ClockWidget />
          </div>
        </TabsContent>
        <TabsContent value="leave"><LeaveQueue requests={leave.data ?? []} onChange={(r) => leave.setData((d) => d?.map((x) => (x.id === r.id ? r : x)) ?? null)} /></TabsContent>
        <TabsContent value="overtime"><OvertimeApprovals /></TabsContent>
        <TabsContent value="timesheets"><Timesheets records={today.data ?? []} /></TabsContent>
        <TabsContent value="calendar"><ShiftCalendar /></TabsContent>
        <TabsContent value="reports">
          <ChartCard title="Attendance trend" description="Daily attendance rate with late arrivals, last 30 days" summary={trend.data ? `Attendance averaged ${(trend.data.reduce((a, d) => a + d.rate, 0) / trend.data.length).toFixed(1)}% over 30 days.` : "Loading"}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trend.data ?? []}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" {...axisProps} interval={4} />
                <YAxis yAxisId="l" domain={[88, 100]} {...axisProps} width={36} />
                <YAxis yAxisId="r" orientation="right" {...axisProps} width={30} />
                <RTooltip content={<ChartTooltip />} />
                <Bar yAxisId="r" dataKey="late" name="Late arrivals" fill="#F59E0B" opacity={0.55} radius={[3, 3, 0, 0]} barSize={10} />
                <Line yAxisId="l" dataKey="rate" name="Attendance %" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </>
  );
}

function ClockWidget() {
  const [state, setState] = useState<"out" | "in" | "break">("out");
  const [since, setSince] = useState<Date | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const elapsed = since && now ? Math.floor((now.getTime() - since.getTime()) / 1000) : 0;
  const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return (
    <Card className="h-fit">
      <CardHeader><CardTitle>My time clock</CardTitle><CardDescription>Karachi HQ · Morning shift 08:00–17:00</CardDescription></CardHeader>
      <CardContent>
        <div className="rounded-xl border bg-muted/30 p-5 text-center">
          <p className="font-mono text-4xl font-semibold tabular" suppressHydrationWarning>{now ? now.toLocaleTimeString("en-US", { hour12: false }) : "--:--:--"}</p>
          <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">{state === "out" ? "You're clocked out" : state === "break" ? `On break · ${fmt(elapsed)}` : `Working · ${fmt(elapsed)}`}</p>
        </div>
        <div className="mt-4 grid gap-2">
          {state === "out" && <Button onClick={() => { setState("in"); setSince(new Date()); toast.success("Clocked in", { description: "Location verified: Karachi HQ (office network)." }); }}><LogIn /> Clock in</Button>}
          {state === "in" && <><Button variant="outline" onClick={() => { setState("break"); setSince(new Date()); toast("Break started"); }}><Coffee /> Start break</Button><Button variant="destructive" onClick={() => { setState("out"); setSince(null); toast.success("Clocked out", { description: "Your timesheet has been updated." }); }}><LogOut /> Clock out</Button></>}
          {state === "break" && <Button onClick={() => { setState("in"); setSince(new Date()); toast("Welcome back"); }}><Timer /> End break</Button>}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Device: Desktop agent v3.2 · IP verified against office allowlist.</p>
      </CardContent>
    </Card>
  );
}

function LeaveQueue({ requests, onChange }: { requests: LeaveRequest[]; onChange: (r: LeaveRequest) => void }) {
  const [pending, setPending] = useState<{ r: LeaveRequest; action: "Approved" | "Declined" } | null>(null);
  const [busy, setBusy] = useState(false);
  const decide = async () => {
    if (!pending) return;
    setBusy(true);
    await services.attendance.decideLeave(pending.r.id, pending.action);
    onChange({ ...pending.r, status: pending.action });
    toast.success(`Leave ${pending.action.toLowerCase()}`, { description: `${pending.r.name} has been notified.` });
    setBusy(false);
    setPending(null);
  };
  if (!requests.length) return <EmptyState icon={Plane} title="No leave requests" description="When employees request time off, it will show up here for approval." />;
  return (
    <>
      <ul className="grid gap-3 lg:grid-cols-2">
        {requests.map((r) => (
          <li key={r.id}>
            <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <Avatar name={r.name} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className="font-medium">{r.name}</p><Badge variant="secondary">{r.type}</Badge><StatusBadge status={r.status} /></div>
                <p className="mt-1 text-sm text-muted-foreground"><CalendarDays className="mr-1 inline size-3.5" />{formatDate(r.from, { month: "short", day: "numeric" })} – {formatDate(r.to, { month: "short", day: "numeric" })} · {r.days} day{r.days > 1 && "s"}</p>
                <p className="mt-1 text-sm">{r.reason}</p>
              </div>
              {r.status === "Pending" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPending({ r, action: "Declined" })}><X /> Decline</Button>
                  <Button size="sm" onClick={() => setPending({ r, action: "Approved" })}><Check /> Approve</Button>
                </div>
              )}
            </Card>
          </li>
        ))}
      </ul>
      <ConfirmDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)} loading={busy} destructive={pending?.action === "Declined"}
        title={pending ? `${pending.action === "Approved" ? "Approve" : "Decline"} ${pending.r.days}-day ${pending.r.type.toLowerCase()} leave?` : ""}
        description={pending ? (pending.action === "Approved" ? `${pending.r.name}'s shifts will be marked as leave and their team lead will be asked to arrange cover.` : `${pending.r.name} will be notified. You can add a note in their profile.`) : ""}
        confirmLabel={pending?.action === "Approved" ? "Approve leave" : "Decline leave"} onConfirm={decide} />
    </>
  );
}

function OvertimeApprovals() {
  const [items, setItems] = useState([
    { id: "OT1", team: "Voice Team A", client: "Northstar Retail", agents: 22, hours: 46, reason: "Holiday peak volume +38%", status: "Pending" },
    { id: "OT2", team: "Claims Processing", client: "Meridian Insurance", agents: 9, hours: 27, reason: "Backlog clearance before SLA review", status: "Pending" },
    { id: "OT3", team: "Tier 1 Helpdesk", client: "Nova Support Services", agents: 4, hours: 8, reason: "Migration cutover weekend", status: "Approved" },
  ]);
  const act = (id: string, status: string) => { setItems((x) => x.map((i) => (i.id === id ? { ...i, status } : i))); toast.success(`Overtime ${status.toLowerCase()}`, { description: "Payroll will pick this up automatically." }); };
  return (
    <Card className="overflow-hidden">
      <CardHeader><CardTitle>Overtime requests</CardTitle><CardDescription>Requests above 4 hours per agent per week need manager approval.</CardDescription></CardHeader>
      <ul className="mt-4 divide-y border-t">
        {items.map((i) => (
          <li key={i.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
            <div className="flex-1"><p className="font-medium">{i.team} · {i.client}</p><p className="text-sm text-muted-foreground">{i.agents} agents · {i.hours} extra hours · {i.reason}</p></div>
            {i.status === "Pending" ? <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => act(i.id, "Declined")}>Decline</Button><Button size="sm" onClick={() => act(i.id, "Approved")}>Approve</Button></div> : <StatusBadge status={i.status} />}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Timesheets({ records }: { records: AttendanceRecord[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const rows = records.filter((r) => r.hours).slice(0, 12);
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between"><div><CardTitle>Weekly timesheets</CardTitle><CardDescription>Hours per day, auto-filled from clock events.</CardDescription></div><Button size="sm" onClick={() => toast.success("12 timesheets approved", { description: "Locked for payroll." })}><Check /> Approve all</Button></CardHeader>
      <div className="mt-4 relative overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[720px] text-sm">
          <caption className="sr-only">Weekly timesheets</caption>
          <thead><tr className="border-y bg-muted/40 text-xs text-muted-foreground"><th scope="col" className="px-5 py-2.5 text-left font-medium">Employee</th>{days.map((d) => <th key={d} scope="col" className="px-3 py-2.5 text-right font-medium">{d}</th>)}<th scope="col" className="px-5 py-2.5 text-right font-medium">Total</th></tr></thead>
          <tbody>
            {rows.map((r, i) => {
              const hrs = days.map((_, k) => (k === 5 && i % 3 ? 0 : +(r.hours - 0.5 + ((i + k) % 4) * 0.3).toFixed(1)));
              const total = hrs.reduce((a, b) => a + b, 0);
              return <tr key={r.id} className="border-b last:border-0"><th scope="row" className="px-5 py-2.5 text-left font-medium">{r.name}</th>{hrs.map((h, k) => <td key={k} className={cn("px-3 py-2.5 text-right tabular", !h && "text-muted-foreground")}>{h ? h.toFixed(1) : "—"}</td>)}<td className={cn("px-5 py-2.5 text-right font-semibold tabular", total > 48 && "text-amber-600 dark:text-amber-400")}>{total.toFixed(1)}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ShiftCalendar() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const cells = Array.from({ length: offset + daysInMonth }, (_, i) => (i < offset ? null : i - offset + 1));
  const shifts = [["Morning", "bg-blue-500"], ["Evening", "bg-violet-500"], ["Night", "bg-slate-500"]];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <Card>
        <CardHeader><CardTitle>{now.toLocaleDateString("en-US", { month: "long", year: "numeric" })} · Voice Team A</CardTitle><CardDescription>Coverage by shift. Days below target are flagged.</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted-foreground">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-1 font-medium">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const isToday = d === now.getDate();
              const under = d % 9 === 4;
              const sunday = (i % 7) === 6;
              return (
                <div key={i} className={cn("min-h-[64px] rounded-lg border p-1.5 text-left sm:min-h-[84px]", isToday && "border-primary ring-1 ring-primary", under && "border-amber-500/40 bg-amber-500/5", sunday && "bg-muted/40")}>
                  <p className={cn("text-xs font-medium", isToday && "text-primary")}>{d}</p>
                  {!sunday && <div className="mt-1 space-y-0.5">{shifts.map(([s, c], k) => <div key={s} className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className={cn("size-1.5 rounded-full", c)} /><span className="hidden sm:inline">{s.slice(0, 3)}</span> <span className="tabular">{[14, 9, 6][k] - (under && k === 1 ? 3 : 0)}</span></div>)}</div>}
                  {under && <p className="mt-0.5 hidden text-[10px] font-medium text-amber-600 dark:text-amber-400 sm:block">Under target</p>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardHeader><CardTitle>Upcoming holidays</CardTitle></CardHeader>
        <CardContent><ul className="space-y-3">{holidays.map((h) => <li key={h.date} className="flex gap-3"><div className="grid w-12 shrink-0 place-items-center rounded-lg border py-1.5 text-center"><span className="text-[10px] uppercase text-muted-foreground">{formatDate(h.date, { month: "short" })}</span><span className="text-lg font-semibold leading-none tabular">{new Date(h.date).getDate()}</span></div><div><p className="text-sm font-medium">{h.name}</p><p className="text-xs text-muted-foreground">{h.sites}</p></div></li>)}</ul></CardContent>
      </Card>
    </div>
  );
}
