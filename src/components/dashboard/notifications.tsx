"use client";
import Link from "next/link";
import { useState } from "react";
import { Bell, CheckCheck, FileText, Wallet, CalendarDays, Target, Megaphone, ShieldAlert, ClipboardCheck } from "lucide-react";
import { useShell } from "./app-shell";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/misc";
import { timeAgo } from "./format";

const icons = { approval: ClipboardCheck, invoice: FileText, leave: CalendarDays, payroll: Wallet, lead: Target, system: ShieldAlert, announcement: Megaphone } as const;
const tones = { approval: "text-violet-500 bg-violet-500/10", invoice: "text-amber-500 bg-amber-500/10", leave: "text-cyan-500 bg-cyan-500/10", payroll: "text-emerald-500 bg-emerald-500/10", lead: "text-blue-500 bg-blue-500/10", system: "text-rose-500 bg-rose-500/10", announcement: "text-slate-500 bg-slate-500/10" } as const;

export function NotificationList({ compact }: { compact?: boolean }) {
  const { notifications, setNotifications } = useShell();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const list = notifications.filter((n) => filter === "all" || !n.read);
  const markAll = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) => setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Notifications</h2>
        <div className="flex items-center gap-1">
          <div className="flex rounded-md bg-muted p-0.5 text-xs" role="tablist" aria-label="Filter notifications">
            {(["all", "unread"] as const).map((f) => <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn("rounded px-2 py-1 capitalize", filter === f ? "bg-card font-medium shadow-sm" : "text-muted-foreground")}>{f}</button>)}
          </div>
          <button onClick={markAll} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Mark all as read" title="Mark all as read"><CheckCheck className="size-4" /></button>
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState className="m-4 border-0 py-10" icon={Bell} title="You're all caught up" description="New approvals, alerts and announcements will appear here." />
      ) : (
        <ul className={cn("divide-y overflow-y-auto scrollbar-thin", compact && "max-h-[420px]")}>
          {list.map((n) => {
            const Icon = icons[n.kind];
            const body = (
              <div className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-accent/50">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", tones[n.kind])}><Icon className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[13px] leading-snug", !n.read && "font-semibold")}>{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/80">{timeAgo(n.at)}</p>
                </div>
                {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
              </div>
            );
            return <li key={n.id}>{n.href ? <Link href={n.href} onClick={() => markOne(n.id)} className="block">{body}</Link> : <button className="block w-full text-left" onClick={() => markOne(n.id)}>{body}</button>}</li>;
          })}
        </ul>
      )}
      {compact && <div className="border-t p-2"><Link href="/app/notifications" className="block rounded-md py-2 text-center text-sm font-medium text-primary hover:bg-accent">View all activity</Link></div>}
    </div>
  );
}
