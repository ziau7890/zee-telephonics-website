"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FilePlus2, FileWarning, CheckCircle2, FileClock, Send, Printer, BellRing, Plus, Trash2, Repeat, CreditCard, Copy, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/lib/services";
import { useService } from "@/lib/services/use-service";
import { clients } from "@/lib/mock/data";
import type { Invoice } from "@/lib/mock/types";
import { PageHeader, StatCard, DataTable, StatusBadge, type Column } from "@/components/dashboard/kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field, NativeSelect } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogoMark } from "@/components/brand/logo";
import { cn, downloadFile, formatCurrency, formatDate, printHTML, toCSV } from "@/lib/utils";

const STATUSES = ["All", "Draft", "Sent", "Partially paid", "Overdue", "Paid"] as const;
const subtotal = (i: Pick<Invoice, "lines">) => i.lines.reduce((a, l) => a + l.qty * l.rate, 0);

export default function InvoicesPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, loading, setData } = useService(() => services.invoices.list());
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  useEffect(() => { if (params.get("new")) setCreateOpen(true); }, [params]);

  const all = data ?? [];
  const rows = useMemo(() => all.filter((i) => status === "All" || i.status === status), [all, status]);
  const outstanding = all.filter((i) => ["Sent", "Partially paid", "Overdue"].includes(i.status)).reduce((a, i) => a + i.amount - i.paid, 0);
  const overdue = all.filter((i) => i.status === "Overdue");
  const paid = all.filter((i) => i.status === "Paid").reduce((a, i) => a + i.amount, 0);

  const update = async (inv: Invoice, patch: Partial<Invoice>, msg: string, desc?: string) => {
    await services.invoices.update(inv.id, patch);
    const next = { ...inv, ...patch };
    setData((d) => d?.map((x) => (x.id === inv.id ? next : x)) ?? null);
    setSelected((s) => (s?.id === inv.id ? next : s));
    toast.success(msg, { description: desc });
  };

  const columns: Column<Invoice>[] = [
    { key: "number", header: "Invoice", sortValue: (i) => i.number, cell: (i) => <div><p className="font-medium">{i.number}</p><p className="text-xs text-muted-foreground">{i.recurring ? <span className="inline-flex items-center gap-1"><Repeat className="size-3" /> Recurring</span> : "One-off"}</p></div> },
    { key: "client", header: "Client", sortValue: (i) => i.client, cell: (i) => i.client },
    { key: "issue", header: "Issued", sortValue: (i) => i.issueDate, cell: (i) => formatDate(i.issueDate, { month: "short", day: "numeric" }), hideBelow: "lg" },
    { key: "due", header: "Due", sortValue: (i) => i.dueDate, cell: (i) => <span className={cn(i.status === "Overdue" && "font-medium text-rose-600 dark:text-rose-400")}>{formatDate(i.dueDate, { month: "short", day: "numeric" })}</span>, hideBelow: "md" },
    { key: "amount", header: "Amount", sortValue: (i) => i.amount, cell: (i) => <span className="font-medium">{formatCurrency(i.amount, i.currency)}</span>, align: "right" },
    { key: "balance", header: "Balance", sortValue: (i) => i.amount - i.paid, cell: (i) => (i.amount - i.paid ? formatCurrency(i.amount - i.paid, i.currency) : <span className="text-muted-foreground">—</span>), align: "right", hideBelow: "sm" },
    { key: "status", header: "Status", sortValue: (i) => i.status, cell: (i) => <StatusBadge status={i.status} /> },
  ];

  return (
    <>
      <PageHeader title="Invoices" description="Bill seats and services, track payments and send reminders automatically."
        actions={<><Button variant="outline" size="sm" onClick={() => { downloadFile("invoices.csv", toCSV(rows.map(({ lines, ...r }) => r))); toast.success("Invoices exported"); }}><Download /> Export</Button><Button size="sm" onClick={() => setCreateOpen(true)}><FilePlus2 /> Create invoice</Button></>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} icon={FileClock} tone="blue" loading={loading} hint="Sent, partially paid and overdue balances." />
        <StatCard label="Overdue" value={formatCurrency(overdue.reduce((a, i) => a + i.amount - i.paid, 0))} icon={FileWarning} tone="rose" loading={loading} deltaLabel={`${overdue.length} invoices`} />
        <StatCard label="Collected (90 days)" value={formatCurrency(paid)} icon={CheckCircle2} tone="emerald" loading={loading} delta={7.8} />
        <StatCard label="Avg. days to pay" value="18.4" icon={CreditCard} tone="violet" loading={loading} delta={-2.1} invert deltaLabel="days vs last quarter" />
      </div>
      <Tabs defaultValue="invoices">
        <TabsList><TabsTrigger value="invoices">All invoices</TabsTrigger><TabsTrigger value="recurring">Recurring</TabsTrigger><TabsTrigger value="templates">Templates</TabsTrigger><TabsTrigger value="reminders">Reminders</TabsTrigger></TabsList>
        <TabsContent value="invoices">
          <div className="mb-4 flex gap-1.5 relative overflow-x-auto no-scrollbar" role="tablist" aria-label="Filter by status">
            {STATUSES.map((s) => { const n = s === "All" ? all.length : all.filter((i) => i.status === s).length; return <button key={s} role="tab" aria-selected={status === s} onClick={() => setStatus(s)} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors", status === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent")}>{s}<span className={cn("rounded-full px-1.5 text-[11px] tabular", status === s ? "bg-white/20" : "bg-muted")}>{n}</span></button>; })}
          </div>
          <DataTable key={params.get("q") ?? ""} rows={rows} columns={columns} loading={loading} caption="Invoices" rowKey={(i) => i.id} onRowClick={setSelected} searchKeys={(i) => `${i.number} ${i.client}`} searchPlaceholder="Search invoice # or client…" initialQuery={params.get("q") ?? ""}
            emptyTitle="No invoices in this status" emptyDescription="Create an invoice or pick another status." />
        </TabsContent>
        <TabsContent value="recurring">
          <Card className="overflow-hidden"><CardHeader><CardTitle>Recurring schedules</CardTitle><CardDescription>Generated automatically from contracts on the 1st of each cycle.</CardDescription></CardHeader>
            <ul className="mt-4 divide-y border-t">{clients.slice(0, 10).map((c) => <li key={c.id} className="flex flex-wrap items-center gap-3 px-6 py-3 text-sm"><Repeat className="size-4 text-muted-foreground" /><span className="flex-1 font-medium">{c.name}</span><span className="text-muted-foreground">{c.billingCycle} · next on the 1st</span><span className="w-24 text-right font-medium tabular">{formatCurrency(c.monthlyValue * (c.billingCycle === "Quarterly" ? 3 : 1), c.currency)}</span><Switch defaultChecked aria-label={`Recurring invoice for ${c.name}`} onCheckedChange={(v) => toast(v ? `Resumed recurring billing for ${c.name}` : `Paused recurring billing for ${c.name}`)} /></li>)}</ul>
          </Card>
        </TabsContent>
        <TabsContent value="templates">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[["Dedicated seats (monthly)", "Per-seat pricing with QA add-on", true], ["Hourly support", "Billed from approved timesheets", false], ["Outcome-based", "Per appointment or qualified lead", false]].map(([t, d, def]) => (
              <li key={t as string}><Card className="h-full p-5"><div className="flex items-center justify-between"><FileText className="size-5 text-primary" />{def && <Badge>Default</Badge>}</div><p className="mt-4 font-semibold">{t}</p><p className="mt-1 text-sm text-muted-foreground">{d}</p><div className="mt-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>Use template</Button><Button size="sm" variant="ghost" onClick={() => toast.success("Template duplicated")}><Copy /> Duplicate</Button></div></Card></li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="reminders">
          <Card><CardHeader><CardTitle>Automatic payment reminders</CardTitle><CardDescription>Sent from billing@zeetelephonics.com with a secure pay link.</CardDescription></CardHeader><CardContent>
            <ul className="divide-y">{[["3 days before due date", true], ["On the due date", true], ["7 days overdue", true], ["14 days overdue (cc account manager)", true], ["30 days overdue (pause new work warning)", false]].map(([l, on]) => <li key={l as string} className="flex items-center justify-between py-3 text-sm"><span>{l}</span><Switch defaultChecked={on as boolean} aria-label={l as string} onCheckedChange={(v) => toast.success(`Reminder ${v ? "enabled" : "disabled"}`)} /></li>)}</ul>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
      <InvoiceDrawer inv={selected} onClose={() => setSelected(null)} onUpdate={update} />
      <CreateInvoiceDialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o && params.get("new")) router.replace("/app/invoices"); }} onCreated={(inv) => { setData((d) => [inv, ...(d ?? [])]); setSelected(inv); }} />
    </>
  );
}

function printInvoice(inv: Invoice) {
  const sub = subtotal(inv);
  const tax = Math.round((sub - inv.discount) * inv.taxRate);
  const client = clients.find((c) => c.id === inv.clientId);
  printHTML(inv.number, `<div class="head"><div><div class="brand">Zee Telephonics BPO</div><div class="muted">Shahrah-e-Faisal, Karachi · billing@zeetelephonics.com</div></div><div style="text-align:right"><h1>Invoice</h1><div class="muted">${inv.number}</div></div></div>
    <table style="margin-top:16px"><tr><td style="border:0;padding-left:0"><div class="muted">Bill to</div><strong>${inv.client}</strong><br>${client?.primaryContact.name ?? ""}<br>${client?.country ?? ""}</td><td style="border:0" class="r"><div class="muted">Issued</div>${formatDate(inv.issueDate)}<div class="muted" style="margin-top:8px">Due</div>${formatDate(inv.dueDate)}</td></tr></table>
    <table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead><tbody>
    ${inv.lines.map((l) => `<tr><td>${l.description}</td><td class="r">${l.qty}</td><td class="r">${formatCurrency(l.rate, inv.currency)}</td><td class="r">${formatCurrency(l.qty * l.rate, inv.currency)}</td></tr>`).join("")}
    <tr><td colspan="3" class="r muted">Subtotal</td><td class="r">${formatCurrency(sub, inv.currency)}</td></tr>
    ${inv.discount ? `<tr><td colspan="3" class="r muted">Discount</td><td class="r">−${formatCurrency(inv.discount, inv.currency)}</td></tr>` : ""}
    <tr><td colspan="3" class="r muted">Tax (${(inv.taxRate * 100).toFixed(0)}%)</td><td class="r">${formatCurrency(tax, inv.currency)}</td></tr>
    ${inv.paid ? `<tr><td colspan="3" class="r muted">Paid</td><td class="r">−${formatCurrency(inv.paid, inv.currency)}</td></tr>` : ""}
    <tr class="tot"><td colspan="3" class="r">Balance due</td><td class="r">${formatCurrency(inv.amount - inv.paid, inv.currency)}</td></tr></tbody></table>
    <p class="muted" style="margin-top:32px;font-size:12px">Pay online at portal.zeetelephonics.com or by bank transfer quoting ${inv.number}. Thank you for your business.</p>`);
}

function InvoiceDrawer({ inv, onClose, onUpdate }: { inv: Invoice | null; onClose: () => void; onUpdate: (i: Invoice, p: Partial<Invoice>, m: string, d?: string) => Promise<void> }) {
  const [payment, setPayment] = useState("");
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { setPayment(""); setErr(null); }, [inv?.id]);
  if (!inv) return <Dialog open={false} />;
  const sub = subtotal(inv);
  const tax = Math.round((sub - inv.discount) * inv.taxRate);
  const balance = inv.amount - inv.paid;
  const record = () => {
    const v = Number(payment);
    if (!payment || Number.isNaN(v) || v <= 0) return setErr("Enter a payment amount greater than 0");
    if (v > balance) return setErr(`Payment can't exceed the balance of ${formatCurrency(balance, inv.currency)}`);
    setErr(null);
    const paid = inv.paid + v;
    onUpdate(inv, { paid, status: paid >= inv.amount ? "Paid" : "Partially paid" }, "Payment recorded", `${formatCurrency(v, inv.currency)} applied to ${inv.number}`);
    setPayment("");
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent side="right" className="max-w-xl">
        <DialogHeader><div className="flex items-center gap-2"><DialogTitle>{inv.number}</DialogTitle><StatusBadge status={inv.status} /></div><DialogDescription>{inv.client} · issued {formatDate(inv.issueDate)} · due {formatDate(inv.dueDate)}</DialogDescription></DialogHeader>
        <div className="flex flex-wrap gap-2">
          {inv.status === "Draft" && <Button size="sm" onClick={() => onUpdate(inv, { status: "Sent" }, "Invoice sent", `Emailed to ${clients.find((c) => c.id === inv.clientId)?.primaryContact.email ?? "client"}`)}><Send /> Send invoice</Button>}
          {["Sent", "Overdue", "Partially paid"].includes(inv.status) && <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent", { description: "Includes a secure payment link." })}><BellRing /> Send reminder</Button>}
          <Button size="sm" variant="outline" onClick={() => printInvoice(inv)}><Printer /> Download PDF</Button>
          {inv.status !== "Paid" && inv.status !== "Draft" && <Button size="sm" variant="outline" onClick={() => onUpdate(inv, { paid: inv.amount, status: "Paid" }, "Marked as paid")}><CheckCircle2 /> Mark paid</Button>}
        </div>
        <div className="mt-6 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between"><div className="flex items-center gap-2"><LogoMark size={24} /><span className="text-sm font-semibold">Zee Telephonics BPO</span></div><div className="text-right text-xs text-muted-foreground"><p>Bill to</p><p className="font-medium text-foreground">{inv.client}</p></div></div>
          <table className="mt-5 w-full text-sm"><caption className="sr-only">Invoice line items</caption>
            <thead><tr className="border-b text-xs text-muted-foreground"><th scope="col" className="py-2 text-left font-medium">Item</th><th scope="col" className="py-2 text-right font-medium">Qty</th><th scope="col" className="py-2 text-right font-medium">Amount</th></tr></thead>
            <tbody>{inv.lines.map((l, i) => <tr key={i} className="border-b"><td className="py-2.5 pr-2">{l.description}<span className="block text-xs text-muted-foreground">{formatCurrency(l.rate, inv.currency)} each</span></td><td className="py-2.5 text-right tabular">{l.qty}</td><td className="py-2.5 text-right tabular">{formatCurrency(l.qty * l.rate, inv.currency)}</td></tr>)}</tbody>
          </table>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular">{formatCurrency(sub, inv.currency)}</dd></div>
            {inv.discount > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd className="tabular">−{formatCurrency(inv.discount, inv.currency)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted-foreground">Tax ({(inv.taxRate * 100).toFixed(0)}%)</dt><dd className="tabular">{formatCurrency(tax, inv.currency)}</dd></div>
            <div className="flex justify-between border-t pt-2 font-semibold"><dt>Total</dt><dd className="tabular">{formatCurrency(inv.amount, inv.currency)}</dd></div>
            {inv.paid > 0 && <div className="flex justify-between text-emerald-600 dark:text-emerald-400"><dt>Paid</dt><dd className="tabular">−{formatCurrency(inv.paid, inv.currency)}</dd></div>}
            <div className="flex justify-between text-base font-semibold"><dt>Balance due</dt><dd className="tabular">{formatCurrency(balance, inv.currency)}</dd></div>
          </dl>
        </div>
        {balance > 0 && inv.status !== "Draft" && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold">Record a payment</p>
            <div className="flex gap-2"><label htmlFor="pay-amt" className="sr-only">Payment amount</label><Input id="pay-amt" inputMode="decimal" placeholder={`Up to ${balance}`} value={payment} onChange={(e) => setPayment(e.target.value)} aria-invalid={!!err} aria-describedby={err ? "pay-err" : undefined} /><Button onClick={record}>Record</Button></div>
            {err && <p id="pay-err" role="alert" className="mt-2 text-xs font-medium text-destructive">{err}</p>}
            <p className="mt-2 text-xs text-muted-foreground">Partial payments are supported. The status updates automatically.</p>
          </div>
        )}
        <div className="mt-6"><p className="mb-2 text-sm font-semibold">History</p><ol className="space-y-2 text-sm text-muted-foreground"><li>Created by Daniel Lee · {formatDate(inv.issueDate)}</li>{inv.status !== "Draft" && <li>Sent to client · {formatDate(inv.issueDate)}</li>}{inv.paid > 0 && <li>Payment received · {formatCurrency(inv.paid, inv.currency)}</li>}</ol></div>
      </DialogContent>
    </Dialog>
  );
}

const invSchema = z.object({
  clientId: z.string().min(1, "Choose a client"),
  issueDate: z.string().min(1, "Choose an issue date"),
  dueDate: z.string().min(1, "Choose a due date"),
  taxRate: z.coerce.number().min(0, "Tax can't be negative").max(30, "Tax rate looks too high"),
  discount: z.coerce.number().min(0, "Discount can't be negative"),
  recurring: z.boolean(),
  lines: z.array(z.object({
    description: z.string().trim().min(3, "Describe the item"),
    qty: z.coerce.number({ invalid_type_error: "Qty" }).positive("Must be > 0"),
    rate: z.coerce.number({ invalid_type_error: "Rate" }).positive("Must be > 0"),
  })).min(1, "Add at least one line"),
}).refine((v) => new Date(v.dueDate) >= new Date(v.issueDate), { path: ["dueDate"], message: "Due date must be on or after the issue date" });

function CreateInvoiceDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (i: Invoice) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
  const { register, control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<z.input<typeof invSchema>, unknown, z.output<typeof invSchema>>({
    resolver: zodResolver(invSchema),
    defaultValues: { clientId: "", issueDate: today, dueDate: due, taxRate: 0, discount: 0, recurring: true, lines: [{ description: "Inbound voice support · dedicated agents", qty: 10, rate: 720 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const watched = useWatch({ control });
  const sub = (watched.lines ?? []).reduce((a, l) => a + (Number(l?.qty) || 0) * (Number(l?.rate) || 0), 0);
  const disc = Number(watched.discount) || 0;
  const tax = Math.round((sub - disc) * ((Number(watched.taxRate) || 0) / 100));
  const total = sub - disc + tax;
  const client = clients.find((c) => c.id === watched.clientId);

  const submit = async (v: z.output<typeof invSchema>, send: boolean) => {
    const c = clients.find((x) => x.id === v.clientId)!;
    const inv = await services.invoices.create({ clientId: c.id, client: c.name, issueDate: new Date(v.issueDate).toISOString(), dueDate: new Date(v.dueDate).toISOString(), lines: v.lines, taxRate: v.taxRate / 100, discount: v.discount, amount: total, status: send ? "Sent" : "Draft", recurring: v.recurring, currency: c.currency });
    onCreated(inv);
    toast.success(send ? `${inv.number} sent to ${c.name}` : `${inv.number} saved as draft`);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>Create invoice</DialogTitle><DialogDescription>Line items, tax and discount are calculated as you type.</DialogDescription></DialogHeader>
        <form noValidate className="grid gap-5" onSubmit={handleSubmit((v) => submit(v, false))}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Client" htmlFor="ci-client" error={errors.clientId?.message} required>
              <NativeSelect id="ci-client" aria-invalid={!!errors.clientId} {...register("clientId", { onChange: (e) => { const c = clients.find((x) => x.id === e.target.value); if (c) setValue("lines.0.qty", c.seats); } })}><option value="">Choose client…</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</NativeSelect>
            </Field>
            <Field label="Issue date" htmlFor="ci-issue" error={errors.issueDate?.message} required><Input id="ci-issue" type="date" {...register("issueDate")} /></Field>
            <Field label="Due date" htmlFor="ci-due" error={errors.dueDate?.message} required><Input id="ci-due" type="date" aria-invalid={!!errors.dueDate} {...register("dueDate")} /></Field>
          </div>
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium">Line items</legend>
            <div className="space-y-2">
              {fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-[1fr_72px_100px_36px] items-start gap-2">
                  <div><label className="sr-only" htmlFor={`l-d-${i}`}>Description</label><Input id={`l-d-${i}`} placeholder="Description" aria-invalid={!!errors.lines?.[i]?.description} {...register(`lines.${i}.description`)} />{errors.lines?.[i]?.description && <p className="mt-1 text-xs text-destructive">{errors.lines[i]!.description!.message}</p>}</div>
                  <div><label className="sr-only" htmlFor={`l-q-${i}`}>Quantity</label><Input id={`l-q-${i}`} inputMode="numeric" placeholder="Qty" aria-invalid={!!errors.lines?.[i]?.qty} {...register(`lines.${i}.qty`)} /></div>
                  <div><label className="sr-only" htmlFor={`l-r-${i}`}>Rate</label><Input id={`l-r-${i}`} inputMode="decimal" placeholder="Rate" aria-invalid={!!errors.lines?.[i]?.rate} {...register(`lines.${i}.rate`)} /></div>
                  <Button type="button" variant="ghost" size="icon" disabled={fields.length === 1} onClick={() => remove(i)} aria-label={`Remove line ${i + 1}`}><Trash2 /></Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ description: "", qty: 1, rate: 0 })}><Plus /> Add line</Button>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1.3fr]">
            <Field label="Tax rate (%)" htmlFor="ci-tax" error={errors.taxRate?.message}><Input id="ci-tax" inputMode="decimal" {...register("taxRate")} /></Field>
            <Field label="Discount" htmlFor="ci-disc" error={errors.discount?.message}><Input id="ci-disc" inputMode="decimal" {...register("discount")} /></Field>
            <dl className="rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular">{formatCurrency(sub, client?.currency ?? "USD")}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tax − discount</dt><dd className="tabular">{formatCurrency(tax - disc, client?.currency ?? "USD")}</dd></div>
              <div className="mt-1 flex justify-between border-t pt-1 font-semibold"><dt>Total</dt><dd className="tabular">{formatCurrency(total, client?.currency ?? "USD")}</dd></div>
            </dl>
          </div>
          <label className="flex items-center gap-3 text-sm"><Switch checked={!!watched.recurring} onCheckedChange={(v) => setValue("recurring", v)} aria-label="Recurring invoice" /> Repeat this invoice every {client?.billingCycle === "Quarterly" ? "quarter" : "month"}</label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="secondary" loading={isSubmitting}>Save draft</Button>
            <Button type="button" loading={isSubmitting} onClick={handleSubmit((v) => submit(v, true))}><Send /> Create & send</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
