import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/primitives";
import { FinalCTA } from "@/components/marketing/cta";
import { ResourceList } from "./resource-list";

export const metadata: Metadata = {
  title: "Resources",
  description: "Guides and playbooks for BPO operators: seat costing, SLAs, payroll, pricing, QA and client health.",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero eyebrow="Resources" title="Playbooks for running a better BPO." description="Practical guides from operators, finance leads and client success managers. No fluff, just the models we use." />
      <section className="container pb-12"><ResourceList /></section>
      <FinalCTA />
    </>
  );
}
