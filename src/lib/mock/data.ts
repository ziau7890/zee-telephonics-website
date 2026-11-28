/**
 * Realistic, deterministic sample data for the Zee Telephonics BPO demo workspace.
 * Every generator uses a seeded PRNG so lists are stable across reloads.
 * Replace by pointing the service layer (src/lib/services) at a real API.
 */
import { seeded } from "@/lib/utils";
import type {
  Activity, AttendanceRecord, AuditEvent, Client, Employee, Invoice, Lead, LeaveRequest,
  MonthlyFinance, Notification, PayrollLine, PayrollRun, Project, Transaction, Shift, EmployeeStatus,
} from "./types";

const rand = seeded(20261127);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => Math.round(min + rand() * (max - min));

const DAY = 86_400_000;
const today = new Date();
today.setHours(9, 0, 0, 0);
export const REF_DATE = today;
export const daysFromNow = (n: number) => new Date(today.getTime() + n * DAY).toISOString();

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

export const departments = [
  { name: "Customer Support", head: "Sarah Ahmed", color: "#3B82F6" },
  { name: "Sales & Lead Gen", head: "Omar Khan", color: "#8B5CF6" },
  { name: "Technical Support", head: "Bilal Raza", color: "#22D3EE" },
  { name: "Back Office", head: "Maria Santos", color: "#10B981" },
  { name: "Quality Assurance", head: "Aisha Malik", color: "#F59E0B" },
  { name: "Client Success", head: "Emily Johnson", color: "#EC4899" },
  { name: "Finance", head: "Daniel Lee", color: "#14B8A6" },
  { name: "HR & Admin", head: "Hina Qureshi", color: "#64748B" },
] as const;

const teamsByDept: Record<string, string[]> = {
  "Customer Support": ["Voice Team A", "Voice Team B", "Chat & Email", "Escalations"],
  "Sales & Lead Gen": ["Outbound SDR", "Appointment Setting", "Inbound Sales"],
  "Technical Support": ["Tier 1 Helpdesk", "Tier 2 Specialists"],
  "Back Office": ["Data Entry", "Claims Processing", "Order Management"],
  "Quality Assurance": ["Call Audit", "Process QA"],
  "Client Success": ["Account Management"],
  Finance: ["Billing & Payroll"],
  "HR & Admin": ["People Ops", "Recruitment"],
};

const rolesByDept: Record<string, string[]> = {
  "Customer Support": ["Customer Support Agent", "Senior Support Agent", "Team Lead"],
  "Sales & Lead Gen": ["Sales Development Rep", "Appointment Setter", "Account Executive", "Team Lead"],
  "Technical Support": ["Helpdesk Technician", "Technical Support Specialist"],
  "Back Office": ["Data Processing Associate", "Claims Associate", "Back Office Executive"],
  "Quality Assurance": ["Quality Analyst", "QA Coach"],
  "Client Success": ["Client Success Manager", "Account Coordinator"],
  Finance: ["Payroll Officer", "Accounts Executive"],
  "HR & Admin": ["HR Generalist", "Talent Acquisition Specialist"],
};

const skillsPool = ["English C1", "Arabic", "Spanish", "Zendesk", "Salesforce", "HubSpot", "Five9", "Genesys", "Excel", "QuickBooks", "Upselling", "De-escalation", "Medical billing", "HIPAA awareness", "Data entry 70 WPM", "Chat multitasking", "Cold calling", "Appointment setting", "Tier 2 networking", "Coaching"];
const firstNames = ["Ahmed", "Fatima", "Usman", "Zara", "Hamza", "Ayesha", "Ali", "Sana", "Hassan", "Mahnoor", "Junaid", "Iqra", "Faisal", "Noor", "Rizwan", "Maryam", "Kamran", "Areeba", "Tariq", "Mehwish", "Carlo", "Angelica", "Paolo", "Kristine", "Mark", "Jasmine", "Rafael", "Bea", "James", "Olivia", "Ethan", "Grace", "Lucas", "Chloe", "Ryan", "Sophie", "Adnan", "Rabia", "Shahzaib", "Laiba"];
const lastNames = ["Hussain", "Siddiqui", "Chaudhry", "Sheikh", "Butt", "Iqbal", "Mirza", "Abbasi", "Farooq", "Javed", "Reyes", "Cruz", "Bautista", "Garcia", "Mendoza", "Villanueva", "Walker", "Bennett", "Carter", "Hughes", "Zafar", "Nawaz", "Anwar", "Haider"];
const locations = ["Karachi HQ", "Lahore Center", "Islamabad Hub", "Manila Site", "Remote"];

const leaders: Partial<Employee>[] = [
  { name: "Sarah Ahmed", role: "Operations Manager", department: "Customer Support", accessRole: "Admin", salary: 2400, performance: 95 },
  { name: "Omar Khan", role: "Team Lead", department: "Sales & Lead Gen", accessRole: "Team Lead", salary: 1500, performance: 92 },
  { name: "Emily Johnson", role: "Client Success Manager", department: "Client Success", accessRole: "Manager", salary: 4200, performance: 94, location: "Remote", currency: "GBP" },
  { name: "Daniel Lee", role: "Finance Administrator", department: "Finance", accessRole: "Finance", salary: 2200, performance: 91 },
  { name: "Aisha Malik", role: "Quality Analyst", department: "Quality Assurance", accessRole: "Manager", salary: 1200, performance: 96 },
  { name: "Bilal Raza", role: "Technical Support Manager", department: "Technical Support", accessRole: "Manager", salary: 2000, performance: 89 },
  { name: "Maria Santos", role: "Back Office Supervisor", department: "Back Office", accessRole: "Manager", salary: 1300, performance: 90, location: "Manila Site", currency: "PHP" },
  { name: "Hina Qureshi", role: "HR Manager", department: "HR & Admin", accessRole: "Admin", salary: 1800, performance: 88 },
];

function makeEmployees(): Employee[] {
  const list: Employee[] = [];
  const used = new Set<string>();
  leaders.forEach((l, i) => {
    used.add(l.name!);
    const dept = l.department!;
    list.push({
      id: `EMP-${String(1001 + i)}`,
      name: l.name!,
      email: `${l.name!.toLowerCase().replace(" ", ".")}@zeetelephonics.com`,
      phone: `+92 300 ${between(1000000, 9999999)}`,
      role: l.role!,
      department: dept,
      team: teamsByDept[dept][0],
      location: l.location ?? (i % 2 ? "Lahore Center" : "Karachi HQ"),
      shift: "Morning",
      status: "Active",
      joinDate: daysFromNow(-between(900, 2200)),
      salary: l.salary!,
      currency: (l.currency as Employee["currency"]) ?? "PKR",
      skills: [pick(skillsPool), pick(skillsPool), "Coaching"],
      performance: l.performance!,
      attendanceRate: between(970, 995) / 10,
      accessRole: l.accessRole as Employee["accessRole"],
    });
  });
  const weights = [84, 48, 30, 38, 14, 10, 8, 16];
  departments.forEach((d, di) => {
    const count = weights[di] - (di < leaders.length ? 1 : 0);
    for (let k = 0; k < count && list.length < 248; k++) {
      let name = "";
      do name = `${pick(firstNames)} ${pick(lastNames)}`; while (used.has(name));
      used.add(name);
      const roles = rolesByDept[d.name];
      const statusRoll = rand();
      const status: EmployeeStatus = statusRoll > 0.95 ? "On leave" : statusRoll > 0.91 ? "Onboarding" : statusRoll > 0.87 ? "Probation" : statusRoll > 0.86 ? "Offboarding" : "Active";
      const location = d.name === "Back Office" && rand() > 0.4 ? "Manila Site" : pick(locations);
      const shift: Shift = pick(["Morning", "Evening", "Night", "Night", "Evening", "Flexible"] as const);
      const role = roles[Math.min(roles.length - 1, Math.floor(rand() * rand() * roles.length * 1.4))];
      list.push({
        id: `EMP-${1001 + list.length}`,
        name,
        email: `${name.toLowerCase().replace(" ", ".")}@zeetelephonics.com`,
        phone: location === "Manila Site" ? `+63 917 ${between(100, 999)} ${between(1000, 9999)}` : `+92 3${between(0, 4)}${between(0, 9)} ${between(1000000, 9999999)}`,
        role,
        department: d.name,
        team: pick(teamsByDept[d.name]),
        location,
        shift,
        status,
        joinDate: daysFromNow(-between(20, 1500)),
        salary: role.includes("Lead") || role.includes("Senior") || role.includes("Specialist") || role.includes("Executive") ? between(430, 700) : between(260, 430),
        currency: location === "Manila Site" ? "PHP" : "PKR",
        skills: Array.from(new Set([pick(skillsPool), pick(skillsPool), pick(skillsPool)])),
        performance: between(68, 98),
        attendanceRate: between(905, 1000) / 10,
        managerId: list.find((e) => e.department === d.name)?.id,
        accessRole: role === "Team Lead" ? "Team Lead" : d.name === "Finance" ? "Finance" : "Agent",
      });
    }
  });
  return list.slice(0, 248);
}

export const employees: Employee[] = makeEmployees();

/* ------------------------------------------------------------------ */
/* Clients & projects                                                  */
/* ------------------------------------------------------------------ */

const clientSeeds: [string, string, string][] = [
  ["Northstar Retail", "Retail & eCommerce", "United States"],
  ["Vertex Health", "Healthcare", "United States"],
  ["BrightPath Education", "Education", "United Kingdom"],
  ["Nova Support Services", "Technology", "Canada"],
  ["Harbor Telecom", "Telecommunications", "United Kingdom"],
  ["Meridian Insurance Group", "Insurance", "United States"],
  ["Pulse Fitness Co.", "Consumer services", "Australia"],
  ["Atlas Logistics", "Logistics", "Germany"],
  ["Lumen Energy", "Utilities", "United Kingdom"],
  ["Crestline Realty", "Real estate", "United States"],
  ["Summit Travel Group", "Travel & hospitality", "UAE"],
  ["Evergreen Dental Network", "Healthcare", "United States"],
  ["Kite Payments", "Fintech", "United Kingdom"],
  ["Orbit Home Services", "Home services", "United States"],
  ["Silverline Auto", "Automotive", "Canada"],
  ["Cobalt SaaS Inc.", "Technology", "United States"],
  ["Riverstone Legal", "Legal services", "United Kingdom"],
  ["Peak Solar Solutions", "Energy", "Australia"],
  ["Greenleaf Grocers", "Retail & eCommerce", "United States"],
  ["Apex Mortgage", "Financial services", "United States"],
  ["Bluewave Internet", "Telecommunications", "Canada"],
  ["Mosaic Marketplace", "Retail & eCommerce", "UAE"],
  ["Sterling Pharmacy", "Healthcare", "United Kingdom"],
  ["Horizon Edu Online", "Education", "United States"],
  ["Ironclad Security", "Security services", "United States"],
  ["Willow Pet Care", "Consumer services", "United States"],
  ["Quantum Labs", "Technology", "Germany"],
  ["Coastal Rentals", "Travel & hospitality", "Australia"],
  ["Prime Debt Advisors", "Financial services", "United Kingdom"],
  ["Urban Bites Delivery", "Food delivery", "UAE"],
  ["Clearview Optics", "Retail & eCommerce", "Canada"],
  ["Redwood Property Mgmt", "Real estate", "United States"],
  ["Fable Books", "Media", "United Kingdom"],
  ["Granite Construction Supply", "Construction", "United States"],
  ["Helix Biotech", "Healthcare", "United States"],
  ["Trident Freight", "Logistics", "UAE"],
];

const servicesPool = ["Inbound voice support", "Live chat", "Email support", "Outbound sales", "Appointment setting", "Lead qualification", "Data entry", "Claims processing", "Order management", "Tier 1 IT helpdesk", "Quality monitoring", "After-hours coverage"];
const managers = ["Emily Johnson", "Sarah Ahmed", "Omar Khan", "Bilal Raza"];
const contactFirst = ["Jessica", "Michael", "Priya", "Thomas", "Laura", "David", "Rachel", "Kevin", "Hannah", "Andrew", "Megan", "Chris"];
const contactLast = ["Morgan", "Patel", "Reed", "Collins", "Nguyen", "Fischer", "Brooks", "Turner", "Ward", "Shaw"];

function makeClients(): Client[] {
  // Weights tuned so the monthly book totals roughly $184k across 36 clients.
  const values = [16800, 14200, 11400, 9800, 8600, 8200, 7400, 7100, 6800, 6500, 6200, 5900, 5600, 5300, 5100, 4900, 4700, 4500, 4300, 4100, 3900, 3700, 3500, 3300, 3100, 2900, 2800, 2600, 2400, 2300, 2100, 1900, 1800, 1700, 1500, 1520];
  return clientSeeds.map(([name, industry, country], i) => {
    const status = i === 5 || i === 17 || i === 28 ? "At risk" : i === 33 || i === 34 ? "Onboarding" : i === 30 ? "Paused" : "Active";
    const health = status === "At risk" ? between(48, 62) : status === "Onboarding" ? between(72, 82) : between(78, 98);
    const cf = pick(contactFirst), cl = pick(contactLast);
    const domain = name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 14);
    return {
      id: `CL-${String(i + 1).padStart(3, "0")}`,
      name,
      industry,
      country,
      accountManager: managers[i % managers.length],
      status,
      monthlyValue: values[i],
      seats: Math.max(2, Math.round(values[i] / 720)),
      health,
      csat: status === "At risk" ? between(84, 89) : between(91, 99),
      slaTarget: 90,
      slaActual: status === "At risk" ? between(82, 88) : between(90, 98),
      services: Array.from(new Set([pick(servicesPool), pick(servicesPool), pick(servicesPool)])),
      contractStart: daysFromNow(-between(120, 1100)),
      renewalDate: daysFromNow(between(12, 330)),
      primaryContact: { name: `${cf} ${cl}`, title: pick(["VP Customer Experience", "Head of Operations", "Director of Support", "COO", "Sales Director"]), email: `${cf.toLowerCase()}.${cl.toLowerCase()}@${domain}.com`, phone: `+1 (555) ${between(200, 899)}-${between(1000, 9999)}` },
      billingCycle: i % 5 === 0 ? "Quarterly" : "Monthly",
      currency: country === "United Kingdom" ? "GBP" : country === "Germany" ? "EUR" : country === "Australia" ? "AUD" : "USD",
    };
  });
}

export const clients: Client[] = makeClients();

export const projects: Project[] = [
  { id: "PRJ-01", name: "Holiday peak voice support", client: "Northstar Retail", type: "Inbound support", status: "On track", progress: 72, agents: 34, lead: "Sarah Ahmed", start: daysFromNow(-40), end: daysFromNow(45), kpi: "AHT 5:40 · FCR 81%" },
  { id: "PRJ-02", name: "Patient scheduling desk", client: "Vertex Health", type: "Inbound support", status: "On track", progress: 64, agents: 22, lead: "Omar Khan", start: daysFromNow(-90), end: daysFromNow(120), kpi: "Booked 1,284 appts" },
  { id: "PRJ-03", name: "Enrollment outreach Q4", client: "BrightPath Education", type: "Outbound sales", status: "At risk", progress: 41, agents: 12, lead: "Omar Khan", start: daysFromNow(-35), end: daysFromNow(25), kpi: "Conversion 6.2% vs 8% goal" },
  { id: "PRJ-04", name: "Tier 1 helpdesk migration", client: "Nova Support Services", type: "Technical support", status: "On track", progress: 88, agents: 16, lead: "Bilal Raza", start: daysFromNow(-120), end: daysFromNow(14), kpi: "Resolution 78%" },
  { id: "PRJ-05", name: "Claims backlog clearance", client: "Meridian Insurance Group", type: "Back office", status: "At risk", progress: 55, agents: 18, lead: "Maria Santos", start: daysFromNow(-60), end: daysFromNow(10), kpi: "3,410 of 6,200 claims" },
  { id: "PRJ-06", name: "Fiber upgrade campaign", client: "Harbor Telecom", type: "Outbound sales", status: "On track", progress: 58, agents: 20, lead: "Omar Khan", start: daysFromNow(-28), end: daysFromNow(62), kpi: "412 upgrades closed" },
  { id: "PRJ-07", name: "24/7 chat coverage", client: "Kite Payments", type: "Chat support", status: "On track", progress: 93, agents: 14, lead: "Sarah Ahmed", start: daysFromNow(-200), end: daysFromNow(165), kpi: "CSAT 96.1%" },
  { id: "PRJ-08", name: "B2B appointment setting", client: "Cobalt SaaS Inc.", type: "Lead generation", status: "On track", progress: 47, agents: 8, lead: "Omar Khan", start: daysFromNow(-21), end: daysFromNow(70), kpi: "96 meetings booked" },
  { id: "PRJ-09", name: "Order management desk", client: "Mosaic Marketplace", type: "Back office", status: "Completed", progress: 100, agents: 10, lead: "Maria Santos", start: daysFromNow(-180), end: daysFromNow(-5), kpi: "99.2% accuracy" },
  { id: "PRJ-10", name: "Solar lead qualification", client: "Peak Solar Solutions", type: "Lead generation", status: "Planning", progress: 12, agents: 6, lead: "Omar Khan", start: daysFromNow(7), end: daysFromNow(97), kpi: "Kickoff in 7 days" },
];

/* ------------------------------------------------------------------ */
/* CRM                                                                 */
/* ------------------------------------------------------------------ */

const leadCompanies = ["Orchid Wellness", "Brightline Fiber", "Keystone Lending", "Velvet Home Goods", "Polar Cold Chain", "Juniper Clinics", "Tandem Bikes", "Skyway Airlines Cargo", "Maple Leaf Insurance", "Cinder Gaming", "Pioneer HVAC", "Lattice Software", "Amber Hotels", "Nimbus Cloud", "Driftwood Furniture", "Echo Telehealth", "Falcon Security", "Gather Events", "Ridge Outdoor", "Sapphire Jewelers", "Bolt EV Charging", "Cedar Senior Living", "Ember Coffee Roasters", "Prism Analytics", "Harvest Meal Kits", "Vanta Property", "Zenith Pharmacy", "Coral Cruises", "Northwind Traders", "Quill Legal", "Sparrow Mobile", "Terra Landscaping"];
const stages = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"] as const;
const stageWeights = [6, 6, 6, 5, 4, 3, 2];
const owners = ["Omar Khan", "Emily Johnson", "Zara Hussain", "Ryan Carter"];

function makeLeads(): Lead[] {
  const out: Lead[] = [];
  let idx = 0;
  stages.forEach((stage, si) => {
    for (let k = 0; k < stageWeights[si]; k++) {
      const company = leadCompanies[idx % leadCompanies.length];
      const cf = pick(contactFirst), cl = pick(contactLast);
      const seats = between(4, 40);
      out.push({
        id: `LD-${String(2100 + idx)}`,
        company,
        contact: `${cf} ${cl}`,
        title: pick(["COO", "VP Operations", "Head of CX", "Founder", "Director of Sales", "Procurement Lead"]),
        email: `${cf.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
        value: seats * between(620, 880),
        stage,
        source: pick(["Website", "Referral", "LinkedIn", "Outbound", "Event", "Partner"] as const),
        score: stage === "Lost" ? between(20, 45) : Math.min(99, between(40, 70) + si * 6),
        owner: owners[idx % owners.length],
        industry: pick(["Healthcare", "Retail & eCommerce", "Fintech", "Telecommunications", "Travel & hospitality", "Technology", "Insurance"]),
        seats,
        nextFollowUp: daysFromNow(between(-2, 9)),
        createdAt: daysFromNow(-between(3, 80)),
      });
      idx++;
    }
  });
  return out;
}

export const leads: Lead[] = makeLeads();

export const activities: Activity[] = [
  { id: "A1", type: "call", subject: "Discovery call: 24/7 chat coverage", who: "Omar Khan", related: "Juniper Clinics", at: daysFromNow(-0.08), outcome: "Qualified · 18 seats" },
  { id: "A2", type: "email", subject: "Sent pricing for 12-seat outbound pod", who: "Zara Hussain", related: "Brightline Fiber", at: daysFromNow(-0.2) },
  { id: "A3", type: "meeting", subject: "Solution walkthrough with ops leadership", who: "Emily Johnson", related: "Keystone Lending", at: daysFromNow(-0.4), outcome: "Proposal requested" },
  { id: "A4", type: "note", subject: "Prefers Manila site for APAC hours", who: "Ryan Carter", related: "Amber Hotels", at: daysFromNow(-0.9) },
  { id: "A5", type: "task", subject: "Send security questionnaire answers", who: "Emily Johnson", related: "Echo Telehealth", at: daysFromNow(-1.2) },
  { id: "A6", type: "call", subject: "Negotiation: volume discount at 30 seats", who: "Omar Khan", related: "Nimbus Cloud", at: daysFromNow(-1.6), outcome: "Pending legal review" },
  { id: "A7", type: "email", subject: "Follow-up after Dubai CX Summit", who: "Ryan Carter", related: "Coral Cruises", at: daysFromNow(-2.1) },
  { id: "A8", type: "meeting", subject: "Pilot results review", who: "Zara Hussain", related: "Lattice Software", at: daysFromNow(-3) , outcome: "Won · 14 seats" },
];

/* ------------------------------------------------------------------ */
/* Attendance                                                          */
/* ------------------------------------------------------------------ */

const fmtTime = (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

function makeAttendance(): AttendanceRecord[] {
  const shiftStart: Record<Shift, number> = { Morning: 8, Evening: 16, Night: 21, Flexible: 10 };
  return employees.map((e, i) => {
    const r = rand();
    let status: AttendanceRecord["status"] = e.status === "On leave" ? "On leave" : r > 0.975 ? "Absent" : r > 0.9 ? "Late" : e.location === "Remote" ? "Remote" : "Present";
    if (i < 5) status = i === 1 ? "Remote" : "Present";
    const start = shiftStart[e.shift];
    const lateBy = status === "Late" ? between(6, 38) : between(-12, 3);
    const inMin = start * 60 + lateBy;
    const worked = status === "Absent" || status === "On leave" ? 0 : between(450, 590);
    const outMin = inMin + worked + 60;
    const breakMinutes = worked ? between(38, 72) : 0;
    return {
      id: `ATT-${i}`,
      employeeId: e.id,
      name: e.name,
      department: e.department,
      shift: e.shift,
      clockIn: worked ? fmtTime(Math.floor((inMin / 60) % 24), ((inMin % 60) + 60) % 60) : undefined,
      clockOut: worked && rand() > 0.35 ? fmtTime(Math.floor((outMin / 60) % 24), outMin % 60) : undefined,
      breakMinutes,
      hours: +(worked / 60).toFixed(1),
      overtime: worked > 540 ? +((worked - 540) / 60).toFixed(1) : 0,
      status,
      device: e.location === "Remote" ? "Desktop agent" : rand() > 0.8 ? "Mobile" : "Office kiosk",
      site: e.location,
    };
  });
}

export const attendanceToday: AttendanceRecord[] = makeAttendance();

export const attendanceTrend = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(today.getTime() - (29 - i) * DAY);
  const weekend = d.getDay() === 0;
  const base = weekend ? 93.2 : 96.4;
  return {
    date: d.toISOString().slice(0, 10),
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    rate: +(base + (rand() - 0.4) * 2.4).toFixed(1),
    late: between(4, 16),
    overtime: between(18, 64),
  };
});

export const leaveRequests: LeaveRequest[] = [
  { id: "LV-301", employeeId: employees[14].id, name: employees[14].name, type: "Annual", from: daysFromNow(4), to: daysFromNow(8), days: 5, reason: "Family wedding in Multan", status: "Pending" },
  { id: "LV-302", employeeId: employees[33].id, name: employees[33].name, type: "Sick", from: daysFromNow(0), to: daysFromNow(1), days: 2, reason: "Fever, doctor's note attached", status: "Pending" },
  { id: "LV-303", employeeId: employees[61].id, name: employees[61].name, type: "Annual", from: daysFromNow(12), to: daysFromNow(16), days: 5, reason: "Year-end travel", status: "Pending" },
  { id: "LV-304", employeeId: employees[90].id, name: employees[90].name, type: "Parental", from: daysFromNow(20), to: daysFromNow(49), days: 30, reason: "Paternity leave", status: "Approved" },
  { id: "LV-305", employeeId: employees[120].id, name: employees[120].name, type: "Unpaid", from: daysFromNow(2), to: daysFromNow(3), days: 2, reason: "University exams", status: "Pending" },
  { id: "LV-306", employeeId: employees[150].id, name: employees[150].name, type: "Bereavement", from: daysFromNow(-3), to: daysFromNow(-1), days: 3, reason: "Bereavement", status: "Approved" },
  { id: "LV-307", employeeId: employees[175].id, name: employees[175].name, type: "Annual", from: daysFromNow(-10), to: daysFromNow(-8), days: 3, reason: "Personal", status: "Declined" },
];

export const holidays = [
  { date: "2026-12-25", name: "Quaid-e-Azam Day / Christmas", sites: "All sites" },
  { date: "2026-12-30", name: "Rizal Day", sites: "Manila Site" },
  { date: "2027-01-01", name: "New Year's Day", sites: "All sites" },
  { date: "2027-02-05", name: "Kashmir Solidarity Day", sites: "Pakistan sites" },
  { date: "2027-03-23", name: "Pakistan Day", sites: "Pakistan sites" },
];

/* ------------------------------------------------------------------ */
/* Finance                                                             */
/* ------------------------------------------------------------------ */

const monthLabel = (offset: number) => {
  const d = new Date(today.getFullYear(), today.getMonth() - offset, 1);
  return d.toLocaleDateString("en-US", { month: "short" });
};

export const financeMonthly: MonthlyFinance[] = Array.from({ length: 12 }, (_, i) => {
  const offset = 11 - i;
  const growth = 1 - offset * 0.028;
  const revenue = Math.round(184620 * growth + (rand() - 0.5) * 6000);
  const payroll = Math.round(revenue * (0.47 + rand() * 0.03));
  const expenses = Math.round(payroll + revenue * (0.18 + rand() * 0.04));
  return { month: monthLabel(offset), revenue: offset === 0 ? 184620 : revenue, payroll, expenses, profit: (offset === 0 ? 184620 : revenue) - expenses };
});

export const expenseCategories = [
  { name: "Payroll & benefits", value: 89400, color: "#3B82F6" },
  { name: "Facilities & rent", value: 14200, color: "#8B5CF6" },
  { name: "Telephony & licenses", value: 11800, color: "#22D3EE" },
  { name: "IT & infrastructure", value: 7600, color: "#10B981" },
  { name: "Recruitment & training", value: 4900, color: "#F59E0B" },
  { name: "Other", value: 3300, color: "#64748B" },
];

export const budgets = [
  { category: "Telephony & licenses", budget: 12500, spent: 11800 },
  { category: "Recruitment & training", budget: 6000, spent: 4900 },
  { category: "IT & infrastructure", budget: 7000, spent: 7600 },
  { category: "Facilities & rent", budget: 14500, spent: 14200 },
  { category: "Marketing", budget: 4000, spent: 2150 },
];

const txnTemplates: [string, string, string, Transaction["type"], number, number][] = [
  ["Client payment received", "Accounts Receivable", "Revenue", "Credit", 2400, 16800],
  ["Five9 seat licenses", "Accounts Payable", "Telephony & licenses", "Debit", 1800, 4200],
  ["Karachi HQ rent", "Operating", "Facilities & rent", "Debit", 6200, 6200],
  ["AWS infrastructure", "Operating", "IT & infrastructure", "Debit", 900, 2100],
  ["Recruitment drive: Lahore", "Operating", "Recruitment & training", "Debit", 400, 1600],
  ["Internet & leased lines", "Accounts Payable", "Telephony & licenses", "Debit", 700, 1900],
  ["Payroll transfer", "Payroll", "Payroll & benefits", "Debit", 38000, 46000],
  ["Withholding tax deposit", "Tax", "Taxes", "Debit", 3200, 5400],
];

export const transactions: Transaction[] = Array.from({ length: 40 }, (_, i) => {
  const t = txnTemplates[i % txnTemplates.length];
  const client = clients[i % clients.length].name;
  return {
    id: `TXN-${8800 + i}`,
    date: daysFromNow(-Math.floor(i * 0.9)),
    description: t[0] === "Client payment received" ? `Payment: ${client}` : t[0],
    account: t[1],
    category: t[2],
    type: t[3],
    amount: between(t[4], t[5]),
    reference: `${t[3] === "Credit" ? "RCPT" : "BILL"}-${between(10000, 99999)}`,
  };
});

export const auditLog: AuditEvent[] = [
  { id: "AU-1", actor: "Daniel Lee", action: "Approved payroll run", target: "November 2026 · 248 employees", at: daysFromNow(-0.1), ip: "39.48.112.20" },
  { id: "AU-2", actor: "Sarah Ahmed", action: "Changed role permissions", target: "Team Lead → can approve overtime", at: daysFromNow(-0.3), ip: "39.48.112.21" },
  { id: "AU-3", actor: "Emily Johnson", action: "Sent invoice", target: "INV-2026-1142 · Vertex Health", at: daysFromNow(-0.6), ip: "81.2.69.160" },
  { id: "AU-4", actor: "Hina Qureshi", action: "Started onboarding", target: "6 new hires · Voice Team B", at: daysFromNow(-1.1), ip: "39.48.112.40" },
  { id: "AU-5", actor: "System", action: "Nightly backup completed", target: "All workspaces · 2.4 GB", at: daysFromNow(-1.4), ip: "—" },
  { id: "AU-6", actor: "Daniel Lee", action: "Exported general ledger", target: "Q3 2026 · CSV", at: daysFromNow(-2), ip: "39.48.112.20" },
  { id: "AU-7", actor: "Zia Ullah", action: "Enabled SSO enforcement", target: "Workspace security", at: daysFromNow(-4), ip: "39.48.100.2" },
];

/* ------------------------------------------------------------------ */
/* Invoicing                                                           */
/* ------------------------------------------------------------------ */

function makeInvoices(): Invoice[] {
  const out: Invoice[] = [];
  for (let i = 0; i < 32; i++) {
    const c = clients[i % clients.length];
    const issue = -Math.floor(i * 2.6) - 1;
    const seats = c.seats;
    const lines = [
      { description: `${c.services[0]} · ${seats} dedicated agents`, qty: seats, rate: Math.round((c.monthlyValue * 0.9) / seats) },
      { description: "Quality monitoring & reporting", qty: 1, rate: Math.round(c.monthlyValue * 0.1) },
    ];
    const sub = lines.reduce((a, l) => a + l.qty * l.rate, 0);
    const taxRate = c.country === "United Kingdom" ? 0 : 0;
    const discount = i % 7 === 0 ? Math.round(sub * 0.05) : 0;
    const amount = sub - discount + Math.round(sub * taxRate);
    const due = issue + (c.billingCycle === "Quarterly" ? 30 : 15);
    let status: Invoice["status"];
    let paid = 0;
    if (i < 3) status = "Draft";
    else if (due < -2 && i % 4 === 1) { status = "Overdue"; }
    else if (i % 6 === 2) { status = "Partially paid"; paid = Math.round(amount * 0.5); }
    else if (due >= 0) status = "Sent";
    else { status = "Paid"; paid = amount; }
    out.push({
      id: `inv-${i}`,
      number: `INV-2026-${1160 - i}`,
      clientId: c.id,
      client: c.name,
      issueDate: daysFromNow(issue),
      dueDate: daysFromNow(due),
      lines,
      taxRate,
      discount,
      amount,
      paid,
      status,
      recurring: i % 3 !== 0,
      currency: c.currency,
    });
  }
  return out;
}

export const invoices: Invoice[] = makeInvoices();

/* ------------------------------------------------------------------ */
/* Payroll                                                             */
/* ------------------------------------------------------------------ */

export const payrollLines: PayrollLine[] = employees.map((e) => {
  const overtime = rand() > 0.6 ? between(12, 70) : 0;
  const bonus = e.performance > 92 ? between(25, 90) : rand() > 0.85 ? between(15, 45) : 0;
  const gross = e.salary + overtime + bonus;
  const tax = Math.round(gross * (e.salary > 1500 ? 0.12 : 0.04));
  const deductions = Math.round(e.salary * 0.03) + (e.status === "On leave" ? between(30, 90) : 0);
  const r = rand();
  return {
    employeeId: e.id,
    name: e.name,
    department: e.department,
    base: e.salary,
    overtime,
    bonus,
    deductions,
    tax,
    net: gross - tax - deductions,
    currency: e.currency,
    status: e.status === "Offboarding" ? "On hold" : r > 0.93 ? "Needs review" : "Ready",
  };
});

const payrollTotal = payrollLines.reduce((a, l) => ({ gross: a.gross + l.base + l.overtime + l.bonus, net: a.net + l.net, tax: a.tax + l.tax }), { gross: 0, net: 0, tax: 0 });

export const payrollRuns: PayrollRun[] = [
  { id: "PR-2611", period: monthPeriod(0), payDate: daysFromNow(3), employees: 248, gross: payrollTotal.gross, net: payrollTotal.net, tax: payrollTotal.tax, status: "Pending approval" },
  ...Array.from({ length: 5 }, (_, i) => {
    const f = 1 - (i + 1) * 0.025;
    return { id: `PR-${2610 - i}`, period: monthPeriod(i + 1), payDate: daysFromNow(-27 - i * 30), employees: 248 - (i + 1) * 4, gross: Math.round(payrollTotal.gross * f), net: Math.round(payrollTotal.net * f), tax: Math.round(payrollTotal.tax * f), status: "Paid" as const };
  }),
];

function monthPeriod(offset: number) {
  const d = new Date(today.getFullYear(), today.getMonth() - offset, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/* KPIs, productivity, notifications                                   */
/* ------------------------------------------------------------------ */

export const kpis = {
  activeEmployees: 248,
  activeClients: 36,
  monthlyRevenue: 184620,
  attendanceRate: 96.8,
  leadConversion: 28.4,
  outstandingInvoices: 42800,
  clientSatisfaction: 94.6,
  payrollThisMonth: payrollTotal.net,
  profit: financeMonthly[11].profit,
  productivity: 87.3,
};

export const productivityByDept = departments.slice(0, 6).map((d) => ({
  department: d.name.replace(" & Lead Gen", "").replace("Customer ", "Cust. ").replace("Technical", "Tech").replace("Quality Assurance", "QA"),
  full: d.name,
  utilization: between(78, 93),
  target: 85,
  color: d.color,
}));

export const csatTrend = Array.from({ length: 12 }, (_, i) => ({ month: monthLabel(11 - i), csat: +(91.2 + i * 0.32 + (rand() - 0.5)).toFixed(1), sla: +(92 + i * 0.25 + (rand() - 0.5) * 1.5).toFixed(1) }));

export const leadSources = [
  { name: "Referral", value: 34, color: "#3B82F6" },
  { name: "LinkedIn", value: 26, color: "#8B5CF6" },
  { name: "Website", value: 21, color: "#22D3EE" },
  { name: "Outbound", value: 12, color: "#10B981" },
  { name: "Events", value: 7, color: "#F59E0B" },
];

export const notifications: Notification[] = [
  { id: "N1", kind: "payroll", title: "November payroll is ready for approval", body: "248 employees · 14 lines need review before Friday's cutoff.", at: daysFromNow(-0.05), read: false, href: "/app/payroll" },
  { id: "N2", kind: "leave", title: "3 leave requests awaiting you", body: `${leaveRequests[0].name} and 2 others requested time off.`, at: daysFromNow(-0.12), read: false, href: "/app/attendance?tab=leave" },
  { id: "N3", kind: "invoice", title: "Invoice INV-2026-1155 is 9 days overdue", body: "Meridian Insurance Group · reminder scheduled for tomorrow 10:00.", at: daysFromNow(-0.3), read: false, href: "/app/invoices" },
  { id: "N4", kind: "lead", title: "Juniper Clinics moved to Qualified", body: "Omar Khan logged an 18-seat opportunity worth $14,040/mo.", at: daysFromNow(-0.5), read: true, href: "/app/leads" },
  { id: "N5", kind: "approval", title: "Overtime approval: Voice Team A", body: "22 agents requested 46 extra hours for the Northstar peak.", at: daysFromNow(-0.8), read: false, href: "/app/attendance" },
  { id: "N6", kind: "announcement", title: "Manila site: new shift roster published", body: "Maria Santos published December rosters for Back Office.", at: daysFromNow(-1.2), read: true },
  { id: "N7", kind: "system", title: "SLA dip detected for Meridian Insurance", body: "Service level fell to 84% (target 90%) over the last 3 days.", at: daysFromNow(-1.6), read: true, href: "/app/clients/CL-006" },
];

export const announcements = [
  { id: "AN1", title: "Year-end town hall · Dec 18", body: "Leadership update, 2027 client roadmap and top-performer awards. Streamed to all sites.", author: "Zia Ullah", at: daysFromNow(-1) },
  { id: "AN2", title: "New QA scorecard goes live Monday", body: "Call audits now weight empathy and resolution equally. Coaching sessions are booked per team.", author: "Aisha Malik", at: daysFromNow(-3) },
];

export const recentActivity = [
  { id: "R1", who: "Daniel Lee", what: "approved payroll adjustments for", target: "Back Office", at: daysFromNow(-0.04) },
  { id: "R2", who: "Emily Johnson", what: "sent invoice INV-2026-1142 to", target: "Vertex Health", at: daysFromNow(-0.15) },
  { id: "R3", who: "Omar Khan", what: "won a 14-seat deal with", target: "Lattice Software", at: daysFromNow(-0.3) },
  { id: "R4", who: "Hina Qureshi", what: "onboarded 6 agents into", target: "Voice Team B", at: daysFromNow(-0.7) },
  { id: "R5", who: "Aisha Malik", what: "completed 42 call audits for", target: "Northstar Retail", at: daysFromNow(-1.1) },
];

export const alerts = [
  { id: "AL1", tone: "danger" as const, title: "SLA breach risk", body: "Meridian Insurance at 84% vs 90% target. Add 3 agents to evening shift.", href: "/app/clients/CL-006" },
  { id: "AL2", tone: "warning" as const, title: "Payroll cutoff in 3 days", body: "14 payroll lines need review before approval.", href: "/app/payroll" },
  { id: "AL3", tone: "info" as const, title: "2 contracts renew this month", body: "Harbor Telecom and Kite Payments. Renewal decks are ready.", href: "/app/clients" },
];

export const integrations = [
  { id: "slack", name: "Slack", category: "Communication", description: "Push approvals, SLA alerts and announcements to team channels.", connected: true },
  { id: "msteams", name: "Microsoft Teams", category: "Communication", description: "Notify supervisors and share shift updates in Teams.", connected: false },
  { id: "five9", name: "Five9", category: "Contact center", description: "Sync agent states, handle times and call outcomes.", connected: true },
  { id: "genesys", name: "Genesys Cloud", category: "Contact center", description: "Import interaction data for productivity and QA.", connected: false },
  { id: "zendesk", name: "Zendesk", category: "Helpdesk", description: "Ticket volumes and CSAT per client, mapped to projects.", connected: true },
  { id: "salesforce", name: "Salesforce", category: "CRM", description: "Two-way sync for leads, contacts and opportunities.", connected: false },
  { id: "hubspot", name: "HubSpot", category: "CRM", description: "Import pipeline and contacts from HubSpot.", connected: false },
  { id: "quickbooks", name: "QuickBooks Online", category: "Accounting", description: "Post invoices, payments and payroll journals.", connected: true },
  { id: "xero", name: "Xero", category: "Accounting", description: "Sync chart of accounts and reconcile receivables.", connected: false },
  { id: "stripe", name: "Stripe", category: "Payments", description: "Let clients pay invoices by card or bank transfer.", connected: true },
  { id: "google", name: "Google Workspace", category: "Identity", description: "Single sign-on and directory sync for employees.", connected: true },
  { id: "okta", name: "Okta", category: "Identity", description: "SAML SSO and SCIM provisioning for enterprise workspaces.", connected: false },
];
