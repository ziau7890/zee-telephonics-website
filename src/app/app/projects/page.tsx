"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FolderKanban, Users, CalendarRange, Activity } from "lucide-react";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import { PageHeader, StatCard, StatusBadge, FilterSelect } from "@/components/dashboard/kit";
import { Card } from "@/components/ui/card";
import { Avatar, Progress, Skeleton, EmptyState } from "@/components/ui/misc";
import { clients } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";

export default function ProjectsPage() {
  const { data, loading } = useService(() => services.clients.projects());
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const list = useMemo(() => (data ?? []).filter((p) => (!status || p.status === status) && (!type || p.type === type)), [data, status, type]);
  const all = data ?? [];
  return (
    <>
      <PageHeader title="Projects & campaigns" description="Client programs with staffing, timelines and the KPI each one is measured on." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active programs" value={String(all.filter((p) => p.status !== "Completed").length)} icon={FolderKanban} tone="blue" loading={loading} />
        <StatCard label="Agents assigned" value={String(all.reduce((a, p) => a + p.agents, 0))} icon={Users} tone="violet" loading={loading} />
        <StatCard label="At risk" value={String(all.filter((p) => p.status === "At risk").length)} icon={Activity} tone="rose" loading={loading} />
        <StatCard label="Launching soon" value={String(all.filter((p) => p.status === "Planning").length)} icon={CalendarRange} tone="cyan" loading={loading} />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterSelect label="Statuses" value={status} onChange={setStatus} options={["On track", "At risk", "Planning", "Completed"]} />
        <FilterSelect label="Types" value={type} onChange={setType} options={["Inbound support", "Outbound sales", "Back office", "Chat support", "Lead generation", "Technical support"]} />
      </div>
      {!loading && list.length === 0 ? <EmptyState icon={FolderKanban} title="No projects match these filters" description="Clear a filter to see all programs." /> : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          {list.map((p) => {
            const client = clients.find((c) => c.name === p.client);
            return (
              <li key={p.id}>
                <Card className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-semibold leading-snug">{p.name}</p>{client ? <Link href={`/app/clients/${client.id}`} className="text-sm text-primary hover:underline">{p.client}</Link> : <p className="text-sm text-muted-foreground">{p.client}</p>}</div><StatusBadge status={p.status} /></div>
                  <p className="mt-3 text-xs text-muted-foreground">{p.type} · {formatDate(p.start, { month: "short", day: "numeric" })} – {formatDate(p.end, { month: "short", day: "numeric" })}</p>
                  <div className="mt-4"><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-medium tabular">{p.progress}%</span></div><Progress value={p.progress} tone={p.status === "At risk" ? "warning" : p.status === "Completed" ? "success" : "primary"} label={`${p.name} progress`} /></div>
                  <p className="mt-4 rounded-lg bg-muted/50 px-3 py-2 text-sm">{p.kpi}</p>
                  <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><Avatar name={p.lead} size={22} />{p.lead}</span><span className="inline-flex items-center gap-1"><Users className="size-3.5" />{p.agents} agents</span></div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
