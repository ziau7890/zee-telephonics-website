"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, CalendarCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, NativeSelect, Textarea } from "@/components/ui/input";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";

const darkInput = "bg-white/[0.03] border-white/10 text-white placeholder:text-slate-500";

const demoSchema = z.object({
  firstName: z.string().trim().min(2, "Enter your first name"),
  lastName: z.string().trim().min(2, "Enter your last name"),
  email: z.string().trim().email("Enter a valid work email").refine((v) => !/@(gmail|yahoo|hotmail|outlook)\./i.test(v), "Please use your work email so we can prepare your workspace"),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, "Enter a valid phone number").optional().or(z.literal("")),
  company: z.string().trim().min(2, "Enter your company name"),
  seats: z.string().min(1, "Select your team size"),
  type: z.string().min(1, "Select your business type"),
  interests: z.array(z.string()).min(1, "Pick at least one area"),
  message: z.string().max(800, "Keep it under 800 characters").optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept so we can contact you" }) }),
});
type DemoValues = z.infer<typeof demoSchema>;

const interestOptions = ["Team & attendance", "CRM & leads", "Client management", "Payroll", "Accounting & invoicing", "Reporting"];

export function DemoForm({ plan }: { plan?: string }) {
  const [done, setDone] = useState<null | { ref: string; name: string }>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<DemoValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: { interests: plan === "enterprise" ? ["Team & attendance", "Payroll"] : [], seats: plan === "enterprise" ? "500+" : "" },
  });
  const interests = watch("interests") ?? [];

  const onSubmit = async (v: DemoValues) => {
    try {
      const res = await services.marketing.requestDemo(v);
      setDone({ ref: res.ref, name: v.firstName });
      toast.success("Demo request received", { description: "We'll email you within one business day." });
    } catch {
      toast.error("We couldn't send your request", { description: "Please try again, or email sales@zeetelephonics.com." });
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-10 text-center" role="status">
        <CheckCircle2 className="size-12 text-emerald-300" />
        <h2 className="mt-5 text-2xl font-semibold text-white">Thanks, {done.name}. You&apos;re booked in.</h2>
        <p className="mt-3 max-w-md text-slate-300">A solutions specialist will email you within one business day with times that suit your timezone. Your reference is <span className="font-mono text-white">{done.ref}</span>.</p>
        <p className="mt-6 text-sm text-slate-400">While you wait, explore the <a href="/app" className="font-medium text-blue-300 underline-offset-4 hover:underline">live demo workspace</a>.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5" aria-label="Request a demo">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={errors.firstName?.message} required>
          <Input id="firstName" autoComplete="given-name" className={darkInput} aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? "firstName-error" : undefined} {...register("firstName")} />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={errors.lastName?.message} required>
          <Input id="lastName" autoComplete="family-name" className={darkInput} aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? "lastName-error" : undefined} {...register("lastName")} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Work email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" className={darkInput} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />
        </Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone?.message} hint="Optional, for scheduling only">
          <Input id="phone" type="tel" autoComplete="tel" placeholder="+92 300 1234567" className={darkInput} aria-invalid={!!errors.phone} {...register("phone")} />
        </Field>
      </div>
      <Field label="Company" htmlFor="company" error={errors.company?.message} required>
        <Input id="company" autoComplete="organization" className={darkInput} aria-invalid={!!errors.company} {...register("company")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Team size" htmlFor="seats" error={errors.seats?.message} required>
          <NativeSelect id="seats" className={darkInput} aria-invalid={!!errors.seats} {...register("seats")}>
            <option value="">Select seats</option>
            {["1–25", "26–100", "101–250", "251–500", "500+"].map((s) => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
          </NativeSelect>
        </Field>
        <Field label="Business type" htmlFor="type" error={errors.type?.message} required>
          <NativeSelect id="type" className={darkInput} aria-invalid={!!errors.type} {...register("type")}>
            <option value="">Select type</option>
            {["Call center", "Customer support", "Virtual assistants", "Lead generation", "Back office", "IT-enabled services", "Other"].map((s) => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
          </NativeSelect>
        </Field>
      </div>
      <fieldset>
        <legend className="text-[13px] font-medium text-foreground/90">What do you want to see? <span className="text-destructive" aria-hidden>*</span></legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {interestOptions.map((o) => {
            const on = interests.includes(o);
            return (
              <button key={o} type="button" aria-pressed={on} onClick={() => setValue("interests", on ? interests.filter((x) => x !== o) : [...interests, o], { shouldValidate: true })}
                className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors", on ? "border-blue-400/60 bg-blue-500/15 text-blue-100" : "border-white/10 text-slate-300 hover:border-white/25")}>
                {o}
              </button>
            );
          })}
        </div>
        {errors.interests && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{errors.interests.message}</p>}
      </fieldset>
      <Field label="Anything we should know?" htmlFor="message" error={errors.message?.message} hint="Current tools, number of sites, go-live timeline">
        <Textarea id="message" className={darkInput} {...register("message")} />
      </Field>
      <label className="flex items-start gap-3 text-sm text-slate-400">
        <input type="checkbox" className="mt-0.5 size-4 rounded border-white/20 bg-transparent accent-blue-500" aria-invalid={!!errors.consent} {...register("consent")} />
        <span>I agree to be contacted about my demo. We never share your details.{errors.consent && <span role="alert" className="mt-1 block text-xs font-medium text-destructive">{errors.consent.message}</span>}</span>
      </label>
      <Button type="submit" variant="brand" size="lg" loading={isSubmitting}>{!isSubmitting && <CalendarCheck />} Book my demo</Button>
    </form>
  );
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  topic: z.string().min(1, "Choose a topic"),
  message: z.string().trim().min(20, "Tell us a little more (at least 20 characters)").max(1500),
});
type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactValues>({ resolver: zodResolver(contactSchema), defaultValues: { topic: "" } });
  const onSubmit = async (v: ContactValues) => {
    await services.marketing.contact(v);
    setSent(true);
    reset();
    toast.success("Message sent", { description: "We reply to most messages within 4 business hours." });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5" aria-label="Contact us">
      {sent && <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"><CheckCircle2 className="size-4" /> Thanks, your message is on its way to the right team.</div>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="c-name" error={errors.name?.message} required><Input id="c-name" autoComplete="name" className={darkInput} aria-invalid={!!errors.name} {...register("name")} /></Field>
        <Field label="Email" htmlFor="c-email" error={errors.email?.message} required><Input id="c-email" type="email" autoComplete="email" className={darkInput} aria-invalid={!!errors.email} {...register("email")} /></Field>
      </div>
      <Field label="Topic" htmlFor="c-topic" error={errors.topic?.message} required>
        <NativeSelect id="c-topic" className={darkInput} aria-invalid={!!errors.topic} {...register("topic")}>
          <option value="">Choose a topic</option>
          {["Sales", "Customer support", "Partnerships", "Billing", "Press", "Something else"].map((t) => <option key={t} className="bg-slate-900">{t}</option>)}
        </NativeSelect>
      </Field>
      <Field label="Message" htmlFor="c-message" error={errors.message?.message} required><Textarea id="c-message" rows={6} className={darkInput} aria-invalid={!!errors.message} {...register("message")} /></Field>
      <Button type="submit" variant="brand" size="lg" loading={isSubmitting} className="sm:w-fit">{!isSubmitting && <Send />} Send message</Button>
    </form>
  );
}
