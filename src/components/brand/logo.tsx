import { cn } from "@/lib/utils";
import { useId } from "react";

/**
 * Zee Telephonics mark: a "Z" signal path routed through a central operations hub,
 * enclosed by an open flow ring. Reads as a call path, a workflow and a network at once.
 * Variants: "color" (gradient tile), "mono" (currentColor, for white/black placements).
 */
export function LogoMark({ size = 32, variant = "color", className, title }: { size?: number; variant?: "color" | "mono"; className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  const mono = variant === "mono";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={cn("shrink-0", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset=".55" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <radialGradient id={`h-${id}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(10 6) rotate(50) scale(30)">
          <stop stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {mono ? (
        <rect x=".75" y=".75" width="30.5" height="30.5" rx="8.25" stroke="currentColor" strokeWidth="1.5" />
      ) : (
        <>
          <rect width="32" height="32" rx="9" fill={`url(#g-${id})`} />
          <rect width="32" height="32" rx="9" fill={`url(#h-${id})`} />
        </>
      )}
      <path d="M24.5 11.2A10 10 0 1 0 24.5 20.8" stroke={mono ? "currentColor" : "#fff"} strokeOpacity=".38" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.5 10.8h11L10.5 21.2h11" stroke={mono ? "currentColor" : "#fff"} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="2.6" fill={mono ? "currentColor" : "#fff"} />
      <circle cx="16" cy="16" r="1.1" fill={mono ? "transparent" : "#2563EB"} />
      <circle cx="10.5" cy="10.8" r="1.7" fill={mono ? "currentColor" : "#fff"} />
      <circle cx="21.5" cy="21.2" r="1.7" fill={mono ? "currentColor" : "#fff"} />
    </svg>
  );
}

export function Logo({ className, size = 30, variant = "color", compact }: { className?: string; size?: number; variant?: "color" | "mono"; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} variant={variant} />
      {!compact && (
        <span className="flex items-baseline gap-1.5 leading-none">
          <span className="text-[16px] font-semibold tracking-[-0.02em]">Zee Telephonics</span>
          <span className="rounded-[4px] border border-current/20 px-1 py-[1px] text-[9.5px] font-semibold tracking-[0.14em] opacity-70">BPO</span>
        </span>
      )}
    </span>
  );
}
