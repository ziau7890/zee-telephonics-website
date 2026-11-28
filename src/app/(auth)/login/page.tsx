import type { Metadata } from "next";
import { LoginForm } from "@/components/marketing/auth-forms";

export const metadata: Metadata = { title: "Log in", description: "Log in to your Zee Telephonics BPO workspace." };

export default function LoginPage() {
  return <LoginForm />;
}
