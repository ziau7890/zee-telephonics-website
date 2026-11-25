/**
 * Decides whether this device gets the live 3D hero, and loads it only after the
 * page is visible. Otherwise the still image stays, with nothing else downloaded.
 */
type Nav = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
  deviceMemory?: number;
};

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function initHero(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas');
  if (!canvas) return;

  const nav = navigator as Nav;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const slowNet = nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? '');
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4;
  const lowCores = (navigator.hardwareConcurrency || 4) < 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = window.matchMedia('(max-width: 760px)').matches;

  // Phones keep the still image: the globe is small there, the still looks almost identical,
  // and skipping 3D saves battery and keeps the page responsive on slower phones.
  if (small || reducedMotion.matches || slowNet || lowMemory || lowCores || !supportsWebGL()) return;

  const lite = coarse; // tablets and touch laptops get a lighter scene
  let instance: { start(): void; stop(): void; dispose(): void } | null = null;

  const boot = async () => {
    try {
      const { createConnectionSphere } = await import('./connection-sphere');
      canvas.addEventListener('sphere:ready', () => root.classList.add('is-live'), { once: true });
      instance = createConnectionSphere(canvas, { lite });

      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !document.hidden) instance?.start();
        else instance?.stop();
      });
      io.observe(root);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) instance?.stop();
        else if (root.getBoundingClientRect().bottom > 0) instance?.start();
      });
      reducedMotion.addEventListener('change', (e) => {
        if (e.matches) {
          root.classList.remove('is-live');
          io.disconnect();
          instance?.dispose();
          instance = null;
        }
      });
    } catch {
      // Any failure: keep the still image, show no error.
      root.classList.remove('is-live');
    }
  };

  const whenIdle = (cb: () => void) => {
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(cb, { timeout: 2500 });
    else setTimeout(cb, 1200);
  };

  if (document.readyState === 'complete') whenIdle(boot);
  else window.addEventListener('load', () => whenIdle(boot), { once: true });
}
