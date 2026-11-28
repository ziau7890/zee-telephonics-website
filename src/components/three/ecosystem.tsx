"use client";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Glow, LoopControl, Particles, canvasProps } from "./shared";
import type { SceneProps } from "./scene-frame";

const MODULES = ["#3B82F6", "#8B5CF6", "#10B981", "#14B8A6", "#F59E0B", "#22D3EE"]; // team, crm, payroll, finance, invoicing, analytics

function Plate({ y, radius, color, opacity }: { y: number; radius: number; color: string; opacity: number }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.CylinderGeometry(radius, radius, 0.08, 6)), [radius]);
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, 0.08, 6]} />
        <meshPhysicalMaterial color={color} transparent opacity={opacity} roughness={0.2} metalness={0.1} clearcoat={1} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#60a5fa" transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}

function ModuleBlock({ i }: { i: number }) {
  const ref = useRef<THREE.Group>(null);
  const a = (i / MODULES.length) * Math.PI * 2 + Math.PI / 6;
  const r = 1.75;
  const color = MODULES[i];
  useFrame((s) => {
    if (ref.current) ref.current.position.y = 0.42 + Math.sin(s.clock.elapsedTime * 1.1 + i) * 0.08;
  });
  const beam = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a) * r, 0.3, Math.sin(a) * r), new THREE.Vector3(0, 1.45, 0)]);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 }));
  }, [a, color]);
  return (
    <>
      <group ref={ref} position={[Math.cos(a) * r, 0.42, Math.sin(a) * r]}>
        <mesh>
          <cylinderGeometry args={[0.42, 0.42, 0.42, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
        <Glow color={color} scale={1.5} opacity={0.3} />
      </group>
      <primitive object={beam} />
    </>
  );
}

function Stack({ still }: { still: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s, dt) => {
    if (!g.current) return;
    if (!still) g.current.rotation.y += dt * 0.12;
    g.current.rotation.x += (s.pointer.y * 0.1 + 0.05 - g.current.rotation.x) * 0.05;
  });
  return (
    <group ref={g} position={[0, -0.6, 0]}>
      <Plate y={-0.9} radius={3.3} color="#0b1a33" opacity={0.75} />
      <Plate y={0} radius={2.6} color="#102347" opacity={0.7} />
      {MODULES.map((_, i) => <ModuleBlock key={i} i={i} />)}
      <group position={[0, 1.55, 0]}>
        <mesh>
          <octahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={1.2} roughness={0.1} metalness={0.6} />
        </mesh>
        <Glow color="#38bdf8" scale={3} opacity={0.7} />
      </group>
      <Particles count={260} radius={5} size={0.022} />
    </group>
  );
}

export default function EcosystemScene({ still, active }: SceneProps) {
  return (
    <Canvas {...canvasProps} camera={{ position: [0, 3.2, 7.2], fov: 40 }}>
      <LoopControl active={active} still={still} />
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 6, 4]} intensity={45} color="#bfdbfe" />
      <pointLight position={[-4, 1, -3]} intensity={20} color="#c4b5fd" />
      <Stack still={still} />
    </Canvas>
  );
}
