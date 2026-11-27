"use client";
import { useMemo, useState } from "react";
import { Plug, Search, CheckCircle2, RefreshCw, Settings2, KeyRound, Copy, Webhook, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { integrations as seed } from "@/lib/mock/data";
import { PageHeader, StatCard, ConfirmDialog } from "@/components/dashboard/kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { Input, Field, NativeSelect } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { timeAgo } from "@/components/dashboard/format";
import { cn, sleep } from "@/lib/utils";

type Integration = (typeof seed)[number] & { lastSync?: string; frequency?: string };
const tileColors: Record<string, string> = { Communication: "from-violet-500 to-fuchsia-500", "Contact center": "from-blue-500 to-cyan-400", Helpdesk: "from-emerald-500 to-teal-400", CRM: "from-sky-500 to-blue-600", Accounting: "from-amber-500 to-orange-500", Payments: "from-indigo-500 to-violet-500", Identity: "from-slate-500 to-slate-700" };
const scopes: Record<string, string[]> = {
  Communication: ["Post messages to channels you choose", "Read channel names (not message content)"],
  "Contact center": ["Read agent states and interaction records", "Read queue and skill configuration"],
  Helpdesk: ["Read tickets, satisfaction ratings and tags", "Read organizations to map tickets to clients"],
  CRM: ["Read and write leads, contacts and opportunities", "Read owners and pipeline stages"],
  Accounting: ["Create invoices, payments and journal entries", "Read chart of accounts"],
  Payments: ["Create payment links for invoices", "Receive payment status webhooks"],
  Identity: ["Authenticate users with single sign-on", "Read the user directory for provisioning"],
};

export default function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>(() => seed.map((s, i) => ({ ...s, lastSync: s.connected ? new Date(Date.now() - (i + 1) * 7 * 60_000).toISOString() : undefined, frequency: "Every 15 minutes" })));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [view, setView] = useState<"all" | "connected">("all");
  const [connecting, setConnecting] = useState<Integration | null>(null);
  const [configuring, setConfiguring] = useState<Integration | null>(null);
  const [removing, setRemoving] = useState<Integration | null>(null);
  const [busy, setBusy] = useState(false);
  const categories = ["All", ...Array.from(new Set(seed.map((s) => s.category)))];
  const list = useMemo(() => items.filter((i) => (cat === "All" || i.category === cat) && (view === "all" || i.connected) && `${i.name} ${i.description}`.toLowerCase().includes(q.toLowerCase())), [items, q, cat, view]);
  const update = (id: string, patch: Partial<Integration>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const connect = async () => {
    if (!connecting) return;
    setBusy(true); await sleep(1100);
    update(connecting.id, { connected: true, lastSync: new Date().toISOString() });
    toast.success(`${connecting.name} connected`, { description: "The first sync is running in the background." });
    setBusy(false); setConnecting(null);
  };
  const disconnect = async () => {
    if (!removing) return;
    setBusy(true); await sleep(700);
    update(removing.id, { connected: false, lastSync: undefined });
    toast(`${removing.name} disconnected`);
    setBusy(false); setRemoving(null); setConfiguring(null);
  };
  const syncNow = async (i: Integration) => { toast.promise(sleep(1200).then(() => update(i.id, { lastSync: new Date().toISOString() })), { loading: `Syncing ${i.name}…`, success: `${i.name} is up to date`, error: "Sync failed" }); };

  const connected = items.filter((i) => i.connected).length;
  return (
    <>
      <PageHeader title="Integrations" description="Connect the contact center, CRM, accounting and identity tools your teams already use." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Connected" value={`${connected} of ${items.length}`} icon={Plug} tone="blue" />
        <StatCard label="Healthy syncs (24h)" value="1,284" icon={CheckCircle2} tone="emerald" hint="No failed jobs in the last 24 hours." />
        <StatCard label="Records synced (30d)" value="412k" icon={RefreshCw} tone="violet" />
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1.5 relative overflow-x-auto no-scrollbar" role="tablist" aria-label="Filter by category">
          {categories.map((c) => <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cn("shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors", cat === c ? "border-primary/50 bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>{c}</button>)}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md bg-muted p-0.5 text-xs">
            {(["all", "connected"] as const).map((v) => <button key={v} aria-pressed={view === v} onClick={() => setView(v)} className={cn("rounded px-2.5 py-1.5 capitalize", view === v ? "bg-card font-medium shadow-sm" : "text-muted-foreground")}>{v}</button>)}
          </div>
          <div className="relative w-full lg:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search integrations" className="pl-9" aria-label="Search integrations" /></div>
        </div>
      </div>

      {list.length === 0 ? <EmptyState icon={Plug} title="No integrations match" description="Try a different search or category." /> : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((i) => (
            <li key={i.id}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={cn("grid size-10 place-items-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-sm", tileColors[i.category] ?? "from-slate-500 to-slate-700")} aria-hidden>{i.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                    <div><p className="font-semibold leading-tight">{i.name}</p><p className="text-xs text-muted-foreground">{i.category}</p></div>
                  </div>
                  {i.connected ? <Badge variant="success" dot>Connected</Badge> : <Badge variant="secondary">Available</Badge>}
                </div>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{i.description}</p>
                <div className="mt-4 flex items-center justify-between gap-2 border-t pt-4">
                  {i.connected ? (
                    <>
                      <span className="text-xs text-muted-foreground">Synced {i.lastSync ? timeAgo(i.lastSync) : "—"}</span>
                      <div className="flex gap-1">
                        <Button size="icon-sm" variant="ghost" aria-label={`Sync ${i.name} now`} onClick={() => syncNow(i)}><RefreshCw /></Button>
                        <Button size="sm" variant="outline" onClick={() => setConfiguring(i)}><Settings2 /> Manage</Button>
                      </div>
                    </>
                  ) : (
                    <><span className="text-xs text-muted-foreground">Setup takes about 2 minutes</span><Button size="sm" onClick={() => setConnecting(i)}>Connect</Button></>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ApiKeys />
        <Webhooks />
      </div>

      <Dialog open={!!connecting} onOpenChange={(o) => !o && !busy && setConnecting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Connect {connecting?.name}</DialogTitle><DialogDescription>You'll be asked to sign in to {connecting?.name} and approve access. Zee Telephonics BPO will be able to:</DialogDescription></DialogHeader>
          <ul className="space-y-2">{(connecting ? scopes[connecting.category] ?? [] : []).map((s) => <li key={s} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />{s}</li>)}</ul>
          <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0" />Credentials are stored encrypted and you can disconnect at any time. Only workspace admins can manage integrations.</p>
          <DialogFooter><Button variant="ghost" onClick={() => setConnecting(null)} disabled={busy}>Cancel</Button><Button onClick={connect} loading={busy}>Authorize and connect</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!configuring} onOpenChange={(o) => !o && setConfiguring(null)}>
        <DialogContent side="right">
          {configuring && (
            <>
              <DialogHeader><DialogTitle>{configuring.name}</DialogTitle><DialogDescription>{configuring.description}</DialogDescription></DialogHeader>
              <div className="space-y-5">
                <Field label="Sync frequency" htmlFor="int-freq"><NativeSelect id="int-freq" value={configuring.frequency} onChange={(e) => { update(configuring.id, { frequency: e.target.value }); setConfiguring({ ...configuring, frequency: e.target.value }); toast.success("Sync frequency updated"); }}>{["Real time", "Every 15 minutes", "Hourly", "Daily"].map((f) => <option key={f}>{f}</option>)}</NativeSelect></Field>
                <div className="space-y-3">
                  <p className="text-sm font-medium">What to sync</p>
                  {(scopes[configuring.category] ?? []).map((s, idx) => <label key={s} className="flex items-center justify-between gap-4 text-sm"><span className="text-muted-foreground">{s}</span><Switch defaultChecked={idx === 0 || configuring.category !== "CRM"} aria-label={s} /></label>)}
                </div>
                <div className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">Recent sync activity</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                    <li>Synced {configuring.lastSync ? timeAgo(configuring.lastSync) : "—"} · 214 records updated</li>
                    <li>1 hour ago · 188 records updated</li>
                    <li>2 hours ago · 203 records updated</li>
                  </ul>
                </div>
              </div>
              <DialogFooter className="mt-auto"><Button variant="destructive" onClick={() => setRemoving(configuring)}>Disconnect</Button><Button variant="outline" onClick={() => syncNow(configuring)}><RefreshCw /> Sync now</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)} title={`Disconnect ${removing?.name}?`} description="Syncing stops immediately. Data already imported stays in your workspace, and you can reconnect later." confirmLabel="Disconnect" destructive loading={busy} onConfirm={disconnect} />
    </>
  );
}

function ApiKeys() {
  const [keys, setKeys] = useState([{ id: "k1", name: "Reporting warehouse", prefix: "zt_live_8f3a", created: "Sep 12, 2026", lastUsed: "2 hours ago" }]);
  const [revoke, setRevoke] = useState<string | null>(null);
  const create = () => {
    const prefix = `zt_live_${Math.random().toString(16).slice(2, 6)}`;
    setKeys((k) => [...k, { id: `k${Date.now()}`, name: `API key ${k.length + 1}`, prefix, created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), lastUsed: "Never" }]);
    navigator.clipboard?.writeText(`${prefix}${"•".repeat(4)}`).catch(() => {});
    toast.success("API key created", { description: "In production the full secret is shown once. Store it somewhere safe." });
  };
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0"><div><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="size-4 text-muted-foreground" /> API keys</CardTitle><CardDescription>Read access to the REST API for your own tools.</CardDescription></div><Button size="sm" variant="outline" onClick={create}><Plus /> Create key</Button></CardHeader>
      <CardContent>
        <ul className="divide-y">
          {keys.map((k) => (
            <li key={k.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0"><p className="text-sm font-medium">{k.name}</p><p className="font-mono text-xs text-muted-foreground">{k.prefix}••••••••</p><p className="text-xs text-muted-foreground">Created {k.created} · last used {k.lastUsed}</p></div>
              <div className="flex shrink-0 gap-1"><Button size="icon-sm" variant="ghost" aria-label={`Copy ${k.name} prefix`} onClick={() => { navigator.clipboard?.writeText(k.prefix).catch(() => {}); toast("Key prefix copied"); }}><Copy /></Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => setRevoke(k.id)}>Revoke</Button></div>
            </li>
          ))}
          {keys.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No API keys yet.</li>}
        </ul>
      </CardContent>
      <ConfirmDialog open={!!revoke} onOpenChange={(o) => !o && setRevoke(null)} title="Revoke this API key?" description="Any system using it will lose access right away. This can't be undone." confirmLabel="Revoke key" destructive onConfirm={() => { setKeys((k) => k.filter((x) => x.id !== revoke)); setRevoke(null); toast("API key revoked"); }} />
    </Card>
  );
}

function Webhooks() {
  const [hooks, setHooks] = useState([{ id: "w1", url: "https://ops.example.com/hooks/invoices", events: "invoice.paid, invoice.overdue", on: true }]);
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const add = () => {
    try { const u = new URL(url); if (u.protocol !== "https:") throw new Error(); } catch { return setErr("Enter a valid https:// URL."); }
    setHooks((h) => [...h, { id: `w${Date.now()}`, url, events: "All events", on: true }]); setUrl(""); setErr(""); toast.success("Webhook endpoint added");
  };
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Webhook className="size-4 text-muted-foreground" /> Webhooks</CardTitle><CardDescription>Receive events when invoices, leads or payroll runs change.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <ul className="divide-y">
          {hooks.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0"><p className="truncate font-mono text-xs">{h.url}</p><p className="text-xs text-muted-foreground">{h.events}</p></div>
              <Switch checked={h.on} onCheckedChange={(v) => setHooks((x) => x.map((y) => (y.id === h.id ? { ...y, on: v } : y)))} aria-label={`Toggle webhook ${h.url}`} />
            </li>
          ))}
        </ul>
        <form className="flex items-start gap-2" onSubmit={(e) => { e.preventDefault(); add(); }} noValidate>
          <div className="flex-1"><Input value={url} onChange={(e) => { setUrl(e.target.value); setErr(""); }} placeholder="https://your-endpoint.com/webhook" aria-label="Webhook URL" aria-invalid={!!err} aria-describedby={err ? "wh-err" : undefined} />{err && <p id="wh-err" className="mt-1 text-xs text-destructive">{err}</p>}</div>
          <Button type="submit" variant="outline">Add</Button>
        </form>
      </CardContent>
    </Card>
  );
}
