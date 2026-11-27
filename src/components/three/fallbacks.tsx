/** Static SVG compositions shown before 3D loads, and permanently when WebGL or motion is unavailable. */
export function CoreFallback() {
  const nodes = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return { x: 200 + Math.cos(a) * 140, y: 200 + Math.sin(a) * 100, c: ["#3B82F6", "#22D3EE", "#8B5CF6", "#10B981", "#EC4899", "#F59E0B"][i] };
  });
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="fb-core" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#93c5fd" /><stop offset=".35" stopColor="#3b82f6" /><stop offset="1" stopColor="#3b82f6" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="200" cy="200" rx="160" ry="118" fill="none" stroke="#22d3ee" strokeOpacity=".35" />
      <ellipse cx="200" cy="200" rx="185" ry="70" fill="none" stroke="#a78bfa" strokeOpacity=".25" />
      {nodes.map((n, i) => <line key={`l${i}`} x1="200" y1="200" x2={n.x} y2={n.y} stroke={n.c} strokeOpacity=".4" />)}
      <circle cx="200" cy="200" r="90" fill="url(#fb-core)" opacity=".7" />
      <circle cx="200" cy="200" r="30" fill="#1d4ed8" stroke="#7dd3fc" strokeOpacity=".6" />
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="24" fill={n.c} opacity=".18" />
          <rect x={n.x - 12} y={n.y - 12} width="24" height="24" rx="5" fill="#0b1a33" stroke={n.c} />
        </g>
      ))}
    </svg>
  );
}

export function ShieldFallback() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="fb-sh" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#2563eb" stopOpacity=".55" /><stop offset="1" stopColor="#2563eb" stopOpacity="0" /></radialGradient>
        <linearGradient id="fb-sh2" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#1e40af" /><stop offset="1" stopColor="#0b1a33" /></linearGradient>
      </defs>
      <circle cx="200" cy="200" r="170" fill="url(#fb-sh)" />
      <circle cx="200" cy="200" r="150" fill="none" stroke="#22d3ee" strokeOpacity=".5" strokeDasharray="600 400" />
      <path d="M200 92c25 14 50 18 70 18 0 70-20 130-70 168-50-38-70-98-70-168 20 0 45-4 70-18z" fill="url(#fb-sh2)" stroke="#7dd3fc" strokeOpacity=".8" strokeWidth="2" />
      <rect x="178" y="190" width="44" height="36" rx="6" fill="#e0f2fe" />
      <path d="M186 190v-10a14 14 0 0 1 28 0v10" fill="none" stroke="#e0f2fe" strokeWidth="6" />
    </svg>
  );
}

export function TeamFallback() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden>
      <ellipse cx="200" cy="200" rx="170" ry="50" fill="#1d4ed8" opacity=".12" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const x = 200 + Math.cos(a) * 130, y = 190 + Math.sin(a) * 40;
        return (
          <g key={i}>
            <line x1="200" y1="110" x2={x} y2={y - 20} stroke="#60a5fa" strokeOpacity=".25" />
            <circle cx={x} cy={y - 26} r="9" fill={["#3B82F6", "#22D3EE", "#8B5CF6", "#10B981"][i % 4]} />
            <rect x={x - 11} y={y - 14} width="22" height="22" rx="11" fill={["#3B82F6", "#22D3EE", "#8B5CF6", "#10B981"][i % 4]} opacity=".7" />
          </g>
        );
      })}
      <circle cx="200" cy="110" r="40" fill="#3b82f6" opacity=".25" />
      <circle cx="200" cy="110" r="16" fill="#dbeafe" />
    </svg>
  );
}
