import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { site } from "@/lib/site";

const cols = [
  { title: "Platform", links: [["Team management", "/features#team"], ["Attendance & time", "/features#attendance"], ["Leads & CRM", "/features#crm"], ["Payroll", "/features#payroll"], ["Invoicing", "/features#invoicing"], ["Reporting", "/features#reports"]] },
  { title: "Solutions", links: [["For operations leaders", "/solutions#operations"], ["For finance teams", "/solutions#finance"], ["For sales teams", "/solutions#sales"], ["Industries", "/industries"], ["Pricing", "/pricing"]] },
  { title: "Company", links: [["About us", "/about"], ["Resources", "/resources"], ["Contact", "/contact"], ["Book a demo", "/demo"]] },
  { title: "Product", links: [["Live dashboard", "/app"], ["Security", "/#security"], ["Integrations", "/#integrations"], ["Log in", "/login"], ["Sign up", "/signup"]] },
];

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#050b16]">
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo className="text-white" />
            <p className="mt-5 text-sm leading-relaxed text-slate-400">
              The operating platform for BPO companies. People, clients, pipeline and money, run from one system.
            </p>
            <p className="mt-6 text-sm text-slate-400">
              <a className="hover:text-white" href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{c.title}</h2>
                <ul className="mt-4 space-y-3">
                  {c.links.map(([label, href]) => (
                    <li key={label}><Link href={href} className="text-sm text-slate-300 transition-colors hover:text-white">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.06] pt-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Zee Telephonics BPO. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about#privacy" className="hover:text-slate-300">Privacy</Link>
            <Link href="/about#terms" className="hover:text-slate-300">Terms</Link>
            <span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-400" aria-hidden /> All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
