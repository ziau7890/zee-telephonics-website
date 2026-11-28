"use client";
import { useState } from "react";
import Link from "next/link";
import { Megaphone, Activity, MessageSquare, Send, Bell, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { announcements as seedAnnouncements, recentActivity } from "@/lib/mock/data";
import { PageHeader } from "@/components/dashboard/kit";
import { NotificationList } from "@/components/dashboard/notifications";
import { useShell } from "@/components/dashboard/app-shell";
import { timeAgo } from "@/components/dashboard/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { Field, Input, Textarea, NativeSelect } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ago = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export default function NotificationsPage() {
  const { notifications } = useShell();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <>
      <PageHeader title="Notifications & activity" description={unread ? `You have ${unread} unread notification${unread === 1 ? "" : "s"}.` : "You're all caught up."}
        actions={<Link href="/app/settings?tab=notifications" className={buttonVariants({ variant: "outline", size: "sm" })}><Settings2 /> Preferences</Link>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <Tabs defaultValue="inbox">
            <TabsList>
              <TabsTrigger value="inbox"><Bell className="mr-1.5 size-4" />Inbox</TabsTrigger>
              <TabsTrigger value="messages"><MessageSquare className="mr-1.5 size-4" />Team messages</TabsTrigger>
              <TabsTrigger value="activity"><Activity className="mr-1.5 size-4" />Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="inbox"><Card className="overflow-hidden"><NotificationList /></Card></TabsContent>
            <TabsContent value="messages"><TeamMessages /></TabsContent>
            <TabsContent value="activity"><ActivityFeed /></TabsContent>
          </Tabs>
        </div>
        <Announcements />
      </div>
    </>
  );
}

function Announcements() {
  const [items, setItems] = useState(seedAnnouncements.map((a) => ({ ...a, audience: "Everyone" })));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: "Everyone" });
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const publish = () => {
    const e: typeof errors = {};
    if (form.title.trim().length < 4) e.title = "Add a title of at least 4 characters";
    if (form.body.trim().length < 10) e.body = "Write at least a sentence";
    setErrors(e);
    if (Object.keys(e).length) return;
    setItems((x) => [{ id: `AN${Date.now()}`, title: form.title.trim(), body: form.body.trim(), author: "Zia Ullah", at: new Date().toISOString(), audience: form.audience }, ...x]);
    setForm({ title: "", body: "", audience: "Everyone" }); setOpen(false);
    toast.success("Announcement published", { description: `Sent to ${form.audience.toLowerCase()}.` });
  };
  return (
    <Card className="h-fit">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div><CardTitle className="flex items-center gap-2 text-base"><Megaphone className="size-4 text-muted-foreground" /> Announcements</CardTitle><CardDescription>Company-wide updates.</CardDescription></div>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>New</Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {items.map((a) => (
            <li key={a.id} className="rounded-lg border p-4">
              <p className="font-medium leading-snug">{a.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Avatar name={a.author} size={18} />{a.author} · {timeAgo(a.at)} · {a.audience}</p>
            </li>
          ))}
        </ul>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New announcement</DialogTitle><DialogDescription>Shows in everyone's notification center and on the overview.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <Field label="Title" htmlFor="an-title" error={errors.title} required><Input id="an-title" value={form.title} aria-invalid={!!errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Message" htmlFor="an-body" error={errors.body} required><Textarea id="an-body" rows={4} value={form.body} aria-invalid={!!errors.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
            <Field label="Audience" htmlFor="an-aud"><NativeSelect id="an-aud" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>{["Everyone", "Managers & supervisors", "Karachi HQ", "Manila site", "Customer Support"].map((a) => <option key={a}>{a}</option>)}</NativeSelect></Field>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={publish}>Publish</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

const CHANNELS = ["#ops-leads", "#payroll", "#northstar-peak"] as const;
const seedMessages: Record<string, { id: string; who: string; text: string; at: string }[]> = {
  "#ops-leads": [
    { id: "m1", who: "Sarah Ahmed", text: "Voice Team A is at 94% occupancy this afternoon. Pulling two agents from Chat & Email until 17:00.", at: ago(2.2) },
    { id: "m2", who: "Bilal Raza", text: "Works for Tier 1. We can spare one more if the queue crosses 40.", at: ago(1.9) },
    { id: "m3", who: "Maria Santos", text: "December rosters for Manila are published. Please flag conflicts by Friday.", at: ago(0.6) },
  ],
  "#payroll": [
    { id: "m4", who: "Daniel Lee", text: "November run is ready for approval. 14 lines have overtime adjustments to review.", at: ago(3) },
    { id: "m5", who: "Hina Qureshi", text: "Two new joiners need bank details verified before cutoff.", at: ago(1.1) },
  ],
  "#northstar-peak": [
    { id: "m6", who: "Emily Johnson", text: "Northstar expects 30% more volume on Black Friday weekend. Forecast is in the shared drive.", at: ago(5) },
  ],
};

function TeamMessages() {
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("#ops-leads");
  const [messages, setMessages] = useState(seedMessages);
  const [text, setText] = useState("");
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setMessages((m) => ({ ...m, [channel]: [...m[channel], { id: `m${Date.now()}`, who: "Zia Ullah", text: text.trim(), at: new Date().toISOString() }] }));
    setText("");
  };
  return (
    <Card className="flex flex-col overflow-hidden md:h-[560px] md:flex-row">
      <nav aria-label="Channels" className="flex gap-1 relative overflow-x-auto border-b p-2 no-scrollbar md:w-48 md:flex-col md:border-b-0 md:border-r">
        {CHANNELS.map((c) => <button key={c} onClick={() => setChannel(c)} aria-current={channel === c ? "true" : undefined} className={cn("shrink-0 rounded-md px-3 py-2 text-left text-sm", channel === c ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent/60")}>{c}</button>)}
      </nav>
      <div className="flex min-h-[420px] flex-1 flex-col">
        <ul className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin" aria-live="polite" aria-label={`Messages in ${channel}`}>
          {messages[channel].map((m) => (
            <li key={m.id} className="flex gap-3">
              <Avatar name={m.who} size={32} />
              <div className="min-w-0"><p className="text-sm"><span className="font-semibold">{m.who}</span> <span className="text-xs text-muted-foreground">{timeAgo(m.at)}</span></p><p className="text-sm text-foreground/90">{m.text}</p></div>
            </li>
          ))}
        </ul>
        <form onSubmit={send} className="flex gap-2 border-t p-3">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${channel}`} aria-label={`Message ${channel}`} maxLength={500} />
          <Button type="submit" size="icon" aria-label="Send message" disabled={!text.trim()}><Send /></Button>
        </form>
      </div>
    </Card>
  );
}

function ActivityFeed() {
  const extra = [
    { id: "R6", who: "Bilal Raza", what: "closed 18 escalations for", target: "Lattice Software", at: ago(30) },
    { id: "R7", who: "Daniel Lee", what: "reconciled October bank statements for", target: "Operating account", at: ago(44) },
    { id: "R8", who: "Sarah Ahmed", what: "updated the shift roster for", target: "Voice Team A", at: ago(52) },
  ];
  const feed = [...recentActivity, ...extra];
  return (
    <Card>
      <CardContent className="p-0">
        <ol className="relative p-5">
          {feed.map((a, i) => (
            <li key={a.id} className="relative flex gap-3 pb-6 last:pb-0">
              {i < feed.length - 1 && <span className="absolute left-4 top-9 h-[calc(100%-2.25rem)] w-px bg-border" aria-hidden />}
              <Avatar name={a.who} size={32} />
              <div className="min-w-0 pt-1"><p className="text-sm"><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span> <span className="font-medium">{a.target}</span></p><p className="text-xs text-muted-foreground">{timeAgo(a.at)}</p></div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
