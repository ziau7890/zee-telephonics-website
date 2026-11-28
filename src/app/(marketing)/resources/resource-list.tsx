"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { posts } from "@/lib/content";
import { cn, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/misc";

const gradients = ["from-blue-600/40 via-cyan-500/20", "from-violet-600/40 via-blue-500/20", "from-emerald-600/40 via-teal-500/20", "from-amber-500/40 via-orange-500/10", "from-sky-600/40 via-indigo-500/20", "from-pink-600/30 via-violet-500/20"];

export function ResourceList() {
  const cats = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const list = useMemo(() => posts.filter((p) => (cat === "All" || p.category === cat) && (p.title + p.excerpt).toLowerCase().includes(q.toLowerCase())), [cat, q]);
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
          {cats.map((c) => (
            <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors", cat === c ? "border-white bg-white text-slate-900" : "border-white/10 text-slate-300 hover:border-white/25")}>{c}</button>
          ))}
        </div>
        <label className="relative block sm:w-64">
          <span className="sr-only">Search articles</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles" className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none" />
        </label>
      </div>
      {list.length === 0 ? (
        <EmptyState className="mt-10 border-white/10" icon={Search} title="No articles match that search" description="Try a different keyword or clear the category filter." action={<button type="button" className="text-sm font-medium text-blue-300" onClick={() => { setQ(""); setCat("All"); }}>Clear filters</button>} />
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <li key={p.slug}>
              <Link href={`/resources/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] transition-colors hover:border-white/15">
                <div className={cn("relative h-40 bg-gradient-to-br to-transparent", gradients[posts.indexOf(p) % gradients.length])}>
                  <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
                  <span className="absolute left-5 top-5 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">{p.category}</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-semibold leading-snug text-white group-hover:text-blue-200">{p.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{p.excerpt}</p>
                  <div className="mt-5 flex items-center justify-between text-xs text-slate-500"><span>{formatDate(p.date)} · {p.read}</span><ArrowUpRight className="size-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
