import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD", opts: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0, ...opts }).format(value);
}

export function formatCompact(value: number, currency?: string) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
    ...(currency ? { style: "currency", currency } : {}),
  }).format(value);
}

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function formatDate(input: string | Date, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-US", opts).format(d);
}

export function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Deterministic PRNG so mock data is stable between server and client renders. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function downloadFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function toCSV<T extends object>(rows: T[], columns?: (keyof T)[]) {
  if (!rows.length) return "";
  const cols = columns ?? (Object.keys(rows[0]) as (keyof T)[]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc((r as Record<string, unknown>)[c as string])).join(","))].join("\n");
}

/** Renders HTML in a hidden iframe and opens the browser print dialog ("Save as PDF"). */
export function printHTML(title: string, body: string) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
    *{box-sizing:border-box}body{font:14px/1.5 -apple-system,Segoe UI,Inter,sans-serif;color:#0f172a;margin:40px}
    h1{font-size:22px;margin:0}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:left}
    th{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em}.r{text-align:right}.muted{color:#64748b}.tot td{font-weight:700;border-top:2px solid #0f172a}
    .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2563eb;padding-bottom:16px}.brand{font-weight:700;font-size:18px;color:#2563eb}
  </style></head><body>${body}</body></html>`);
  doc.close();
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 1000);
  }, 250);
}
