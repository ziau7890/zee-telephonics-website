"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, LayoutGrid, List, MoreHorizontal, Phone, Mail, CalendarClock, Flame, ArrowRight, Building2, Users, DollarSign, Target, Trophy, Percent } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import type { Lead, LeadStage } from "@/lib/mock/types";
import { PageHeader, StatCard, DataTable, StatusBadge, FilterSelect, type Column } from "@/components/dashboard/kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Field, NativeSelect, Textarea } from "@/components/ui/input";
import { Avatar, Skeleton, Progress } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { cn, formatCurrency, formatCompact, formatDate } from "@/lib/utils";

const STAGES: { id: LeadStage; color: string }[] = [
  { id: "New", color: "bg-slate-400" }, { id: "Contacted", color: "bg-cyan-400" }, { id: "Qualified", color: "bg-blue-500" },
  { id: "Proposal", color: "bg-violet-500" }, { id: "Negotiation", color: "bg-fuchsia-500" }, { id: "Won", color: "bg-emerald-500" }, { id: "Lost", color: "bg-rose-500" },
];

export default function LeadsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, loading, setData } = useService(() => services.crm.leads());
  const [view, setView] = useState<"board" | "list">("board");
  const [q, setQ] = useState("");
  const [owner, setOwner] = useState("");
  const [source, setSource] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStage | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  useEffect(() => { if (params.get("new")) setNewOpen(true); }, [params]);

  const leads = useMemo(() => (data ?? []).filter((l) => (!owner || l.owner === owner) && (!source || l.source === source) && (`${l.company} ${l.contact} ${l.industry}`.toLowerCase().includes(q.toLowerCase()))), [data, owner, source, q]);
  const open = (data ?? []).filter((l) => l.stage !== "Won" && l.stage !== "Lost");
  const won = (data ?? []).filter((l) => l.stage === "Won");

  const move = async (id: string, stage: LeadStage) => {
    const lead = data?.find((l) => l.id === id);
    if (!lead || lead.stage === stage) return;
    setData((d) => d?.map((l) => (l.id === id ? { ...l, stage } : l)) ?? null);
    setSelected((s) => (s?.id === id ? { ...s, stage } : s));
    await services.crm.moveLead(id, stage);
    if (stage === "Won") toast.success(`${lead.company} won`, { description: `${lead.seats} seats · ${formatCurrency(lead.value)}/mo. Client and onboarding project created.` });
    else toast(`${lead.company} moved to ${stage}`);
  };

  const columns: Column<Lead>[] = [
    { key: "company", header: "Company", sortValue: (l) => l.company, cell: (l) => <div><p className="font-medium">{l.company}</p><p className="text-xs text-muted-foreground">{l.contact} · {l.title}</p></div> },
    { key: "stage", header: "Stage", sortValue: (l) => STAGES.findIndex((s) => s.id === l.stage), cell: (l) => <StatusBadge status={l.stage} /> },
    { key: "value", header: "Value / mo", sortValue: (l) => l.value, cell: (l) => formatCurrency(l.value), align: "right" },
    { key: "seats", header: "Seats", sortValue: (l) => l.seats, cell: (l) => l.seats, align: "right", hideBelow: "md" },
    { key: "score", header: "Score", sortValue: (l) => l.score, cell: (l) => <ScorePill score={l.score} />, hideBelow: "sm" },
    { key: "source", header: "Source", sortValue: (l) => l.source, cell: (l) => l.source, hideBelow: "lg" },
    { key: "owner", header: "Owner", sortValue: (l) => l.owner, cell: (l) => <span className="inline-flex items-center gap-2"><Avatar name={l.owner} size={22} />{l.owner}</span>, hideBelow: "lg" },
    { key: "follow", header: "Next follow-up", sortValue: (l) => l.nextFollowUp, cell: (l) => <FollowUp date={l.nextFollowUp} />, hideBelow: "md" },
  ];

  return (
    <>
      <PageHeader title="Leads" description="Your sales pipeline, measured in seats, services and monthly contract value." actions={<Button size="sm" onClick={() => setNewOpen(true)}><Plus /> New lead</Button>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open pipeline" value={formatCurrency(open.reduce((a, l) => a + l.value, 0))} icon={DollarSign} tone="blue" loading={loading} deltaLabel="monthly value" delta={12.4} />
        <StatCard label="Open deals" value={String(open.length)} icon={Target} tone="violet" loading={loading} />
        <StatCard label="Won this quarter" value={formatCurrency(won.reduce((a, l) => a + l.value, 0))} icon={Trophy} tone="emerald" loading={loading} delta={18} />
        <StatCard label="Lead conversion" value="28.4%" icon={Percent} tone="cyan" loading={loading} delta={3.2} deltaLabel="pts, trailing 90 days" />
      </div>

      <Card className="mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <label className="relative block w-full sm:max-w-xs"><span className="sr-only">Search leads</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company, contact…" className="h-9 pl-9" /></label>
        <div className="flex flex-wrap gap-2">
          <FilterSelect label="Owners" value={owner} onChange={setOwner} options={["Omar Khan", "Emily Johnson", "Zara Hussain", "Ryan Carter"]} />
          <FilterSelect label="Sources" value={source} onChange={setSource} options={["Website", "Referral", "LinkedIn", "Outbound", "Event", "Partner"]} />
        </div>
        <div className="flex rounded-lg border p-0.5 sm:ml-auto" role="radiogroup" aria-label="View">
          {([["board", LayoutGrid, "Board"], ["list", List, "List"]] as const).map(([v, I, l]) => (
            <button key={v} role="radio" aria-checked={view === v} onClick={() => setView(v)} className={cn("inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium", view === v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}><I className="size-3.5" />{l}</button>
          ))}
        </div>
      </Card>

      {view === "list" ? (
        <DataTable rows={leads} columns={columns} loading={loading} caption="Leads" rowKey={(l) => l.id} onRowClick={setSelected} pageSize={25} />
      ) : (
        <div className="relative -mx-4 overflow-x-auto px-4 pb-4 scrollbar-thin sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <p className="sr-only">Drag cards between columns to change stage, or use each card&apos;s menu to move it with the keyboard.</p>
          <div className="flex gap-4">
            {STAGES.map((s) => {
              const items = leads.filter((l) => l.stage === s.id);
              const total = items.reduce((a, l) => a + l.value, 0);
              return (
                <section key={s.id} aria-label={`${s.id} stage, ${items.length} leads`}
                  onDragOver={(e) => { e.preventDefault(); setOverStage(s.id); }} onDragLeave={() => setOverStage((o) => (o === s.id ? null : o))}
                  onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain") || dragId; if (id) move(id, s.id); setDragId(null); setOverStage(null); }}
                  className={cn("flex w-[280px] shrink-0 flex-col rounded-xl border bg-muted/30 transition-colors", overStage === s.id && "border-primary/50 bg-primary/5")}>
                  <header className="flex items-center gap-2 px-3 pb-2 pt-3">
                    <span className={cn("size-2 rounded-full", s.color)} aria-hidden />
                    <h2 className="text-sm font-semibold">{s.id}</h2>
                    <span className="rounded-full bg-background px-1.5 text-xs tabular text-muted-foreground">{items.length}</span>
                    <span className="ml-auto text-xs tabular text-muted-foreground">{formatCompact(total, "USD")}</span>
                  </header>
                  <ul className="flex min-h-[120px] flex-1 flex-col gap-2 p-2">
                    {loading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
                    {items.map((l) => (
                      <li key={l.id} draggable onDragStart={(e) => { setDragId(l.id); e.dataTransfer.setData("text/plain", l.id); e.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => setDragId(null)}
                        className={cn("group cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-all hover:border-primary/40 hover:shadow-card active:cursor-grabbing", dragId === l.id && "opacity-50")}>
                        <div className="flex items-start gap-2">
                          <button onClick={() => setSelected(l)} className="min-w-0 flex-1 text-left">
                            <p className="truncate text-sm font-medium group-hover:text-primary">{l.company}</p>
                            <p className="truncate text-xs text-muted-foreground">{l.contact}</p>
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" className="-mr-1 -mt-1 size-7" aria-label={`Actions for ${l.company}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onSelect={() => setSelected(l)}>Open details</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Move to</DropdownMenuLabel>
                              {STAGES.filter((x) => x.id !== l.stage).map((x) => <DropdownMenuItem key={x.id} onSelect={() => move(l.id, x.id)}><span className={cn("size-2 rounded-full", x.color)} /> {x.id}</DropdownMenuItem>)}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="font-semibold tabular">{formatCurrency(l.value)}<span className="font-normal text-muted-foreground">/mo</span></span>
                          <ScorePill score={l.score} />
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Users className="size-3" />{l.seats} seats</span>
                          <FollowUp date={l.nextFollowUp} compact />
                          <Avatar name={l.owner} size={20} />
                        </div>
                      </li>
                    ))}
                    {!loading && items.length === 0 && <li className="grid flex-1 place-items-center rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">Drop a lead here</li>}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      )}
      <LeadDrawer lead={selected} onClose={() => setSelected(null)} onMove={move} />
      <NewLeadDialog open={newOpen} onOpenChange={(o) => { setNewOpen(o); if (!o && params.get("new")) router.replace("/app/leads"); }} onCreated={(l) => setData((d) => [l, ...(d ?? [])])} />
    </>
  );
}

function ScorePill({ score }: { score: number }) {
  const tone = score >= 80 ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-300" : score >= 60 ? "text-blue-700 bg-blue-500/10 dark:text-blue-300" : "text-slate-600 bg-slate-500/10 dark:text-slate-300";
  return <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular", tone)} title="Lead score">{score >= 80 && <Flame className="size-3" aria-hidden />}{score}<span className="sr-only"> lead score</span></span>;
}

function FollowUp({ date, compact }: { date: string; compact?: boolean }) {
  const d = new Date(date);
  const days = Math.round((d.getTime() - Date.now()) / 86400000);
  const overdue = days < 0;
  return <span className={cn("inline-flex items-center gap-1", overdue ? "font-medium text-rose-600 dark:text-rose-400" : days === 0 ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted-foreground", !compact && "text-sm")}><CalendarClock className="size-3" />{overdue ? `${-days}d overdue` : days === 0 ? "Today" : compact ? `${days}d` : formatDate(date, { month: "short", day: "numeric" })}</span>;
}

function LeadDrawer({ lead, onClose, onMove }: { lead: Lead | null; onClose: () => void; onMove: (id: string, s: LeadStage) => void }) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  useEffect(() => { setNotes([]); setNote(""); }, [lead?.id]);
  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent side="right">
        {lead && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Building2 className="size-5" /></span><div><DialogTitle>{lead.company}</DialogTitle><DialogDescription>{lead.industry} · {lead.id}</DialogDescription></div></div>
            </DialogHeader>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success(`Calling ${lead.contact}…`, { description: "Call logged to the timeline." })}><Phone /> Call</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Email draft opened")}><Mail /> Email</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Reminder set for tomorrow 10:00")}><CalendarClock /> Remind me</Button>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Stage</p>
              <div className="flex flex-wrap gap-1.5">{STAGES.map((s) => <button key={s.id} aria-pressed={lead.stage === s.id} onClick={() => onMove(lead.id, s.id)} className={cn("rounded-full border px-2.5 py-1 text-xs font-medium transition-colors", lead.stage === s.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent")}>{s.id}</button>)}</div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3">
              {[["Monthly value", formatCurrency(lead.value)], ["Seats", String(lead.seats)], ["Source", lead.source], ["Owner", lead.owner], ["Contact", `${lead.contact}, ${lead.title}`], ["Email", lead.email]].map(([k, v]) => <div key={k} className="rounded-lg border p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-0.5 truncate text-sm font-medium">{v}</dd></div>)}
            </dl>
            <div className="mt-6"><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">Lead score</span><span className="font-medium tabular">{lead.score}/100</span></div><Progress value={lead.score} tone={lead.score >= 80 ? "success" : "primary"} label="Lead score" /><p className="mt-2 text-xs text-muted-foreground">Based on seat count, industry fit, engagement in the last 14 days and decision-maker contact.</p></div>
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Notes & activity</p>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!note.trim()) return; setNotes((n) => [note.trim(), ...n]); setNote(""); toast.success("Note added"); }}>
                <label className="sr-only" htmlFor="lead-note">Add a note</label>
                <Textarea id="lead-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className="min-h-[40px]" rows={1} />
                <Button type="submit" size="sm" className="h-10" disabled={!note.trim()}>Add</Button>
              </form>
              <ul className="mt-4 space-y-3 text-sm">
                {notes.map((n, i) => <li key={i} className="rounded-lg bg-muted/50 p-3"><p>{n}</p><p className="mt-1 text-xs text-muted-foreground">You · just now</p></li>)}
                <li className="flex gap-2"><Phone className="mt-0.5 size-4 text-muted-foreground" /><div><p>Discovery call with {lead.contact}</p><p className="text-xs text-muted-foreground">{lead.owner} · 2 days ago · Interested in {lead.seats} seats, evening coverage</p></div></li>
                <li className="flex gap-2"><Mail className="mt-0.5 size-4 text-muted-foreground" /><div><p>Sent capabilities deck</p><p className="text-xs text-muted-foreground">{lead.owner} · {formatDate(lead.createdAt, { month: "short", day: "numeric" })}</p></div></li>
              </ul>
            </div>
            {lead.stage !== "Won" && <Button className="mt-6 w-full" onClick={() => onMove(lead.id, "Won")}>Mark as won <ArrowRight /></Button>}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const leadSchema = z.object({
  company: z.string().trim().min(2, "Enter the company name"),
  contact: z.string().trim().min(2, "Enter a contact name"),
  title: z.string().trim().min(2, "Enter their job title"),
  email: z.string().trim().email("Enter a valid email"),
  industry: z.string().min(1, "Choose an industry"),
  seats: z.coerce.number({ invalid_type_error: "Enter a number" }).int("Whole seats only").min(1, "At least 1 seat").max(2000),
  value: z.coerce.number({ invalid_type_error: "Enter a number" }).min(100, "Enter a monthly value of at least $100"),
  source: z.enum(["Website", "Referral", "LinkedIn", "Outbound", "Event", "Partner"]),
  owner: z.string().min(1),
});

function NewLeadDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (l: Lead) => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.input<typeof leadSchema>, unknown, z.output<typeof leadSchema>>({ resolver: zodResolver(leadSchema), defaultValues: { source: "Website", owner: "Omar Khan", industry: "" } });
  const submit = async (v: z.output<typeof leadSchema>) => {
    const l = await services.crm.createLead({ ...v, stage: "New", nextFollowUp: new Date(Date.now() + 86400000).toISOString() });
    onCreated(l);
    toast.success(`${v.company} added to pipeline`, { description: `Assigned to ${v.owner}. Follow-up set for tomorrow.` });
    reset();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>New lead</DialogTitle><DialogDescription>Add a prospect to the pipeline. It starts in the New stage.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" htmlFor="nl-company" error={errors.company?.message} required><Input id="nl-company" aria-invalid={!!errors.company} {...register("company")} /></Field>
          <Field label="Industry" htmlFor="nl-ind" error={errors.industry?.message} required><NativeSelect id="nl-ind" aria-invalid={!!errors.industry} {...register("industry")}><option value="">Choose…</option>{["Healthcare", "Retail & eCommerce", "Fintech", "Telecommunications", "Travel & hospitality", "Technology", "Insurance"].map((i) => <option key={i}>{i}</option>)}</NativeSelect></Field>
          <Field label="Contact name" htmlFor="nl-contact" error={errors.contact?.message} required><Input id="nl-contact" aria-invalid={!!errors.contact} {...register("contact")} /></Field>
          <Field label="Job title" htmlFor="nl-title" error={errors.title?.message} required><Input id="nl-title" aria-invalid={!!errors.title} {...register("title")} /></Field>
          <Field label="Email" htmlFor="nl-email" error={errors.email?.message} required className="sm:col-span-2"><Input id="nl-email" type="email" aria-invalid={!!errors.email} {...register("email")} /></Field>
          <Field label="Seats" htmlFor="nl-seats" error={errors.seats?.message} required><Input id="nl-seats" inputMode="numeric" aria-invalid={!!errors.seats} {...register("seats")} /></Field>
          <Field label="Monthly value (USD)" htmlFor="nl-value" error={errors.value?.message} required><Input id="nl-value" inputMode="numeric" aria-invalid={!!errors.value} {...register("value")} /></Field>
          <Field label="Source" htmlFor="nl-source"><NativeSelect id="nl-source" {...register("source")}>{["Website", "Referral", "LinkedIn", "Outbound", "Event", "Partner"].map((s) => <option key={s}>{s}</option>)}</NativeSelect></Field>
          <Field label="Owner" htmlFor="nl-owner"><NativeSelect id="nl-owner" {...register("owner")}>{["Omar Khan", "Emily Johnson", "Zara Hussain", "Ryan Carter"].map((s) => <option key={s}>{s}</option>)}</NativeSelect></Field>
          <DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" loading={isSubmitting}>Create lead</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
