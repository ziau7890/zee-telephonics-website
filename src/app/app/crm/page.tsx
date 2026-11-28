"use client";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { Phone, Mail, Users2, StickyNote, ListTodo, Plus, BellRing, Check, Trash2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import { clients } from "@/lib/mock/data";
import type { Activity, Lead } from "@/lib/mock/types";
import { PageHeader, DataTable, StatusBadge, ChartCard, ChartTooltip, axisProps, type Column } from "@/components/dashboard/kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect, Field } from "@/components/ui/input";
import { Avatar, EmptyState } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { timeAgo } from "@/components/dashboard/format";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const actIcon = { call: Phone, email: Mail, meeting: Users2, note: StickyNote, task: ListTodo } as const;

interface ContactRow { id: string; name: string; title: string; company: string; email: string; type: "Lead" | "Client"; stage: string; owner: string }

export default function CRMPage() {
  const leads = useService(() => services.crm.leads());
  const acts = useService(() => services.crm.activities());
  const contacts: ContactRow[] = useMemo(() => [
    ...(leads.data ?? []).map((l) => ({ id: l.id, name: l.contact, title: l.title, company: l.company, email: l.email, type: "Lead" as const, stage: l.stage, owner: l.owner })),
    ...clients.map((c) => ({ id: c.id, name: c.primaryContact.name, title: c.primaryContact.title, company: c.name, email: c.primaryContact.email, type: "Client" as const, stage: c.status, owner: c.accountManager })),
  ], [leads.data]);

  const columns: Column<ContactRow>[] = [
    { key: "name", header: "Contact", sortValue: (c) => c.name, cell: (c) => <div className="flex items-center gap-3"><Avatar name={c.name} size={30} /><div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.title}</p></div></div> },
    { key: "company", header: "Company", sortValue: (c) => c.company, cell: (c) => c.company },
    { key: "type", header: "Type", sortValue: (c) => c.type, cell: (c) => <Badge variant={c.type === "Client" ? "success" : "default"}>{c.type}</Badge>, hideBelow: "sm" },
    { key: "stage", header: "Stage / status", sortValue: (c) => c.stage, cell: (c) => <StatusBadge status={c.stage} />, hideBelow: "md" },
    { key: "email", header: "Email", sortValue: (c) => c.email, cell: (c) => <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="text-primary hover:underline">{c.email}</a>, hideBelow: "lg" },
    { key: "owner", header: "Owner", sortValue: (c) => c.owner, cell: (c) => c.owner, hideBelow: "lg" },
  ];

  const funnel = useMemo(() => {
    const d = leads.data ?? [];
    const order = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won"];
    return order.map((s, i) => ({ stage: s, count: d.filter((l) => order.indexOf(l.stage) >= i && l.stage !== "Lost").length }));
  }, [leads.data]);

  return (
    <>
      <PageHeader title="CRM" description="Contacts, activities, reminders and conversion reporting for every prospect and client." />
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="reminders">Follow-ups</TabsTrigger>
          <TabsTrigger value="reports">Conversion</TabsTrigger>
          <TabsTrigger value="fields">Custom fields</TabsTrigger>
        </TabsList>
        <TabsContent value="activity"><ActivityFeed items={acts.data ?? []} setItems={(fn) => acts.setData((d) => fn(d ?? []))} leads={leads.data ?? []} /></TabsContent>
        <TabsContent value="contacts">
          <DataTable rows={contacts} columns={columns} loading={leads.loading} caption="Contacts" rowKey={(c) => c.id + c.type} searchKeys={(c) => `${c.name} ${c.company} ${c.email}`} searchPlaceholder="Search contacts…" />
        </TabsContent>
        <TabsContent value="reminders"><Reminders leads={leads.data ?? []} /></TabsContent>
        <TabsContent value="reports">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Pipeline funnel" description="Leads reaching each stage" summary={funnel.map((f) => `${f.stage}: ${f.count}`).join(", ")}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={funnel} layout="vertical" margin={{ left: 12, right: 24 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" {...axisProps} allowDecimals={false} />
                  <YAxis type="category" dataKey="stage" {...axisProps} width={88} />
                  <RTooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]} barSize={22}>{funnel.map((_, i) => <Cell key={i} fill={["#94A3B8", "#22D3EE", "#3B82F6", "#8B5CF6", "#D946EF", "#10B981"][i]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <Card>
              <CardHeader><CardTitle>Conversion by stage</CardTitle><CardDescription>Share of leads that progress to the next stage.</CardDescription></CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {funnel.slice(0, -1).map((f, i) => {
                    const next = funnel[i + 1].count;
                    const pct = f.count ? Math.round((next / f.count) * 100) : 0;
                    return <li key={f.stage}><div className="mb-1.5 flex justify-between text-sm"><span>{f.stage} → {funnel[i + 1].stage}</span><span className="font-medium tabular">{pct}%</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${pct}%` }} /></div></li>;
                  })}
                </ul>
                <p className="mt-6 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">Biggest drop-off: <span className="font-medium text-foreground">Proposal → Negotiation</span>. Deals with a pilot offer convert 1.6× more often.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="fields"><CustomFields /></TabsContent>
      </Tabs>
    </>
  );
}

function ActivityFeed({ items, setItems, leads }: { items: Activity[]; setItems: (fn: (d: Activity[]) => Activity[]) => void; leads: Lead[] }) {
  const [type, setType] = useState<Activity["type"]>("call");
  const [subject, setSubject] = useState("");
  const [related, setRelated] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Activity["type"]>("all");
  const log = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 4) return setErr("Describe the activity in at least 4 characters");
    if (!related) return setErr("Choose the related company");
    setErr(null);
    setItems((d) => [{ id: `A${Date.now()}`, type, subject: subject.trim(), who: "Zia Ullah", related, at: new Date().toISOString() }, ...d]);
    setSubject("");
    toast.success("Activity logged");
  };
  const shown = items.filter((i) => filter === "all" || i.type === filter);
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit">
        <CardHeader><CardTitle>Log activity</CardTitle><CardDescription>Calls, emails, meetings, notes and tasks.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={log} noValidate className="grid gap-4">
            <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Activity type">
              {(Object.keys(actIcon) as Activity["type"][]).map((t) => { const I = actIcon[t]; return <button key={t} type="button" role="radio" aria-checked={type === t} onClick={() => setType(t)} className={cn("flex flex-col items-center gap-1 rounded-lg border py-2 text-[11px] capitalize", type === t ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}><I className="size-4" />{t}</button>; })}
            </div>
            <Field label="Summary" htmlFor="act-subject"><Input id="act-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Pricing call, agreed on 12-seat pilot" aria-invalid={!!err && subject.trim().length < 4} /></Field>
            <Field label="Related to" htmlFor="act-related"><NativeSelect id="act-related" value={related} onChange={(e) => setRelated(e.target.value)}><option value="">Choose company…</option>{leads.slice(0, 30).map((l) => <option key={l.id}>{l.company}</option>)}</NativeSelect></Field>
            {err && <p role="alert" className="text-xs font-medium text-destructive">{err}</p>}
            <Button type="submit"><Plus /> Log activity</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3"><CardTitle>Timeline</CardTitle>
          <NativeSelect value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-8 w-36 text-xs" aria-label="Filter activity type"><option value="all">All activity</option>{Object.keys(actIcon).map((t) => <option key={t} value={t} className="capitalize">{t}s</option>)}</NativeSelect>
        </CardHeader>
        <CardContent>
          {shown.length === 0 ? <EmptyState icon={ListTodo} title="No activity of this type yet" description="Log a call, email or meeting to start the timeline." /> : (
            <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-border">
              {shown.map((a) => { const I = actIcon[a.type]; return (
                <li key={a.id} className="relative flex gap-4">
                  <span className="z-10 grid size-8 shrink-0 place-items-center rounded-full border bg-card"><I className="size-3.5 text-muted-foreground" /></span>
                  <div className="min-w-0 flex-1 rounded-lg border p-3">
                    <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{a.subject}</p>{a.outcome && <Badge variant="success">{a.outcome}</Badge>}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{a.who} · {a.related} · {timeAgo(a.at)}</p>
                  </div>
                </li>
              ); })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Reminders({ leads }: { leads: Lead[] }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const due = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp)).slice(0, 12);
  return (
    <Card>
      <CardHeader><CardTitle>Upcoming follow-ups</CardTitle><CardDescription>Sorted by due date. Overdue items are flagged.</CardDescription></CardHeader>
      <CardContent>
        <ul className="divide-y">
          {due.map((l) => {
            const overdue = new Date(l.nextFollowUp).getTime() < Date.now() - 86400000 / 2;
            const isDone = done.has(l.id);
            return (
              <li key={l.id} className={cn("flex items-center gap-3 py-3", isDone && "opacity-50")}>
                <button onClick={() => { setDone((s) => new Set(s).add(l.id)); toast.success(`Follow-up with ${l.contact} completed`); }} disabled={isDone} className={cn("grid size-5 shrink-0 place-items-center rounded-md border", isDone && "border-emerald-500 bg-emerald-500 text-white")} aria-label={`Mark follow-up with ${l.company} done`}>{isDone && <Check className="size-3" />}</button>
                <BellRing className={cn("size-4", overdue ? "text-rose-500" : "text-muted-foreground")} aria-hidden />
                <div className="min-w-0 flex-1"><p className={cn("truncate text-sm font-medium", isDone && "line-through")}>Follow up with {l.contact} · {l.company}</p><p className="text-xs text-muted-foreground">{l.stage} · {formatCurrency(l.value)}/mo · {l.owner}</p></div>
                <span className={cn("text-xs tabular", overdue ? "font-medium text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>{overdue ? "Overdue · " : ""}{formatDate(l.nextFollowUp, { month: "short", day: "numeric" })}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function CustomFields() {
  const [fields, setFields] = useState([
    { name: "Seats requested", type: "Number", required: true },
    { name: "Services needed", type: "Multi-select", required: true },
    { name: "Coverage hours", type: "Single select", required: false },
    { name: "Preferred delivery site", type: "Single select", required: false },
    { name: "Current vendor", type: "Text", required: false },
  ]);
  const [name, setName] = useState("");
  const [type, setType] = useState("Text");
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Settings2 className="size-4" /> Custom CRM fields</CardTitle><CardDescription>Fields shown on every lead and contact.</CardDescription></CardHeader>
      <CardContent>
        <ul className="divide-y rounded-lg border">
          {fields.map((f, i) => (
            <li key={f.name} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1"><p className="text-sm font-medium">{f.name}</p><p className="text-xs text-muted-foreground">{f.type}</p></div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">Required <Switch checked={f.required} onCheckedChange={(v) => setFields((x) => x.map((y, k) => (k === i ? { ...y, required: v } : y)))} aria-label={`${f.name} required`} /></label>
              <Button variant="ghost" size="icon-sm" aria-label={`Delete ${f.name}`} onClick={() => { setFields((x) => x.filter((_, k) => k !== i)); toast(`Removed “${f.name}”`); }}><Trash2 /></Button>
            </li>
          ))}
        </ul>
        <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (name.trim().length < 2) { toast.error("Field name needs at least 2 characters"); return; } setFields((x) => [...x, { name: name.trim(), type, required: false }]); setName(""); toast.success("Field added"); }}>
          <label className="sr-only" htmlFor="cf-name">Field name</label>
          <Input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="New field name" />
          <NativeSelect value={type} onChange={(e) => setType(e.target.value)} className="sm:w-44" aria-label="Field type">{["Text", "Number", "Date", "Single select", "Multi-select", "Currency"].map((t) => <option key={t}>{t}</option>)}</NativeSelect>
          <Button type="submit"><Plus /> Add field</Button>
        </form>
      </CardContent>
    </Card>
  );
}
