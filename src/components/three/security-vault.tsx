"use client";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Glow, LoopControl, Particles, canvasProps } from "./shared";
import type { SceneProps } from "./scene-frame";

function useShieldGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 1.35);
    s.bezierCurveTo(0.45, 1.1, 0.85, 1.05, 1.1, 1.05);
    s.bezierCurveTo(1.12, 0.1, 0.85, -0.85, 0, -1.4);
    s.bezierCurveTo(-0.85, -0.85, -1.12, 0.1, -1.1, 1.05);
    s.bezierCurveTo(-0.85, 1.05, -0.45, 1.1, 0, 1.35);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.28, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 4, curveSegments: 32 });
    g.center();
    return g;
  }, []);
}

function Vault({ still }: { still: boolean }) {
  const g = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const shield = useShieldGeometry();
  const edges = useMemo(() => new THREE.EdgesGeometry(shield, 30), [shield]);
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    if (g.current) {
      const target = still ? 0.35 : Math.sin(t * 0.4) * 0.45;
      g.current.rotation.y += (target + s.pointer.x * 0.25 - g.current.rotation.y) * 0.05;
      g.current.rotation.x += (-s.pointer.y * 0.12 - g.current.rotation.x) * 0.05;
    }
    if (ring1.current) ring1.current.rotation.z += dt * 0.5;
    if (ring2.current) ring2.current.rotation.z -= dt * 0.3;
  });
  return (
    <group ref={g}>
      <mesh geometry={shield}>
        <meshPhysicalMaterial color="#0f2a5c" metalness={0.5} roughness={0.18} clearcoat={1} clearcoatRoughness={0.1} emissive="#1d4ed8" emissiveIntensity={0.35} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#7dd3fc" transparent opacity={0.8} />
      </lineSegments>
      {/* lock */}
      <group position={[0, -0.1, 0.32]}>
        <mesh position={[0, 0.28, 0]}>
          <torusGeometry args={[0.24, 0.06, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#e0f2fe" emissive="#22d3ee" emissiveIntensity={0.8} metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.7, 0.55, 0.16]} />
          <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={0.6} metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 20]} />
          <meshBasicMaterial color="#0b1a33" />
        </mesh>
      </group>
      <mesh ref={ring1}>
        <torusGeometry args={[1.9, 0.012, 8, 128, Math.PI * 1.5]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
      </mesh>
      <mesh ref={ring2} rotation={[0.3, 0.2, 0]}>
        <torusGeometry args={[2.25, 0.008, 8, 128, Math.PI * 1.2]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.6} />
      </mesh>
      <Glow color="#2563eb" scale={5} opacity={0.65} position={[0, 0, -0.6]} />
    </group>
  );
}

export default function SecurityVaultScene({ still, active }: SceneProps) {
  return (
    <Canvas {...canvasProps} camera={{ position: [0, 0, 6.2], fov: 40 }}>
      <LoopControl active={active} still={still} />
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 4]} intensity={45} color="#bfdbfe" />
      <pointLight position={[-3, -2, 3]} intensity={25} color="#a78bfa" />
      <Vault still={still} />
      <Particles count={220} radius={5} size={0.02} color="#93c5fd" />
    </Canvas>
  );
}
