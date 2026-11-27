"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { sleep, cn } from "@/lib/utils";

const dark = "bg-white/[0.03] border-white/10 text-white placeholder:text-slate-500 h-11";

function SSOButtons() {
  const router = useRouter();
  const go = (p: string) => { toast.message(`Continuing with ${p}`, { description: "Demo mode: signing you into the sample workspace." }); setTimeout(() => router.push("/app"), 600); };
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button type="button" variant="glass" className="h-11" onClick={() => go("Google")}>
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" /></svg>
        Google
      </Button>
      <Button type="button" variant="glass" className="h-11" onClick={() => go("Microsoft")}>
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden><path fill="#F25022" d="M3 3h8.5v8.5H3z" /><path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" /><path fill="#00A4EF" d="M3 12.5h8.5V21H3z" /><path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" /></svg>
        Microsoft
      </Button>
    </div>
  );
}

function Divider() {
  return <div className="my-6 flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-white/10" />or continue with email<span className="h-px flex-1 bg-white/10" /></div>;
}

function PasswordInput({ id, invalid, describedBy, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; describedBy?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} className={cn(dark, "pr-11")} aria-invalid={invalid} aria-describedby={describedBy} {...rest} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:text-white" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean().optional(),
});

export function LoginForm() {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "zia@zeetelephonics.com", password: "", remember: true },
  });
  const onSubmit = async (v: z.infer<typeof loginSchema>) => {
    await sleep(700);
    if (v.password === "wrongpassword") {
      setError("password", { message: "That email and password don't match. Try again or reset your password." });
      return;
    }
    toast.success("Welcome back", { description: "Loading your workspace…" });
    router.push("/app");
  };
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-white">Log in to your workspace</h1>
      <p className="mt-2 text-sm text-slate-400">Welcome back. Enter any password with 8+ characters to open the demo workspace.</p>
      <div className="mt-8"><SSOButtons /></div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5" aria-label="Log in">
        <Field label="Work email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" className={dark} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" invalid={!!errors.password} describedBy={errors.password ? "password-error" : undefined} {...register("password")} />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-400"><input type="checkbox" className="size-4 accent-blue-500" {...register("remember")} /> Keep me signed in</label>
          <button type="button" className="font-medium text-blue-300 hover:underline" onClick={() => toast.info("Password reset link sent", { description: "Check your inbox for a link that expires in 30 minutes." })}>Forgot password?</button>
        </div>
        <Button type="submit" variant="brand" size="lg" loading={isSubmitting}>Log in {!isSubmitting && <ArrowRight />}</Button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-400">New to Zee Telephonics? <Link href="/signup" className="font-medium text-blue-300 hover:underline">Create a workspace</Link></p>
    </div>
  );
}

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  company: z.string().trim().min(2, "Enter your company name"),
  email: z.string().trim().email("Enter a valid work email"),
  password: z.string().min(8, "Use at least 8 characters").regex(/[A-Z]/, "Add an uppercase letter").regex(/[0-9]/, "Add a number"),
  terms: z.literal(true, { errorMap: () => ({ message: "You need to accept the terms to continue" }) }),
});

export function SignupForm({ plan }: { plan?: string }) {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<z.infer<typeof signupSchema>>({ resolver: zodResolver(signupSchema) });
  const pw = watch("password") ?? "";
  const strength = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const onSubmit = async () => {
    await sleep(900);
    toast.success("Workspace created", { description: "We've loaded sample data so you can explore right away." });
    router.push("/app");
  };
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-white">Start your 14-day trial</h1>
      <p className="mt-2 text-sm text-slate-400">{plan ? `You're trying the ${plan[0].toUpperCase() + plan.slice(1)} plan. ` : ""}No credit card. Sample data included.</p>
      <div className="mt-8"><SSOButtons /></div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5" aria-label="Sign up">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="name" error={errors.name?.message}><Input id="name" autoComplete="name" className={dark} aria-invalid={!!errors.name} {...register("name")} /></Field>
          <Field label="Company" htmlFor="company" error={errors.company?.message}><Input id="company" autoComplete="organization" className={dark} aria-invalid={!!errors.company} {...register("company")} /></Field>
        </div>
        <Field label="Work email" htmlFor="s-email" error={errors.email?.message}><Input id="s-email" type="email" autoComplete="email" className={dark} aria-invalid={!!errors.email} {...register("email")} /></Field>
        <Field label="Password" htmlFor="s-password" error={errors.password?.message}>
          <PasswordInput id="s-password" autoComplete="new-password" invalid={!!errors.password} describedBy="pw-strength" {...register("password")} />
          <div id="pw-strength" className="flex items-center gap-2" aria-live="polite">
            <div className="flex flex-1 gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={cn("h-1 flex-1 rounded-full", i < strength ? (strength < 2 ? "bg-rose-400" : strength < 4 ? "bg-amber-400" : "bg-emerald-400") : "bg-white/10")} />)}</div>
            <span className="w-14 text-right text-xs text-slate-400">{pw ? ["Weak", "Weak", "Fair", "Good", "Strong"][strength] : ""}</span>
          </div>
        </Field>
        <label className="flex items-start gap-3 text-sm text-slate-400">
          <input type="checkbox" className="mt-0.5 size-4 accent-blue-500" aria-invalid={!!errors.terms} {...register("terms")} />
          <span>I agree to the <Link href="/about#terms" className="text-blue-300 hover:underline">Terms</Link> and <Link href="/about#privacy" className="text-blue-300 hover:underline">Privacy Policy</Link>.{errors.terms && <span role="alert" className="mt-1 block text-xs font-medium text-destructive">{errors.terms.message}</span>}</span>
        </label>
        <Button type="submit" variant="brand" size="lg" loading={isSubmitting}>Create workspace {!isSubmitting && <ArrowRight />}</Button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-400">Already have an account? <Link href="/login" className="font-medium text-blue-300 hover:underline">Log in</Link></p>
    </div>
  );
}
