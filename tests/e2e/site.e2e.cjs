/**
 * End-to-end check of the built site, run against `php -S` serving dist/.
 *   - every internal link on every page resolves (no 404s)
 *   - no horizontal scrolling on phone, tablet and desktop widths
 *   - no JavaScript errors
 *   - the contact form really submits: with JavaScript, without JavaScript, and shows validation errors
 * Usage: see tests/e2e/run.sh
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8099';
const DIST = path.resolve(__dirname, '../../dist');
let failures = 0;
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? '  ok  ' : '  FAIL'} ${name}${!cond && detail ? ` (${detail})` : ''}`);
  if (!cond) failures++;
};

function pagesFromDist(dir = DIST, base = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...pagesFromDist(path.join(dir, entry.name), `${base}/${entry.name}`));
    else if (entry.name === 'index.html') out.push(`${base}/`);
  }
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const pages = pagesFromDist().filter((p) => !p.startsWith('/_astro'));
  console.log(`Pages found: ${pages.length}`);

  console.log('Links, layout and script errors');
  const seen = new Map();
  for (const [label, viewport] of [['phone', { width: 375, height: 800 }], ['tablet', { width: 820, height: 1100 }], ['desktop', { width: 1440, height: 900 }]]) {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && !/api\/lead/.test(m.text()) && errors.push(m.text()));
    for (const p of pages) {
      const res = await page.goto(BASE + p, { waitUntil: 'load' });
      if (label === 'desktop') ok(`${p} loads`, res && res.status() === 200, String(res && res.status()));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(`${p} fits ${label} width`, overflow <= 0, `${overflow}px too wide`);
      if (label === 'desktop') {
        const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
        for (const h of hrefs) if (h.startsWith('/')) seen.set(h.split('#')[0], p);
        const h1 = await page.$$eval('h1', (x) => x.length);
        ok(`${p} has exactly one h1`, h1 === 1, String(h1));
        const title = await page.title();
        ok(`${p} has a title`, title.length > 5);
      }
    }
    ok(`no script errors on ${label}`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
  const req = await browser.newContext();
  for (const [href, from] of seen) {
    const r = await req.request.get(BASE + href);
    ok(`link ${href} (from ${from})`, r.status() === 200, String(r.status()));
  }

  console.log('3D hero');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(BASE + '/');
    await page.waitForTimeout(5000);
    const live = await page.evaluate(() => document.querySelector('[data-hero-visual]').classList.contains('is-live'));
    console.log(`  info  live 3D started in this browser: ${live} (headless browsers may lack WebGL; the still image is used then)`);
    ok('no errors or security-policy blocks with 3D', errors.length === 0, errors.join(' | '));
    await ctx.close();
    const rctx = await browser.newContext({ reducedMotion: 'reduce' });
    const rpage = await rctx.newPage();
    const loaded = [];
    rpage.on('request', (r) => loaded.push(r.url()));
    await rpage.goto(BASE + '/');
    await rpage.waitForTimeout(3000);
    ok('reduce motion: 3D code never downloaded', !loaded.some((u) => u.includes('connection-sphere')));
    ok('reduce motion: still image shown', await rpage.isVisible('.hero__still'));
    await rctx.close();
  }

  console.log('Mobile menu');
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(BASE + '/');
    ok('menu hidden at first', !(await page.isVisible('#site-nav')));
    await page.click('[data-nav-toggle]');
    ok('menu opens', await page.isVisible('#site-nav'));
    await page.click('[data-menu-toggle]');
    ok('services submenu opens', await page.isVisible('#services-menu a >> nth=0'));
    await page.keyboard.press('Escape');
    ok('Escape closes menu', !(await page.isVisible('#site-nav')));
    await ctx.close();
  }

  console.log('Contact form with JavaScript');
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE + '/contact/?service=outbound-calling&utm_source=e2e');
    ok('service preselected from link', (await page.inputValue('#lf-service')) === 'outbound-calling');
    await page.click('[data-submit]');
    ok('empty form shows field errors', (await page.locator('.field__error').count()) >= 3);
    await page.fill('#lf-name', 'Test Person');
    await page.fill('#lf-email', 'test.person@example.com');
    await page.fill('#lf-company', 'Example Co');
    await page.fill('#lf-message', 'Hello, this is an automated end-to-end test.');
    await page.check('#lf-consent');
    await page.waitForTimeout(2200); // the server rejects forms sent faster than a person could
    await Promise.all([page.waitForURL('**/thank-you/'), page.click('[data-submit]')]);
    ok('redirects to thank-you page', page.url().endsWith('/thank-you/'));
    await ctx.close();
  }

  console.log('Contact form without JavaScript');
  {
    const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(BASE + '/contact/');
    await page.fill('#lf-name', 'No Script');
    await page.fill('#lf-email', 'noscript@example.com');
    await page.fill('#lf-message', 'Sent with JavaScript turned off.');
    await page.check('#lf-consent');
    await Promise.all([page.waitForURL('**/thank-you/'), page.click('[data-submit]')]);
    ok('works without JavaScript', page.url().endsWith('/thank-you/'));
    await page.goto(BASE + '/contact/');
    await page.fill('#lf-email', 'bad');
    await Promise.all([page.waitForURL('**/contact/?error=invalid**'), page.click('[data-submit]')]);
    ok('invalid no-JS form returns to contact with error', page.url().includes('error=invalid'));
    await ctx.close();
  }

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})();
