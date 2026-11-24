# Zee Telephonics website

The website for **Zee Telephonics** (zeetelephonicsbpo.com).
*Connecting Businesses. Empowering Customers.*

It is a fast, static website built with [Astro](https://astro.build), with a 3D "connection sphere" on the homepage and a small PHP + MySQL contact form handler that is ready to connect to a CRM later.

> **Status:** Phase 1 (build) and Phase 2 (testing) are done. The site can run in two places:
> * **Vercel** (current preview): the contact form runs as a Vercel function and saves leads into the Zee Telephonics CRM database on Supabase, the same pattern as the Business Care project. See [Deploying on Vercel](#deploying-on-vercel).
> * **Hostinger** (later, optional): the contact form runs as PHP + MySQL. See [docs/DEPLOYMENT-HOSTINGER.md](docs/DEPLOYMENT-HOSTINGER.md).

---

## What is included

| Page | Address |
| --- | --- |
| Home (3D hero, services, process, principles) | `/` |
| Services overview | `/services/` |
| One page per service (8, generated from one file) | `/services/<slug>/` |
| How we work | `/how-we-work/` |
| About | `/about/` |
| Contact and quote form | `/contact/` |
| Thank you (after sending the form, hidden from Google) | `/thank-you/` |
| Privacy policy and Terms of use (drafts) | `/privacy/`, `/terms/` |
| 404 page, `sitemap-index.xml`, `robots.txt` | automatic |

Also included: the logo, a round "ZT" badge inside an orbit ring with a cyan signal dot plus an uppercase wordmark (`src/components/Logo.astro`, `public/favicon.svg`, and a standalone `public/brand/zee-telephonics-logo.svg` for documents), responsive layouts for phone, tablet and desktop, SEO tags and structured data, security headers, and automated tests.

## Editing the content (no coding needed)

All text you are likely to change lives in **three files** in `src/content/`. You can edit them on GitHub: open the file, click the pencil icon, change the text, and commit.

| File | What it controls |
| --- | --- |
| `src/content/services.json` | **The services.** One entry per service. Set `"published": false` to hide a service everywhere (menu, pages, footer, contact form). Change `"order"` to reorder. |
| `src/content/site.json` | Business details: legal name, email, phone, hours, address, social links. **An empty value `""` hides that item on the site.** |
| `src/content/home.json` | Homepage hero text, the four "How we work" steps, the principles, and the About page text. |

Rules that keep the site honest:

* Only add facts that are true today. The site deliberately has **no** statistics, client logos, testimonials, certifications or office locations. Add them only when they are real and you have permission to show them.
* Contact email and phone are empty on purpose until you confirm them. The contact form works without them.
* The service descriptions are a **draft**. Remove anything you do not actually offer.
* If you make a mistake in one of these files (for example a missing comma or a missing field), the build stops with a message that names the file and field. Nothing broken gets published.

## Running it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install        # once
npm run dev        # live preview at http://localhost:4321
npm run build      # production files in dist/
npm run preview    # view the production build
```

The contact form needs PHP, so in `npm run dev` it shows a polite "could not send" message. That is expected. See "Testing" to try the real form locally.

## Testing

| Command | What it checks |
| --- | --- |
| `npx astro check` | TypeScript and content file checks |
| `npm run test:vercel` | 13 tests of the Vercel form function against a fake Supabase server |
| `npm run test:php` | 33 automated tests of the form handler: validation, spam blocking, rate limits, saving, email, CRM output, and what happens when the database or email is down |
| `npm run test:e2e` | Runs the built site on a local PHP server and checks every page and link on phone, tablet and desktop sizes, the mobile menu, the 3D hero and its fallback, and sends real test enquiries (with and without JavaScript) into a local database and a local test mail server. Needs PHP 8.1+, Python 3 with `aiosmtpd`, and Playwright. |

GitHub runs the type check, build and PHP tests on every pull request (`.github/workflows/ci.yml`).

## The 3D connection sphere

* `src/scripts/connection-sphere.ts` draws a slowly turning globe of points, with light pulses travelling along arcs between random points. The points are abstract; they do not represent real places.
* `src/scripts/hero-loader.ts` decides who gets it. It loads **after** the page is visible, and only on laptops, desktops and tablets with WebGL. Phones, "reduce motion" users, data-saver users, low-memory devices and browsers without WebGL see a still image of the same globe (`/hero-sphere.svg`, generated at build time) and download no 3D code at all.
* It pauses when scrolled out of view or when the tab is hidden, caps at 60 frames per second, and limits screen resolution to save battery.

## The contact form and CRM readiness

```
Browser form  ──POST──▶  /api/lead.php
                          ├─ spam checks: hidden honeypot field, too-fast check, per-connection rate limit,
                          │               same-site check, optional Cloudflare Turnstile
                          ├─ validation of every field on the server
                          ├─ save to MySQL table `leads`              (database/schema.sql)
                          ├─ email alert to you via SMTP (PHPMailer, included)
                          ├─ optional confirmation email to the visitor
                          └─ CRM adapter (off by default; a webhook adapter is included)
```

* The form works with and without JavaScript.
* A lead is only lost if **both** the database and email fail. If one works, the visitor sees success and you still get the lead.
* IP addresses are never stored, only a salted one-way hash for rate limiting.
* **CRM ready:** the `leads` table uses common CRM fields (name, company, email, phone, service, team size, message, consent, source page, UTM campaign tags, status) plus `crm_status`, `crm_id` and `crm_synced_at` columns. `public/api/lib/Crm/` holds a small `CrmAdapter` interface. Today it uses `NullCrmAdapter` (no CRM). Setting `'driver' => 'webhook'` in the config sends each lead as JSON to Zapier, Make, n8n or a CRM webhook. A HubSpot or Zoho adapter can be added later without touching the website pages.

### Server configuration (secrets)

Passwords never go in Git. The template is `server/config/config.example.php`. On the server you copy it to `config.php`, fill it in, and place it **outside** `public_html` in a folder named `zee-private`. `config.php` is listed in `.gitignore` so it cannot be committed by accident. Full steps are in the deployment guide.

What has and has not been tested: the form handler was tested locally with an SQLite database and a local test mail server. It has **not** yet been tested on Hostinger with a real MySQL database and a real mailbox, because there is no hosting yet. That test is part of Phase 3.

## Deploying on Vercel

`vercel.json` tells Vercel to build the Astro site, remove the PHP files (Vercel cannot run PHP), and serve the form handler `api/lead.ts` as a serverless function at `/api/lead`. The form automatically posts there when the site is built on Vercel.

Leads are saved by one server-only database function, `create_website_lead`, in the Zee Telephonics CRM Supabase project. It writes into the CRM's existing `leads` table (with `source = 'website'`) and keeps a `website_submissions` log for rate limiting. The SQL is in `supabase/migrations/20261124000001_website_intake.sql`. It only adds; it does not change existing CRM tables.

Environment variables to set in Vercel (Project > Settings > Environment Variables):

| Variable | Required | What it is |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | The CRM Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase > Project settings > API > `service_role` key. Server only, never shown to visitors. |
| `IP_HASH_SALT` | Yes | Any long random string |
| `TURNSTILE_SECRET_KEY` | No | Cloudflare Turnstile secret (also put the site key in `site.json`) |
| `RESEND_API_KEY`, `LEAD_NOTIFY_TO`, `LEAD_FROM` | No | Email alert for each new lead through Resend |

Until the Supabase key is set, the form tells visitors it could not send the enquiry. It never pretends to succeed.

## Project structure

```
src/
  content/        services.json, site.json, home.json   <- edit these
  components/     Header, Footer, Hero, Logo, LeadForm, ServiceCard, ...
  layouts/        BaseLayout (SEO tags, fonts, header, footer)
  pages/          one file per page; services/[slug].astro builds every service page
  scripts/        3D hero (connection-sphere.ts, hero-loader.ts)
  styles/         global.css (colours, fonts, spacing tokens)
api/
  lead.ts         Vercel form function (saves leads to Supabase)
supabase/
  migrations/     website intake function for the CRM database
public/
  .htaccess       HTTPS redirect, security headers, caching (Hostinger)
  api/            lead.php + lib/ (PHP form handler, PHPMailer, CRM adapters)
server/config/    config.example.php (template for secrets)
database/         schema.sql (MySQL tables)
tests/            php/ (unit tests) and e2e/ (browser tests)
docs/             DEPLOYMENT-HOSTINGER.md
scripts/          package.sh (builds the downloadable ZIP)
```

## Brand

| Token | Colour | Use |
| --- | --- | --- |
| Midnight navy | `#0A1630` | Hero, footer, dark sections |
| Deep navy | `#12244D` | Panels on dark sections |
| Signal blue | `#1E5EFF` | Gradients, icons |
| Electric cyan | `#00D4FF` | Buttons and highlights on dark backgrounds |
| Cyan for light backgrounds | `#007A99` | Links on white (readable contrast) |
| Mist | `#F2F6FB` | Alternating light sections |

Fonts: Sora (headings) and Inter (text), both self-hosted, so no Google Fonts request is made.

## Before launch checklist

- [ ] Confirm which services you offer and edit `services.json`.
- [ ] Fill in `legalName` and any contact details you want public in `site.json`.
- [ ] Have the privacy policy and terms reviewed.
- [ ] Approve or replace the starter logo.
- [ ] Phase 3: hosting, database, mailbox, SSL, and a live form test (see the deployment guide).
