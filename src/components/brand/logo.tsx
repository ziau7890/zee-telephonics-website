import { cn } from "@/lib/utils";
import { useId } from "react";

/**
 * Zee Telephonics mark: "ZT" initials in a dark filled circle, framed by a thin
 * outer ring with top and bottom ticks and a cyan accent dot on the lower right.
 * Variants: "color" (navy disc, blue ring) and "mono" (currentColor outline, for single-colour placements).
 */
export function LogoMark({ size = 32, variant = "color", className, title }: { size?: number; variant?: "color" | "mono"; className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  const mono = variant === "mono";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={cn("shrink-0", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`d-${id}`} x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#13306B" />
          <stop offset="1" stopColor="#071428" />
        </linearGradient>
      </defs>
      {/* outer ring with top and bottom ticks */}
      <circle cx="16" cy="16" r="14.6" stroke={mono ? "currentColor" : "#3B82F6"} strokeWidth="1.2" />
      <path d="M16 0.4v3M16 28.6v3" stroke={mono ? "currentColor" : "#3B82F6"} strokeWidth="1.2" strokeLinecap="round" />
      {/* disc */}
      {mono ? (
        <circle cx="16" cy="16" r="11.6" stroke="currentColor" strokeWidth="1.6" />
      ) : (
        <circle cx="16" cy="16" r="12.2" fill={`url(#d-${id})`} />
      )}
      <text x="16" y="16" dy="0.36em" textAnchor="middle" fontFamily="var(--font-geist-sans), Inter, 'Segoe UI', Arial, sans-serif" fontSize="11.4" fontWeight="700" letterSpacing="-0.4" fill={mono ? "currentColor" : "#fff"}>ZT</text>
      {/* accent dot on the ring */}
      <circle cx="26.3" cy="26.3" r="2.3" fill="#22D3EE" stroke={mono ? "none" : "#071428"} strokeWidth="0.9" />
    </svg>
  );
}

export function Logo({ className, size = 30, variant = "color", compact }: { className?: string; size?: number; variant?: "color" | "mono"; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} variant={variant} />
      {!compact && <span className="text-[16.5px] font-bold leading-none tracking-[-0.02em]">Zee Telephonics</span>}
    </span>
  );
}
