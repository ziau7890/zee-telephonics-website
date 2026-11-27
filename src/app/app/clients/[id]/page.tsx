"use client";
import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Mail, Phone, FileText, Download, Upload, ExternalLink, Building2, CalendarClock, Users, Package, ShieldCheck, MessageSquare, Eye } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { toast } from "sonner";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import { invoices, projects } from "@/lib/mock/data";
import { StatusBadge, HealthBadge, ChartCard, ChartTooltip, axisProps, StatCard } from "@/components/dashboard/kit";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, EmptyState, Progress, Skeleton } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/brand/logo";
import { cn, formatCurrency, formatDate, seeded } from "@/lib/utils";

export default function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: c, loading } = useService(() => services.clients.get(id), [id]);
  if (loading) return <div className="space-y-4"><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>;
  if (!c) return <EmptyState icon={Building2} title="Client not found" description="The client may have been archived, or the link is wrong." action={<Link href="/app/clients" className="text-sm font-medium text-primary">Back to clients</Link>} />;

  const r = seeded(c.id.charCodeAt(5) * 97);
  const slaSeries = Array.from({ length: 14 }, (_, i) => ({ day: `D${i + 1}`, sla: +(c.slaActual + (r() - 0.5) * 6 - (c.status === "At risk" && i > 10 ? 4 : 0)).toFixed(1) }));
  const clientInvoices = invoices.filter((i) => i.clientId === c.id);
  const clientProjects = projects.filter((p) => p.client === c.name);
  const comms = [
    ["email", `Monthly performance report sent to ${c.primaryContact.name}`, "2 days ago"],
    ["call", "Weekly ops sync · reviewed handle time and staffing", "5 days ago"],
    ["meeting", "Quarterly business review · renewal discussed", "3 weeks ago"],
  ];

  return (
    <>
      <Link href="/app/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Clients</Link>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-bold text-white">{c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
        <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">{c.name}</h1><StatusBadge status={c.status} /><HealthBadge value={c.health} /></div><p className="text-sm text-muted-foreground">{c.industry} · {c.country} · Client since {formatDate(c.contractStart, { month: "long", year: "numeric" })}</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => toast.success("QBR deck generated", { description: `${c.name} · Q4 business review.pdf` })}><Download /> QBR report</Button><Button size="sm" onClick={() => toast.success(`Message sent to ${c.primaryContact.name}`)}><MessageSquare /> Contact</Button></div>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly value" value={formatCurrency(c.monthlyValue)} icon={Building2} tone="blue" />
        <StatCard label="Dedicated seats" value={String(c.seats)} icon={Users} tone="violet" />
        <StatCard label="SLA attainment" value={`${c.slaActual}%`} icon={ShieldCheck} tone={c.slaActual >= c.slaTarget ? "emerald" : "rose"} hint={`Target ${c.slaTarget}% of contacts answered within agreed time.`} />
        <StatCard label="Client satisfaction" value={`${c.csat}%`} icon={MessageSquare} tone="cyan" />
      </div>
      {c.status === "At risk" && (
        <div role="alert" className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm"><p className="font-medium text-rose-700 dark:text-rose-300">This account is at risk</p><p className="mt-1 text-muted-foreground">SLA has been below target for 3+ days. Suggested action: move 3 agents from Voice Team B to this queue for the evening shift, and schedule a call with {c.primaryContact.name}.</p><Button size="sm" className="mt-3" onClick={() => toast.success("Staffing change proposed", { description: "Sent to Sarah Ahmed for approval." })}>Apply suggested staffing</Button></div>
      )}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contract">Contract & SLAs</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="portal">Client portal</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            <ChartCard className="lg:col-span-2" title="Service level, last 14 days" description={`Target ${c.slaTarget}%`} summary={`SLA ranged around ${c.slaActual}% against a ${c.slaTarget}% target.`}>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={slaSeries}><defs><linearGradient id="gs" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#22D3EE" stopOpacity={0.3} /><stop offset="1" stopColor="#22D3EE" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="day" {...axisProps} /><YAxis domain={[75, 100]} {...axisProps} width={32} /><RTooltip content={<ChartTooltip format={(v) => `${v}%`} />} />
                  <ReferenceLine y={c.slaTarget} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: "Target", position: "insideTopRight", fill: "#F59E0B", fontSize: 11 }} />
                  <Area dataKey="sla" name="SLA" stroke="#22D3EE" strokeWidth={2} fill="url(#gs)" /></AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <div className="space-y-6">
              <Card><CardHeader><CardTitle>Primary contact</CardTitle></CardHeader><CardContent>
                <div className="flex items-center gap-3"><Avatar name={c.primaryContact.name} size={40} /><div><p className="font-medium">{c.primaryContact.name}</p><p className="text-xs text-muted-foreground">{c.primaryContact.title}</p></div></div>
                <div className="mt-4 space-y-2 text-sm"><a href={`mailto:${c.primaryContact.email}`} className="flex items-center gap-2 text-primary hover:underline"><Mail className="size-4" />{c.primaryContact.email}</a><a href={`tel:${c.primaryContact.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Phone className="size-4" />{c.primaryContact.phone}</a></div>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Account manager</CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><Avatar name={c.accountManager} size={40} /><div><p className="font-medium">{c.accountManager}</p><p className="text-xs text-muted-foreground">Next QBR in 18 days</p></div></div></CardContent></Card>
            </div>
            <Card className="lg:col-span-3"><CardHeader><CardTitle>Communication history</CardTitle></CardHeader><CardContent>
              <ul className="divide-y">{comms.map(([t, s, w]) => <li key={s} className="flex items-center gap-3 py-3"><span className="grid size-8 place-items-center rounded-full bg-muted">{t === "email" ? <Mail className="size-3.5" /> : t === "call" ? <Phone className="size-3.5" /> : <Users className="size-3.5" />}</span><p className="flex-1 text-sm">{s}</p><span className="text-xs text-muted-foreground">{w}</span></li>)}</ul>
            </CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="contract">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>Contract</CardTitle></CardHeader><CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {[["Start date", formatDate(c.contractStart)], ["Renewal date", formatDate(c.renewalDate)], ["Billing cycle", c.billingCycle], ["Currency", c.currency], ["Term", "12 months, auto-renew"], ["Notice period", "60 days"]].map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}
              </dl>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Service package</CardTitle></CardHeader><CardContent>
              <ul className="space-y-2">{c.services.map((s) => <li key={s} className="flex items-center gap-2 text-sm"><Package className="size-4 text-primary" />{s}</li>)}</ul>
            </CardContent></Card>
            <Card className="lg:col-span-2"><CardHeader><CardTitle>Service level agreements</CardTitle></CardHeader><CardContent>
              <ul className="space-y-5">
                {[["Service level (answered in 20s)", c.slaActual, c.slaTarget], ["First contact resolution", Math.round(c.slaActual * 0.86), 75], ["QA score", Math.round(c.csat - 3), 85], ["Email response < 4h", Math.min(99, c.slaActual + 3), 95]].map(([l, a, t]) => (
                  <li key={l as string}><div className="mb-1.5 flex justify-between text-sm"><span>{l}</span><span className={cn("font-medium tabular", (a as number) < (t as number) && "text-rose-600 dark:text-rose-400")}>{a}% <span className="text-xs font-normal text-muted-foreground">target {t}%</span></span></div><Progress value={a as number} tone={(a as number) >= (t as number) ? "success" : "danger"} label={l as string} /></li>
                ))}
              </ul>
            </CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="projects">
          {clientProjects.length ? (
            <ul className="grid gap-4 md:grid-cols-2">{clientProjects.map((p) => <li key={p.id}><Card className="p-5"><div className="flex items-center justify-between"><p className="font-semibold">{p.name}</p><StatusBadge status={p.status} /></div><p className="mt-1 text-sm text-muted-foreground">{p.type} · {p.agents} agents · lead {p.lead}</p><div className="mt-4"><Progress value={p.progress} label={`${p.name} progress`} /></div><p className="mt-2 text-xs text-muted-foreground">{p.kpi}</p></Card></li>)}</ul>
          ) : <EmptyState icon={CalendarClock} title="No active projects or campaigns" description="Projects created for this client will be listed here with progress and KPIs." action={<Link href="/app/projects" className="text-sm font-medium text-primary">Go to projects</Link>} />}
        </TabsContent>
        <TabsContent value="billing">
          <Card className="overflow-hidden"><CardHeader><CardTitle>Invoices</CardTitle><CardDescription>{c.billingCycle} billing in {c.currency}</CardDescription></CardHeader>
            {clientInvoices.length ? (
              <ul className="mt-4 divide-y border-t">{clientInvoices.map((i) => <li key={i.id} className="flex items-center gap-4 px-6 py-3 text-sm"><FileText className="size-4 text-muted-foreground" /><span className="font-medium">{i.number}</span><span className="hidden text-muted-foreground sm:inline">Due {formatDate(i.dueDate)}</span><span className="ml-auto tabular">{formatCurrency(i.amount)}</span><StatusBadge status={i.status} /></li>)}</ul>
            ) : <CardContent><p className="text-sm text-muted-foreground">No invoices yet.</p></CardContent>}
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>Client documents</CardTitle><Button size="sm" variant="outline" onClick={() => toast.success("Upload started")}><Upload /> Upload</Button></CardHeader><CardContent>
            <ul className="divide-y">{["Master services agreement.pdf", "Statement of work - 2026.pdf", "Data processing addendum.pdf", "Process manual v4.docx", "Escalation matrix.xlsx"].map((d) => <li key={d} className="flex items-center gap-3 py-3"><FileText className="size-4 text-muted-foreground" /><span className="flex-1 text-sm">{d}</span><Button variant="ghost" size="icon-sm" aria-label={`Download ${d}`} onClick={() => toast.success(`Downloading ${d}`)}><Download /></Button></li>)}</ul>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="portal">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground"><Eye className="size-3.5" /> Preview: what {c.primaryContact.name} sees at portal.zeetelephonics.com <ExternalLink className="ml-auto size-3.5" /></div>
            <div className="p-6">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><LogoMark size={26} /><span className="font-semibold">{c.name} · Service portal</span></div><Badge variant="success" dot>All services operational</Badge></div>
              <div className="mt-6 grid gap-4 sm:grid-cols-4">
                {[["Contacts handled (MTD)", (c.seats * 412).toLocaleString()], ["Service level", `${c.slaActual}%`], ["CSAT", `${c.csat}%`], ["Open invoices", String(clientInvoices.filter((i) => i.status !== "Paid").length)]].map(([k, v]) => <div key={k} className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-xl font-semibold tabular">{v}</p></div>)}
              </div>
              <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => toast.success("Report downloaded")}>Download monthly report</Button><Button size="sm" variant="outline" onClick={() => toast.success("Redirecting to secure payment…")}>Pay outstanding invoices</Button><Button size="sm" variant="outline" onClick={() => toast.success("Request sent to account manager")}>Request a change</Button></div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
