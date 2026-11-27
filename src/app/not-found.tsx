import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="dark grid min-h-dvh place-items-center bg-[#081426] px-6 text-center text-slate-100">
      <div>
        <Logo className="justify-center text-white" />
        <p className="mt-10 font-mono text-sm text-blue-300">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">This page isn&apos;t on the roster.</h1>
        <p className="mt-4 text-slate-400">The link may be outdated, or the page has moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className={buttonVariants({ variant: "brand" })}>Back to home</Link>
          <Link href="/app" className={buttonVariants({ variant: "glass" })}>Open dashboard</Link>
        </div>
      </div>
    </main>
  );
}
