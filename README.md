# Zee Telephonics BPO

The operating platform for BPO teams: a marketing website and a SaaS dashboard for workforce, attendance, CRM, clients, projects, payroll, accounting, invoicing and reporting.

Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI, Recharts, React Hook Form + Zod, and React Three Fiber for the 3D scenes.

---

## Quick start

Requirements: Node.js 20 or newer, npm 10 or newer.

```bash
npm install
cp .env.example .env.local     # optional, defaults work out of the box
npm run dev                    # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (type checks included) |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript only |

The dashboard lives at `/app`. Sign-in is a mock: any email and password on `/login` take you to the dashboard (the password `wrongpassword` shows the error state).

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_DATA_SOURCE` | `mock` | `mock` uses in-memory sample data, `api` calls your backend |
| `NEXT_PUBLIC_API_BASE_URL` | none | Base URL for the REST API when `DATA_SOURCE=api` |
| `NEXT_PUBLIC_SITE_URL` | `https://zee-telephonics-bpo.vercel.app` | Canonical URL for metadata, sitemap and robots |

### Deploying

The project is a standard Next.js app. On Vercel: import the repository, keep the defaults (framework is detected automatically), add the environment variables above, and deploy. Any Node host works with `npm run build && npm start`.

---

## What's inside

### Marketing site (`src/app/(marketing)`)

Home, Features, Solutions, Industries, Pricing (monthly/yearly toggle, comparison table, FAQ), About, Resources (blog index plus articles), Contact and Request a Demo. Login and Sign Up live in `src/app/(auth)`.

- **3D scenes** (`src/components/three`): the hero "operations core", the module ecosystem, the team orbit and the security vault are procedural (no model files). Each scene loads only as it nears the viewport, pauses when off screen, honours `prefers-reduced-motion`, and falls back to a static SVG when WebGL is unavailable, on Save-Data, or on low-end devices.
- **SEO**: per-page metadata, Open Graph tags, `sitemap.xml`, `robots.txt`, semantic headings.

### Dashboard (`src/app/app`)

| Route | Module |
| --- | --- |
| `/app` | Executive overview: KPIs, revenue/expense trend, alerts, productivity, CSAT, activity |
| `/app/team` | Directory, departments, hierarchy, onboarding, roles. Employee profiles at `/app/team/[id]` |
| `/app/attendance` | Today's board, trends, shifts, leave approvals, holidays |
| `/app/leads` | Kanban pipeline with drag and drop (plus a keyboard "Move to" menu) |
| `/app/crm` | Contacts, activities, follow-ups, pipeline analytics |
| `/app/clients` | Client list, health, SLA. Client detail with portal preview at `/app/clients/[id]` |
| `/app/projects` | Programs and campaigns with staffing and KPIs |
| `/app/payroll` | Payroll runs, approval, payslips, adjustments |
| `/app/accounting` | P&L, cash flow, ledger, receivables/payables, budgets, tax, audit log |
| `/app/invoices` | Invoices with create/send/remind/mark paid, partial payments, PDF, recurring |
| `/app/reports` | Seven standard reports, filters, CSV/PDF export, custom report builder, schedules |
| `/app/integrations` | Connect/disconnect integrations, API keys, webhooks |
| `/app/settings` | Profile, workspace, users and roles, security, notifications, billing |
| `/app/notifications` | Notification inbox, team messages, activity feed, announcements |

Shell features: collapsible sidebar (remembered per browser), mobile navigation drawer, breadcrumbs, workspace switcher, notification center, profile menu, light/dark/system theme, and a command palette.

Keyboard shortcuts: `⌘K` / `Ctrl+K` or `/` opens the command palette, `[` collapses the sidebar, and `g` followed by a letter jumps to a module (for example `g t` for Team, `g i` for Invoices).

### Project layout

```
src/
  app/                 routes (marketing, auth, dashboard), sitemap, robots
  components/
    ui/                buttons, inputs, dialogs, tabs, badges and other primitives
    marketing/         header, footer, pricing, forms, product previews
    dashboard/         app shell, command palette, data table, charts kit
    three/             3D scenes and their static fallbacks
    brand/             logo and wordmark
  lib/
    services/          the data layer (see below)
    mock/              types and deterministic sample data
    content.ts         marketing copy: modules, plans, FAQs, posts
    site.ts            company name, URLs, contact emails, navigation
```

### Branding

Company name, contact emails and navigation are in `src/lib/site.ts`. The logo is `src/components/brand/logo.tsx` with matching files at `src/app/icon.svg` and `public/logo-mark.svg`. Colours are CSS variables in `src/app/globals.css` (light and dark sets) and brand colours in `tailwind.config.ts`.

The contact emails (`@zeetelephonics.com`) and office address are placeholders. Replace them with your real details before going live.

---

## Replacing mock data with a real backend

UI code never imports mock data directly for reads; it calls `services.*` from `src/lib/services/index.ts`. Each method is declared once with two implementations:

```ts
list: () => source(
  () => mock(db.employees),                 // used when NEXT_PUBLIC_DATA_SOURCE=mock
  () => http<Employee[]>("/employees"),     // used when NEXT_PUBLIC_DATA_SOURCE=api
),
```

Pages consume them through `useService`, which handles loading, error and reload state:

```ts
const { data, loading, error, reload } = useService(() => services.team.list());
```

### Option A: your own REST API

1. Implement the endpoints listed in `src/lib/services/index.ts` (for example `GET /employees`, `PATCH /leads/:id`, `POST /invoices`, `POST /payroll/runs/:id/approve`). Response shapes are the TypeScript types in `src/lib/mock/types.ts`.
2. Set `NEXT_PUBLIC_DATA_SOURCE=api` and `NEXT_PUBLIC_API_BASE_URL=https://your-api`.
3. Requests send cookies (`credentials: "include"`), so a session cookie from your auth service works without code changes. For bearer tokens, add an `Authorization` header in `http()` inside `src/lib/services/client.ts`.

### Option B: Supabase

1. Create tables that mirror the types in `src/lib/mock/types.ts` (employees, clients, projects, leads, invoices, payroll_runs, transactions, and so on). Enable Row Level Security and scope every table by a `workspace_id` column.
2. `npm install @supabase/supabase-js` and create a client in `src/lib/services/supabase.ts` using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Replace the `http(...)` side of each service with a Supabase query, for example:

   ```ts
   list: () => source(
     () => mock(db.employees),
     async () => {
       const { data, error } = await supabase.from("employees").select("*").order("name");
       if (error) throw error;
       return data as Employee[];
     },
   ),
   ```
4. Swap the mock login in `src/components/marketing/auth-forms.tsx` for `supabase.auth.signInWithPassword` (and the Google/Microsoft buttons for `signInWithOAuth`), and protect `/app` with middleware that checks the session.

### A few things to wire up for production

- **Authentication and route protection** for `/app` (middleware plus server-side session checks).
- **Role-based access**: the roles in Settings → Users & roles are UI only. Enforce them on the server.
- **Integrations, emails and file exports**: connect/sync, invoice emails, reminders and scheduled reports are simulated. Hook them to your providers.
- **Forms** on Contact and Request a Demo call `services.marketing.*`. Point these at your CRM or an email service.
- **Mutations in mock mode** live in memory and reset on reload. This is intentional for demos.

---

## Accessibility and performance notes

- Skip link, visible focus rings, labelled form fields with inline errors, `aria-sort` on sortable tables, text summaries for every chart, keyboard alternatives for drag and drop.
- Respects `prefers-reduced-motion` across animations and 3D scenes.
- 3D code is split into its own chunks and never blocks first paint. Dashboard routes are client-rendered with skeleton loading states.
