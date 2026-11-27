"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { marketingNav } from "@/lib/site";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled || open ? "border-b border-white/[0.06] bg-[#060e1c]/80 backdrop-blur-xl" : "border-b border-transparent")}>
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href="/" className="rounded-md text-white" aria-label="Zee Telephonics BPO home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {marketingNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                className={cn("rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:text-white", active && "text-white")}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-slate-300 hover:bg-white/5 hover:text-white")}>Log in</Link>
          <Link href="/demo" className={buttonVariants({ variant: "brand", size: "sm" })}>Book a Demo</Link>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav id="mobile-nav" aria-label="Mobile" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "calc(100dvh - 64px)" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }} className="overflow-y-auto border-t border-white/[0.06] lg:hidden">
            <div className="container flex flex-col gap-1 py-6">
              {marketingNav.map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-lg px-3 py-3.5 text-lg font-medium text-slate-200 hover:bg-white/5">
                  {item.label}
                  <ArrowRight className="size-4 text-slate-500" />
                </Link>
              ))}
              <div className="mt-6 grid gap-3">
                <Link href="/demo" className={buttonVariants({ variant: "brand", size: "lg" })}>Book a Demo</Link>
                <Link href="/login" className={cn(buttonVariants({ variant: "glass", size: "lg" }))}>Log in</Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
