"use client";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as D from "@radix-ui/react-dialog";
import { useTheme } from "next-themes";
import { Search, Plus, FileText, UserPlus, Moon, Sun, CalendarPlus, Building2, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { flatNav } from "./nav";
import { employees, clients, invoices } from "@/lib/mock/data";
import { Kbd } from "@/components/ui/misc";

const itemCls = "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/90 aria-selected:bg-accent aria-selected:text-accent-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground";
const groupCls = "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const run = (fn: () => void) => { onOpenChange(false); setTimeout(fn, 50); };
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px]" />
        <D.Content className="fixed left-1/2 top-[12vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-elevated" aria-describedby={undefined}>
          <D.Title className="sr-only">Command palette</D.Title>
          <Command label="Command palette" loop>
            <div className="flex items-center gap-3 border-b px-4">
              <Search className="size-4 text-muted-foreground" aria-hidden />
              <Command.Input autoFocus placeholder="Search or type a command…" className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" />
              <Kbd>Esc</Kbd>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
              <Command.Empty className="px-4 py-10 text-center text-sm text-muted-foreground">No results. Try a name, client or invoice number.</Command.Empty>
              <Command.Group heading="Quick actions" className={groupCls}>
                <Command.Item className={itemCls} onSelect={() => run(() => router.push("/app/team?new=1"))}><UserPlus /> Add employee</Command.Item>
                <Command.Item className={itemCls} onSelect={() => run(() => router.push("/app/invoices?new=1"))}><FileText /> Create invoice</Command.Item>
                <Command.Item className={itemCls} onSelect={() => run(() => router.push("/app/leads?new=1"))}><Plus /> New lead</Command.Item>
                <Command.Item className={itemCls} onSelect={() => run(() => router.push("/app/attendance?tab=leave"))}><CalendarPlus /> Review leave requests</Command.Item>
                <Command.Item className={itemCls} onSelect={() => run(() => { setTheme(resolvedTheme === "dark" ? "light" : "dark"); toast.success(`Switched to ${resolvedTheme === "dark" ? "light" : "dark"} mode`); })}>{resolvedTheme === "dark" ? <Sun /> : <Moon />} Toggle {resolvedTheme === "dark" ? "light" : "dark"} mode</Command.Item>
              </Command.Group>
              <Command.Group heading="Go to" className={groupCls}>
                {flatNav.map((n) => (
                  <Command.Item key={n.href} value={`go ${n.label}`} className={itemCls} onSelect={() => run(() => router.push(n.href))}><n.icon /> {n.label}<ArrowRight className="ml-auto opacity-0 group-aria-selected:opacity-100" /></Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="People" className={groupCls}>
                {employees.slice(0, 60).map((e) => (
                  <Command.Item key={e.id} value={`${e.name} ${e.role} ${e.id}`} className={itemCls} onSelect={() => run(() => router.push(`/app/team/${e.id}`))}><User /> <span className="flex-1 truncate">{e.name}</span><span className="text-xs text-muted-foreground">{e.role}</span></Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Clients" className={groupCls}>
                {clients.map((c) => (
                  <Command.Item key={c.id} value={`${c.name} ${c.industry}`} className={itemCls} onSelect={() => run(() => router.push(`/app/clients/${c.id}`))}><Building2 /> <span className="flex-1 truncate">{c.name}</span><span className="text-xs text-muted-foreground">{c.industry}</span></Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Invoices" className={groupCls}>
                {invoices.slice(0, 15).map((i) => (
                  <Command.Item key={i.id} value={`${i.number} ${i.client}`} className={itemCls} onSelect={() => run(() => router.push(`/app/invoices?q=${i.number}`))}><FileText /> <span className="flex-1 truncate">{i.number}</span><span className="text-xs text-muted-foreground">{i.client}</span></Command.Item>
                ))}
              </Command.Group>
            </Command.List>
            <div className="flex items-center gap-4 border-t px-4 py-2.5 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
              <span className="inline-flex items-center gap-1"><Kbd>↵</Kbd> open</span>
              <span className="ml-auto hidden sm:inline">Tip: press <Kbd>g</Kbd> then <Kbd>t</Kbd> for Team</span>
            </div>
          </Command>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
