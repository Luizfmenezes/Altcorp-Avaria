import { useMemo, useState } from "react";

export interface Area {
  code: string;
  label: string;
  view: "side" | "top" | "rear";
  // Polygon hot-zone path coordinates relative to a 320x180 viewBox per view.
  path: string;
  // Anchor point for label callouts.
  anchor: [number, number];
}

// Hot zones for the three views. Same area codes as backend.
export const BUS_AREAS: Area[] = [
  // SIDE VIEW (left lateral) — viewBox 320x180
  { code: "front_bumper",     label: "Para-choque dianteiro",  view: "side", path: "M 286,118 L 304,118 L 304,138 L 286,138 Z", anchor: [295,128] },
  { code: "windshield",       label: "Para-brisa",             view: "side", path: "M 256,38 L 286,38 L 286,90 L 264,90 Z",     anchor: [274,64] },
  { code: "left_side_front",  label: "Lateral dianteira",      view: "side", path: "M 168,40 L 254,40 L 254,128 L 168,128 Z",   anchor: [210,82] },
  { code: "left_side_rear",   label: "Lateral traseira",       view: "side", path: "M 32,40  L 166,40 L 166,128 L 32,128  Z",   anchor: [98,82]  },
  { code: "rear_bumper",      label: "Para-choque traseiro",   view: "side", path: "M 14,118 L 30,118 L 30,138 L 14,138 Z",     anchor: [22,128] },
  { code: "roof",             label: "Teto",                   view: "side", path: "M 28,22 L 290,22 L 286,38 L 32,38 Z",       anchor: [160,30] },

  // TOP VIEW — viewBox 320x180
  { code: "roof",             label: "Teto",                   view: "top",  path: "M 40,30 L 280,30 L 280,150 L 40,150 Z",     anchor: [160,90] },
  { code: "front_bumper",     label: "Para-choque dianteiro",  view: "top",  path: "M 278,40 L 304,40 L 304,140 L 278,140 Z",   anchor: [291,90] },
  { code: "rear_bumper",      label: "Para-choque traseiro",   view: "top",  path: "M 16,40  L 42,40  L 42,140  L 16,140  Z",   anchor: [29,90]  },
  { code: "left_side_front",  label: "Lateral esq. diant.",    view: "top",  path: "M 160,18 L 274,18 L 274,32 L 160,32 Z",     anchor: [217,25] },
  { code: "left_side_rear",   label: "Lateral esq. tras.",     view: "top",  path: "M 46,18  L 158,18 L 158,32 L 46,32 Z",      anchor: [102,25] },
  { code: "right_side_front", label: "Lateral dir. diant.",    view: "top",  path: "M 160,148 L 274,148 L 274,162 L 160,162 Z", anchor: [217,155] },
  { code: "right_side_rear",  label: "Lateral dir. tras.",     view: "top",  path: "M 46,148 L 158,148 L 158,162 L 46,162 Z",   anchor: [102,155] },

  // REAR VIEW — viewBox 320x180
  { code: "rear_bumper",      label: "Para-choque traseiro",   view: "rear", path: "M 84,150 L 236,150 L 236,168 L 84,168 Z",   anchor: [160,159] },
  { code: "roof",             label: "Teto",                   view: "rear", path: "M 76,24 L 244,24 L 244,38 L 76,38 Z",       anchor: [160,31] },
  { code: "left_side_rear",   label: "Lateral esquerda",       view: "rear", path: "M 76,38 L 100,38 L 100,150 L 76,150 Z",     anchor: [88,94]  },
  { code: "right_side_rear",  label: "Lateral direita",        view: "rear", path: "M 220,38 L 244,38 L 244,150 L 220,150 Z",   anchor: [232,94] },
  { code: "windshield",       label: "Vidro traseiro",         view: "rear", path: "M 104,42 L 216,42 L 216,90 L 104,90 Z",     anchor: [160,66] },
];

interface Props {
  counts?: Record<string, number>;
  onPick?: (area: Area, x: number, y: number) => void;
  highlightArea?: string | null;
  defaultView?: "side" | "top" | "rear";
  compact?: boolean;
}

const VIEW_LABELS: Record<string, string> = {
  side: "Lateral",
  top: "Superior",
  rear: "Traseira",
};

export function VehicleSilhouette({ counts = {}, onPick, highlightArea, defaultView = "side", compact = false }: Props) {
  const [view, setView] = useState<"side" | "top" | "rear">(defaultView);
  const [hovered, setHovered] = useState<string | null>(null);

  const max = useMemo(() => Math.max(1, ...Object.values(counts)), [counts]);
  const totalHits = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

  function intensity(code: string): { fill: string; ring: string; level: number } {
    const v = counts[code] ?? 0;
    if (v === 0) return { fill: "rgba(10,10,12,0.025)", ring: "rgba(10,10,12,0.08)", level: 0 };
    const ratio = v / max;
    if (ratio > 0.66) return { fill: `rgba(255, 61, 46, ${0.28 + ratio * 0.45})`, ring: "rgba(255,61,46,0.7)", level: 3 };
    if (ratio > 0.33) return { fill: `rgba(255, 176, 32, ${0.32 + ratio * 0.4})`, ring: "rgba(255,176,32,0.7)", level: 2 };
    return { fill: `rgba(188, 228, 22, ${0.32 + ratio * 0.4})`, ring: "rgba(188,228,22,0.8)", level: 1 };
  }

  function handleClick(e: React.MouseEvent<SVGElement>, area: Area) {
    if (!onPick) return;
    const svg = (e.currentTarget.ownerSVGElement ?? e.currentTarget) as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onPick(area, x, y);
  }

  const areasOnView = BUS_AREAS.filter((a) => a.view === view);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-ink-100 bg-gradient-to-br from-paper-50 via-white to-paper-100">
      {/* Decorative grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(10,10,12,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,12,0.04) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3 px-6 pt-6">
        <div>
          <div className="eyebrow text-ink-500">Mapa de avarias</div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="display text-2xl font-semibold text-ink-900">Ônibus · {VIEW_LABELS[view]}</div>
            {totalHits > 0 && (
              <span className="font-mono text-[11px] font-medium text-ink-400">{totalHits} impactos</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-ink-100 bg-white p-1 shadow-sm">
          {(["side", "top", "rear"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                view === v ? "bg-ink-900 text-paper-50 shadow-sm" : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Bus illustration */}
      <div className="relative px-6 py-4">
        <svg
          viewBox="0 0 320 180"
          className={`w-full ${compact ? "h-44" : "h-72"} drop-shadow-[0_24px_30px_rgba(10,10,12,0.10)]`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="busBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0eee5" />
            </linearGradient>
            <linearGradient id="busWindow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c1c22" />
              <stop offset="100%" stopColor="#46464e" />
            </linearGradient>
            <linearGradient id="limeAccent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#bce416" />
              <stop offset="100%" stopColor="#d2ef55" />
            </linearGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="2" />
              <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {view === "side" && <BusSide />}
          {view === "top" && <BusTop />}
          {view === "rear" && <BusRear />}

          {/* Heat zones overlay */}
          <g>
            {areasOnView.map((a) => {
              const it = intensity(a.code);
              const isActive = hovered === a.code || highlightArea === a.code;
              return (
                <g key={a.code + a.view}>
                  <path
                    d={a.path}
                    fill={it.fill}
                    stroke={isActive ? "#0a0a0c" : it.ring}
                    strokeWidth={isActive ? 1.2 : 0.5}
                    strokeDasharray={it.level === 0 ? "2 2" : undefined}
                    onClick={(e) => handleClick(e as any, a)}
                    onMouseEnter={() => setHovered(a.code)}
                    onMouseLeave={() => setHovered(null)}
                    className={onPick ? "cursor-pointer transition-all duration-200" : "transition-all duration-200"}
                    style={{ filter: isActive ? "drop-shadow(0 4px 12px rgba(10,10,12,0.18))" : undefined }}
                  />
                  {it.level > 0 && (
                    <g>
                      <circle cx={a.anchor[0]} cy={a.anchor[1]} r="3.2" fill={it.level === 3 ? "#ff3d2e" : it.level === 2 ? "#ffb020" : "#bce416"} stroke="#ffffff" strokeWidth="1" />
                      {it.level === 3 && (
                        <circle cx={a.anchor[0]} cy={a.anchor[1]} r="3.2" fill="none" stroke="#ff3d2e" strokeWidth="1" className="damage-pulse" />
                      )}
                      <text
                        x={a.anchor[0]}
                        y={a.anchor[1] + 1.4}
                        textAnchor="middle"
                        fontSize="3.6"
                        fontWeight="800"
                        fill="#0a0a0c"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {counts[a.code]}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating tooltip */}
        {hovered && (
          <div className="pointer-events-none absolute left-6 top-4 rounded-2xl border border-ink-100 bg-white px-3 py-2 text-xs shadow-card animate-fade-in">
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Região</div>
            <div className="font-semibold text-ink-900">{areasOnView.find((a) => a.code === hovered)?.label}</div>
            <div className="mt-0.5 text-[11px] text-ink-500">
              {counts[hovered] ?? 0} {(counts[hovered] ?? 0) === 1 ? "ocorrência" : "ocorrências"}
            </div>
          </div>
        )}
      </div>

      {/* Legend + table */}
      <div className="relative border-t border-ink-100 bg-white/60 px-6 py-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[11px] text-ink-500">
            <span className="eyebrow text-ink-400">Intensidade</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-lime-400" /> Baixa</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warn-500" /> Média</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger-500" /> Alta</span>
          </div>
          <div className="font-mono text-[11px] text-ink-400">
            Pico: {Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"}
          </div>
        </div>

        {!compact && (
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px] md:grid-cols-3">
            {Object.entries(
              BUS_AREAS.reduce<Record<string, string>>((acc, a) => {
                if (!acc[a.code]) acc[a.code] = a.label;
                return acc;
              }, {})
            ).map(([code, label]) => {
              const v = counts[code] ?? 0;
              return (
                <div
                  key={code}
                  className="flex items-center justify-between border-b border-dashed border-ink-100 py-1.5 last:border-0"
                  onMouseEnter={() => setHovered(code)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className="text-ink-600">{label}</span>
                  <span className={`font-mono font-bold ${v > 0 ? "text-ink-900" : "text-ink-300"}`}>{v}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BusSide() {
  return (
    <g filter="url(#softShadow)">
      {/* Ground shadow */}
      <ellipse cx="160" cy="170" rx="120" ry="3" fill="rgba(10,10,12,0.18)" />

      {/* Main body */}
      <rect x="20" y="38" width="276" height="100" rx="14" fill="url(#busBody)" stroke="#0a0a0c" strokeWidth="1.4" />

      {/* Roof line */}
      <rect x="28" y="20" width="262" height="20" rx="10" fill="#ececef" stroke="#0a0a0c" strokeWidth="1.2" />
      <line x1="35" y1="30" x2="285" y2="30" stroke="#0a0a0c" strokeWidth="0.4" opacity="0.4" />

      {/* Windshield */}
      <path d="M 256,40 L 290,40 L 290,90 L 264,90 Z" fill="url(#busWindow)" stroke="#0a0a0c" strokeWidth="0.8" />
      <path d="M 258,44 L 286,44 L 286,86 L 266,86 Z" fill="rgba(255,255,255,0.12)" />

      {/* Side windows row */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect
          key={i}
          x={36 + i * 30}
          y={48}
          width={26}
          height={38}
          rx="3"
          fill="url(#busWindow)"
          stroke="#0a0a0c"
          strokeWidth="0.6"
        />
      ))}
      {/* Window inner glints */}
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={`g-${i}`}
          x1={38 + i * 30}
          y1={52}
          x2={56 + i * 30}
          y2={52}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="0.8"
        />
      ))}

      {/* Door */}
      <rect x="246" y="92" width="18" height="42" rx="2" fill="#1c1c22" stroke="#0a0a0c" strokeWidth="0.6" />
      <line x1="255" y1="94" x2="255" y2="132" stroke="#46464e" strokeWidth="0.5" />

      {/* Belt line + lime accent stripe */}
      <rect x="20" y="92" width="276" height="4" fill="url(#limeAccent)" />
      <rect x="20" y="91" width="276" height="1" fill="rgba(10,10,12,0.4)" />

      {/* Lower paneling */}
      <line x1="20" y1="118" x2="296" y2="118" stroke="rgba(10,10,12,0.15)" strokeWidth="0.4" />

      {/* Brand wordmark */}
      <text x="78" y="112" fontSize="6" fontWeight="800" fill="#0a0a0c" style={{ fontFamily: "Bricolage Grotesque, sans-serif", letterSpacing: "0.16em" }}>
        ALTCORP
      </text>
      <rect x="74" y="106" width="2" height="8" fill="#bce416" />

      {/* Headlights */}
      <ellipse cx="294" cy="112" rx="3" ry="4" fill="#fff7d6" stroke="#0a0a0c" strokeWidth="0.5" />
      {/* Tail light */}
      <ellipse cx="24" cy="112" rx="2" ry="3.5" fill="#ff3d2e" stroke="#0a0a0c" strokeWidth="0.5" />

      {/* Side mirror */}
      <path d="M 290,52 L 298,48 L 300,54 L 292,58 Z" fill="#1c1c22" stroke="#0a0a0c" strokeWidth="0.5" />

      {/* Wheels with hub detail */}
      <g>
        <circle cx="68" cy="140" r="14" fill="#0a0a0c" />
        <circle cx="68" cy="140" r="10" fill="#1c1c22" stroke="#46464e" strokeWidth="0.6" />
        <circle cx="68" cy="140" r="5.5" fill="#ececef" />
        <circle cx="68" cy="140" r="2" fill="#0a0a0c" />
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          const x = 68 + Math.cos(angle) * 4;
          const y = 140 + Math.sin(angle) * 4;
          return <circle key={i} cx={x} cy={y} r="0.8" fill="#46464e" />;
        })}
      </g>
      <g>
        <circle cx="252" cy="140" r="14" fill="#0a0a0c" />
        <circle cx="252" cy="140" r="10" fill="#1c1c22" stroke="#46464e" strokeWidth="0.6" />
        <circle cx="252" cy="140" r="5.5" fill="#ececef" />
        <circle cx="252" cy="140" r="2" fill="#0a0a0c" />
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          const x = 252 + Math.cos(angle) * 4;
          const y = 140 + Math.sin(angle) * 4;
          return <circle key={i} cx={x} cy={y} r="0.8" fill="#46464e" />;
        })}
      </g>
    </g>
  );
}

function BusTop() {
  return (
    <g filter="url(#softShadow)">
      {/* Roof */}
      <rect x="32" y="22" width="256" height="136" rx="22" fill="url(#busBody)" stroke="#0a0a0c" strokeWidth="1.4" />

      {/* Front bumper */}
      <rect x="270" y="36" width="22" height="108" rx="6" fill="#ececef" stroke="#0a0a0c" strokeWidth="0.8" />
      {/* Rear bumper */}
      <rect x="28" y="36" width="22" height="108" rx="6" fill="#ececef" stroke="#0a0a0c" strokeWidth="0.8" />

      {/* AC units */}
      {[80, 130, 180, 230].map((x, i) => (
        <rect key={i} x={x} y="68" width="32" height="44" rx="4" fill="#1c1c22" stroke="#0a0a0c" strokeWidth="0.5" />
      ))}

      {/* Center spine */}
      <line x1="50" y1="90" x2="270" y2="90" stroke="rgba(10,10,12,0.15)" strokeWidth="0.4" strokeDasharray="3 3" />

      {/* Lime accent strips on sides */}
      <rect x="50" y="22" width="220" height="3" fill="url(#limeAccent)" />
      <rect x="50" y="155" width="220" height="3" fill="url(#limeAccent)" />

      {/* Antenna */}
      <circle cx="270" cy="90" r="3" fill="#0a0a0c" />
      <line x1="270" y1="90" x2="284" y2="90" stroke="#0a0a0c" strokeWidth="1" />

      {/* Direction arrow */}
      <path d="M 296,84 L 304,90 L 296,96 Z" fill="#0a0a0c" />
    </g>
  );
}

function BusRear() {
  return (
    <g filter="url(#softShadow)">
      {/* Ground shadow */}
      <ellipse cx="160" cy="170" rx="92" ry="3" fill="rgba(10,10,12,0.18)" />

      {/* Main body silhouette */}
      <rect x="68" y="22" width="184" height="138" rx="14" fill="url(#busBody)" stroke="#0a0a0c" strokeWidth="1.4" />

      {/* Rear window */}
      <rect x="92" y="42" width="136" height="50" rx="6" fill="url(#busWindow)" stroke="#0a0a0c" strokeWidth="0.8" />
      <line x1="96" y1="48" x2="120" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

      {/* Lime accent */}
      <rect x="68" y="94" width="184" height="4" fill="url(#limeAccent)" />

      {/* Plate */}
      <rect x="138" y="118" width="44" height="14" rx="2" fill="#ffffff" stroke="#0a0a0c" strokeWidth="0.8" />
      <text x="160" y="128" fontSize="6.5" fontWeight="800" fill="#0a0a0c" textAnchor="middle" style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.12em" }}>
        ALT-2024
      </text>

      {/* Tail lights */}
      <rect x="76" y="106" width="14" height="20" rx="3" fill="#ff3d2e" stroke="#0a0a0c" strokeWidth="0.5" />
      <rect x="230" y="106" width="14" height="20" rx="3" fill="#ff3d2e" stroke="#0a0a0c" strokeWidth="0.5" />

      {/* Wheels */}
      <ellipse cx="100" cy="160" rx="14" ry="6" fill="#0a0a0c" />
      <ellipse cx="100" cy="160" rx="9" ry="3.5" fill="#1c1c22" />
      <ellipse cx="220" cy="160" rx="14" ry="6" fill="#0a0a0c" />
      <ellipse cx="220" cy="160" rx="9" ry="3.5" fill="#1c1c22" />

      {/* Exhaust hint */}
      <circle cx="240" cy="148" r="2.5" fill="#46464e" stroke="#0a0a0c" strokeWidth="0.5" />
    </g>
  );
}
