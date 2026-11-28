"use client";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Glow, LoopControl, Particles, canvasProps } from "./shared";
import type { SceneProps } from "./scene-frame";

/** Module nodes orbiting the operations core: team, clients, finance, analytics, CRM, payroll. */
const NODES = [
  { color: "#3B82F6", shape: "team" },
  { color: "#22D3EE", shape: "analytics" },
  { color: "#8B5CF6", shape: "crm" },
  { color: "#10B981", shape: "finance" },
  { color: "#EC4899", shape: "clients" },
  { color: "#F59E0B", shape: "payroll" },
] as const;

function nodePosition(i: number, t = 0): THREE.Vector3 {
  const a = (i / NODES.length) * Math.PI * 2 + t;
  const tilt = Math.sin(a * 2) * 0.55;
  return new THREE.Vector3(Math.cos(a) * 2.9, tilt, Math.sin(a) * 2.9);
}

function ModuleNode({ index, color, shape }: { index: number; color: string; shape: string }) {
  const ref = useRef<THREE.Group>(null);
  const pos = nodePosition(index);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = pos.y + Math.sin(t * 0.9 + index) * 0.12;
    ref.current.rotation.y = t * 0.4 + index;
  });
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} metalness={0.3} roughness={0.25} />;
  return (
    <group ref={ref} position={pos}>
      <mesh>
        <boxGeometry args={[0.56, 0.56, 0.56]} />
        <meshStandardMaterial color="#16305c" emissive="#1e3a8a" emissiveIntensity={0.35} metalness={0.3} roughness={0.25} transparent opacity={0.8} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.58, 0.58, 0.58)]} />
        <lineBasicMaterial color={color} transparent opacity={0.9} />
      </lineSegments>
      {/* inner glyph: abstract symbol per module */}
      {shape === "team" && (
        <group scale={0.9}>
          <mesh position={[-0.1, 0.05, 0]}><sphereGeometry args={[0.07, 16, 16]} />{mat}</mesh>
          <mesh position={[0.1, 0.05, 0]}><sphereGeometry args={[0.07, 16, 16]} />{mat}</mesh>
          <mesh position={[0, -0.1, 0]}><capsuleGeometry args={[0.09, 0.08, 4, 12]} />{mat}</mesh>
        </group>
      )}
      {shape === "analytics" && (
        <group position={[0, -0.12, 0]}>
          {[0.1, 0.2, 0.3].map((h, k) => (
            <mesh key={k} position={[(k - 1) * 0.11, h / 2, 0]}><boxGeometry args={[0.07, h, 0.07]} />{mat}</mesh>
          ))}
        </group>
      )}
      {shape === "crm" && <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.13, 0.035, 12, 32]} />{mat}</mesh>}
      {shape === "finance" && <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />{mat}</mesh>}
      {shape === "clients" && <mesh><octahedronGeometry args={[0.16]} />{mat}</mesh>}
      {shape === "payroll" && <mesh><boxGeometry args={[0.26, 0.16, 0.04]} />{mat}</mesh>}
      <Glow color={color} scale={1.6} opacity={0.35} />
    </group>
  );
}

/** Curved connection from hub to a node, with a data pulse travelling along it. */
function Link({ index, color }: { index: number; color: string }) {
  const pulse = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => {
    const end = nodePosition(index);
    const mid = end.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, 0.6, 0));
    return new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), mid, end);
  }, [index]);
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 }));
  }, [curve, color]);
  useFrame((state) => {
    if (!pulse.current) return;
    const t = (state.clock.elapsedTime * 0.35 + index / NODES.length) % 1;
    pulse.current.position.copy(curve.getPoint(t));
  });
  return (
    <group>
      <primitive object={line} />
      <mesh ref={pulse}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Core() {
  const shell = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (shell.current) { shell.current.rotation.y += dt * 0.25; shell.current.rotation.x += dt * 0.1; }
    if (ringA.current) ringA.current.rotation.z += dt * 0.4;
    if (ringB.current) ringB.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.5) * 0.1;
  });
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.72, 3]} />
        <meshStandardMaterial color="#1d4ed8" emissive="#3b82f6" emissiveIntensity={1.4} roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshBasicMaterial color="#7dd3fc" wireframe transparent opacity={0.35} />
      </mesh>
      <mesh ref={ringA} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.012, 8, 128]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 2.4, 0.4, 0]}>
        <torusGeometry args={[1.85, 0.008, 8, 128]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.5} />
      </mesh>
      <Glow color="#3b82f6" scale={4.2} opacity={0.9} />
      <Glow color="#22d3ee" scale={2.2} opacity={0.6} />
    </group>
  );
}

function Rig({ still, children }: { still: boolean; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (!group.current) return;
    if (!still) group.current.rotation.y += dt * 0.08;
    // mouse parallax, eased
    const tx = state.pointer.y * 0.18;
    const tz = -state.pointer.x * 0.12;
    group.current.rotation.x += (tx + 0.12 - group.current.rotation.x) * 0.04;
    group.current.rotation.z += (tz - group.current.rotation.z) * 0.04;
  });
  return <group ref={group} rotation={[0.12, 0.4, 0]}>{children}</group>;
}

export default function HeroCoreScene({ still, active }: SceneProps) {
  return (
    <Canvas {...canvasProps} camera={{ position: [0, 1.5, 9.6], fov: 42 }}>
      <LoopControl active={active} still={still} />
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 5, 5]} intensity={40} color="#93c5fd" />
      <pointLight position={[-5, -2, -3]} intensity={25} color="#a78bfa" />
      <Rig still={still}>
        <Core />
        {NODES.map((n, i) => (
          <group key={n.shape}>
            <Link index={i} color={n.color} />
            <ModuleNode index={i} color={n.color} shape={n.shape} />
          </group>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
          <ringGeometry args={[2.6, 4.4, 96, 1]} />
          <meshBasicMaterial color="#1e3a8a" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
        <Particles count={520} radius={7} />
      </Rig>
    </Canvas>
  );
}
