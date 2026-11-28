"use client";
import * as React from "react";
import * as T from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = T.Root;
export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof T.List>) {
  return <T.List className={cn("inline-flex max-w-full items-center gap-1 relative overflow-x-auto rounded-lg border bg-muted/60 p-1 no-scrollbar", className)} {...props} />;
}
export function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof T.Trigger>) {
  return (
    <T.Trigger
      className={cn(
        "inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md px-3 text-[13px] font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm [&_svg]:size-3.5",
        className
      )}
      {...props}
    />
  );
}
export function TabsContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof T.Content>) {
  return <T.Content className={cn("mt-6 focus-visible:outline-none", className)} {...props} />;
}
