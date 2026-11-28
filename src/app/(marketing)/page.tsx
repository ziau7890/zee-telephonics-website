import Link from "next/link";
import {
  ArrowRight, CalendarCheck, Check,
  ShieldCheck, KeyRound, ScrollText, Lock, DatabaseBackup, UserCog, Activity, ServerCog, Quote, PlayCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow, Reveal, SectionHeading } from "@/components/marketing/primitives";
import { FinalCTA } from "@/components/marketing/cta";
import { HeroCore, Ecosystem, TeamOrbit, SecurityVault } from "@/components/three";
import { DashboardPreview, TeamPreview, WorkforcePreview, CRMPreview, PayrollPreview, ClientPreview, FinancePreview } from "@/components/marketing/previews";
import { PricingCards } from "@/components/marketing/pricing";
import { logos, modules, testimonials } from "@/lib/content";
import { integrations } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { moduleIcons } from "@/components/marketing/module-icons";


export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoStrip />
      <PlatformOverview />
      <FeatureGrid />
      <Showcase
        id="team"
        eyebrow="Team management"
        title="Know who is on every shift, for every client, at every site."
        description="One directory for 50 or 5,000 people. Departments, teams, reporting lines, skills and documents stay current because onboarding, transfers and exits all run through the same workflow."
        points={["Org chart, teams and reporting lines", "Shift and client assignments per agent", "Onboarding checklists with document collection", "Skills, languages and certifications"]}
        visual={
          <div className="relative">
            <TeamOrbit className="-mb-12 h-56 sm:h-64" />
            <div className="relative"><TeamPreview /></div>
          </div>
        }
      />
      <Showcase
        id="workforce"
        reverse
        eyebrow="Workforce analytics"
        title="Attendance you can bill against and pay from."
        description="Clock-ins from office kiosks, desktop agents and mobile are matched to rosters in real time. Lateness, breaks and overtime are calculated by your rules, not reconstructed at month end."
        points={["Live presence by site, shift and client", "Late arrivals, breaks and adherence", "Overtime with approval thresholds", "Leave balances and holiday calendars"]}
        visual={<WorkforcePreview />}
      />
      <Showcase
        id="crm"
        eyebrow="CRM and lead management"
        title="A pipeline that speaks in seats, services and monthly value."
        description="Generic CRMs track deals. BPO sales track how many agents, which services and when the pod goes live. Score leads, assign owners and hand won deals straight to operations."
        points={["Drag-and-drop pipeline with your stages", "Lead scoring and round-robin assignment", "Calls, emails, notes and reminders in one timeline", "Won deals create the client and project automatically"]}
        visual={<CRMPreview />}
      />
      <Showcase
        id="payroll"
        reverse
        eyebrow="Payroll and finance"
        title="Close payroll in hours, and see margin by client."
        description="Approved hours flow into payroll with overtime, bonuses, deductions and tax applied. Revenue, payroll and overheads post to one ledger so profitability is visible per account, every month."
        points={["Multi-currency payroll: PKR, PHP, USD, GBP and more", "Approval chain with payslips and bank export", "P&L, cash flow, budgets and receivables", "Audit trail on every change"]}
        visual={
          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr] sm:items-start">
            <PayrollPreview />
            <FinancePreview />
          </div>
        }
      />
      <Showcase
        id="clients"
        eyebrow="Client management"
        title="See an at-risk account two weeks before it calls you."
        description="Every client profile combines contract, seats, SLA attainment, CSAT and billing history into a health score, with the staffing change that would fix it."
        points={["Contracts, service packages and renewals", "SLA targets against live actuals", "Communication history and documents", "Client portal for reports and invoices"]}
        visual={<ClientPreview />}
      />
      <Integrations />
      <Security />
      <Testimonials />
      <section className="relative py-24 sm:py-32" aria-labelledby="pricing-preview">
        <div className="container">
          <SectionHeading eyebrow="Pricing" title={<span id="pricing-preview">Priced per seat. Predictable as you grow.</span>} description="Start with workforce basics and add payroll, billing and finance when you are ready. Every plan includes onboarding help." />
          <div className="mt-14"><PricingCards compact /></div>
          <p className="mt-8 text-center text-sm text-slate-400">
            Need the full breakdown? <Link href="/pricing" className="font-medium text-blue-300 underline-offset-4 hover:underline">Compare every feature</Link>
          </p>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-70" aria-hidden />
      <div className="pointer-events-none absolute -left-40 top-20 size-[520px] rounded-full bg-blue-600/25 blur-[140px]" aria-hidden />
      <div className="pointer-events-none absolute -right-20 top-40 size-[420px] rounded-full bg-violet-600/20 blur-[140px]" aria-hidden />
      <div className="container relative grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-4">
        <div className="relative z-10 max-w-2xl py-6 lg:py-16">
          <Reveal>
            <Link href="/features#payroll" className="group inline-flex">
              <Eyebrow className="pr-2 transition-colors group-hover:border-blue-300/40">
                <span className="rounded-full bg-blue-500 px-1.5 py-px text-[10px] font-semibold text-white">New</span>
                Attendance-driven payroll in 6 currencies
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Eyebrow>
            </Link>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-7 text-[40px] font-semibold leading-[1.04] tracking-[-0.035em] text-white sm:text-6xl lg:text-[68px]">
              Run your entire BPO operation from <span className="text-gradient">one intelligent platform.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300/90 sm:text-lg">
              Zee Telephonics BPO brings your people, shifts, clients, pipeline, payroll and invoicing into one system, so you can staff every account, bill every hour and see real margin by client.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className={buttonVariants({ variant: "brand", size: "lg" })}><CalendarCheck /> Book a Demo</Link>
            <Link href="/app" className={buttonVariants({ variant: "glass", size: "lg" })}><PlayCircle /> Explore Platform</Link>
          </Reveal>
          <Reveal delay={0.2}>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/[0.08] pt-6">
              {[["4 hrs", "to close payroll"], ["96.8%", "attendance visibility"], ["1", "system for every site"]].map(([v, l]) => (
                <div key={l}><dt className="sr-only">{l}</dt><dd className="text-xl font-semibold tabular text-white sm:text-2xl">{v}</dd><dd className="mt-1 text-xs text-slate-400 sm:text-[13px]">{l}</dd></div>
              ))}
            </dl>
          </Reveal>
        </div>
        <div className="relative -mx-4 h-[360px] sm:mx-0 sm:h-[460px] lg:h-[600px]">
          <HeroCore className="absolute inset-0" />
          {/* Floating context chips around the 3D core (decorative, mirrored in copy) */}
          <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
            <div className="glass absolute left-[4%] top-[18%] rounded-xl border border-white/10 px-3.5 py-2.5 shadow-elevated animate-fade-up [animation-delay:.6s]">
              <p className="text-[11px] text-slate-400">Agents on shift</p><p className="text-lg font-semibold tabular text-white">231<span className="ml-1 text-xs font-normal text-emerald-300">/ 248</span></p>
            </div>
            <div className="glass absolute right-[2%] top-[30%] rounded-xl border border-white/10 px-3.5 py-2.5 shadow-elevated animate-fade-up [animation-delay:.8s]">
              <p className="text-[11px] text-slate-400">Monthly revenue</p><p className="text-lg font-semibold tabular text-white">$184,620</p>
            </div>
            <div className="glass absolute bottom-[14%] left-[12%] rounded-xl border border-white/10 px-3.5 py-2.5 shadow-elevated animate-fade-up [animation-delay:1s]">
              <p className="text-[11px] text-slate-400">Client satisfaction</p><p className="text-lg font-semibold tabular text-white">94.6%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  return (
    <section aria-label="Trusted by BPO teams" className="relative border-y border-white/[0.05] bg-white/[0.015] py-10">
      <p className="text-center text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Trusted by operations teams running 20 to 2,000 seats</p>
      <div className="mask-fade-x mt-7 overflow-hidden">
        <ul className="flex w-max animate-marquee gap-14 pr-14 motion-reduce:animate-none">
          {[...logos, ...logos].map((l, i) => (
            <li key={i} className="flex items-center gap-2.5 whitespace-nowrap text-lg font-semibold tracking-tight text-slate-500" aria-hidden={i >= logos.length}>
              <span className={cn("grid size-7 place-items-center rounded-md border border-white/10 text-[11px] font-bold text-slate-400", i % 3 === 0 ? "rounded-full" : i % 3 === 1 ? "rotate-45 rounded-sm" : "")}><span className={i % 3 === 1 ? "-rotate-45" : ""}>{l[0]}</span></span>
              {l}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PlatformOverview() {
  const layers = [
    ["People layer", "Employees, teams, shifts and attendance feed everything else."],
    ["Revenue layer", "Leads become clients, clients become projects and invoices."],
    ["Money layer", "Payroll, expenses and receivables roll up to margin by client."],
  ];
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="overview-title">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Platform overview" title={<span id="overview-title">Six modules. One source of truth.</span>} description="Most BPOs run on a dialer, a CRM, an HR tool, a payroll spreadsheet and an accounting package that never agree. Zee Telephonics connects them so a change in one place is reflected everywhere." />
            <ol className="mt-10 space-y-5">
              {layers.map(([t, d], i) => (
                <Reveal as="li" key={t} delay={i * 0.06} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-blue-400/20 bg-blue-500/10 font-mono text-xs text-blue-300">0{i + 1}</span>
                  <div><h3 className="font-medium text-white">{t}</h3><p className="mt-1 text-sm leading-relaxed text-slate-400">{d}</p></div>
                </Reveal>
              ))}
            </ol>
          </div>
          <Ecosystem className="h-[340px] sm:h-[440px]" />
        </div>
        <Reveal className="relative mt-16 sm:mt-24">
          <div className="pointer-events-none absolute -inset-x-10 -top-10 h-40 bg-blue-600/20 blur-3xl" aria-hidden />
          <DashboardPreview />
        </Reveal>
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="features-title" id="features">
      <div className="container">
        <SectionHeading eyebrow="Feature categories" title={<span id="features-title">Built for how outsourcing actually runs.</span>} description="Every module understands seats, shifts, clients and SLAs, because it was designed for BPO operations from day one." />
        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => {
            const Icon = moduleIcons[m.key];
            return (
              <Reveal as="li" key={m.key} delay={(i % 3) * 0.05}>
                <Link href={`/features#${m.key}`} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-colors hover:border-white/15 hover:bg-white/[0.035]">
                  <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-40" style={{ background: m.color }} aria-hidden />
                  <span className="grid size-10 place-items-center rounded-xl border border-white/10" style={{ background: `${m.color}1f`, color: m.color }}><Icon className="size-5" /></span>
                  <h3 className="mt-5 font-semibold text-white">{m.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{m.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-blue-300">Learn more <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Showcase({ id, eyebrow, title, description, points, visual, reverse }: { id: string; eyebrow: string; title: string; description: string; points: string[]; visual: React.ReactNode; reverse?: boolean }) {
  return (
    <section id={id} className="relative py-16 sm:py-24" aria-labelledby={`${id}-title`}>
      <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className={cn(reverse && "lg:order-2")}>
          <Reveal><Eyebrow>{eyebrow}</Eyebrow></Reveal>
          <Reveal delay={0.05}><h2 id={`${id}-title`} className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2></Reveal>
          <Reveal delay={0.1}><p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">{description}</p></Reveal>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {points.map((p, i) => (
              <Reveal as="li" key={p} delay={0.12 + i * 0.04} className="flex gap-2.5 text-sm text-slate-300">
                <Check className="mt-0.5 size-4 shrink-0 text-cyan-400" aria-hidden />{p}
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal delay={0.1} className={cn("relative", reverse && "lg:order-1")}>{visual}</Reveal>
      </div>
    </section>
  );
}

function Integrations() {
  const colors = ["#3B82F6", "#22D3EE", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899"];
  return (
    <section id="integrations" className="relative py-24 sm:py-32" aria-labelledby="int-title">
      <div className="container">
        <SectionHeading eyebrow="Integrations" title={<span id="int-title">Works with the stack you already run.</span>} description="Connect your dialer, helpdesk, accounting and identity provider. Data flows both ways, so nobody re-keys anything." />
        <ul className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {integrations.map((it, i) => (
            <Reveal as="li" key={it.id} delay={(i % 4) * 0.04} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${colors[i % colors.length]}, ${colors[(i + 2) % colors.length]})` }} aria-hidden>{it.name[0]}</span>
              <div className="min-w-0"><p className="truncate text-sm font-medium text-white">{it.name}</p><p className="truncate text-xs text-slate-500">{it.category}</p></div>
            </Reveal>
          ))}
        </ul>
        <p className="mt-8 text-center text-sm text-slate-400">Plus a REST API and webhooks for anything custom.</p>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    { icon: UserCog, t: "Role-based access control", d: "Agents, leads, managers, finance and owners each see only what their role allows." },
    { icon: KeyRound, t: "Secure authentication", d: "SSO with Google or SAML, enforced MFA and session controls." },
    { icon: ScrollText, t: "Audit logs", d: "Every approval, export and permission change is recorded with who, when and where." },
    { icon: Lock, t: "Encrypted data", d: "TLS in transit and AES-256 encryption at rest for every workspace." },
    { icon: DatabaseBackup, t: "Backup and recovery", d: "Nightly backups with point-in-time recovery options." },
    { icon: ShieldCheck, t: "Permission management", d: "Field-level controls for salaries, bank details and client rates." },
    { icon: Activity, t: "Activity tracking", d: "Login history, device sessions and unusual activity alerts." },
    { icon: ServerCog, t: "Compliance-ready architecture", d: "Designed for compliance-ready operations, with data residency options on Enterprise." },
  ];
  return (
    <section id="security" className="relative overflow-hidden py-24 sm:py-32" aria-labelledby="sec-title">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" aria-hidden />
      <div className="container grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading align="left" eyebrow="Security and trust" title={<span id="sec-title">Salaries, client rates and bank details deserve real controls.</span>} description="Your workspace holds your most sensitive data. Access is least-privilege by default and every sensitive action leaves a trail." />
          <SecurityVault className="mx-auto mt-6 h-[300px] max-w-md sm:h-[360px]" />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((it, i) => (
            <Reveal as="li" key={it.t} delay={(i % 2) * 0.05} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <it.icon className="size-5 text-cyan-300" aria-hidden />
              <h3 className="mt-3 text-[15px] font-medium text-white">{it.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{it.d}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="t-title">
      <div className="container">
        <SectionHeading eyebrow="Customer stories" title={<span id="t-title">Operators who stopped reconciling spreadsheets.</span>} />
        <ul className="mt-14 grid gap-4 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal as="li" key={t.name} delay={i * 0.06} className="flex flex-col rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-7">
              <Quote className="size-6 text-blue-400/60" aria-hidden />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-200">“{t.quote}”</blockquote>
              <p className="mt-6 inline-flex w-fit rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">{t.metric}</p>
              <div className="mt-5 border-t border-white/[0.06] pt-5">
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-sm text-slate-400">{t.title}, {t.company}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
