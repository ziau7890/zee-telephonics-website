"use client";
import * as React from "react";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

export function DialogContent({ className, children, side, ...props }: React.ComponentPropsWithoutRef<typeof D.Content> & { side?: "center" | "right" }) {
  const isSheet = side === "right";
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] data-[state=open]:animate-[fade-up_.2s_ease]" />
      <D.Content
        className={cn(
          "fixed z-50 border bg-popover text-popover-foreground shadow-elevated focus:outline-none",
          isSheet
            ? "inset-y-0 right-0 h-full w-full max-w-lg overflow-y-auto border-l p-6 data-[state=open]:animate-[slide-in_.25s_cubic-bezier(.2,.7,.2,1)]"
            : "left-1/2 top-1/2 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl p-6 data-[state=open]:animate-[dialog-in_.2s_cubic-bezier(.2,.7,.2,1)]",
          className
        )}
        {...props}
      >
        {children}
        <D.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label="Close">
          <X className="size-4" />
        </D.Close>
      </D.Content>
    </D.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-5 flex flex-col gap-1.5 pr-8", className)} {...props} />;
}
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}
export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<typeof D.Title>>(({ className, ...props }, ref) => (
  <D.Title ref={ref} className={cn("text-lg font-semibold tracking-tight", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";
export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<typeof D.Description>>(({ className, ...props }, ref) => (
  <D.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";
