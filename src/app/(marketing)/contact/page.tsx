import type { Metadata } from "next";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/marketing/forms";
import { PageHero } from "@/components/marketing/primitives";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to the Zee Telephonics BPO team about sales, support, partnerships or billing.",
};

export default function ContactPage() {
  const channels = [
    { icon: Mail, title: "Sales", body: site.sales, href: `mailto:${site.sales}` },
    { icon: MessageCircle, title: "Customer support", body: "In-app chat, 24/5 coverage", href: "/app" },
    { icon: Phone, title: "Phone", body: "+92 21 3456 7890", href: "tel:+922134567890" },
    { icon: MapPin, title: "Headquarters", body: "Shahrah-e-Faisal, Karachi, Pakistan" },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to a person who knows BPO." description="Questions about pricing, migration or security? Our team replies within four business hours." />
      <section className="container grid gap-10 pb-24 lg:grid-cols-[1fr_1.4fr]">
        <ul className="grid content-start gap-3">
          {channels.map((c) => (
            <li key={c.title} className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <c.icon className="mt-0.5 size-5 text-cyan-300" aria-hidden />
              <div><p className="font-medium text-white">{c.title}</p>{c.href ? <a href={c.href} className="text-sm text-slate-400 hover:text-white">{c.body}</a> : <p className="text-sm text-slate-400">{c.body}</p>}</div>
            </li>
          ))}
        </ul>
        <div className="rounded-3xl border border-white/10 bg-[#0b1a33]/80 p-6 sm:p-10"><ContactForm /></div>
      </section>
    </>
  );
}
