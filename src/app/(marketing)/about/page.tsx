import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { PageHero, Reveal, SectionHeading } from "@/components/marketing/primitives";
import { FinalCTA } from "@/components/marketing/cta";
import { Avatar } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "About us",
  description: "Zee Telephonics BPO was built by people who ran outsourcing floors. Learn about our mission, values and team.",
};

const values = [
  ["Operators first", "Every workflow is designed with the people who run shifts, close payroll and answer to clients."],
  ["Clarity over complexity", "One number, one definition, one place. If a metric needs a meeting to explain, we redesign it."],
  ["Trust is earned in detail", "Salaries and client rates are sensitive. Permissions, audit trails and encryption are defaults, not add-ons."],
  ["Built to grow with you", "From a 20-seat startup floor to a multi-site enterprise, the platform should never be the bottleneck."],
];

const leadership = [
  ["Zia Ullah", "Founder & CEO", "Spent a decade running voice and back-office operations before building the platform he wished he'd had."],
  ["Sarah Ahmed", "Head of Operations", "Scaled support floors from 30 to 400 agents across three sites."],
  ["Daniel Lee", "Head of Finance Product", "Former BPO controller who has closed more payrolls than he can count."],
  ["Emily Johnson", "Head of Client Success", "Leads onboarding for clients across the US, UK and Middle East."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="Company" title="We ran BPO floors. Then we built the system we needed." description="Zee Telephonics BPO started inside an outsourcing operation that outgrew its spreadsheets. Today it helps operators run people, clients and finances from one place." />
      <section className="container pb-20">
        <dl className="grid gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.015] p-8 sm:grid-cols-4">
          {[["2016", "Operating since"], ["3", "Delivery sites"], ["248", "Team members"], ["36", "Active client programs"]].map(([v, l]) => (
            <div key={l} className="text-center"><dd className="text-3xl font-semibold tabular text-white sm:text-4xl">{v}</dd><dt className="mt-1 text-sm text-slate-400">{l}</dt></div>
          ))}
        </dl>
      </section>
      <section className="container grid gap-12 pb-24 lg:grid-cols-2">
        <SectionHeading align="left" eyebrow="Our mission" title="Turn BPO complexity into operational clarity." description="Outsourcing companies juggle hundreds of people, dozens of clients and thin margins. Our job is to make every staffing, billing and payroll decision obvious, fast and correct." />
        <ul className="grid gap-4 sm:grid-cols-2">
          {values.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.05} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <h3 className="font-semibold text-white">{t}</h3><p className="mt-2 text-sm leading-relaxed text-slate-400">{d}</p>
            </Reveal>
          ))}
        </ul>
      </section>
      <section className="container pb-24" aria-labelledby="team-h">
        <SectionHeading title={<span id="team-h">Leadership</span>} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {leadership.map(([n, r, b]) => (
            <li key={n} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <Avatar name={n} size={56} className="ring-[#081426]" />
              <h3 className="mt-5 font-semibold text-white">{n}</h3><p className="text-sm text-blue-300">{r}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{b}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="container pb-12" aria-labelledby="loc-h">
        <SectionHeading title={<span id="loc-h">Where we work</span>} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-3">
          {[["Karachi", "Headquarters · Shahrah-e-Faisal"], ["Lahore", "Delivery center · Gulberg III"], ["Manila", "APAC site · Makati City"]].map(([c, d]) => (
            <li key={c} className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"><MapPin className="mt-0.5 size-5 text-cyan-300" aria-hidden /><div><p className="font-medium text-white">{c}</p><p className="text-sm text-slate-400">{d}</p></div></li>
          ))}
        </ul>
      </section>
      <section className="container grid gap-4 pb-8 sm:grid-cols-2">
        <div id="privacy" className="scroll-mt-24 rounded-2xl border border-white/[0.07] p-6"><h2 className="font-semibold text-white">Privacy</h2><p className="mt-2 text-sm leading-relaxed text-slate-400">We collect only the data needed to operate your workspace, never sell it, and process it under your instructions. A full privacy policy is available on request from our team.</p></div>
        <div id="terms" className="scroll-mt-24 rounded-2xl border border-white/[0.07] p-6"><h2 className="font-semibold text-white">Terms</h2><p className="mt-2 text-sm leading-relaxed text-slate-400">Subscriptions are billed per active seat, monthly or annually. Enterprise agreements, data processing terms and SLAs are provided during procurement.</p></div>
      </section>
      <FinalCTA />
    </>
  );
}
