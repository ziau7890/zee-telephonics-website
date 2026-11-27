import type { Metadata } from "next";
import { CheckCircle2, Clock, ShieldCheck, Users } from "lucide-react";
import { DemoForm } from "@/components/marketing/forms";
import { Eyebrow } from "@/components/marketing/primitives";

export const metadata: Metadata = {
  title: "Book a demo",
  description: "See Zee Telephonics BPO with your own departments, clients and payroll structure in a 30-minute walkthrough.",
};

export default async function DemoPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-50" aria-hidden />
      <div className="pointer-events-none absolute -left-40 top-20 size-[480px] rounded-full bg-blue-600/20 blur-[140px]" aria-hidden />
      <div className="container relative grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div>
          <Eyebrow>Request a demo</Eyebrow>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">See your operation running in 30 minutes.</h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">Tell us a little about your team. We&apos;ll tailor the walkthrough to your sites, clients and payroll setup, not a generic script.</p>
          <ul className="mt-10 space-y-6">
            {[
              [Clock, "30 minutes, your timezone", "Live session with a solutions specialist who has run BPO operations."],
              [Users, "Your structure, preloaded", "Departments, shifts and a sample client configured before the call."],
              [ShieldCheck, "Security review on request", "Bring your IT lead. We'll cover access control, encryption and audit logs."],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Clock;
              return (
                <li key={t as string} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-cyan-300"><I className="size-5" /></span>
                  <div><p className="font-medium text-white">{t as string}</p><p className="mt-1 text-sm text-slate-400">{d as string}</p></div>
                </li>
              );
            })}
          </ul>
          <figure className="mt-12 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <blockquote className="text-sm leading-relaxed text-slate-300">“The demo used our own shift patterns. By the end of the call our finance lead had already mapped our payroll rules.”</blockquote>
            <figcaption className="mt-4 flex items-center gap-2 text-sm text-slate-400"><CheckCircle2 className="size-4 text-emerald-300" /> Rehan Siddiqui, Meridian Contact Solutions</figcaption>
          </figure>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#0b1a33]/80 p-6 shadow-elevated backdrop-blur sm:p-10">
          <DemoForm plan={plan} />
        </div>
      </div>
    </section>
  );
}
