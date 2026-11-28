"use client";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { cn } from "@/lib/utils";

export interface SceneProps {
  /** true when the user prefers reduced motion: scenes render a still composition. */
  still: boolean;
  /** false when the canvas is scrolled out of view: scenes stop their render loop. */
  active: boolean;
}

function canUseWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

/**
 * Wraps a lazily imported 3D scene.
 * - Renders the static fallback first (and during SSR), so 3D never blocks first paint.
 * - Imports the scene only when it approaches the viewport.
 * - Falls back permanently without WebGL, on Save-Data, or on very low-end devices.
 * - Passes `still` for prefers-reduced-motion and `active` to pause off-screen.
 */
export function SceneFrame({ load, fallback, label, className }: { load: () => Promise<{ default: ComponentType<SceneProps> }>; fallback: React.ReactNode; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
  const [active, setActive] = useState(false);
  const [still, setStill] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setStill(mq.matches);
    const onMq = () => setStill(mq.matches);
    mq.addEventListener("change", onMq);

    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const lowEnd = nav.connection?.saveData || (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2;
    if (lowEnd || !canUseWebGL()) return () => mq.removeEventListener("change", onMq);

    let loaded = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
        if (entry.isIntersecting && !loaded) {
          loaded = true;
          const start = () => load().then((m) => setScene(() => m.default));
          const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
          if (ric) ric(start, { timeout: 1200 });
          else setTimeout(start, 200);
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, [load]);

  useEffect(() => {
    if (!Scene) return;
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, [Scene]);

  return (
    <div ref={ref} className={cn("relative [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_76%)]", className)} role="img" aria-label={label}>
      <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-0" : "opacity-100")} aria-hidden>
        {fallback}
      </div>
      {Scene && (
        <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")} aria-hidden>
          <Scene still={still} active={active} />
        </div>
      )}
    </div>
  );
}
