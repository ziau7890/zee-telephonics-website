/** Shared geometry helpers for the hero "connection sphere" (3D scene and still fallback). */

export type Vec3 = [number, number, number];

/** Evenly spread points on a unit sphere (Fibonacci lattice). */
export function fibonacciSphere(count: number): Vec3[] {
  const pts: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
  }
  return pts;
}

/** Small deterministic random generator so the still image is identical on every build. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * Points along a great-circle arc from a to b (unit vectors), lifted off the
 * surface in the middle so it reads as a connection travelling between two points.
 */
export function arcPoints(a: Vec3, b: Vec3, segments: number, lift = 0.22): Vec3[] {
  const omega = Math.acos(Math.min(1, Math.max(-1, dot(a, b))));
  const sinO = Math.sin(omega) || 1e-6;
  const out: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const k1 = Math.sin((1 - t) * omega) / sinO;
    const k2 = Math.sin(t * omega) / sinO;
    const h = 1 + lift * Math.sin(Math.PI * t) * (omega / Math.PI + 0.35);
    out.push([(a[0] * k1 + b[0] * k2) * h, (a[1] * k1 + b[1] * k2) * h, (a[2] * k1 + b[2] * k2) * h]);
  }
  return out;
}
