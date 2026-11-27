import type { Metadata } from "next";
import Link from "next/link";
import { Headset, MessagesSquare, UserRound, Target, FileStack, Cpu, Globe2, Building2, Check, ArrowRight } from "lucide-react";
import { PageHero, Reveal } from "@/components/marketing/primitives";
import { FinalCTA } from "@/components/marketing/cta";
import { industries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Industries",
  description: "Zee Telephonics BPO for call centers, customer support, virtual assistant agencies, lead generation, back-office and IT-enabled service providers.",
};

const icons = { Headset, MessagesSquare, UserRound, Target, FileStack, Cpu, Globe2, Building2 } as const;

export default function IndustriesPage() {
  return (
    <>
      <PageHero eyebrow="Industries" title="Made for every kind of outsourcing business." description="Whether you sell seats, hours or outcomes, the platform adapts to how you staff, bill and report." />
      <section className="container pb-16">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((ind, i) => {
            const Icon = icons[ind.icon as keyof typeof icons];
            return (
              <Reveal as="li" key={ind.slug} delay={(i % 4) * 0.05} className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500/25 to-cyan-400/10 text-cyan-300"><Icon className="size-5" /></span>
                <h2 className="mt-5 font-semibold text-white">{ind.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{ind.description}</p>
                <ul className="mt-5 flex-1 space-y-2">
                  {ind.needs.map((n) => <li key={n} className="flex gap-2 text-[13px] text-slate-300"><Check className="mt-0.5 size-3.5 text-cyan-400" aria-hidden />{n}</li>)}
                </ul>
                <p className="mt-6 border-t border-white/[0.06] pt-4 text-xs font-medium text-emerald-300">{ind.stats}</p>
              </Reveal>
            );
          })}
        </ul>
        <div className="mt-12 text-center">
          <Link href="/demo" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-300 hover:underline">Don&apos;t see your model? Tell us how you operate <ArrowRight className="size-4" /></Link>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}
