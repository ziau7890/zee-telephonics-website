import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap", {
  variants: {
    variant: {
      default: "border-transparent bg-primary/10 text-primary dark:bg-primary/15 dark:text-blue-300",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
      outline: "text-muted-foreground",
      success: "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      warning: "border-transparent bg-amber-500/12 text-amber-700 dark:text-amber-300",
      danger: "border-transparent bg-rose-500/10 text-rose-700 dark:text-rose-300",
      info: "border-transparent bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
      violet: "border-transparent bg-violet-500/10 text-violet-700 dark:text-violet-300",
    },
  },
  defaultVariants: { variant: "default" },
});

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export function Badge({ className, variant, dot, children, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants> & { dot?: boolean }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
