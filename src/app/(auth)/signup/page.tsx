import type { Metadata } from "next";
import { SignupForm } from "@/components/marketing/auth-forms";

export const metadata: Metadata = { title: "Sign up", description: "Create a Zee Telephonics BPO workspace and start a 14-day free trial." };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  return <SignupForm plan={plan} />;
}
