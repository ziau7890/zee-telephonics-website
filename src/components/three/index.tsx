"use client";
import { SceneFrame } from "./scene-frame";
import { CoreFallback, ShieldFallback, TeamFallback } from "./fallbacks";

// Each loader is a separate dynamic import, so three.js is split out of the main bundle.
const loadHero = () => import("./hero-core");
const loadEco = () => import("./ecosystem");
const loadTeam = () => import("./team-orbit");
const loadVault = () => import("./security-vault");

export function HeroCore({ className }: { className?: string }) {
  return <SceneFrame load={loadHero} fallback={<CoreFallback />} className={className} label="Interactive 3D illustration of the operations core: a glowing central hub connected to six modules for team, analytics, CRM, finance, clients and payroll." />;
}
export function Ecosystem({ className }: { className?: string }) {
  return <SceneFrame load={loadEco} fallback={<CoreFallback />} className={className} label="3D layered platform showing six connected modules on a shared data layer: team management, CRM, payroll, finance, invoicing and analytics." />;
}
export function TeamOrbit({ className }: { className?: string }) {
  return <SceneFrame load={loadTeam} fallback={<TeamFallback />} className={className} label="3D illustration of a team: abstract people arranged around a central coordinating node." />;
}
export function SecurityVault({ className }: { className?: string }) {
  return <SceneFrame load={loadVault} fallback={<ShieldFallback />} className={className} label="3D shield with a lock, representing encrypted and access-controlled data." />;
}
