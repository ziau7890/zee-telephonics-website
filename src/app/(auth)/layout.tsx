import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { TrendingUp, ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark grid min-h-dvh bg-[#081426] text-slate-100 [color-scheme:dark] lg:grid-cols-[1fr_1.05fr]">
      <main id="main" className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="w-fit text-white" aria-label="Zee Telephonics BPO home"><Logo /></Link>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">{children}</div>
        <p className="text-center text-xs text-slate-500">© {new Date().getFullYear()} Zee Telephonics BPO · <Link href="/about#privacy" className="hover:text-slate-300">Privacy</Link> · <Link href="/about#terms" className="hover:text-slate-300">Terms</Link></p>
      </main>
      <aside className="relative hidden overflow-hidden border-l border-white/[0.06] bg-[radial-gradient(120%_100%_at_100%_0%,#1d4ed8_0%,#0b1a33_45%,#060e1c_100%)] lg:flex lg:flex-col lg:justify-between lg:p-14" aria-label="Product highlights">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-radial" aria-hidden />
        <div className="relative">
          <p className="text-sm font-medium text-blue-200">Zee Telephonics BPO</p>
          <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">The operating system for high-performing BPO teams.</h2>
        </div>
        <div className="relative grid max-w-md gap-4">
          <div className="glass rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between text-sm text-slate-300">Monthly revenue <span className="inline-flex items-center gap-1 text-emerald-300"><TrendingUp className="size-3.5" />8.2%</span></div>
            <p className="mt-2 text-3xl font-semibold tabular text-white">$184,620</p>
            <div className="mt-4 flex h-14 items-end gap-1.5">{[42, 48, 46, 55, 60, 58, 66, 70, 68, 76, 82, 90].map((h, i) => <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-blue-500/40 to-cyan-300/90" style={{ height: `${h}%` }} />)}</div>
          </div>
          <div className="glass flex items-center gap-3 rounded-2xl border border-white/10 p-4 text-sm text-slate-300"><ShieldCheck className="size-5 text-cyan-300" /> SSO, role-based access and full audit logs</div>
        </div>
      </aside>
    </div>
  );
}
