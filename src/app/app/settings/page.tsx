"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Laptop, Moon, Sun, Smartphone, ShieldCheck, Monitor, Download, CreditCard, UserPlus } from "lucide-react";
import { PageHeader, ConfirmDialog, StatusBadge } from "@/components/dashboard/kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, Progress, Separator } from "@/components/ui/misc";
import { Field, Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { plans } from "@/lib/content";
import { cn, sleep, formatCurrency } from "@/lib/utils";

const TABS = ["profile", "workspace", "users", "security", "notifications", "billing"] as const;
type Tab = (typeof TABS)[number];

export default function SettingsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const t = params.get("tab");
  const tab: Tab = (TABS as readonly string[]).includes(t ?? "") ? (t as Tab) : "profile";
  return (
    <>
      <PageHeader title="Settings" description="Your profile, workspace preferences, access, security and billing." />
      <Tabs value={tab} onValueChange={(v) => router.replace(`/app/settings?tab=${v}`, { scroll: false })}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="users">Users & roles</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><Profile /></TabsContent>
        <TabsContent value="workspace"><Workspace /></TabsContent>
        <TabsContent value="users"><Users /></TabsContent>
        <TabsContent value="security"><Security /></TabsContent>
        <TabsContent value="notifications"><Notifications /></TabsContent>
        <TabsContent value="billing"><Billing /></TabsContent>
      </Tabs>
    </>
  );
}

function Section({ title, description, children, footer }: { title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Card className="mb-6">
      <CardHeader><CardTitle className="text-base">{title}</CardTitle>{description && <CardDescription>{description}</CardDescription>}</CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <div className="flex justify-end gap-2 border-t px-6 py-4">{footer}</div>}
    </Card>
  );
}

/* ---------- Profile ---------- */
const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, "Enter a valid phone number").or(z.literal("")),
  title: z.string().trim().min(2, "Enter your job title"),
  timezone: z.string(),
  bio: z.string().max(240, "Keep it under 240 characters").optional(),
});
function Profile() {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting, isDirty } } = useForm<z.input<typeof profileSchema>, unknown, z.output<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "Zia Ullah", email: "zia@zeetelephonics.com", phone: "+92 300 1234567", title: "Operations Director", timezone: "Asia/Karachi", bio: "" },
  });
  const name = watch("name");
  const onSubmit = async (v: z.output<typeof profileSchema>) => { await sleep(600); reset(v); toast.success("Profile saved"); };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Section title="Personal details" description="How you appear to colleagues across the workspace."
        footer={<><Button type="button" variant="ghost" disabled={!isDirty} onClick={() => reset()}>Discard</Button><Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save changes</Button></>}>
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={name || "?"} size={64} />
          <div><Button type="button" variant="outline" size="sm" onClick={() => toast("Photo upload connects to your storage provider in production.")}>Upload photo</Button><p className="mt-1 text-xs text-muted-foreground">PNG or JPG, at least 256×256.</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="p-name" error={errors.name?.message} required><Input id="p-name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} /></Field>
          <Field label="Job title" htmlFor="p-title" error={errors.title?.message} required><Input id="p-title" aria-invalid={!!errors.title} {...register("title")} /></Field>
          <Field label="Work email" htmlFor="p-email" error={errors.email?.message} required><Input id="p-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} /></Field>
          <Field label="Phone" htmlFor="p-phone" error={errors.phone?.message}><Input id="p-phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} {...register("phone")} /></Field>
          <Field label="Time zone" htmlFor="p-tz"><NativeSelect id="p-tz" {...register("timezone")}>{["Asia/Karachi", "Asia/Manila", "Asia/Dubai", "Europe/London", "America/New_York", "America/Chicago"].map((z) => <option key={z}>{z}</option>)}</NativeSelect></Field>
          <Field label="Short bio" htmlFor="p-bio" error={errors.bio?.message} className="sm:col-span-2"><Textarea id="p-bio" rows={3} aria-invalid={!!errors.bio} {...register("bio")} placeholder="What you look after, in a sentence or two." /></Field>
        </div>
      </Section>
      <AppearanceCard />
    </form>
  );
}
function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const opts = [{ v: "light", l: "Light", I: Sun }, { v: "dark", l: "Dark", I: Moon }, { v: "system", l: "System", I: Laptop }];
  return (
    <Section title="Appearance" description="Choose how the dashboard looks on this device.">
      <div className="grid max-w-md grid-cols-3 gap-3" role="radiogroup" aria-label="Theme">
        {opts.map(({ v, l, I }) => (
          <button key={v} type="button" role="radio" aria-checked={mounted && theme === v} onClick={() => setTheme(v)} className={cn("flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors", mounted && theme === v ? "border-primary bg-primary/10 font-medium" : "hover:bg-accent")}>
            <I className="size-5" />{l}
          </button>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Workspace ---------- */
const wsSchema = z.object({
  name: z.string().trim().min(2, "Enter a workspace name"),
  slug: z.string().trim().regex(/^[a-z0-9-]{3,32}$/, "Use 3–32 lowercase letters, numbers or hyphens"),
  currency: z.string(),
  fiscalStart: z.string(),
  weekStart: z.string(),
  payCycle: z.string(),
  graceMinutes: z.coerce.number({ invalid_type_error: "Enter a number" }).int().min(0, "Can't be negative").max(60, "Maximum is 60 minutes"),
  address: z.string().trim().min(5, "Enter the registered address"),
});
function Workspace() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<z.input<typeof wsSchema>, unknown, z.output<typeof wsSchema>>({
    resolver: zodResolver(wsSchema),
    defaultValues: { name: "Zee Telephonics BPO", slug: "zee-telephonics", currency: "USD", fiscalStart: "July", weekStart: "Monday", payCycle: "Monthly", graceMinutes: 10, address: "Shahrah-e-Faisal, Karachi, Pakistan" },
  });
  const onSubmit = async (v: z.output<typeof wsSchema>) => { await sleep(700); reset(v); toast.success("Workspace settings saved"); };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Section title="Workspace" description="Company details used on invoices, payslips and reports."
        footer={<><Button type="button" variant="ghost" disabled={!isDirty} onClick={() => reset()}>Discard</Button><Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save workspace</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" htmlFor="w-name" error={errors.name?.message} required><Input id="w-name" aria-invalid={!!errors.name} {...register("name")} /></Field>
          <Field label="Workspace URL" htmlFor="w-slug" error={errors.slug?.message} hint="app.zeetelephonics.com/your-url" required><Input id="w-slug" aria-invalid={!!errors.slug} {...register("slug")} /></Field>
          <Field label="Registered address" htmlFor="w-addr" error={errors.address?.message} required className="sm:col-span-2"><Input id="w-addr" aria-invalid={!!errors.address} {...register("address")} /></Field>
          <Field label="Base currency" htmlFor="w-cur"><NativeSelect id="w-cur" {...register("currency")}>{["USD", "PKR", "PHP", "GBP", "EUR"].map((c) => <option key={c}>{c}</option>)}</NativeSelect></Field>
          <Field label="Fiscal year starts" htmlFor="w-fy"><NativeSelect id="w-fy" {...register("fiscalStart")}>{["January", "April", "July", "October"].map((c) => <option key={c}>{c}</option>)}</NativeSelect></Field>
        </div>
      </Section>
      <Section title="Operations defaults" description="Applied to new teams, shifts and payroll runs.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Week starts on" htmlFor="w-week"><NativeSelect id="w-week" {...register("weekStart")}>{["Monday", "Sunday", "Saturday"].map((c) => <option key={c}>{c}</option>)}</NativeSelect></Field>
          <Field label="Pay cycle" htmlFor="w-pay"><NativeSelect id="w-pay" {...register("payCycle")}>{["Monthly", "Semi-monthly", "Bi-weekly"].map((c) => <option key={c}>{c}</option>)}</NativeSelect></Field>
          <Field label="Late grace period (minutes)" htmlFor="w-grace" error={errors.graceMinutes?.message}><Input id="w-grace" type="number" inputMode="numeric" aria-invalid={!!errors.graceMinutes} {...register("graceMinutes")} /></Field>
        </div>
      </Section>
    </form>
  );
}

/* ---------- Users & roles ---------- */
const ROLES = ["Owner", "Admin", "Manager", "Finance", "Supervisor", "Viewer"] as const;
const inviteSchema = z.object({ email: z.string().trim().email("Enter a valid email address"), role: z.enum(ROLES) });
function Users() {
  const [users, setUsers] = useState([
    { name: "Zia Ullah", email: "zia@zeetelephonics.com", role: "Owner", status: "Active", last: "Now" },
    { name: "Daniel Lee", email: "daniel@zeetelephonics.com", role: "Finance", status: "Active", last: "1 hour ago" },
    { name: "Sarah Ahmed", email: "sarah@zeetelephonics.com", role: "Manager", status: "Active", last: "Today" },
    { name: "Hina Qureshi", email: "hina@zeetelephonics.com", role: "Admin", status: "Active", last: "Yesterday" },
    { name: "Aisha Malik", email: "aisha@zeetelephonics.com", role: "Supervisor", status: "Active", last: "2 days ago" },
  ]);
  const [open, setOpen] = useState(false);
  const [remove, setRemove] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof inviteSchema>>({ resolver: zodResolver(inviteSchema), defaultValues: { role: "Viewer" } });
  const invite = async (v: z.infer<typeof inviteSchema>) => {
    if (users.some((u) => u.email.toLowerCase() === v.email.toLowerCase())) return toast.error("That person is already in the workspace");
    await sleep(600);
    setUsers((u) => [...u, { name: v.email.split("@")[0], email: v.email, role: v.role, status: "Invited", last: "—" }]);
    toast.success(`Invitation sent to ${v.email}`); reset(); setOpen(false);
  };
  const perms: [string, string[]][] = [["Owner", ["Everything, including billing and deleting the workspace"]], ["Admin", ["All modules, users and integrations"]], ["Manager", ["Team, attendance, clients, projects and reports"]], ["Finance", ["Payroll, accounting, invoices and financial reports"]], ["Supervisor", ["Their teams' attendance, leave and performance"]], ["Viewer", ["Read-only dashboards and reports"]]];
  return (
    <>
      <Section title="Users" description="People who can sign in to this workspace.">
        <div className="mb-4 flex justify-end"><Button size="sm" onClick={() => setOpen(true)}><UserPlus /> Invite user</Button></div>
        <ul className="divide-y">
          {users.map((u) => (
            <li key={u.email} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3"><Avatar name={u.name} size={34} /><div className="min-w-0"><p className="truncate text-sm font-medium">{u.name} {u.status === "Invited" && <Badge variant="warning" className="ml-1">Invited</Badge>}</p><p className="truncate text-xs text-muted-foreground">{u.email} · last active {u.last}</p></div></div>
              <div className="flex items-center gap-2">
                <NativeSelect aria-label={`Role for ${u.name}`} value={u.role} disabled={u.role === "Owner"} className="h-8 w-32" onChange={(e) => { setUsers((x) => x.map((y) => (y.email === u.email ? { ...y, role: e.target.value } : y))); toast.success(`${u.name} is now ${e.target.value}`); }}>{ROLES.map((r) => <option key={r} disabled={r === "Owner"}>{r}</option>)}</NativeSelect>
                {u.role !== "Owner" && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setRemove(u.email)}>Remove</Button>}
              </div>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Roles and permissions" description="Role-based access applies to every module and export.">
        <dl className="grid gap-3 sm:grid-cols-2">{perms.map(([r, p]) => <div key={r} className="rounded-lg border p-3"><dt className="text-sm font-medium">{r}</dt><dd className="text-xs text-muted-foreground">{p.join(", ")}</dd></div>)}</dl>
      </Section>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite a user</DialogTitle><DialogDescription>They'll get an email with a link to join the workspace.</DialogDescription></DialogHeader>
          <form id="invite" onSubmit={handleSubmit(invite)} noValidate className="space-y-4">
            <Field label="Email" htmlFor="inv-email" error={errors.email?.message} required><Input id="inv-email" type="email" aria-invalid={!!errors.email} {...register("email")} placeholder="name@company.com" /></Field>
            <Field label="Role" htmlFor="inv-role"><NativeSelect id="inv-role" {...register("role")}>{ROLES.filter((r) => r !== "Owner").map((r) => <option key={r}>{r}</option>)}</NativeSelect></Field>
          </form>
          <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" form="invite" loading={isSubmitting}>Send invite</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!remove} onOpenChange={(o) => !o && setRemove(null)} title="Remove this user?" description="They'll lose access immediately. Their past activity stays in the audit log." confirmLabel="Remove user" destructive onConfirm={() => { setUsers((u) => u.filter((x) => x.email !== remove)); setRemove(null); toast("User removed"); }} />
    </>
  );
}

/* ---------- Security ---------- */
const pwSchema = z.object({
  current: z.string().min(1, "Enter your current password"),
  next: z.string().min(10, "Use at least 10 characters").regex(/[A-Z]/, "Include an uppercase letter").regex(/\d/, "Include a number"),
  confirm: z.string(),
}).refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
function Security() {
  const [mfa, setMfa] = useState(true);
  const [sso, setSso] = useState(false);
  const [sessions, setSessions] = useState([
    { id: "s1", device: "Chrome on macOS", where: "Karachi, PK", when: "Current session", I: Monitor, current: true },
    { id: "s2", device: "Safari on iPhone", where: "Karachi, PK", when: "3 hours ago", I: Smartphone, current: false },
    { id: "s3", device: "Edge on Windows", where: "Lahore, PK", when: "2 days ago", I: Monitor, current: false },
  ]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof pwSchema>>({ resolver: zodResolver(pwSchema) });
  const onPw = async () => { await sleep(700); reset({ current: "", next: "", confirm: "" }); toast.success("Password updated"); };
  return (
    <>
      <form onSubmit={handleSubmit(onPw)} noValidate>
        <Section title="Password" description="Use 10 or more characters with an uppercase letter and a number." footer={<Button type="submit" loading={isSubmitting}>Update password</Button>}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Current password" htmlFor="pw-cur" error={errors.current?.message} required><Input id="pw-cur" type="password" autoComplete="current-password" aria-invalid={!!errors.current} {...register("current")} /></Field>
            <Field label="New password" htmlFor="pw-new" error={errors.next?.message} required><Input id="pw-new" type="password" autoComplete="new-password" aria-invalid={!!errors.next} {...register("next")} /></Field>
            <Field label="Confirm new password" htmlFor="pw-conf" error={errors.confirm?.message} required><Input id="pw-conf" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register("confirm")} /></Field>
          </div>
        </Section>
      </form>
      <Section title="Sign-in protection">
        <div className="space-y-4">
          <label className="flex items-start justify-between gap-6"><span><span className="block text-sm font-medium">Two-factor authentication</span><span className="text-xs text-muted-foreground">Require an authenticator code at sign-in for every user.</span></span><Switch checked={mfa} onCheckedChange={(v) => { setMfa(v); toast(v ? "Two-factor required for all users" : "Two-factor is now optional"); }} /></label>
          <Separator />
          <label className="flex items-start justify-between gap-6"><span><span className="block text-sm font-medium">Enforce single sign-on</span><span className="text-xs text-muted-foreground">Only allow sign-in through Google Workspace or Okta.</span></span><Switch checked={sso} onCheckedChange={(v) => { setSso(v); toast(v ? "SSO enforced" : "Password sign-in allowed"); }} /></label>
          <Separator />
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />Sensitive actions such as payroll approval, bank detail changes and exports are recorded in the audit log under Accounting.</div>
        </div>
      </Section>
      <Section title="Active sessions" description="Devices currently signed in to your account.">
        <ul className="divide-y">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3"><s.I className="size-5 text-muted-foreground" /><div><p className="text-sm font-medium">{s.device}</p><p className="text-xs text-muted-foreground">{s.where} · {s.when}</p></div></div>
              {s.current ? <Badge variant="success" dot>This device</Badge> : <Button size="sm" variant="ghost" onClick={() => { setSessions((x) => x.filter((y) => y.id !== s.id)); toast("Session signed out"); }}>Sign out</Button>}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

/* ---------- Notifications ---------- */
function Notifications() {
  const events = [
    { k: "approvals", l: "Approvals waiting on me", d: "Leave, overtime, payroll and invoice approvals" },
    { k: "payroll", l: "Payroll status", d: "Runs ready for review, approved and paid" },
    { k: "invoices", l: "Invoices", d: "Paid, overdue and disputed invoices" },
    { k: "leads", l: "Sales pipeline", d: "Stage changes on leads I own or follow" },
    { k: "sla", l: "SLA and attendance alerts", d: "SLA breaches, absenteeism spikes and late shifts" },
    { k: "weekly", l: "Weekly summary", d: "A Monday digest of KPIs across the workspace" },
  ];
  const [prefs, setPrefs] = useState<Record<string, { app: boolean; email: boolean }>>(() => Object.fromEntries(events.map((e, i) => [e.k, { app: true, email: i < 3 || e.k === "weekly" }])));
  const [quiet, setQuiet] = useState(true);
  return (
    <Section title="Notification preferences" description="Choose what reaches you, and where." footer={<Button onClick={() => toast.success("Notification preferences saved")}>Save preferences</Button>}>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Notification channels by event</caption>
          <thead><tr className="border-b text-xs text-muted-foreground"><th scope="col" className="py-2 text-left font-medium">Event</th><th scope="col" className="w-20 py-2 font-medium">In app</th><th scope="col" className="w-20 py-2 font-medium">Email</th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.k} className="border-b last:border-0">
                <td className="py-3 pr-4"><p className="font-medium">{e.l}</p><p className="text-xs text-muted-foreground">{e.d}</p></td>
                {(["app", "email"] as const).map((c) => <td key={c} className="py-3 text-center"><Switch checked={prefs[e.k][c]} onCheckedChange={(v) => setPrefs((p) => ({ ...p, [e.k]: { ...p[e.k], [c]: v } }))} aria-label={`${e.l} by ${c === "app" ? "in-app notification" : "email"}`} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label className="mt-5 flex items-start justify-between gap-6 rounded-lg border p-3"><span><span className="block text-sm font-medium">Quiet hours</span><span className="text-xs text-muted-foreground">Hold email notifications between 22:00 and 07:00 in your time zone.</span></span><Switch checked={quiet} onCheckedChange={setQuiet} /></label>
    </Section>
  );
}

/* ---------- Billing ---------- */
function Billing() {
  const [plan, setPlan] = useState("growth");
  const [change, setChange] = useState<string | null>(null);
  const seats = 248, limit = 300;
  const current = plans.find((p) => p.id === plan)!;
  const history = [
    { id: "ZT-B-1107", date: "Nov 1, 2026", amount: 2976, status: "Paid" },
    { id: "ZT-B-1006", date: "Oct 1, 2026", amount: 2928, status: "Paid" },
    { id: "ZT-B-0905", date: "Sep 1, 2026", amount: 2880, status: "Paid" },
  ];
  const price = (p: (typeof plans)[number]) => (typeof p.monthly === "number" ? `${formatCurrency(p.monthly)}/user/mo` : "Custom pricing");
  return (
    <>
      <Section title="Current plan">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-lg font-semibold">{current.name} <Badge variant="info" className="ml-1 align-middle">Billed monthly</Badge></p><p className="text-sm text-muted-foreground">{price(current)} · renews December 1, 2026</p></div>
          <div className="w-full max-w-xs"><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">Active users</span><span className="tabular font-medium">{seats} / {limit}</span></div><Progress value={(seats / limit) * 100} label="Seat usage" /></div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} className={cn("rounded-xl border p-4", p.id === plan && "border-primary bg-primary/5")}>
              <p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{price(p)}</p>
              <Button size="sm" variant={p.id === plan ? "secondary" : "outline"} className="mt-3 w-full" disabled={p.id === plan} onClick={() => (p.id === "enterprise" ? toast("Our team will reach out to scope Enterprise.", { description: "You can also book time from the Request a demo page." }) : setChange(p.id))}>{p.id === plan ? "Current plan" : p.id === "enterprise" ? "Contact sales" : "Switch"}</Button>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Payment method">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3"><span className="grid h-9 w-12 place-items-center rounded-md border bg-muted"><CreditCard className="size-5" /></span><div><p className="text-sm font-medium">Visa ending 4242</p><p className="text-xs text-muted-foreground">Expires 08/2028</p></div></div>
          <Button size="sm" variant="outline" onClick={() => toast("Card updates open your payment provider's secure form in production.")}>Update</Button>
        </div>
      </Section>
      <Section title="Billing history">
        <ul className="divide-y">{history.map((h) => <li key={h.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span><span className="font-medium">{h.date}</span><span className="ml-2 text-xs text-muted-foreground">{h.id}</span></span><span className="flex items-center gap-3"><span className="tabular">{formatCurrency(h.amount)}</span><StatusBadge status={h.status} /><Button size="icon-sm" variant="ghost" aria-label={`Download ${h.id}`} onClick={() => toast.success(`${h.id} downloaded`)}><Download /></Button></span></li>)}</ul>
      </Section>
      <ConfirmDialog open={!!change} onOpenChange={(o) => !o && setChange(null)} title={`Switch to ${plans.find((p) => p.id === change)?.name}?`} description="The change applies immediately and your next invoice is prorated." confirmLabel="Switch plan" onConfirm={() => { setPlan(change!); setChange(null); toast.success("Plan updated"); }} />
    </>
  );
}
