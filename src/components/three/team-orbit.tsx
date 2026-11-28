"use client";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Glow, LoopControl, canvasProps } from "./shared";
import type { SceneProps } from "./scene-frame";

const COLORS = ["#3B82F6", "#22D3EE", "#8B5CF6", "#10B981", "#60A5FA", "#A78BFA", "#2DD4BF", "#38BDF8"];

function Person({ position, color, scale = 1 }: { position: THREE.Vector3; color: string; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <capsuleGeometry args={[0.2, 0.22, 6, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.35} metalness={0.2} />
      </mesh>
    </group>
  );
}

function Team({ still }: { still: boolean }) {
  const g = useRef<THREE.Group>(null);
  const people = useMemo(() => {
    const out: { p: THREE.Vector3; c: string; s: number }[] = [];
    [[1.5, 6, 0.9], [2.6, 10, 0.75]].forEach(([r, n, s], ring) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.3;
        out.push({ p: new THREE.Vector3(Math.cos(a) * r, -0.3 - ring * 0.25, Math.sin(a) * r), c: COLORS[(i + ring) % COLORS.length], s });
      }
    });
    return out;
  }, []);
  const links = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    people.forEach(({ p }) => { pts.push(new THREE.Vector3(0, 0.6, 0), p.clone().add(new THREE.Vector3(0, 0.3, 0))); });
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: "#60a5fa", transparent: true, opacity: 0.22 }));
  }, [people]);
  useFrame((s, dt) => {
    if (!g.current) return;
    if (!still) g.current.rotation.y += dt * 0.1;
    g.current.rotation.x += (s.pointer.y * 0.08 + 0.08 - g.current.rotation.x) * 0.05;
  });
  return (
    <group ref={g}>
      <primitive object={links} />
      {people.map((x, i) => <Person key={i} position={x.p} color={x.c} scale={x.s} />)}
      <group position={[0, 0.6, 0]}>
        <mesh>
          <icosahedronGeometry args={[0.34, 2]} />
          <meshStandardMaterial color="#dbeafe" emissive="#3b82f6" emissiveIntensity={1.3} roughness={0.15} />
        </mesh>
        <Glow color="#3b82f6" scale={2.6} opacity={0.8} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <ringGeometry args={[1.2, 3.1, 64]} />
        <meshBasicMaterial color="#1d4ed8" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function TeamOrbitScene({ still, active }: SceneProps) {
  return (
    <Canvas {...canvasProps} camera={{ position: [0, 2.6, 6.4], fov: 40 }}>
      <LoopControl active={active} still={still} />
      <ambientLight intensity={0.45} />
      <pointLight position={[3, 5, 4]} intensity={40} color="#bfdbfe" />
      <pointLight position={[-3, 2, -4]} intensity={18} color="#a5f3fc" />
      <Team still={still} />
    </Canvas>
  );
}
