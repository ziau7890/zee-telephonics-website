/** Marketing copy and structured content shared by the public pages. */

export type ModuleKey = "team" | "attendance" | "crm" | "clients" | "payroll" | "finance" | "invoicing" | "reports" | "comms";

export const modules: { key: ModuleKey; name: string; tagline: string; description: string; points: string[]; color: string }[] = [
  { key: "team", name: "Team Management", tagline: "Every agent, team and site in one directory", description: "Org charts, roles, shifts, skills and documents for every employee, from first-day onboarding to a clean offboarding checklist.", points: ["Employee profiles and documents", "Departments, teams and hierarchy", "Onboarding and offboarding workflows", "Skills and certification tracking"], color: "#3B82F6" },
  { key: "attendance", name: "Attendance & Time", tagline: "Shift-accurate time tracking across sites", description: "Clock-ins from office kiosks, desktop agents and mobile, matched to the roster, with late arrivals, breaks and overtime calculated automatically.", points: ["Clock in/out with device and site", "Breaks, lateness and overtime rules", "Leave requests with manager approval", "Holiday and shift calendars"], color: "#22D3EE" },
  { key: "crm", name: "Leads & CRM", tagline: "A pipeline built for selling seats and services", description: "Track prospects by seats, services and monthly value. Score leads, assign owners and never miss a follow-up.", points: ["Kanban pipeline with custom stages", "Lead scoring and assignment", "Calls, emails and notes in one timeline", "Conversion and source reporting"], color: "#8B5CF6" },
  { key: "clients", name: "Client Management", tagline: "Contracts, SLAs and health on every account", description: "See each client's seats, services, SLA attainment, CSAT and billing in one profile, with early warnings before an account goes at-risk.", points: ["Client health score and CSAT", "Contracts, packages and renewals", "SLA targets vs actuals", "Client portal preview"], color: "#EC4899" },
  { key: "payroll", name: "Payroll", tagline: "Attendance-driven payroll in multiple currencies", description: "Hours, overtime, bonuses and deductions flow straight from attendance, so a 250-person payroll is a review, not a rebuild.", points: ["Salary structures and allowances", "Overtime, bonus and deduction rules", "Approval workflow and payslips", "PKR, PHP, USD and GBP payouts"], color: "#10B981" },
  { key: "finance", name: "Accounting & Finance", tagline: "Real margins per client, every month", description: "Revenue, payroll cost and overheads land in one ledger, so you know which accounts make money and which ones only look busy.", points: ["P&L, cash flow and budgets", "Receivables and payables", "General ledger and audit log", "Tax summaries and exports"], color: "#14B8A6" },
  { key: "invoicing", name: "Invoicing", tagline: "Bill seats and services without spreadsheets", description: "Generate recurring invoices from contracts, apply tax and discounts, accept partial payments and send reminders automatically.", points: ["Recurring and one-off invoices", "Tax, discounts and partial payments", "PDF download and email delivery", "Automatic payment reminders"], color: "#F59E0B" },
  { key: "reports", name: "Reporting & Analytics", tagline: "Answers for owners, clients and auditors", description: "Workforce, attendance, payroll, sales and client reports with filters by date, department and account, exportable in one click.", points: ["Prebuilt operational reports", "Custom report builder", "CSV and PDF exports", "Scheduled report delivery"], color: "#6366F1" },
  { key: "comms", name: "Notifications & Comms", tagline: "Approvals and alerts where people already work", description: "A single inbox for approvals, reminders and announcements, mirrored to Slack or Teams so nothing waits on a missed email.", points: ["Approval and SLA alerts", "Internal announcements", "Team messages and activity feed", "Slack and Teams delivery"], color: "#64748B" },
];

export const testimonials = [
  { quote: "We used to close payroll with four spreadsheets and a lot of hope. Now attendance feeds payroll directly and our finance team signs off in an afternoon.", name: "Rehan Siddiqui", title: "Director of Operations", company: "Meridian Contact Solutions", metric: "3 days → 4 hours payroll close" },
  { quote: "Client health scores changed how we run account reviews. We saw an SLA slip two weeks before the client did and fixed staffing before it became a conversation.", name: "Clarissa Dela Cruz", title: "Head of Client Success", company: "Pacific Shore Outsourcing", metric: "+11 pts client retention" },
  { quote: "Our SDR team finally works from one pipeline. Seats, services and monthly value on every deal means forecasting is a report, not a meeting.", name: "Marcus Bell", title: "VP Sales", company: "Brightdesk Virtual Assistants", metric: "28% lead-to-client conversion" },
];

export const logos = ["Meridian Contact", "Pacific Shore", "Brightdesk", "Atlas CX", "Northbeam Support", "Harborline", "Keystone BPO", "Vantage Assist"];

export const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "For BPO teams up to 50 seats getting off spreadsheets.",
    monthly: 6,
    unit: "per seat / month",
    cta: "Start free trial",
    features: ["Team management and directory", "Attendance and leave", "Basic CRM pipeline", "Standard reports", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    description: "For growing BPOs running payroll, billing and multiple clients.",
    monthly: 12,
    unit: "per seat / month",
    cta: "Start free trial",
    popular: true,
    features: ["Everything in Starter", "Advanced CRM and lead scoring", "Payroll with overtime rules", "Invoicing and payment reminders", "Finance reports and budgets", "Workflow automation", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For multi-site operations with custom workflows and controls.",
    monthly: null,
    unit: "Custom pricing",
    cta: "Talk to sales",
    features: ["Everything in Growth", "Custom workflows and approvals", "Advanced roles and permissions", "Multi-workspace and multi-entity", "Custom integrations and API", "SSO and SCIM provisioning", "Dedicated success manager"],
  },
];

export const comparison: { group: string; rows: { label: string; values: (boolean | string)[] }[] }[] = [
  { group: "Workforce", rows: [
    { label: "Employee directory and profiles", values: [true, true, true] },
    { label: "Shift scheduling", values: ["Basic", true, true] },
    { label: "Attendance and leave", values: [true, true, true] },
    { label: "Onboarding workflows", values: [false, true, true] },
  ] },
  { group: "Revenue", rows: [
    { label: "CRM pipeline", values: ["Basic", "Advanced", "Advanced"] },
    { label: "Lead scoring and assignment", values: [false, true, true] },
    { label: "Client health and SLA tracking", values: [false, true, true] },
    { label: "Invoicing and reminders", values: [false, true, true] },
  ] },
  { group: "Finance", rows: [
    { label: "Payroll", values: [false, true, true] },
    { label: "Multi-currency", values: [false, true, true] },
    { label: "P&L, budgets and ledger", values: [false, true, true] },
    { label: "Multi-entity consolidation", values: [false, false, true] },
  ] },
  { group: "Platform & security", rows: [
    { label: "Role-based access control", values: ["Standard roles", "Custom roles", "Granular permissions"] },
    { label: "Audit log retention", values: ["30 days", "1 year", "Unlimited"] },
    { label: "SSO / SAML and SCIM", values: [false, false, true] },
    { label: "Support", values: ["Email", "Priority", "Dedicated manager"] },
  ] },
];

export const faqs = [
  { q: "How is pricing calculated?", a: "You pay per active seat, meaning any employee with a login or tracked attendance in a billing month. Seats that are inactive for a full month are not billed." },
  { q: "Can we run payroll in more than one currency?", a: "Yes. Growth and Enterprise support salaries and payouts in PKR, PHP, USD, GBP, EUR and AUD, with exchange rates recorded on every run for audit purposes." },
  { q: "Do you integrate with our dialer or helpdesk?", a: "We connect to Five9, Genesys Cloud, Zendesk, Slack, QuickBooks, Stripe and more. Enterprise plans include custom integrations through our REST API." },
  { q: "How long does onboarding take?", a: "Most teams import employees, clients and open invoices in the first week. A 200-seat operation is typically fully live, including payroll, within three to four weeks." },
  { q: "Is our data secure?", a: "Data is encrypted in transit and at rest, access is role-based, and every sensitive action is written to an audit log. The platform is designed for compliance-ready operations; we can walk your security team through our controls." },
  { q: "Can we try it before committing?", a: "Yes. Starter and Growth include a 14-day trial with sample data, and we can set up a guided pilot for Enterprise evaluations." },
];

export const industries = [
  { slug: "call-centers", name: "Call centers", icon: "Headset", description: "Voice operations with shift rosters, adherence and overtime across sites.", stats: "Avg. 9% overtime reduction", needs: ["Shift adherence", "Overtime control", "Per-client staffing"] },
  { slug: "customer-support", name: "Customer support companies", icon: "MessagesSquare", description: "Omnichannel support teams measured on CSAT, SLA and first-contact resolution.", stats: "SLA visibility per client", needs: ["SLA tracking", "CSAT by account", "QA scorecards"] },
  { slug: "virtual-assistants", name: "Virtual assistant agencies", icon: "UserRound", description: "Dedicated assistants billed by hours or seats across many small clients.", stats: "Invoices generated from timesheets", needs: ["Timesheets", "Hour-based billing", "Client portal"] },
  { slug: "lead-generation", name: "Lead generation companies", icon: "Target", description: "SDR and appointment-setting teams paid on activity and outcomes.", stats: "Pipeline and payouts in one view", needs: ["Pipeline tracking", "Commission inputs", "Campaign reports"] },
  { slug: "back-office", name: "Back-office outsourcing", icon: "FileStack", description: "Data entry, claims and order processing measured on accuracy and throughput.", stats: "Throughput per agent, per client", needs: ["Productivity tracking", "Accuracy QA", "Project billing"] },
  { slug: "ites", name: "IT-enabled service providers", icon: "Cpu", description: "Helpdesk and technical support teams with tiered skills and certifications.", stats: "Certifications tracked per engineer", needs: ["Skills matrix", "Tiered teams", "Ticket integrations"] },
  { slug: "remote-workforce", name: "Remote workforce companies", icon: "Globe2", description: "Distributed teams across time zones and currencies.", stats: "6 payout currencies", needs: ["Remote clock-in", "Multi-currency payroll", "Device tracking"] },
  { slug: "enterprise-bpo", name: "Large BPO organizations", icon: "Building2", description: "Multi-site, multi-entity operations with thousands of seats.", stats: "Multi-workspace consolidation", needs: ["Granular permissions", "Entity consolidation", "SSO and SCIM"] },
];

export const posts = [
  { slug: "true-cost-per-seat", title: "How to calculate the true cost per seat in a BPO", excerpt: "Salary is only half the story. A practical model for loading facilities, licenses, attrition and idle time into your seat cost.", category: "Finance", read: "8 min read", date: "2026-11-12", author: "Daniel Lee" },
  { slug: "sla-early-warning", title: "Building an SLA early-warning system before clients notice", excerpt: "The three leading indicators that predict an SLA miss two weeks out, and how to act on them with staffing.", category: "Operations", read: "6 min read", date: "2026-10-28", author: "Sarah Ahmed" },
  { slug: "overtime-without-burnout", title: "Peak season overtime without burning out your agents", excerpt: "Rules, caps and approval flows that keep holiday peaks profitable and your attrition flat.", category: "Workforce", read: "7 min read", date: "2026-10-09", author: "Hina Qureshi" },
  { slug: "pricing-bpo-services", title: "Pricing BPO services: per seat, per hour or per outcome?", excerpt: "A side-by-side look at the three pricing models and when each one protects your margin.", category: "Growth", read: "9 min read", date: "2026-09-22", author: "Omar Khan" },
  { slug: "qa-scorecards", title: "QA scorecards that agents actually trust", excerpt: "How to design call audits that balance empathy and resolution, and turn scores into coaching.", category: "Quality", read: "5 min read", date: "2026-09-03", author: "Aisha Malik" },
  { slug: "client-health-score", title: "A client health score you can explain to your CEO", excerpt: "Combining SLA, CSAT, payment behavior and engagement into one number that predicts renewals.", category: "Client success", read: "6 min read", date: "2026-08-18", author: "Emily Johnson" },
];
