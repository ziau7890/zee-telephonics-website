"use client";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

/** Soft radial sprite used for fake bloom / glow without a post-processing pass. */
export function useGlowTexture() {
  return useMemo(() => {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.25, "rgba(255,255,255,0.55)");
    grd.addColorStop(0.6, "rgba(255,255,255,0.12)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

export function Glow({ color, scale = 1, opacity = 0.8, position }: { color: string; scale?: number; opacity?: number; position?: [number, number, number] }) {
  const map = useGlowTexture();
  return (
    <sprite position={position} scale={[scale, scale, scale]}>
      <spriteMaterial map={map} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

/** Field of slowly drifting particles in a spherical shell. */
export function Particles({ count = 500, radius = 6, color = "#7dd3fc", size = 0.025 }: { count?: number; radius?: number; color?: string; size?: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.35 + Math.random() * 0.65);
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, radius]);
  return (
    <points geometry={geometry}>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/** Stops/starts the render loop with visibility so off-screen canvases cost nothing. */
export function LoopControl({ active, still }: { active: boolean; still: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    setFrameloop(active && !still ? "always" : "demand");
    invalidate();
  }, [active, still, setFrameloop, invalidate]);
  return null;
}

export const canvasProps = {
  dpr: [1, 1.75] as [number, number],
  gl: { antialias: true, alpha: true, powerPreference: "default" as const },
  frameloop: "demand" as const,
};
