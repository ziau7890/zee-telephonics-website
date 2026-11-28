"use client";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Info, Search, SearchX, TrendingDown, TrendingUp, AlertTriangle, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { Tooltip } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ---------- Page header ---------- */
export function PageHeader({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- KPI card ---------- */
export function StatCard({ label, value, delta, deltaLabel, icon: Icon, hint, tone = "blue", invert, loading }: {
  label: string; value: string; delta?: number; deltaLabel?: string; icon?: React.ComponentType<{ className?: string }>; hint?: string; tone?: "blue" | "cyan" | "violet" | "emerald" | "amber" | "rose"; invert?: boolean; loading?: boolean;
}) {
  const tones = { blue: "bg-blue-500/10 text-blue-600 dark:text-blue-300", cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300", violet: "bg-violet-500/10 text-violet-600 dark:text-violet-300", emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300", rose: "bg-rose-500/10 text-rose-600 dark:text-rose-300" };
  const up = (delta ?? 0) >= 0;
  const good = invert ? !up : up;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
          {label}
          {hint && <Tooltip content={hint}><button className="rounded text-muted-foreground/60 hover:text-foreground" aria-label={`About ${label}`}><Info className="size-3.5" /></button></Tooltip>}
        </div>
        {Icon && <span className={cn("grid size-8 place-items-center rounded-lg", tones[tone])}><Icon className="size-4" /></span>}
      </div>
      {loading ? <Skeleton className="mt-3 h-8 w-28" /> : <p className="mt-2 text-[26px] font-semibold leading-none tracking-tight tabular">{value}</p>}
      {delta != null && !loading && (
        <p className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium", good ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300")}>
            {up ? <TrendingUp className="size-3" aria-hidden /> : <TrendingDown className="size-3" aria-hidden />}
            <span className="sr-only">{up ? "Up" : "Down"}</span>{Math.abs(delta)}{deltaLabel?.startsWith("pts") ? "" : "%"}
          </span>
          <span className="text-muted-foreground">{deltaLabel ?? "vs last month"}</span>
        </p>
      )}
    </Card>
  );
}

/* ---------- Status badges (text + color, never color alone) ---------- */
const statusMap: Record<string, BadgeVariant> = {
  Active: "success", Present: "success", Paid: "success", Approved: "success", Won: "success", "On track": "success", Ready: "success", Healthy: "success", Completed: "secondary", Connected: "success",
  "On leave": "info", Remote: "info", Sent: "info", Onboarding: "info", Planning: "info", Contacted: "info", New: "secondary", Draft: "secondary",
  Late: "warning", Pending: "warning", "Pending approval": "warning", "Partially paid": "warning", Probation: "warning", "Needs review": "warning", Qualified: "default", Proposal: "violet", Negotiation: "violet", "At risk": "danger", Watch: "warning", Paused: "secondary",
  Absent: "danger", Overdue: "danger", Declined: "danger", Lost: "danger", Offboarding: "danger", "On hold": "danger",
};
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return <Badge variant={statusMap[status] ?? "secondary"} dot className={className}>{status}</Badge>;
}

/* ---------- Chart card with accessible summary ---------- */
export function ChartCard({ title, description, summary, actions, children, className, contentClassName }: { title: string; description?: string; summary: string; actions?: React.ReactNode; children: React.ReactNode; className?: string; contentClassName?: string }) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex items-start justify-between gap-3 p-5 pb-0 sm:p-6 sm:pb-0">
        <div><h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>{description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}</div>
        {actions}
      </div>
      <figure className={cn("flex-1 p-3 pt-4 sm:p-4 sm:pt-5", contentClassName)}>
        <div aria-hidden>{children}</div>
        <figcaption className="sr-only">{summary}</figcaption>
      </figure>
    </Card>
  );
}

export function ChartTooltip({ active, payload, label, format }: { active?: boolean; payload?: { name?: string; value?: number; color?: string; dataKey?: string; payload?: Record<string, unknown> }[]; label?: string | number; format?: (v: number, key?: string) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[150px] rounded-lg border bg-popover px-3 py-2.5 text-xs shadow-elevated">
      {label != null && <p className="mb-1.5 font-medium text-foreground">{label}</p>}
      <ul className="space-y-1">
        {payload.map((p) => (
          <li key={String(p.dataKey ?? p.name)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="size-2 rounded-full" style={{ background: p.color }} />{p.name}</span>
            <span className="font-medium tabular text-foreground">{format ? format(Number(p.value), String(p.dataKey)) : p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const axisProps = { tickLine: false, axisLine: false, tick: { fontSize: 12 } } as const;

/* ---------- Confirmation dialog ---------- */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", destructive, onConfirm, loading }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => void | Promise<void>; loading?: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" role="alertdialog">
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant={destructive ? "destructive" : "default"} loading={loading} onClick={() => onConfirm()}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Error + loading ---------- */
export function ErrorState({ onRetry, message = "We couldn't load this data." }: { onRetry?: () => void; message?: string }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <AlertTriangle className="size-6 text-destructive" />
      <p className="mt-3 text-sm font-medium">{message}</p>
      <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again. If it keeps happening, contact support.</p>
      {onRetry && <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}><RotateCw /> Try again</Button>}
    </div>
  );
}

export function StatGridSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => <Card key={i} className="p-5"><Skeleton className="h-4 w-24" /><Skeleton className="mt-4 h-7 w-32" /><Skeleton className="mt-4 h-4 w-28" /></Card>)}
    </div>
  );
}

/* ---------- Data table: search, filter slot, sort, pagination ---------- */
export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  align?: "left" | "right";
  hideBelow?: "sm" | "md" | "lg";
}

export function DataTable<T>({ rows, columns, caption, searchKeys, searchPlaceholder = "Search…", filters, pageSize = 10, loading, emptyTitle = "Nothing here yet", emptyDescription = "Records will appear here once they're created.", onRowClick, rowKey, toolbar, initialSort, initialQuery = "" }: {
  rows: T[]; columns: Column<T>[]; caption: string; searchKeys?: (row: T) => string; searchPlaceholder?: string; filters?: React.ReactNode; pageSize?: number; loading?: boolean; emptyTitle?: string; emptyDescription?: string; onRowClick?: (row: T) => void; rowKey: (row: T) => string; toolbar?: React.ReactNode; initialSort?: { key: string; dir: "asc" | "desc" }; initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(initialSort ?? null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(pageSize);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = term && searchKeys ? rows.filter((r) => searchKeys(r).toLowerCase().includes(term)) : rows;
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        out = [...out].sort((a, b) => {
          const va = col.sortValue!(a), vb = col.sortValue!(b);
          const r = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
          return sort.dir === "asc" ? r : -r;
        });
      }
    }
    return out;
  }, [rows, q, sort, columns, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, pages - 1);
  const slice = filtered.slice(current * size, current * size + size);
  const hide = { sm: "hidden sm:table-cell", md: "hidden md:table-cell", lg: "hidden lg:table-cell" };

  const toggleSort = (key: string) => setSort((s) => (s?.key === key ? (s.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" }));

  return (
    <Card className="overflow-hidden">
      {(searchKeys || filters || toolbar) && (
        <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:p-4">
          {searchKeys && (
            <label className="relative block w-full sm:max-w-xs">
              <span className="sr-only">{searchPlaceholder}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder={searchPlaceholder} className="h-9 pl-9" />
            </label>
          )}
          {filters && <div className="flex flex-wrap items-center gap-2" onChange={() => setPage(0)}>{filters}</div>}
          {toolbar && <div className="flex items-center gap-2 sm:ml-auto">{toolbar}</div>}
        </div>
      )}
      <div className="relative overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}. {filtered.length} rows. Column headers with buttons can be sorted.</caption>
          <thead>
            <tr className="border-b bg-muted/40">
              {columns.map((c) => (
                <th key={c.key} scope="col" aria-sort={sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                  className={cn("h-10 whitespace-nowrap px-4 text-left text-xs font-medium text-muted-foreground", c.align === "right" && "text-right", c.hideBelow && hide[c.hideBelow], c.className)}>
                  {c.sortValue ? (
                    <button onClick={() => toggleSort(c.key)} className={cn("inline-flex items-center gap-1 rounded hover:text-foreground", c.align === "right" && "flex-row-reverse")}>
                      {c.header}
                      {sort?.key === c.key ? (sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3 opacity-40" />}
                    </button>
                  ) : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: Math.min(size, 6) }).map((_, i) => (
                  <tr key={i} className="border-b last:border-0">{columns.map((c) => <td key={c.key} className={cn("px-4 py-3.5", c.hideBelow && hide[c.hideBelow])}><Skeleton className="h-4 w-full max-w-[140px]" /></td>)}</tr>
                ))
              : slice.map((row) => (
                  <tr key={rowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={onRowClick ? (e) => { if (e.key === "Enter") onRowClick(row); } : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    className={cn("border-b transition-colors last:border-0 hover:bg-muted/40", onRowClick && "cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-0")}>
                    {columns.map((c) => <td key={c.key} className={cn("whitespace-nowrap px-4 py-3", c.align === "right" && "text-right tabular", c.hideBelow && hide[c.hideBelow], c.className)}>{c.cell(row)}</td>)}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!loading && filtered.length === 0 && (
        <EmptyState className="m-4 border-0" icon={q ? SearchX : Search} title={q ? `No results for “${q}”` : emptyTitle} description={q ? "Check the spelling or try a broader search." : emptyDescription} action={q ? <Button variant="outline" size="sm" onClick={() => setQ("")}>Clear search</Button> : undefined} />
      )}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span aria-live="polite">Showing <span className="font-medium text-foreground tabular">{current * size + 1}–{Math.min(filtered.length, (current + 1) * size)}</span> of <span className="font-medium text-foreground tabular">{filtered.length}</span></span>
            <label className="hidden items-center gap-2 sm:flex"><span className="sr-only">Rows per page</span>
              <NativeSelect value={size} onChange={(e) => { setSize(+e.target.value); setPage(0); }} className="h-8 w-[76px] text-xs">{[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}</NativeSelect>
            </label>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page"><ChevronLeft /></Button>
            <span className="px-2 tabular">Page {current + 1} of {pages}</span>
            <Button variant="outline" size="icon-sm" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="Next page"><ChevronRight /></Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <NativeSelect value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-auto min-w-[140px] text-[13px]" aria-label={label}>
        <option value="">{`All ${label.toLowerCase()}`}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </NativeSelect>
    </label>
  );
}

/* ---------- Client health ---------- */
export function HealthBadge({ value }: { value: number }) {
  const label = value >= 85 ? "Healthy" : value >= 70 ? "Watch" : "At risk";
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", value >= 85 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : value >= 70 ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300")}><span className="tabular">{value}</span> · {label}</span>;
}

