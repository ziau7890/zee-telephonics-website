/**
 * Service layer: the only place UI code gets data from.
 * Each method has a mock implementation (local data) and an API implementation (REST).
 * Swap backends by setting NEXT_PUBLIC_DATA_SOURCE=api, or replace a method body with Supabase calls.
 */
import * as db from "@/lib/mock/data";
import type { Invoice, Lead, LeadStage, LeaveStatus, Employee, PayrollRun } from "@/lib/mock/types";
import { mock, http, source } from "./client";

export const services = {
  dashboard: {
    overview: () =>
      source(
        () => mock({ kpis: db.kpis, finance: db.financeMonthly, productivity: db.productivityByDept, csat: db.csatTrend, alerts: db.alerts, activity: db.recentActivity, leadSources: db.leadSources, attendance: db.attendanceTrend }),
        () => http("/dashboard/overview")
      ),
  },

  team: {
    list: () => source(() => mock(db.employees), () => http<Employee[]>("/employees")),
    get: (id: string) => source(() => mock(db.employees.find((e) => e.id === id) ?? null), () => http<Employee | null>(`/employees/${id}`)),
    departments: () => source(() => mock(db.departments.map((d) => ({ ...d, headcount: db.employees.filter((e) => e.department === d.name).length }))), () => http("/departments")),
    create: (input: Omit<Employee, "id" | "performance" | "attendanceRate" | "skills" | "joinDate"> & { skills?: string[] }) =>
      source(
        () =>
          mock(() => {
            const e: Employee = { ...input, id: `EMP-${1001 + db.employees.length + Math.floor(Math.random() * 1000)}`, performance: 0, attendanceRate: 100, skills: input.skills ?? [], joinDate: new Date().toISOString() };
            db.employees.unshift(e);
            return e;
          }, 600),
        () => http<Employee>("/employees", { method: "POST", body: JSON.stringify(input) })
      ),
    updateStatus: (id: string, status: Employee["status"]) =>
      source(() => mock(() => { const e = db.employees.find((x) => x.id === id); if (e) e.status = status; return e; }), () => http(`/employees/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })),
  },

  attendance: {
    today: () => source(() => mock(db.attendanceToday), () => http("/attendance/today")),
    trend: () => source(() => mock(db.attendanceTrend), () => http("/attendance/trend")),
    leave: () => source(() => mock(db.leaveRequests), () => http("/leave-requests")),
    holidays: () => source(() => mock(db.holidays), () => http("/holidays")),
    decideLeave: (id: string, status: LeaveStatus) =>
      source(() => mock(() => { const r = db.leaveRequests.find((x) => x.id === id); if (r) r.status = status; return r; }, 400), () => http(`/leave-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })),
  },

  crm: {
    leads: () => source(() => mock(db.leads), () => http<Lead[]>("/leads")),
    activities: () => source(() => mock(db.activities), () => http("/activities")),
    moveLead: (id: string, stage: LeadStage) =>
      source(() => mock(() => { const l = db.leads.find((x) => x.id === id); if (l) l.stage = stage; return l; }, 150), () => http(`/leads/${id}`, { method: "PATCH", body: JSON.stringify({ stage }) })),
    createLead: (input: Omit<Lead, "id" | "createdAt" | "score">) =>
      source(
        () => mock(() => { const l: Lead = { ...input, id: `LD-${3000 + db.leads.length}`, createdAt: new Date().toISOString(), score: 55 }; db.leads.unshift(l); return l; }, 500),
        () => http<Lead>("/leads", { method: "POST", body: JSON.stringify(input) })
      ),
  },

  clients: {
    list: () => source(() => mock(db.clients), () => http("/clients")),
    get: (id: string) => source(() => mock(db.clients.find((c) => c.id === id) ?? null), () => http(`/clients/${id}`)),
    projects: () => source(() => mock(db.projects), () => http("/projects")),
  },

  payroll: {
    runs: () => source(() => mock(db.payrollRuns), () => http<PayrollRun[]>("/payroll/runs")),
    lines: () => source(() => mock(db.payrollLines), () => http("/payroll/lines")),
    approve: (id: string) =>
      source(() => mock(() => { const r = db.payrollRuns.find((x) => x.id === id); if (r) r.status = "Approved"; return r; }, 900), () => http(`/payroll/runs/${id}/approve`, { method: "POST" })),
  },

  finance: {
    summary: () => source(() => mock({ monthly: db.financeMonthly, categories: db.expenseCategories, budgets: db.budgets }), () => http("/finance/summary")),
    transactions: () => source(() => mock(db.transactions), () => http("/finance/transactions")),
    audit: () => source(() => mock(db.auditLog), () => http("/audit-log")),
  },

  invoices: {
    list: () => source(() => mock(db.invoices), () => http<Invoice[]>("/invoices")),
    create: (input: Omit<Invoice, "id" | "number" | "paid">) =>
      source(
        () => mock(() => { const inv: Invoice = { ...input, id: `inv-${Date.now()}`, number: `INV-2026-${1161 + db.invoices.length}`, paid: 0 }; db.invoices.unshift(inv); return inv; }, 700),
        () => http<Invoice>("/invoices", { method: "POST", body: JSON.stringify(input) })
      ),
    update: (id: string, patch: Partial<Invoice>) =>
      source(() => mock(() => { const i = db.invoices.find((x) => x.id === id); if (i) Object.assign(i, patch); return i; }, 400), () => http(`/invoices/${id}`, { method: "PATCH", body: JSON.stringify(patch) })),
  },

  notifications: {
    list: () => source(() => mock(db.notifications, 200), () => http("/notifications")),
  },

  marketing: {
    requestDemo: (payload: Record<string, unknown>) => source(() => mock({ ok: true, ref: `DEMO-${Math.floor(Math.random() * 90000 + 10000)}`, payload }, 900), () => http("/demo-requests", { method: "POST", body: JSON.stringify(payload) })),
    contact: (payload: Record<string, unknown>) => source(() => mock({ ok: true, payload }, 800), () => http("/contact", { method: "POST", body: JSON.stringify(payload) })),
  },
};

export type Services = typeof services;
