"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download, UserPlus, Users, Building2, ShieldCheck, Network, ClipboardList, Check, Minus, ChevronDown, MapPin } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import { departments } from "@/lib/mock/data";
import type { Employee } from "@/lib/mock/types";
import { PageHeader, DataTable, StatusBadge, FilterSelect, StatCard, type Column } from "@/components/dashboard/kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, Progress } from "@/components/ui/misc";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, Input, NativeSelect } from "@/components/ui/input";
import { cn, downloadFile, formatDate, toCSV } from "@/lib/utils";

export default function TeamPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, loading, setData } = useService(() => services.team.list());
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [loc, setLoc] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState(params.get("tab") ?? "directory");
  useEffect(() => { if (params.get("new")) setAddOpen(true); }, [params]);

  const rows = useMemo(() => (data ?? []).filter((e) => (!dept || e.department === dept) && (!status || e.status === status) && (!loc || e.location === loc)), [data, dept, status, loc]);

  const columns: Column<Employee>[] = [
    { key: "name", header: "Employee", sortValue: (e) => e.name, cell: (e) => (
      <div className="flex items-center gap-3"><Avatar name={e.name} size={32} /><div className="min-w-0"><p className="font-medium">{e.name}</p><p className="text-xs text-muted-foreground">{e.id}</p></div></div>
    ) },
    { key: "role", header: "Role", sortValue: (e) => e.role, cell: (e) => <div><p>{e.role}</p><p className="text-xs text-muted-foreground">{e.team}</p></div> },
    { key: "dept", header: "Department", sortValue: (e) => e.department, cell: (e) => e.department, hideBelow: "md" },
    { key: "loc", header: "Location", sortValue: (e) => e.location, cell: (e) => <span className="inline-flex items-center gap-1.5 text-muted-foreground"><MapPin className="size-3.5" />{e.location}</span>, hideBelow: "lg" },
    { key: "shift", header: "Shift", sortValue: (e) => e.shift, cell: (e) => e.shift, hideBelow: "lg" },
    { key: "perf", header: "Performance", sortValue: (e) => e.performance, cell: (e) => (
      <div className="flex w-28 items-center gap-2"><Progress value={e.performance} tone={e.performance >= 90 ? "success" : e.performance >= 78 ? "primary" : "warning"} label={`${e.name} performance`} /><span className="w-7 text-xs tabular">{e.performance || "—"}</span></div>
    ), hideBelow: "md" },
    { key: "status", header: "Status", sortValue: (e) => e.status, cell: (e) => <StatusBadge status={e.status} /> },
  ];

  const counts = useMemo(() => {
    const d = data ?? [];
    return { total: d.length, onboarding: d.filter((e) => e.status === "Onboarding").length, leave: d.filter((e) => e.status === "On leave").length, avg: d.length ? (d.reduce((a, e) => a + e.performance, 0) / d.length).toFixed(1) : "0" };
  }, [data]);

  return (
    <>
      <PageHeader title="Team" description="Everyone across Karachi, Lahore, Islamabad, Manila and remote, with their teams, shifts and status."
        actions={<>
          <Button variant="outline" size="sm" onClick={() => { downloadFile("employees.csv", toCSV(rows, ["id", "name", "role", "department", "team", "location", "shift", "status", "email"])); toast.success(`Exported ${rows.length} employees`); }}><Download /> Export</Button>
          <Button size="sm" onClick={() => setAddOpen(true)}><UserPlus /> Add employee</Button>
        </>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Headcount" value={String(counts.total)} icon={Users} tone="blue" delta={5.1} deltaLabel="vs last quarter" loading={loading} />
        <StatCard label="Departments" value={String(departments.length)} icon={Building2} tone="violet" loading={loading} />
        <StatCard label="Onboarding now" value={String(counts.onboarding)} icon={ClipboardList} tone="cyan" loading={loading} />
        <StatCard label="Avg. performance" value={counts.avg} icon={ShieldCheck} tone="emerald" delta={2.1} deltaLabel="pts vs last quarter" loading={loading} />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="directory"><Users /> Directory</TabsTrigger>
          <TabsTrigger value="departments"><Building2 /> Departments</TabsTrigger>
          <TabsTrigger value="hierarchy"><Network /> Hierarchy</TabsTrigger>
          <TabsTrigger value="lifecycle"><ClipboardList /> Onboarding</TabsTrigger>
          <TabsTrigger value="roles"><ShieldCheck /> Roles & permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="directory">
          <DataTable rows={rows} columns={columns} loading={loading} caption="Employee directory" rowKey={(e) => e.id}
            searchKeys={(e) => `${e.name} ${e.role} ${e.id} ${e.email} ${e.team} ${e.skills.join(" ")}`} searchPlaceholder="Search name, role, skill…"
            onRowClick={(e) => router.push(`/app/team/${e.id}`)}
            filters={<>
              <FilterSelect label="Departments" value={dept} onChange={setDept} options={departments.map((d) => d.name)} />
              <FilterSelect label="Statuses" value={status} onChange={setStatus} options={["Active", "On leave", "Onboarding", "Probation", "Offboarding"]} />
              <FilterSelect label="Locations" value={loc} onChange={setLoc} options={["Karachi HQ", "Lahore Center", "Islamabad Hub", "Manila Site", "Remote"]} />
            </>}
            emptyTitle="No employees match these filters" emptyDescription="Try clearing a filter to see more people." />
        </TabsContent>
        <TabsContent value="departments">
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {departments.map((d) => {
              const people = (data ?? []).filter((e) => e.department === d.name);
              return (
                <li key={d.name}>
                  <Card className="h-full p-5">
                    <div className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: d.color }} /><h3 className="font-semibold">{d.name}</h3></div>
                    <p className="mt-3 text-3xl font-semibold tabular">{people.length}</p>
                    <p className="text-xs text-muted-foreground">people · head: {d.head}</p>
                    <div className="mt-4 flex -space-x-2">{people.slice(0, 6).map((p) => <Avatar key={p.id} name={p.name} size={28} />)}{people.length > 6 && <span className="grid size-7 place-items-center rounded-full bg-muted text-[10px] font-medium ring-2 ring-background">+{people.length - 6}</span>}</div>
                    <Button variant="link" size="sm" className="mt-3" onClick={() => { setDept(d.name); setTab("directory"); }}>View people</Button>
                  </Card>
                </li>
              );
            })}
          </ul>
        </TabsContent>
        <TabsContent value="hierarchy"><OrgChart employees={data ?? []} /></TabsContent>
        <TabsContent value="lifecycle"><Lifecycle employees={data ?? []} onUpdate={(id, s) => setData((d) => d?.map((e) => (e.id === id ? { ...e, status: s } : e)) ?? null)} /></TabsContent>
        <TabsContent value="roles"><Permissions /></TabsContent>
      </Tabs>
      <AddEmployeeDialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o && params.get("new")) router.replace("/app/team"); }} onCreated={(e) => setData((d) => [e, ...(d ?? [])])} />
    </>
  );
}

function OrgChart({ employees }: { employees: Employee[] }) {
  const [open, setOpen] = useState<string | null>(departments[0].name);
  return (
    <Card>
      <CardHeader><CardTitle>Reporting structure</CardTitle><CardDescription>CEO → department heads → team leads → agents. Expand a department to see its teams.</CardDescription></CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 rounded-xl border bg-primary/5 px-4 py-3"><Avatar name="Zia Ullah" size={36} /><div><p className="text-sm font-semibold">Zia Ullah</p><p className="text-xs text-muted-foreground">Founder & CEO</p></div></div>
          <div className="h-6 w-px bg-border" />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((d) => {
            const people = employees.filter((e) => e.department === d.name);
            const teams = Array.from(new Set(people.map((p) => p.team)));
            const isOpen = open === d.name;
            return (
              <li key={d.name} className="rounded-xl border">
                <button className="flex w-full items-center gap-3 p-3 text-left" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : d.name)}>
                  <Avatar name={d.head} size={32} />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{d.head}</p><p className="truncate text-xs text-muted-foreground">{d.name} · {people.length}</p></div>
                  <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <ul className="space-y-1 border-t p-3">
                    {teams.map((t) => {
                      const members = people.filter((p) => p.team === t);
                      const lead = members.find((m) => m.role === "Team Lead") ?? members[0];
                      return <li key={t} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"><span className="truncate">{t}<span className="block text-xs text-muted-foreground">Lead: {lead?.name}</span></span><span className="text-xs tabular text-muted-foreground">{members.length}</span></li>;
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

const onboardingSteps = ["Offer signed", "Documents (CNIC, bank)", "IT account & headset", "Product training", "Shadow shifts", "Go live"];

function Lifecycle({ employees, onUpdate }: { employees: Employee[]; onUpdate: (id: string, s: Employee["status"]) => void }) {
  const onboarding = employees.filter((e) => e.status === "Onboarding");
  const offboarding = employees.filter((e) => e.status === "Offboarding");
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Onboarding · {onboarding.length}</CardTitle><CardDescription>Checklist progress for new hires.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {onboarding.map((e, i) => {
            const done = (i % 5) + 1;
            return (
              <div key={e.id} className="rounded-lg border p-3">
                <div className="flex items-center gap-3"><Avatar name={e.name} size={30} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{e.name}</p><p className="truncate text-xs text-muted-foreground">{e.role} · {e.team}</p></div>
                  <Button size="sm" variant="outline" onClick={() => { onUpdate(e.id, "Active"); toast.success(`${e.name} is now active`, { description: "Added to the roster and payroll." }); }}>Complete</Button></div>
                <ol className="mt-3 flex flex-wrap gap-1.5">{onboardingSteps.map((s, k) => <li key={s} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]", k < done ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground")}>{k < done && <Check className="size-3" />}{s}</li>)}</ol>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Offboarding · {offboarding.length}</CardTitle><CardDescription>Access removal, asset return and final settlement.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {offboarding.length === 0 && <p className="text-sm text-muted-foreground">Nobody is offboarding right now.</p>}
          {offboarding.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar name={e.name} size={30} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{e.name}</p><p className="text-xs text-muted-foreground">Last day in 6 days · laptop & headset pending</p></div><StatusBadge status="Offboarding" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const perms = ["View team directory", "Edit employee records", "Approve leave & overtime", "View salaries", "Run payroll", "Create invoices", "Manage clients & contracts", "Workspace settings"];
const roleMatrix: Record<string, boolean[]> = {
  Owner: [true, true, true, true, true, true, true, true],
  Admin: [true, true, true, true, false, true, true, true],
  Finance: [true, false, false, true, true, true, false, false],
  Manager: [true, true, true, false, false, false, true, false],
  "Team Lead": [true, false, true, false, false, false, false, false],
  Agent: [false, false, false, false, false, false, false, false],
};

function Permissions() {
  const [matrix, setMatrix] = useState(roleMatrix);
  const roles = Object.keys(matrix);
  return (
    <Card className="overflow-hidden">
      <CardHeader><CardTitle>Roles and permissions</CardTitle><CardDescription>Owners can toggle a permission. Changes are recorded in the audit log.</CardDescription></CardHeader>
      <div className="mt-4 relative overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[720px] text-sm">
          <caption className="sr-only">Permission matrix by role</caption>
          <thead><tr className="border-y bg-muted/40"><th scope="col" className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Permission</th>{roles.map((r) => <th key={r} scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">{r}</th>)}</tr></thead>
          <tbody>
            {perms.map((p, i) => (
              <tr key={p} className="border-b last:border-0">
                <th scope="row" className="px-5 py-3 text-left font-normal">{p}</th>
                {roles.map((r) => {
                  const on = matrix[r][i];
                  const locked = r === "Owner";
                  return (
                    <td key={r} className="px-3 py-2 text-center">
                      <button disabled={locked} aria-pressed={on} aria-label={`${r}: ${p}`} onClick={() => { setMatrix((m) => ({ ...m, [r]: m[r].map((v, k) => (k === i ? !v : v)) })); toast.success(`${r} ${on ? "can no longer" : "can now"} ${p.toLowerCase()}`); }}
                        className={cn("mx-auto grid size-7 place-items-center rounded-md border transition-colors disabled:cursor-not-allowed", on ? "border-primary/30 bg-primary/10 text-primary" : "text-muted-foreground/50 hover:bg-muted")}>
                        {on ? <Check className="size-4" /> : <Minus className="size-4" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const schema = z.object({
  name: z.string().trim().min(3, "Enter the full name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a phone number"),
  role: z.string().trim().min(2, "Enter a role"),
  department: z.string().min(1, "Choose a department"),
  location: z.string().min(1, "Choose a location"),
  shift: z.enum(["Morning", "Evening", "Night", "Flexible"]),
  salary: z.coerce.number({ invalid_type_error: "Enter a number" }).min(150, "Salary looks too low").max(20000, "Salary looks too high"),
});

function AddEmployeeDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (e: Employee) => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { shift: "Morning", location: "Karachi HQ", department: "" } });
  const submit = async (v: z.output<typeof schema>) => {
    const e = await services.team.create({ ...v, team: "Unassigned", status: "Onboarding", currency: v.location === "Manila Site" ? "PHP" : "PKR", accessRole: "Agent" });
    onCreated(e);
    toast.success(`${v.name} added`, { description: "Onboarding checklist created and welcome email queued." });
    reset();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Add employee</DialogTitle><DialogDescription>They&apos;ll start in Onboarding with a checklist and a welcome email.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="ae-name" error={errors.name?.message} required><Input id="ae-name" aria-invalid={!!errors.name} {...register("name")} /></Field>
            <Field label="Work email" htmlFor="ae-email" error={errors.email?.message} required><Input id="ae-email" type="email" aria-invalid={!!errors.email} {...register("email")} /></Field>
            <Field label="Phone" htmlFor="ae-phone" error={errors.phone?.message} required><Input id="ae-phone" type="tel" aria-invalid={!!errors.phone} {...register("phone")} /></Field>
            <Field label="Role" htmlFor="ae-role" error={errors.role?.message} required><Input id="ae-role" placeholder="Customer Support Agent" aria-invalid={!!errors.role} {...register("role")} /></Field>
            <Field label="Department" htmlFor="ae-dept" error={errors.department?.message} required>
              <NativeSelect id="ae-dept" aria-invalid={!!errors.department} {...register("department")}><option value="">Choose…</option>{departments.map((d) => <option key={d.name}>{d.name}</option>)}</NativeSelect>
            </Field>
            <Field label="Location" htmlFor="ae-loc" error={errors.location?.message} required>
              <NativeSelect id="ae-loc" {...register("location")}>{["Karachi HQ", "Lahore Center", "Islamabad Hub", "Manila Site", "Remote"].map((l) => <option key={l}>{l}</option>)}</NativeSelect>
            </Field>
            <Field label="Shift" htmlFor="ae-shift" required><NativeSelect id="ae-shift" {...register("shift")}>{["Morning", "Evening", "Night", "Flexible"].map((l) => <option key={l}>{l}</option>)}</NativeSelect></Field>
            <Field label="Monthly salary (USD equiv.)" htmlFor="ae-sal" error={errors.salary?.message} required><Input id="ae-sal" inputMode="numeric" placeholder="420" aria-invalid={!!errors.salary} {...register("salary")} /></Field>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" loading={isSubmitting}>Add employee</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
