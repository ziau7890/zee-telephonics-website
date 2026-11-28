import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Users, Clock, Target, Contact, Building2, FolderKanban, Wallet, Landmark, FileText, BarChart3, Plug, Settings, Bell,
} from "lucide-react";

export interface NavItem { href: string; label: string; icon: LucideIcon; badge?: string }

export const appNav: { group: string; items: NavItem[] }[] = [
  { group: "Operations", items: [
    { href: "/app", label: "Overview", icon: LayoutDashboard },
    { href: "/app/team", label: "Team", icon: Users },
    { href: "/app/attendance", label: "Attendance", icon: Clock, badge: "3" },
  ] },
  { group: "Revenue", items: [
    { href: "/app/leads", label: "Leads", icon: Target },
    { href: "/app/crm", label: "CRM", icon: Contact },
    { href: "/app/clients", label: "Clients", icon: Building2 },
    { href: "/app/projects", label: "Projects", icon: FolderKanban },
  ] },
  { group: "Finance", items: [
    { href: "/app/payroll", label: "Payroll", icon: Wallet, badge: "!" },
    { href: "/app/accounting", label: "Accounting", icon: Landmark },
    { href: "/app/invoices", label: "Invoices", icon: FileText },
  ] },
  { group: "Workspace", items: [
    { href: "/app/reports", label: "Reports", icon: BarChart3 },
    { href: "/app/integrations", label: "Integrations", icon: Plug },
    { href: "/app/settings", label: "Settings", icon: Settings },
  ] },
];

export const flatNav: NavItem[] = [...appNav.flatMap((g) => g.items), { href: "/app/notifications", label: "Notifications", icon: Bell }];

export function titleFor(pathname: string) {
  const exact = flatNav.find((n) => n.href === pathname);
  if (exact) return exact.label;
  const parent = flatNav.filter((n) => n.href !== "/app" && pathname.startsWith(n.href)).sort((a, b) => b.href.length - a.href.length)[0];
  return parent?.label ?? "Overview";
}
