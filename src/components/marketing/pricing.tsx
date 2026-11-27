"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, Minus, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { comparison, plans } from "@/lib/content";
import { cn } from "@/lib/utils";

export function BillingToggle({ yearly, onChange }: { yearly: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1" role="radiogroup" aria-label="Billing period">
      {[false, true].map((y) => (
        <button key={String(y)} type="button" role="radio" aria-checked={yearly === y} onClick={() => onChange(y)}
          className={cn("inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors", yearly === y ? "bg-white text-slate-900" : "text-slate-300 hover:text-white")}>
          {y ? "Yearly" : "Monthly"}
          {y && <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", yearly ? "bg-emerald-600 text-white" : "bg-emerald-500/15 text-emerald-300")}>Save 20%</span>}
        </button>
      ))}
    </div>
  );
}

export function PricingCards({ compact }: { compact?: boolean }) {
  const [yearly, setYearly] = useState(true);
  return (
    <div>
      <div className="flex justify-center"><BillingToggle yearly={yearly} onChange={setYearly} /></div>
      <ul className="mx-auto mt-10 grid max-w-6xl gap-4 lg:grid-cols-3">
        {plans.map((p) => {
          const price = p.monthly == null ? null : yearly ? +(p.monthly * 0.8).toFixed(2) : p.monthly;
          return (
            <li key={p.id} className={cn("relative flex flex-col rounded-2xl border p-7", p.popular ? "border-blue-400/40 bg-[linear-gradient(180deg,rgba(59,130,246,0.14),rgba(59,130,246,0.02))] shadow-glow" : "border-white/[0.08] bg-white/[0.02]")}>
              {p.popular && <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-1 text-[11px] font-semibold text-white"><Sparkles className="size-3" /> Most popular</span>}
              <h3 className="text-lg font-semibold text-white">{p.name}</h3>
              <p className="mt-2 min-h-[40px] text-sm text-slate-400">{p.description}</p>
              <div className="mt-6 flex items-baseline gap-1.5">
                {price == null ? <span className="text-4xl font-semibold tracking-tight text-white">Custom</span> : (<><span className="text-4xl font-semibold tabular tracking-tight text-white">${price}</span><span className="text-sm text-slate-400">{p.unit}</span></>)}
              </div>
              <p className="mt-1 h-5 text-xs text-slate-500">{price == null ? "Volume pricing for 500+ seats" : yearly ? `Billed annually · $${p.monthly}/seat if billed monthly` : "Billed monthly · switch to yearly to save 20%"}</p>
              <Link href={p.id === "enterprise" ? "/demo?plan=enterprise" : `/signup?plan=${p.id}`} className={cn(buttonVariants({ variant: p.popular ? "brand" : "glass", size: "lg" }), "mt-6 w-full")}>{p.cta}</Link>
              <ul className="mt-7 space-y-3 border-t border-white/[0.06] pt-6">
                {(compact ? p.features.slice(0, 5) : p.features).map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-slate-300"><Check className="mt-0.5 size-4 shrink-0 text-cyan-400" aria-hidden />{f}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ComparisonTable() {
  return (
    <div className="relative mx-auto max-w-5xl overflow-x-auto rounded-2xl border border-white/[0.08] scrollbar-thin">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Feature comparison across Starter, Growth and Enterprise plans</caption>
        <thead className="bg-[#0b1a33]">
          <tr>
            <th scope="col" className="w-[40%] px-5 py-4 font-medium text-slate-400">Features</th>
            {plans.map((p) => <th key={p.id} scope="col" className="px-5 py-4 font-semibold text-white">{p.name}</th>)}
          </tr>
        </thead>
        {comparison.map((g) => (
          <tbody key={g.group}>
            <tr><th colSpan={4} scope="colgroup" className="bg-white/[0.025] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{g.group}</th></tr>
            {g.rows.map((r) => (
              <tr key={r.label} className="border-t border-white/[0.05]">
                <th scope="row" className="px-5 py-3.5 font-normal text-slate-300">{r.label}</th>
                {r.values.map((v, i) => (
                  <td key={i} className="px-5 py-3.5 text-slate-200">
                    {v === true ? <><Check className="size-4 text-cyan-400" aria-hidden /><span className="sr-only">Included</span></> : v === false ? <><Minus className="size-4 text-slate-600" aria-hidden /><span className="sr-only">Not included</span></> : <span className="text-[13px]">{v}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
