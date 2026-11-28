/**
 * Transport abstraction. In "mock" mode every call resolves against in-memory data
 * with a small artificial latency so loading states are visible. In "api" mode the
 * same calls go to NEXT_PUBLIC_API_BASE_URL — implement the endpoints and flip the env var.
 */
import { sleep } from "@/lib/utils";

export const DATA_SOURCE = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") as "mock" | "api";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function mock<T>(value: T | (() => T), latency = 350): Promise<T> {
  await sleep(latency + Math.random() * 250);
  const v = typeof value === "function" ? (value as () => T)() : value;
  return structuredClone(v);
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${path}`);
  return res.json() as Promise<T>;
}

/** Pick mock or HTTP implementation for a call. */
export function source<T>(mockImpl: () => Promise<T>, apiImpl: () => Promise<T>): Promise<T> {
  return DATA_SOURCE === "api" ? apiImpl() : mockImpl();
}
