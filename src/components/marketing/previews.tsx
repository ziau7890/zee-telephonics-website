/**
 * Product previews for the marketing site, built from real UI pieces (not screenshots),
 * using lightweight SVG charts so the public pages don't ship the charting library.
 */
import { ArrowUpRight, Bell, CheckCircle2, Clock, Search, TrendingUp, Users, Wallet, CircleDollarSign, Star } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Avatar } from "@/components/ui/misc";
import { LogoMark } from "@/components/brand/logo";

export function Spark({ data, color = "#3B82F6", className, height = 64, fill = true }: { data: number[]; color?: string; className?: string; height?: number; fill?: boolean }) {
  const w = 300;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, height - ((v - min) / (max - min || 1)) * (height - 8) - 4]);
  const d = pts.map((p, i) => {
    if (i === 0) return `M${p[0]},${p[1]}`;
    const prev = pts[i - 1];
    const cx = (prev[0] + p[0]) / 2;
    return `C${cx},${prev[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
  }).join(" ");
  const id = `sp${color.replace("#", "")}${data.length}${height}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className={cn("w-full", className)} style={{ height }} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient>
      </defs>
      {fill && <path d={`${d} L${w},${height} L0,${height} Z`} fill={`url(#${id})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Frame({ children, className, title = "app.zeetelephonics.com" }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628]/90 shadow-[0_40px_120px_-30px_rgba(37,99,235,0.45)] ring-1 ring-white/5 backdrop-blur", className)}>
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="size-2.5 rounded-full bg-white/15" /><span className="size-2.5 rounded-full bg-white/15" /><span className="size-2.5 rounded-full bg-white/15" />
        <span className="mx-auto rounded-md bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-slate-400">{title}</span>
      </div>
      {children}
    </div>
  );
}

const revenue = [128, 134, 131, 142, 149, 147, 158, 163, 161, 170, 176, 184.6];

/** Large executive dashboard preview used on the homepage. */
export function DashboardPreview() {
  const kpis = [
    { label: "Monthly revenue", value: "$184,620", delta: "+8.2%", icon: CircleDollarSign },
    { label: "Active employees", value: "248", delta: "+12", icon: Users },
    { label: "Attendance rate", value: "96.8%", delta: "+0.6 pts", icon: Clock },
    { label: "Client satisfaction", value: "94.6%", delta: "+1.1 pts", icon: Star },
  ];
  const nav = ["Overview", "Team", "Attendance", "Leads", "Clients", "Payroll", "Accounting", "Invoices", "Reports"];
  return (
    <Frame>
      <div className="flex text-left">
        <aside className="hidden w-48 shrink-0 border-r border-white/[0.06] p-3 md:block">
          <div className="mb-4 flex items-center gap-2 px-2 pt-1 text-[13px] font-semibold text-white"><LogoMark size={20} /> Zee Telephonics</div>
          {nav.map((n, i) => (
            <div key={n} className={cn("mb-0.5 rounded-md px-2.5 py-1.5 text-[12.5px] text-slate-400", i === 0 && "bg-white/[0.06] text-white")}>{n}</div>
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-500">Good morning, Zia</p>
              <p className="text-[15px] font-semibold text-white">Executive overview</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] text-slate-500 sm:flex"><Search className="size-3" /> Search · ⌘K</div>
              <div className="relative rounded-md border border-white/10 p-1.5 text-slate-400"><Bell className="size-3.5" /><span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-rose-500" /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">{k.label}<k.icon className="size-3.5 text-slate-500" /></div>
                <div className="mt-2 text-lg font-semibold tabular text-white">{k.value}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-400"><TrendingUp className="size-3" />{k.delta}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between"><p className="text-[12px] font-medium text-white">Revenue vs expenses</p><p className="text-[11px] text-slate-500">Last 12 months</p></div>
              <div className="relative mt-3">
                <Spark data={revenue} height={120} />
                <Spark data={revenue.map((v, i) => v * 0.78 - i * 0.6)} color="#8B5CF6" height={120} fill={false} className="absolute inset-0" />
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="text-[12px] font-medium text-white">Needs attention</p>
              <ul className="mt-3 space-y-2.5 text-[11.5px]">
                <li className="flex gap-2 text-slate-300"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-rose-400" />Meridian SLA at 84% (target 90%)</li>
                <li className="flex gap-2 text-slate-300"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-400" />Payroll cutoff in 3 days · 14 to review</li>
                <li className="flex gap-2 text-slate-300"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-cyan-400" />3 leave requests pending</li>
                <li className="flex gap-2 text-slate-300"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-400" />Lattice Software signed · 14 seats</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function TeamPreview() {
  const people = [
    ["Sarah Ahmed", "Operations Manager", "Karachi HQ", "Active"],
    ["Omar Khan", "Team Lead · Outbound", "Lahore Center", "Active"],
    ["Emily Johnson", "Client Success Manager", "Remote · UK", "Active"],
    ["Aisha Malik", "Quality Analyst", "Karachi HQ", "On shift"],
    ["Maria Santos", "Back Office Supervisor", "Manila Site", "Onboarding 3"],
  ];
  return (
    <Frame title="Team · Directory">
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between text-[12px]"><span className="font-medium text-white">248 employees · 8 departments</span><span className="rounded-md bg-blue-500/15 px-2 py-1 text-blue-300">+ Add employee</span></div>
        <ul className="divide-y divide-white/[0.06]">
          {people.map(([n, r, l, s]) => (
            <li key={n} className="flex items-center gap-3 py-2.5">
              <Avatar name={n} size={30} className="ring-[#0a1628]" />
              <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium text-white">{n}</p><p className="truncate text-[11.5px] text-slate-400">{r}</p></div>
              <span className="hidden text-[11.5px] text-slate-500 sm:block">{l}</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

export function WorkforcePreview() {
  const bars = [94.8, 96.1, 95.4, 97.2, 96.8, 93.1, 96.9, 97.5, 96.2, 96.8, 97.1, 95.9, 96.4, 96.8];
  return (
    <Frame title="Attendance · Today">
      <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
        {[["Present", "231", "text-emerald-300"], ["Late", "11", "text-amber-300"], ["On leave", "6", "text-cyan-300"]].map(([l, v, c]) => (
          <div key={l} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3"><p className="text-[11px] text-slate-400">{l}</p><p className={cn("mt-1 text-xl font-semibold tabular", c)}>{v}</p></div>
        ))}
        <div className="sm:col-span-3">
          <div className="flex items-center justify-between text-[12px]"><span className="font-medium text-white">Attendance rate · 14 days</span><span className="text-emerald-300">96.8% avg</span></div>
          <div className="mt-3 flex h-28 items-end gap-1.5">
            {bars.map((b, i) => (
              <div key={i} className="flex-1 rounded-t-[3px] bg-gradient-to-t from-blue-600/50 to-cyan-400/90" style={{ height: `${(b - 90) * 12}%` }} />
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function CRMPreview() {
  const cols = [
    { name: "Qualified", color: "bg-blue-400", items: [["Juniper Clinics", 14040, 86], ["Nimbus Cloud", 21300, 78]] },
    { name: "Proposal", color: "bg-violet-400", items: [["Keystone Lending", 9600, 81], ["Amber Hotels", 7200, 74]] },
    { name: "Won", color: "bg-emerald-400", items: [["Lattice Software", 10920, 94]] },
  ] as const;
  return (
    <Frame title="Leads · Pipeline">
      <div className="grid grid-cols-3 gap-3 p-4 sm:p-5">
        {cols.map((c) => (
          <div key={c.name} className="min-w-0">
            <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-medium text-slate-300"><span className={cn("size-1.5 rounded-full", c.color)} />{c.name}</div>
            <div className="space-y-2">
              {c.items.map(([n, v, s]) => (
                <div key={n} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2.5">
                  <p className="truncate text-[12px] font-medium text-white">{n}</p>
                  <p className="mt-1 text-[11px] tabular text-slate-400">{formatCurrency(v)}/mo</p>
                  <div className="mt-2 h-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${s}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function PayrollPreview() {
  return (
    <Frame title="Payroll · November">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-[11px] text-slate-400">Net payroll</p><p className="text-2xl font-semibold tabular text-white">$98,460</p></div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] text-amber-300"><Clock className="size-3" /> Pending approval</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
          {[["Base", "$91,200"], ["Overtime", "$4,180"], ["Bonuses", "$3,080"]].map(([l, v]) => (
            <div key={l} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2.5"><p className="text-slate-400">{l}</p><p className="mt-0.5 font-medium tabular text-white">{v}</p></div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {[["PKR", 72], ["PHP", 21], ["GBP", 5], ["USD", 2]].map(([c, p]) => (
            <div key={c} className="flex items-center gap-3 text-[11.5px]"><span className="w-8 font-mono text-slate-400">{c}</span><div className="h-1.5 flex-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400/80" style={{ width: `${p}%` }} /></div><span className="w-8 text-right tabular text-slate-300">{p}%</span></div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-2 text-[11.5px] text-emerald-300"><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5" /> 234 lines ready</span><span>14 need review</span></div>
      </div>
    </Frame>
  );
}

export function ClientPreview() {
  const rows = [
    ["Northstar Retail", 96, 97.2, "Healthy"],
    ["Vertex Health", 91, 95.8, "Healthy"],
    ["BrightPath Education", 82, 92.4, "Watch"],
    ["Meridian Insurance", 58, 86.1, "At risk"],
  ] as const;
  return (
    <Frame title="Clients · Health">
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3 text-[12px]">
          <span className="text-[11px] text-slate-500">Client</span><span className="text-[11px] text-slate-500">CSAT</span><span className="text-[11px] text-slate-500">Health</span>
          {rows.map(([n, h, c, s]) => (
            <div key={n} className="contents">
              <span className="truncate font-medium text-white">{n}</span>
              <span className="tabular text-slate-300">{c}%</span>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px]", h > 90 ? "bg-emerald-500/10 text-emerald-300" : h > 70 ? "bg-amber-500/10 text-amber-300" : "bg-rose-500/10 text-rose-300")}>
                <span className="tabular">{h}</span> · {s}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-rose-400/20 bg-rose-500/[0.06] p-3 text-[11.5px] text-rose-200">
          SLA at 84% for 3 days. Suggested: move 3 agents from Voice Team B to Meridian evening queue.
        </div>
      </div>
    </Frame>
  );
}

export function FinancePreview() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a1628]/90 p-5">
      <div className="flex items-center justify-between text-[12px]"><span className="font-medium text-white">Net profit</span><span className="inline-flex items-center gap-1 text-emerald-300"><ArrowUpRight className="size-3.5" />+6.4%</span></div>
      <p className="mt-2 text-2xl font-semibold tabular text-white">$41,280</p>
      <Spark data={[28, 30, 29, 33, 34, 33, 36, 37, 36, 39, 40, 41.3]} color="#10B981" height={56} className="mt-3" />
      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400"><Wallet className="size-3.5" /> Outstanding invoices: <span className="tabular text-white">$42,800</span></div>
    </div>
  );
}
