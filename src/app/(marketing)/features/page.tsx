import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { PageHero, Reveal } from "@/components/marketing/primitives";
import { FinalCTA } from "@/components/marketing/cta";
import { moduleIcons } from "@/components/marketing/module-icons";
import { ClientPreview, CRMPreview, DashboardPreview, PayrollPreview, TeamPreview, WorkforcePreview, FinancePreview } from "@/components/marketing/previews";
import { buttonVariants } from "@/components/ui/button";
import { modules } from "@/lib/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Platform features",
  description: "Team management, attendance, CRM, client management, payroll, accounting, invoicing and reporting, built for BPO operations.",
};

const visuals: Record<string, React.ReactNode> = {
  team: <TeamPreview />,
  attendance: <WorkforcePreview />,
  crm: <CRMPreview />,
  clients: <ClientPreview />,
  payroll: <PayrollPreview />,
  finance: <FinancePreview />,
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero eyebrow="Platform" title="Every part of a BPO, connected." description="Nine modules that share one data model: people, time, pipeline, clients and money. Use the ones you need today and switch on the rest as you grow.">
        <nav aria-label="Modules" className="mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
          {modules.map((m) => (
            <a key={m.key} href={`#${m.key}`} className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-sm text-slate-300 transition-colors hover:border-white/20 hover:text-white">{m.name}</a>
          ))}
        </nav>
      </PageHero>
      <div className="container space-y-6 pb-12">
        {modules.map((m, i) => {
          const Icon = moduleIcons[m.key];
          const visual = visuals[m.key];
          return (
            <section key={m.key} id={m.key} className="scroll-mt-24 rounded-3xl border border-white/[0.07] bg-white/[0.015] p-6 sm:p-10" aria-labelledby={`${m.key}-h`}>
              <div className={cn("grid items-center gap-10", visual && "lg:grid-cols-2")}>
                <Reveal className={cn(i % 2 === 1 && visual && "lg:order-2")}>
                  <span className="grid size-11 place-items-center rounded-xl border border-white/10" style={{ background: `${m.color}1f`, color: m.color }}><Icon className="size-5" /></span>
                  <p className="mt-5 text-sm font-medium" style={{ color: m.color }}>{m.name}</p>
                  <h2 id={`${m.key}-h`} className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{m.tagline}</h2>
                  <p className="mt-4 max-w-xl leading-relaxed text-slate-400">{m.description}</p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {m.points.map((p) => <li key={p} className="flex gap-2.5 text-sm text-slate-300"><Check className="mt-0.5 size-4 shrink-0 text-cyan-400" aria-hidden />{p}</li>)}
                  </ul>
                  <Link href="/app" className={cn(buttonVariants({ variant: "link" }), "mt-6 text-blue-300")}>See it in the live dashboard <ArrowRight /></Link>
                </Reveal>
                {visual && <Reveal delay={0.08} className={cn(i % 2 === 1 && "lg:order-1")}>{visual}</Reveal>}
              </div>
            </section>
          );
        })}
      </div>
      <section className="container py-16"><Reveal><DashboardPreview /></Reveal></section>
      <FinalCTA />
    </>
  );
}
