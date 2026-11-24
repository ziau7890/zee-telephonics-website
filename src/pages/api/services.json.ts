/** Published services ({ slug: title }), so the PHP form handler accepts exactly the services shown on the site. */
import type { APIRoute } from 'astro';
import { services } from '../../lib/content';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(Object.fromEntries(services.map((s) => [s.slug, s.title]))), { headers: { 'Content-Type': 'application/json' } });
