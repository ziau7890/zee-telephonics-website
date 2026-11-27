"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { useTheme } from "next-themes";
import * as Popover from "@radix-ui/react-popover";
import * as D from "@radix-ui/react-dialog";
import {
  Bell, ChevronsUpDown, Search, Moon, Sun, Menu, PanelLeftClose, PanelLeftOpen, LogOut, User, Settings, LifeBuoy, Check, Plus, Command as CmdIcon, ChevronRight, X, Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Avatar, Kbd } from "@/components/ui/misc";
import { Tooltip } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { appNav, titleFor } from "./nav";
import { CommandPalette } from "./command-palette";
import { NotificationList } from "./notifications";
import { cn } from "@/lib/utils";
import { notifications as seedNotifications } from "@/lib/mock/data";
import type { Notification } from "@/lib/mock/types";

const workspaces = [
  { id: "zt", name: "Zee Telephonics BPO", plan: "Growth · 248 seats" },
  { id: "zt-mnl", name: "Zee Telephonics Manila", plan: "Growth · 62 seats" },
  { id: "zt-sandbox", name: "Sandbox (training)", plan: "Starter · 10 seats" },
];

interface ShellCtx { openCommand: () => void; notifications: Notification[]; setNotifications: React.Dispatch<React.SetStateAction<Notification[]>> }
const Ctx = createContext<ShellCtx | null>(null);
export const useShell = () => useContext(Ctx)!;

function SidebarNav({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin">
      {appNav.map((g) => (
        <div key={g.group}>
          {!collapsed && <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">{g.group}</p>}
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
              const link = (
                <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                  className={cn("group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13.5px] font-medium transition-colors",
                    active ? "bg-primary/10 text-primary dark:bg-white/[0.07] dark:text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    collapsed && "justify-center px-0")}>
                  {active && <span className="absolute -left-3 top-1.5 h-6 w-[3px] rounded-r-full bg-primary" aria-hidden />}
                  <item.icon className="size-[18px] shrink-0" aria-hidden />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className={cn("grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10.5px] font-semibold", item.badge === "!" ? "bg-amber-500/15 text-amber-600 dark:text-amber-300" : "bg-primary/15 text-primary dark:text-blue-300")}>
                      {item.badge}<span className="sr-only">{item.badge === "!" ? " needs attention" : " pending"}</span>
                    </span>
                  )}
                  {collapsed && <span className="sr-only">{item.label}</span>}
                </Link>
              );
              return <li key={item.href}>{collapsed ? <Tooltip content={item.label} side="right">{link}</Tooltip> : link}</li>;
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function WorkspaceSwitcher({ collapsed }: { collapsed?: boolean }) {
  const [ws, setWs] = useState(workspaces[0]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-accent", collapsed && "justify-center")} aria-label={`Workspace: ${ws.name}. Switch workspace`}>
          <LogoMark size={30} />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-semibold">{ws.name}</span><span className="block truncate text-[11.5px] text-muted-foreground">{ws.plan}</span></span>
              <ChevronsUpDown className="size-4 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem key={w.id} onSelect={() => { setWs(w); toast.success(`Switched to ${w.name}`); }}>
            <LogoMark size={20} />
            <span className="flex-1"><span className="block">{w.name}</span><span className="block text-xs text-muted-foreground">{w.plan}</span></span>
            {ws.id === w.id && <Check className="!text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast.info("Multi-workspace is available on Enterprise", { description: "Talk to us to add another entity." })}><Plus /> Create workspace</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change theme">
          {mounted && theme === "light" ? <Sun /> : <Moon />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[9rem]">
        {[["light", "Light", Sun], ["dark", "Dark", Moon], ["system", "System", Monitor]].map(([v, l, I]) => {
          const Icon = I as typeof Sun;
          return <DropdownMenuItem key={v as string} onSelect={() => setTheme(v as string)}><Icon /> {l as string}{mounted && theme === v && <Check className="ml-auto !text-primary" />}</DropdownMenuItem>;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const crumbs = [{ href: "/app", label: "Zee Telephonics" }, ...parts.map((p, i) => {
    const href = "/app/" + parts.slice(0, i + 1).join("/");
    return { href, label: i === 0 ? titleFor(href) : decodeURIComponent(p).toUpperCase().startsWith("EMP-") || p.startsWith("CL-") ? p : p };
  })];
  if (parts.length === 0) crumbs.push({ href: "/app", label: "Overview" });
  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 md:block">
      <ol className="flex items-center gap-1.5 text-sm">
        {crumbs.map((c, i) => (
          <li key={c.href + i} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground/60" aria-hidden />}
            {i === crumbs.length - 1 ? <span aria-current="page" className="truncate font-medium">{c.label}</span> : <Link href={c.href} className="truncate text-muted-foreground hover:text-foreground">{c.label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    try { setCollapsed(localStorage.getItem("zt:sidebar") === "1"); } catch {}
  }, []);
  const toggleCollapsed = () => setCollapsed((c) => { try { localStorage.setItem("zt:sidebar", c ? "0" : "1"); } catch {} return !c; });

  useEffect(() => setMobileOpen(false), [pathname]);

  // Global keyboard shortcuts: ⌘K / Ctrl+K palette, "/" search, "[" toggle sidebar, g+key navigation.
  useEffect(() => {
    let g = false;
    let gTimer: ReturnType<typeof setTimeout>;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen((o) => !o); return; }
      if (typing) return;
      if (e.key === "/") { e.preventDefault(); setCmdOpen(true); return; }
      if (e.key === "[") { toggleCollapsed(); return; }
      if (e.key === "g") { g = true; clearTimeout(gTimer); gTimer = setTimeout(() => (g = false), 800); return; }
      if (g) {
        const map: Record<string, string> = { o: "/app", t: "/app/team", a: "/app/attendance", l: "/app/leads", c: "/app/clients", p: "/app/payroll", i: "/app/invoices", r: "/app/reports", s: "/app/settings" };
        if (map[e.key]) { router.push(map[e.key]); g = false; }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const openCommand = useCallback(() => setCmdOpen(true), []);

  return (
    <Ctx.Provider value={{ openCommand, notifications, setNotifications }}>
      <div className="flex min-h-dvh bg-background">
        {/* Desktop sidebar */}
        <aside className={cn("sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-card/60 transition-[width] duration-200 lg:flex", collapsed ? "w-[68px]" : "w-[252px]")}>
          <div className="border-b p-3"><WorkspaceSwitcher collapsed={collapsed} /></div>
          <SidebarNav collapsed={collapsed} />
          <div className="border-t p-3">
            {!collapsed && (
              <div className="mb-3 rounded-lg border bg-gradient-to-br from-primary/10 to-transparent p-3">
                <p className="text-xs font-semibold">Payroll closes in 3 days</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">14 lines need review.</p>
                <Link href="/app/payroll" className="mt-2 inline-flex text-xs font-medium text-primary hover:underline">Review payroll</Link>
              </div>
            )}
            <Button variant="ghost" size="sm" className={cn("w-full justify-start text-muted-foreground", collapsed && "justify-center px-0")} onClick={toggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? <PanelLeftOpen /> : <><PanelLeftClose /> Collapse <Kbd className="ml-auto">[</Kbd></>}
            </Button>
          </div>
        </aside>

        {/* Mobile sidebar */}
        <D.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <D.Portal>
            <D.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] lg:hidden" />
            <D.Content className="fixed inset-y-0 left-0 z-50 flex w-[84%] max-w-[300px] flex-col border-r bg-card shadow-elevated data-[state=open]:animate-[slide-in-left_.25s_cubic-bezier(.2,.7,.2,1)] lg:hidden">
              <D.Title className="sr-only">Navigation</D.Title>
              <div className="flex items-center justify-between border-b p-3"><Logo size={28} /><D.Close asChild><Button variant="ghost" size="icon" aria-label="Close navigation"><X /></Button></D.Close></div>
              <div className="border-b p-3"><WorkspaceSwitcher /></div>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </D.Content>
          </D.Portal>
        </D.Root>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu /></Button>
            <Breadcrumbs />
            <span className="font-semibold md:hidden">{titleFor(pathname)}</span>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <button onClick={() => setCmdOpen(true)} className="hidden h-9 w-64 items-center gap-2 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex xl:w-80" aria-label="Search and run commands">
                <Search className="size-4" /> <span className="flex-1 text-left">Search people, clients, invoices…</span><Kbd><CmdIcon className="size-2.5" />K</Kbd>
              </button>
              <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Search" onClick={() => setCmdOpen(true)}><Search /></Button>
              <ThemeToggle />
              <Popover.Root>
                <Popover.Trigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`}>
                    <Bell />
                    {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-background">{unread}</span>}
                  </Button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content align="end" sideOffset={8} className="z-50 w-[min(92vw,400px)] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-elevated">
                    <NotificationList compact />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 rounded-full focus-visible:ring-2 focus-visible:ring-ring" aria-label="Account menu"><Avatar name="Zia Ullah" size={34} /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60">
                  <div className="flex items-center gap-3 px-2 py-2"><Avatar name="Zia Ullah" size={36} /><div className="min-w-0"><p className="truncate text-sm font-medium">Zia Ullah</p><p className="truncate text-xs text-muted-foreground">Owner · zia@zeetelephonics.com</p></div></div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push("/app/settings")}><User /> Profile</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/app/settings?tab=workspace")}><Settings /> Workspace settings</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setCmdOpen(true)}><CmdIcon /> Command palette <span className="ml-auto text-xs text-muted-foreground">⌘K</span></DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/contact")}><LifeBuoy /> Help & support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => { toast.success("Signed out"); router.push("/login"); }}><LogOut /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </Ctx.Provider>
  );
}
