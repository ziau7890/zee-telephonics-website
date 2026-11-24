/**
 * Builds the still image of the connection sphere at build time (dist/hero-sphere.svg).
 * It shows instantly, and stays as the only visual for phones that cannot run 3D
 * and for visitors who turn on "reduce motion".
 */
import type { APIRoute } from 'astro';
import { fibonacciSphere, arcPoints, seeded, type Vec3 } from '../lib/sphere';

const SIZE = 800;
const R = 300;
const C = SIZE / 2;

function rotate([x, y, z]: Vec3): Vec3 {
  const ay = 0.55, ax = 0.32; // match the 3D scene's starting tilt
  const x1 = x * Math.cos(ay) + z * Math.sin(ay);
  const z1 = -x * Math.sin(ay) + z * Math.cos(ay);
  const y2 = y * Math.cos(ax) - z1 * Math.sin(ax);
  const z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
  return [x1, y2, z2];
}
const px = (v: Vec3) => [C + v[0] * R, C - v[1] * R] as const;
const f = (n: number) => n.toFixed(1);

export const GET: APIRoute = () => {
  const rand = seeded(7);
  const pts = fibonacciSphere(900).map(rotate);
  const dots = pts
    .filter((p) => p[2] > -0.15)
    .map((p) => {
      const [x, y] = px(p);
      const depth = (p[2] + 0.15) / 1.15;
      return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + depth * 1.4)}" fill-opacity="${(0.18 + depth * 0.7).toFixed(2)}"/>`;
    })
    .join('');

  const front = pts.filter((p) => p[2] > 0.25);
  const arcs: string[] = [];
  const nodes: string[] = [];
  for (let i = 0; i < 9; i++) {
    const a = front[Math.floor(rand() * front.length)];
    const b = front[Math.floor(rand() * front.length)];
    if (a === b) continue;
    const line = arcPoints(a, b, 40).map((p) => px(p).map(f).join(',')).join(' ');
    arcs.push(`<polyline points="${line}"/>`);
    for (const p of [a, b]) {
      const [x, y] = px(p);
      nodes.push(`<circle cx="${f(x)}" cy="${f(y)}" r="4"/><circle cx="${f(x)}" cy="${f(y)}" r="10" fill-opacity="0.18"/>`);
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="A globe of connected points">
<defs>
<radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0.62" stop-color="#1E5EFF" stop-opacity="0"/><stop offset="0.74" stop-color="#1E5EFF" stop-opacity="0.18"/><stop offset="0.8" stop-color="#00D4FF" stop-opacity="0.08"/><stop offset="1" stop-color="#00D4FF" stop-opacity="0"/></radialGradient>
<radialGradient id="core" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#1A3266" stop-opacity="0.55"/><stop offset="1" stop-color="#0A1630" stop-opacity="0"/></radialGradient>
<linearGradient id="arc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E5EFF"/><stop offset="1" stop-color="#00D4FF"/></linearGradient>
</defs>
<circle cx="${C}" cy="${C}" r="${R * 1.32}" fill="url(#glow)"/>
<circle cx="${C}" cy="${C}" r="${R}" fill="url(#core)"/>
<g fill="#9FE9FF">${dots}</g>
<g fill="none" stroke="url(#arc)" stroke-width="2" stroke-linecap="round" stroke-opacity="0.85">${arcs.join('')}</g>
<g fill="#00D4FF">${nodes.join('')}</g>
</svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
