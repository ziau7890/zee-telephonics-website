export type EmployeeStatus = "Active" | "On leave" | "Onboarding" | "Probation" | "Offboarding";
export type Shift = "Morning" | "Evening" | "Night" | "Flexible";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  team: string;
  location: string;
  shift: Shift;
  status: EmployeeStatus;
  joinDate: string;
  salary: number; // monthly, USD equivalent
  currency: "USD" | "PKR" | "PHP" | "GBP";
  skills: string[];
  performance: number; // 0-100
  attendanceRate: number; // %
  managerId?: string;
  accessRole: "Owner" | "Admin" | "Manager" | "Team Lead" | "Agent" | "Finance";
}

export type AttendanceStatus = "Present" | "Late" | "Absent" | "On leave" | "Remote";
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  shift: Shift;
  clockIn?: string;
  clockOut?: string;
  breakMinutes: number;
  hours: number;
  overtime: number;
  status: AttendanceStatus;
  device: "Desktop agent" | "Mobile" | "Office kiosk";
  site: string;
}

export type LeaveStatus = "Pending" | "Approved" | "Declined";
export interface LeaveRequest {
  id: string;
  employeeId: string;
  name: string;
  type: "Annual" | "Sick" | "Unpaid" | "Bereavement" | "Parental";
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
}

export type LeadStage = "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
export interface Lead {
  id: string;
  company: string;
  contact: string;
  title: string;
  email: string;
  value: number; // monthly contract value
  stage: LeadStage;
  source: "Website" | "Referral" | "LinkedIn" | "Outbound" | "Event" | "Partner";
  score: number;
  owner: string;
  industry: string;
  seats: number;
  nextFollowUp: string;
  createdAt: string;
  notes?: string;
}

export interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "note" | "task";
  subject: string;
  who: string;
  related: string;
  at: string;
  outcome?: string;
}

export type ClientStatus = "Active" | "Onboarding" | "At risk" | "Paused";
export interface Client {
  id: string;
  name: string;
  industry: string;
  country: string;
  accountManager: string;
  status: ClientStatus;
  monthlyValue: number;
  seats: number;
  health: number;
  csat: number;
  slaTarget: number;
  slaActual: number;
  services: string[];
  contractStart: string;
  renewalDate: string;
  primaryContact: { name: string; title: string; email: string; phone: string };
  billingCycle: "Monthly" | "Quarterly";
  currency: "USD" | "GBP" | "EUR" | "AUD";
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: "Inbound support" | "Outbound sales" | "Back office" | "Chat support" | "Lead generation" | "Technical support";
  status: "On track" | "At risk" | "Completed" | "Planning";
  progress: number;
  agents: number;
  lead: string;
  start: string;
  end: string;
  kpi: string;
}

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Partially paid" | "Overdue";
export interface InvoiceLine {
  description: string;
  qty: number;
  rate: number;
}
export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client: string;
  issueDate: string;
  dueDate: string;
  lines: InvoiceLine[];
  taxRate: number;
  discount: number;
  amount: number;
  paid: number;
  status: InvoiceStatus;
  recurring: boolean;
  currency: "USD" | "GBP" | "EUR" | "AUD";
}

export interface PayrollLine {
  employeeId: string;
  name: string;
  department: string;
  base: number;
  overtime: number;
  bonus: number;
  deductions: number;
  tax: number;
  net: number;
  currency: Employee["currency"];
  status: "Ready" | "Needs review" | "Paid" | "On hold";
}

export interface PayrollRun {
  id: string;
  period: string;
  payDate: string;
  employees: number;
  gross: number;
  net: number;
  tax: number;
  status: "Draft" | "Pending approval" | "Approved" | "Paid";
}

export interface MonthlyFinance {
  month: string;
  revenue: number;
  expenses: number;
  payroll: number;
  profit: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  account: string;
  category: string;
  type: "Credit" | "Debit";
  amount: number;
  reference: string;
}

export interface Notification {
  id: string;
  kind: "approval" | "invoice" | "leave" | "payroll" | "lead" | "system" | "announcement";
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  ip: string;
}
