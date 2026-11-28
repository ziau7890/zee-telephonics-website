import { Plus } from "lucide-react";
import { faqs } from "@/lib/content";

export function FAQ({ items = faqs }: { items?: { q: string; a: string }[] }) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/[0.07] rounded-2xl border border-white/[0.07] bg-white/[0.015]">
      {items.map((f) => (
        <details key={f.q} className="group px-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-medium text-white">
            {f.q}
            <Plus className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-45" aria-hidden />
          </summary>
          <p className="-mt-1 pb-5 text-sm leading-relaxed text-slate-400">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
