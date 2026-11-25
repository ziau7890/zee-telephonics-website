// Tests the Vercel form function (api/lead.ts) against a fake Supabase server.
// Run: node tests/vercel/lead.test.mjs   (bundles api/lead.ts with esbuild first)
import { build } from 'esbuild';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const out = join(tmpdir(), `zee-lead-${process.pid}.mjs`);
await build({ entryPoints: ['api/lead.ts'], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'error' });

const calls = [];
let supabaseReply = { status: 'ok', lead_id: 'x' };
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    calls.push({ url: req.url, auth: req.headers.authorization, body: JSON.parse(body || '{}') });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(supabaseReply));
  });
});
await new Promise((r) => server.listen(0, r));
process.env.SUPABASE_URL = `http://127.0.0.1:${server.address().port}`;
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
process.env.IP_HASH_SALT = 'salt';
const { POST, GET } = await import(out);

let failed = 0;
const ok = (name, cond) => { console.log(`${cond ? '  ok  ' : '  FAIL'} ${name}`); if (!cond) failed++; };
const valid = {
  full_name: 'Aisha Khan', email: 'AISHA@example.com', company: 'Example', message: 'We need outbound calling help.',
  consent: 'yes', service: 'outbound-calling', team_size: '6 to 20 people', form_started: String(Math.floor(Date.now() / 1000) - 30),
  source_page: '/contact/', utm_source: 'google', website: '',
};
const req = (fields, { json = true, origin = 'https://zee.example', host = 'zee.example' } = {}) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return new Request('https://zee.example/api/lead', {
    method: 'POST', body: fd,
    headers: { ...(json ? { accept: 'application/json' } : {}), origin, host, 'x-forwarded-for': '203.0.113.5' },
  });
};

let r = await POST(req(valid));
let d = await r.json();
ok('valid enquiry accepted', r.status === 200 && d.ok === true);
ok('calls the CRM intake function with the service key', calls[0]?.url === '/rest/v1/rpc/create_website_lead' && calls[0]?.auth === 'Bearer service-key');
ok('sends cleaned lead', calls[0]?.body.p_payload.email === 'aisha@example.com' && calls[0]?.body.p_payload.service === 'outbound-calling');
ok('never sends the raw IP', calls[0]?.body.p_ip_hash.length === 64 && !JSON.stringify(calls[0]?.body).includes('203.0.113.5'));

r = await POST(req({ ...valid, email: 'bad', consent: '' }));
d = await r.json();
ok('invalid fields return 422 with errors', r.status === 422 && d.errors.email && d.errors.consent);

const before = calls.length;
r = await POST(req({ ...valid, website: 'spam' }));
ok('honeypot: looks fine to bots, nothing saved', r.status === 200 && calls.length === before);

r = await POST(req({ ...valid, form_started: String(Math.floor(Date.now() / 1000)) }));
ok('too fast is rejected', r.status === 400);

r = await POST(req(valid, { origin: 'https://evil.example' }));
ok('other websites cannot post', r.status === 403);

supabaseReply = { status: 'rate_limited' };
r = await POST(req(valid));
ok('rate limit returns 429', r.status === 429);
supabaseReply = { status: 'ok' };

r = await POST(req(valid, { json: false }));
ok('without JavaScript: redirects to thank-you', r.status === 303 && r.headers.get('location') === '/thank-you/');
r = await POST(req({ ...valid, email: 'bad' }, { json: false }));
ok('without JavaScript: errors go back to contact', r.headers.get('location') === '/contact/?error=invalid#quote');

delete process.env.SUPABASE_SERVICE_ROLE_KEY;
r = await POST(req(valid));
d = await r.json();
ok('database not connected: honest error, not fake success', r.status === 503 && d.ok === false);

ok('GET is refused', GET().status === 405);
server.close();
console.log(failed ? `\n${failed} failed` : '\nAll passed');
process.exit(failed ? 1 : 0);
