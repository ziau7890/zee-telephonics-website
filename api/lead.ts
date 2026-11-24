/**
 * Vercel serverless version of the contact form handler (POST /api/lead).
 * Same rules as public/api/lead.php (used on PHP hosting such as Hostinger):
 * honeypot, too-fast check, same-site check, optional Turnstile, per-connection rate limit,
 * server-side validation. Leads go into the Zee Telephonics CRM database (Supabase),
 * following the Business Care pattern: one server-only database function writes the lead.
 *
 * Environment variables (Vercel > Project > Settings > Environment Variables):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   required to save leads
 *   IP_HASH_SALT                              random string for anonymising IPs
 *   TURNSTILE_SECRET_KEY                      optional
 *   RESEND_API_KEY, LEAD_NOTIFY_TO, LEAD_FROM optional email alert via Resend
 */
import { createHash } from 'node:crypto';
import { validateLead, type Lead } from '../src/lib/lead.js';
import servicesFile from '../src/content/services.json' with { type: 'json' };

const SERVICES = servicesFile.services.filter((s) => s.published);
const SLUGS = SERVICES.map((s) => s.slug);
const TITLES: Record<string, string> = Object.fromEntries(SERVICES.map((s) => [s.slug, s.title]));
const RATE_LIMIT_PER_HOUR = 5;
const MIN_SECONDS = 3;

type Outcome = { code: 'ok' | 'invalid' | 'spam' | 'rate' | 'server'; status: number; message: string; errors?: Record<string, string> };
const MSG = {
  ok: 'Thank you. Your enquiry has been sent.',
  server: 'Sorry, we could not send your enquiry right now. Please try again later.',
};

function respond(req: Request, o: Outcome): Response {
  const wantsJson = (req.headers.get('accept') ?? '').includes('application/json');
  if (wantsJson) {
    return Response.json({ ok: o.code === 'ok', message: o.message, errors: o.errors ?? {} }, { status: o.status, headers: { 'Cache-Control': 'no-store' } });
  }
  const to = o.code === 'ok' ? '/thank-you/' : `/contact/?error=${o.code}#quote`;
  return new Response(null, { status: 303, headers: { Location: to, 'Cache-Control': 'no-store' } });
}

function sameSite(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers.get('x-forwarded-host') ?? req.headers.get('host'));
  } catch {
    return false;
  }
}

async function turnstileOk(secret: string, token: string, ip: string): Promise<boolean> {
  if (!token) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const d = (await r.json()) as { success?: boolean };
    return d.success === true;
  } catch {
    return false;
  }
}

async function saveLead(lead: Lead, ipHash: string, userAgent: string): Promise<'ok' | 'rate' | 'error'> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('[zee-lead] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
    return 'error';
  }
  try {
    const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/create_website_lead`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_payload: lead, p_ip_hash: ipHash, p_user_agent: userAgent.slice(0, 255), p_rate_limit: RATE_LIMIT_PER_HOUR }),
    });
    if (!r.ok) {
      console.error('[zee-lead] Supabase error', r.status, (await r.text()).slice(0, 300));
      return 'error';
    }
    const d = (await r.json()) as { status?: string };
    return d.status === 'rate_limited' ? 'rate' : 'ok';
  } catch (e) {
    console.error('[zee-lead] Supabase request failed', e);
    return 'error';
  }
}

async function notify(lead: Lead): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_TO;
  if (!key || !to) return;
  const rows: [string, string][] = [
    ['Name', lead.full_name], ['Company', lead.company], ['Email', lead.email], ['Phone', lead.phone],
    ['Service', TITLES[lead.service] ?? lead.service], ['Team size', lead.team_size], ['Message', lead.message],
    ['Sent from page', lead.source_page], ['Campaign', [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' / ')],
  ];
  const text = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.LEAD_FROM ?? 'Zee Telephonics Website <onboarding@resend.dev>',
        to: to.split(',').map((s) => s.trim()),
        reply_to: lead.email,
        subject: `New website enquiry: ${lead.full_name}${lead.company ? ` (${lead.company})` : ''}`,
        text,
      }),
    });
    if (!r.ok) console.error('[zee-lead] Resend error', r.status);
  } catch (e) {
    console.error('[zee-lead] Resend request failed', e);
  }
}

export async function POST(req: Request): Promise<Response> {
  if (!sameSite(req)) return respond(req, { code: 'spam', status: 403, message: 'Your enquiry could not be verified. Please try again.' });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return respond(req, { code: 'invalid', status: 400, message: 'Please correct the highlighted fields.' });
  }
  const input = Object.fromEntries([...form.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']));
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || '0.0.0.0';
  const ipHash = createHash('sha256').update(`${process.env.IP_HASH_SALT ?? ''}|${ip}`).digest('hex');

  // Honeypot: pretend success so bots move on, store nothing.
  if (String(input.website ?? '').trim() !== '') return respond(req, { code: 'ok', status: 200, message: MSG.ok });

  const started = Number(input.form_started ?? 0);
  if (started > 0 && Date.now() / 1000 - started < MIN_SECONDS) {
    return respond(req, { code: 'spam', status: 400, message: 'Your enquiry could not be verified. Please wait a moment and try again.' });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret && !(await turnstileOk(secret, String(input['cf-turnstile-response'] ?? ''), ip))) {
    return respond(req, { code: 'spam', status: 400, message: 'Your enquiry could not be verified. Please try again.' });
  }

  const { lead, errors } = validateLead(input, SLUGS);
  if (Object.keys(errors).length) return respond(req, { code: 'invalid', status: 422, message: 'Please correct the highlighted fields.', errors });

  const saved = await saveLead(lead, ipHash, req.headers.get('user-agent') ?? '');
  if (saved === 'rate') return respond(req, { code: 'rate', status: 429, message: 'Too many enquiries were sent from your connection. Please try again in an hour.' });
  if (saved === 'error') return respond(req, { code: 'server', status: 503, message: MSG.server });

  await notify(lead);
  return respond(req, { code: 'ok', status: 200, message: MSG.ok });
}

export function GET(): Response {
  return Response.json({ ok: false, message: 'Method not allowed.' }, { status: 405, headers: { Allow: 'POST' } });
}
