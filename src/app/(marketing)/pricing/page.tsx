import type { Metadata } from "next";
import { PageHero, SectionHeading } from "@/components/marketing/primitives";
import { PricingCards, ComparisonTable } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { FinalCTA } from "@/components/marketing/cta";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple per-seat pricing for BPO teams. Starter, Growth and Enterprise plans with a 14-day free trial. Save 20% with yearly billing.",
};

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow="Pricing" title="Pay per seat. Scale without surprises." description="Every plan includes unlimited admins, onboarding support and data import. Only active seats are billed." />
      <section className="container -mt-4 pb-24"><PricingCards /></section>
      <section className="container pb-24" aria-labelledby="compare">
        <SectionHeading title={<span id="compare">Compare plans</span>} description="Everything included in each plan, side by side." />
        <div className="mt-12"><ComparisonTable /></div>
      </section>
      <section className="container pb-8" aria-labelledby="faq">
        <SectionHeading title={<span id="faq">Frequently asked questions</span>} />
        <div className="mt-12"><FAQ /></div>
      </section>
      <FinalCTA title="Not sure which plan fits?" description="Tell us your seat count, sites and clients. We'll recommend a plan and show you the workspace with your structure loaded." />
    </>
  );
}
