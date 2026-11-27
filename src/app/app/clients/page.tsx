"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, HeartPulse, Smile, AlertTriangle, LayoutGrid, List, Plus } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import type { Client } from "@/lib/mock/types";
import { PageHeader, StatCard, DataTable, StatusBadge, FilterSelect, HealthBadge, type Column } from "@/components/dashboard/kit";
import { Card } from "@/components/ui/card";
import { Avatar, Progress, Skeleton } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default function ClientsPage() {
  const router = useRouter();
  const { data, loading } = useService(() => services.clients.list());
  const [view, setView] = useState<"table" | "cards">("table");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState("");
  const [am, setAm] = useState("");
  const rows = useMemo(() => (data ?? []).filter((c) => (!industry || c.industry === industry) && (!status || c.status === status) && (!am || c.accountManager === am)), [data, industry, status, am]);
  const all = data ?? [];
  const avg = (f: (c: Client) => number) => (all.length ? (all.reduce((a, c) => a + f(c), 0) / all.length).toFixed(1) : "0");

  const columns: Column<Client>[] = [
    { key: "name", header: "Client", sortValue: (c) => c.name, cell: (c) => <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span><div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.industry} · {c.country}</p></div></div> },
    { key: "value", header: "Monthly value", sortValue: (c) => c.monthlyValue, cell: (c) => formatCurrency(c.monthlyValue), align: "right" },
    { key: "seats", header: "Seats", sortValue: (c) => c.seats, cell: (c) => c.seats, align: "right", hideBelow: "md" },
    { key: "sla", header: "SLA", sortValue: (c) => c.slaActual, cell: (c) => <span className={cn("tabular", c.slaActual < c.slaTarget && "font-medium text-rose-600 dark:text-rose-400")}>{c.slaActual}% <span className="text-xs text-muted-foreground">/ {c.slaTarget}</span></span>, hideBelow: "md" },
    { key: "csat", header: "CSAT", sortValue: (c) => c.csat, cell: (c) => `${c.csat}%`, align: "right", hideBelow: "lg" },
    { key: "health", header: "Health", sortValue: (c) => c.health, cell: (c) => <HealthBadge value={c.health} /> },
    { key: "am", header: "Account manager", sortValue: (c) => c.accountManager, cell: (c) => <span className="inline-flex items-center gap-2"><Avatar name={c.accountManager} size={22} />{c.accountManager}</span>, hideBelow: "lg" },
    { key: "renewal", header: "Renewal", sortValue: (c) => c.renewalDate, cell: (c) => formatDate(c.renewalDate), hideBelow: "lg" },
    { key: "status", header: "Status", sortValue: (c) => c.status, cell: (c) => <StatusBadge status={c.status} />, hideBelow: "sm" },
  ];

  return (
    <>
      <PageHeader title="Clients" description="Every account with its contract, seats, SLA attainment, satisfaction and health." actions={<Button size="sm" onClick={() => toast.info("New clients are created from won deals", { description: "Mark a lead as Won in the pipeline to create the client and its onboarding project." })}><Plus /> Add client</Button>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active clients" value={String(all.filter((c) => c.status === "Active").length)} icon={Building2} tone="blue" loading={loading} />
        <StatCard label="Avg. health score" value={avg((c) => c.health)} icon={HeartPulse} tone="emerald" loading={loading} delta={2.3} deltaLabel="pts vs last month" />
        <StatCard label="Avg. CSAT" value={`${avg((c) => c.csat)}%`} icon={Smile} tone="cyan" loading={loading} />
        <StatCard label="At risk" value={String(all.filter((c) => c.status === "At risk").length)} icon={AlertTriangle} tone="rose" loading={loading} hint="Health below 70 or SLA under target for 3+ days." />
      </div>
      <div className="mb-4 flex justify-end">
        <div className="flex rounded-lg border p-0.5" role="radiogroup" aria-label="View">
          {([["table", List, "Table"], ["cards", LayoutGrid, "Cards"]] as const).map(([v, I, l]) => <button key={v} role="radio" aria-checked={view === v} onClick={() => setView(v)} className={cn("inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium", view === v ? "bg-secondary" : "text-muted-foreground")}><I className="size-3.5" />{l}</button>)}
        </div>
      </div>
      {view === "table" ? (
        <DataTable rows={rows} columns={columns} loading={loading} caption="Clients" rowKey={(c) => c.id} onRowClick={(c) => router.push(`/app/clients/${c.id}`)} searchKeys={(c) => `${c.name} ${c.industry} ${c.primaryContact.name}`} searchPlaceholder="Search clients…" initialSort={{ key: "value", dir: "desc" }}
          filters={<>
            <FilterSelect label="Industries" value={industry} onChange={setIndustry} options={Array.from(new Set(all.map((c) => c.industry))).sort()} />
            <FilterSelect label="Statuses" value={status} onChange={setStatus} options={["Active", "Onboarding", "At risk", "Paused"]} />
            <FilterSelect label="Managers" value={am} onChange={setAm} options={["Emily Johnson", "Sarah Ahmed", "Omar Khan", "Bilal Raza"]} />
          </>} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          {rows.map((c) => (
            <li key={c.id}>
              <Card className="h-full cursor-pointer p-5 transition-colors hover:border-primary/40" onClick={() => router.push(`/app/clients/${c.id}`)}>
                <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{c.name}</p><p className="text-xs text-muted-foreground">{c.industry}</p></div><HealthBadge value={c.health} /></div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[["Value", formatCurrency(c.monthlyValue)], ["Seats", c.seats], ["CSAT", `${c.csat}%`]].map(([k, v]) => <div key={k as string} className="rounded-lg bg-muted/50 p-2"><dt className="text-[11px] text-muted-foreground">{k}</dt><dd className="text-sm font-semibold tabular">{v}</dd></div>)}
                </dl>
                <div className="mt-4"><div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">SLA {c.slaActual}% of {c.slaTarget}%</span></div><Progress value={c.slaActual} tone={c.slaActual >= c.slaTarget ? "success" : "danger"} label="SLA attainment" /></div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
