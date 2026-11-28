"use client";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Reveal({ children, delay = 0, className, as = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section" }) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </Comp>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.08] px-3 py-1 text-xs font-medium text-blue-200", className)}>
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, description, align = "center", className }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; align?: "center" | "left"; className?: string }) {
  return (
    <Reveal className={cn("flex flex-col gap-4", align === "center" ? "mx-auto max-w-2xl items-center text-center" : "max-w-xl items-start", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[44px] lg:leading-[1.1]">{title}</h2>
      {description && <p className="text-base leading-relaxed text-slate-400 sm:text-lg">{description}</p>}
    </Reveal>
  );
}

export function PageHero({ eyebrow, title, description, children }: { eyebrow: string; title: React.ReactNode; description: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden pb-16 pt-36 sm:pb-20 sm:pt-44">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-60" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" aria-hidden />
      <div className="container relative flex flex-col items-center text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.05]">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">{description}</p>
        {children}
      </div>
    </section>
  );
}
