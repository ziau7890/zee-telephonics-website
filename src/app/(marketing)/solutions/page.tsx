import type { Metadata } from "next";
import { ArrowRight, Briefcase, Calculator, LineChart, HeartHandshake, UsersRound } from "lucide-react";
import { PageHero, Reveal, SectionHeading } from "@/components/marketing/primitives";
import { FinalCTA } from "@/components/marketing/cta";
import { Ecosystem } from "@/components/three";

export const metadata: Metadata = {
  title: "Solutions by team",
  description: "How operations, finance, sales, HR and client success teams use Zee Telephonics BPO to run outsourced operations.",
};

const solutions = [
  { id: "operations", icon: Briefcase, role: "Operations leaders", problem: "Staffing decisions are made from yesterday's spreadsheet while SLAs slip today.", outcome: "Live presence by client and shift, SLA risk alerts and one-click roster changes.", metrics: [["-9%", "overtime cost"], ["+4 pts", "SLA attainment"]] },
  { id: "finance", icon: Calculator, role: "Finance teams", problem: "Payroll takes three days of reconciling attendance exports, and nobody knows margin per client.", outcome: "Approved hours flow into payroll and invoices automatically, with P&L by client every month.", metrics: [["4 hrs", "payroll close"], ["100%", "billable hours invoiced"]] },
  { id: "sales", icon: LineChart, role: "Sales and business development", problem: "Deals live in inboxes and the handoff to operations loses the details clients care about.", outcome: "A seat-based pipeline with scoring, reminders and an automatic handoff that creates the client and project.", metrics: [["28%", "lead conversion"], ["2 days", "faster go-live"]] },
  { id: "hr", icon: UsersRound, role: "HR and people ops", problem: "Onboarding 30 agents for a new campaign means chasing documents across WhatsApp and email.", outcome: "Onboarding checklists, document collection, leave balances and offboarding in one flow.", metrics: [["60%", "less onboarding admin"], ["1 place", "for every document"]] },
  { id: "client-success", icon: HeartHandshake, role: "Client success", problem: "Account reviews are built by hand and at-risk clients are spotted only after they complain.", outcome: "Health scores from SLA, CSAT and payment behavior, with QBR-ready reports and a client portal.", metrics: [["+11 pts", "retention"], ["15 min", "to build a QBR"]] },
];

export default function SolutionsPage() {
  return (
    <>
      <PageHero eyebrow="Solutions" title="One platform, built around the people who run a BPO." description="Each team gets the views and workflows they need, working from the same live data instead of their own copy of it." />
      <section className="container pb-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <Ecosystem className="h-[320px] sm:h-[420px]" />
          <SectionHeading align="left" eyebrow="How it fits together" title="Shared data, role-specific workspaces." description="Agents see their shifts and payslips. Team leads see adherence and approvals. Finance sees payroll and receivables. Owners see all of it, by client and by site." />
        </div>
      </section>
      <section className="container space-y-4 py-16">
        {solutions.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.03}>
            <article id={s.id} className="grid scroll-mt-24 gap-8 rounded-3xl border border-white/[0.07] bg-white/[0.015] p-6 sm:p-10 lg:grid-cols-[1.1fr_1.4fr_1fr]">
              <div>
                <span className="grid size-11 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300"><s.icon className="size-5" /></span>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">{s.role}</h2>
              </div>
              <div className="space-y-5">
                <div><p className="text-xs font-semibold uppercase tracking-wider text-rose-300/80">The problem</p><p className="mt-2 leading-relaxed text-slate-300">{s.problem}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">With Zee Telephonics</p><p className="mt-2 flex gap-2 leading-relaxed text-slate-300"><ArrowRight className="mt-1 size-4 shrink-0 text-emerald-300" aria-hidden />{s.outcome}</p></div>
              </div>
              <dl className="grid grid-cols-2 gap-3 self-start">
                {s.metrics.map(([v, l]) => (
                  <div key={l} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"><dd className="text-2xl font-semibold tabular text-white">{v}</dd><dt className="mt-1 text-xs text-slate-400">{l}</dt></div>
                ))}
              </dl>
            </article>
          </Reveal>
        ))}
        <p className="pt-2 text-center text-xs text-slate-500">Outcomes reported by customers after 90 days. Your results will depend on your starting point.</p>
      </section>
      <FinalCTA />
    </>
  );
}
