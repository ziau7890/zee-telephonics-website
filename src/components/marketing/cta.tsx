import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "./primitives";

export function FinalCTA({ title = "See your operation on one screen.", description = "Book a 30-minute walkthrough. We'll load your departments, a few clients and last month's payroll so you see your own numbers, not a sales deck." }: { title?: string; description?: string }) {
  return (
    <section className="container py-24 sm:py-32">
      <Reveal className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(120%_120%_at_0%_0%,#1d4ed8_0%,#0b1a33_45%,#081426_100%)] px-6 py-16 text-center sm:px-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-radial" aria-hidden />
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h2>
          <p className="mt-5 text-base leading-relaxed text-blue-100/80 sm:text-lg">{description}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/demo" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-blue-50" })}>
              <CalendarCheck /> Book a Demo
            </Link>
            <Link href="/app" className={buttonVariants({ variant: "glass", size: "lg" })}>
              Open the live dashboard <ArrowRight />
            </Link>
          </div>
          <p className="mt-6 text-xs text-blue-100/60">14-day trial · No credit card · Import from spreadsheets in minutes</p>
        </div>
      </Reveal>
    </section>
  );
}
