import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";

/** Public site is always rendered in the dark brand theme. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-dvh overflow-x-clip bg-[#081426] text-slate-100 [color-scheme:dark]">
      <MarketingHeader />
      <main id="main">{children}</main>
      <MarketingFooter />
    </div>
  );
}
