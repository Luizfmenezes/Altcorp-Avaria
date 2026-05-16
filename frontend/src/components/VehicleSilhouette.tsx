import { useMemo, useState } from "react";
import { Box } from "lucide-react";

export type VehicleType = "bus" | "car";
export type ViewKey = "side" | "top" | "rear";

export interface Area {
  code: string;
  view: ViewKey;
  // Center point of the damage marker, relative to a 320x180 viewBox per view.
  anchor: [number, number];
}

// Canonical Portuguese labels per area code — used in legend, tooltip and callouts.
export const AREA_LABELS_PT: Record<string, string> = {
  roof: "Teto",
  windshield: "Para-brisa",
  front_bumper: "Para-choque dianteiro",
  rear_bumper: "Para-choque traseiro",
  left_side_front: "Lateral dianteira esquerda",
  left_side_rear: "Lateral traseira esquerda",
  right_side_front: "Lateral dianteira direita",
  right_side_rear: "Lateral traseira direita",
};

export function areaLabel(code: string): string {
  return AREA_LABELS_PT[code] ?? code;
}

// Marker anchor points for the bus, three views — viewBox 320x180.
export const BUS_AREAS: Area[] = [
  { code: "front_bumper",     view: "side", anchor: [295, 128] },
  { code: "windshield",       view: "side", anchor: [274, 64] },
  { code: "left_side_front",  view: "side", anchor: [210, 82] },
  { code: "left_side_rear",   view: "side", anchor: [98, 82] },
  { code: "rear_bumper",      view: "side", anchor: [22, 128] },
  { code: "roof",             view: "side", anchor: [160, 30] },

  { code: "roof",             view: "top",  anchor: [160, 90] },
  { code: "front_bumper",     view: "top",  anchor: [291, 90] },
  { code: "rear_bumper",      view: "top",  anchor: [29, 90] },
  { code: "left_side_front",  view: "top",  anchor: [217, 25] },
  { code: "left_side_rear",   view: "top",  anchor: [102, 25] },
  { code: "right_side_front", view: "top",  anchor: [217, 155] },
  { code: "right_side_rear",  view: "top",  anchor: [102, 155] },

  { code: "rear_bumper",      view: "rear", anchor: [160, 159] },
  { code: "roof",             view: "rear", anchor: [160, 31] },
  { code: "left_side_rear",   view: "rear", anchor: [88, 94] },
  { code: "right_side_rear",  view: "rear", anchor: [232, 94] },
  { code: "windshield",       view: "rear", anchor: [160, 66] },
];

// Marker anchor points for the car, three views — viewBox 320x180.
export const CAR_AREAS: Area[] = [
  { code: "front_bumper",     view: "side", anchor: [294, 126] },
  { code: "windshield",       view: "side", anchor: [222, 70] },
  { code: "roof",             view: "side", anchor: [168, 50] },
  { code: "left_side_front",  view: "side", anchor: [200, 110] },
  { code: "left_side_rear",   view: "side", anchor: [108, 110] },
  { code: "rear_bumper",      view: "side", anchor: [30, 122] },

  { code: "roof",             view: "top",  anchor: [160, 90] },
  { code: "front_bumper",     view: "top",  anchor: [288, 90] },
  { code: "rear_bumper",      view: "top",  anchor: [32, 90] },
  { code: "left_side_front",  view: "top",  anchor: [205, 32] },
  { code: "left_side_rear",   view: "top",  anchor: [110, 32] },
  { code: "right_side_front", view: "top",  anchor: [205, 148] },
  { code: "right_side_rear",  view: "top",  anchor: [110, 148] },

  { code: "rear_bumper",      view: "rear", anchor: [160, 150] },
  { code: "roof",             view: "rear", anchor: [160, 40] },
  { code: "left_side_rear",   view: "rear", anchor: [96, 96] },
  { code: "right_side_rear",  view: "rear", anchor: [224, 96] },
  { code: "windshield",       view: "rear", anchor: [160, 70] },
];

interface Props {
  counts?: Record<string, number>;
  highlightArea?: string | null;
  defaultView?: ViewKey;
  compact?: boolean;
  vehicleType?: VehicleType;
  /** When provided, a "Ver modelo 3D" button is rendered above the legend peak line. */
  onShow3D?: () => void;
}

const VIEW_LABELS: Record<ViewKey, string> = { side: "Lateral", top: "Superior", rear: "Traseira" };

interface Heat {
  level: 0 | 1 | 2 | 3;
  color: string;
  radius: number;
}

export function VehicleSilhouette({
  counts = {},
  highlightArea,
  defaultView = "side",
  compact = false,
  vehicleType = "bus",
  onShow3D,
}: Props) {
  const [view, setView] = useState<ViewKey>(defaultView);
  const [hovered, setHovered] = useState<string | null>(null);

  const areas = vehicleType === "car" ? CAR_AREAS : BUS_AREAS;
  const max = useMemo(() => Math.max(1, ...Object.values(counts)), [counts]);
  const totalHits = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

  // Radius scales with the damage count — more damage, bigger circle.
  function heat(code: string): Heat {
    const v = counts[code] ?? 0;
    if (v <= 0) return { level: 0, color: "#bce416", radius: 0 };
    const ratio = v / max;
    const radius = 6 + ratio * 14;
    if (ratio > 0.66) return { level: 3, color: "#ff3d2e", radius };
    if (ratio > 0.33) return { level: 2, color: "#ffb020", radius };
    return { level: 1, color: "#bce416", radius };
  }

  const areasOnView = areas.filter((a) => a.view === view);
  const peak = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const allCodes = useMemo(() => {
    const set: string[] = [];
    for (const a of areas) if (!set.includes(a.code)) set.push(a.code);
    return set;
  }, [areas]);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-ink-100 bg-gradient-to-br from-paper-50 via-white to-paper-100">
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
            <div className="display text-2xl font-semibold text-ink-900">
              {vehicleType === "car" ? "Carro" : "Ônibus"} · {VIEW_LABELS[view]}
            </div>
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

      {/* Illustration */}
      <div className="relative px-6 py-4">
        <svg
          viewBox="0 0 320 180"
          className={`w-full ${compact ? "h-44" : "h-72"} drop-shadow-[0_24px_30px_rgba(10,10,12,0.10)]`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="vsBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0eee5" />
            </linearGradient>
            <linearGradient id="vsWindow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c1c22" />
              <stop offset="100%" stopColor="#46464e" />
            </linearGradient>
            <linearGradient id="vsLime" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#bce416" />
              <stop offset="100%" stopColor="#d2ef55" />
            </linearGradient>
            <filter id="vsShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="2" />
              <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {vehicleType === "car" ? <CarArt view={view} /> : <BusArt view={view} />}

          {/* Damage circles — radius proportional to count */}
          <g>
            {areasOnView.map((a) => {
              const v = counts[a.code] ?? 0;
              const h = heat(a.code);
              const isActive = hovered === a.code || highlightArea === a.code;
              if (v <= 0) {
                return (
                  <circle
                    key={a.code + a.view}
                    cx={a.anchor[0]}
                    cy={a.anchor[1]}
                    r={2.4}
                    fill="rgba(10,10,12,0.04)"
                    stroke="rgba(10,10,12,0.16)"
                    strokeWidth={0.5}
                    strokeDasharray="1.6 1.6"
                    onMouseEnter={() => setHovered(a.code)}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              }
              return (
                <g
                  key={a.code + a.view}
                  onMouseEnter={() => setHovered(a.code)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-default transition-all duration-200"
                  style={{ filter: isActive ? "drop-shadow(0 4px 12px rgba(10,10,12,0.22))" : undefined }}
                >
                  {h.level === 3 && (
                    <circle
                      cx={a.anchor[0]}
                      cy={a.anchor[1]}
                      r={h.radius}
                      fill="none"
                      stroke={h.color}
                      strokeWidth={1}
                      className="damage-pulse"
                    />
                  )}
                  <circle
                    cx={a.anchor[0]}
                    cy={a.anchor[1]}
                    r={h.radius * (isActive ? 1.12 : 1)}
                    fill={h.color}
                    fillOpacity={0.32}
                    stroke={h.color}
                    strokeWidth={isActive ? 1.6 : 1}
                  />
                  <text
                    x={a.anchor[0]}
                    y={a.anchor[1] + 2.6}
                    textAnchor="middle"
                    fontSize={Math.min(8, 3.4 + h.radius * 0.28)}
                    fontWeight="800"
                    fill="#0a0a0c"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {v}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {hovered && (
          <div className="pointer-events-none absolute left-6 top-4 rounded-2xl border border-ink-100 bg-white px-3 py-2 text-xs shadow-card animate-fade-in">
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Região</div>
            <div className="font-semibold text-ink-900">{areaLabel(hovered)}</div>
            <div className="mt-0.5 text-[11px] text-ink-500">
              {counts[hovered] ?? 0} {(counts[hovered] ?? 0) === 1 ? "ocorrência" : "ocorrências"}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="relative border-t border-ink-100 bg-white/60 px-6 py-4 backdrop-blur-sm">
        {onShow3D && (
          <div className="mb-3 flex justify-end">
            <button type="button" onClick={onShow3D} className="group btn-primary">
              <Box size={14} className="transition-transform duration-300 group-hover:rotate-[20deg]" />
              Ver modelo 3D
              <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-lime-400" />
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[11px] text-ink-500">
            <span className="eyebrow text-ink-400">Intensidade</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-lime-400" /> Baixa</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warn-500" /> Média</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger-500" /> Alta</span>
          </div>
          <div className="font-mono text-[11px] text-ink-400">
            Pico: {peak ? areaLabel(peak[0]) : "—"}
          </div>
        </div>

        {!compact && (
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px] md:grid-cols-3">
            {allCodes.map((code) => {
              const v = counts[code] ?? 0;
              return (
                <div
                  key={code}
                  className="flex items-center justify-between border-b border-dashed border-ink-100 py-1.5 last:border-0"
                  onMouseEnter={() => setHovered(code)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className="text-ink-600">{areaLabel(code)}</span>
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

/* ---------- Bus illustration ---------- */

function BusArt({ view }: { view: ViewKey }) {
  if (view === "top") return <BusTop />;
  if (view === "rear") return <BusRear />;
  return <BusSide />;
}

function BusSide() {
  return (
    <g filter="url(#vsShadow)">
      <ellipse cx="160" cy="170" rx="120" ry="3" fill="rgba(10,10,12,0.18)" />
      <rect x="20" y="38" width="276" height="100" rx="14" fill="url(#vsBody)" stroke="#0a0a0c" strokeWidth="1.4" />
      <rect x="28" y="20" width="262" height="20" rx="10" fill="#ececef" stroke="#0a0a0c" strokeWidth="1.2" />
      <path d="M 256,40 L 290,40 L 290,90 L 264,90 Z" fill="url(#vsWindow)" stroke="#0a0a0c" strokeWidth="0.8" />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={36 + i * 30} y={48} width={26} height={38} rx="3" fill="url(#vsWindow)" stroke="#0a0a0c" strokeWidth="0.6" />
      ))}
      <rect x="246" y="92" width="18" height="42" rx="2" fill="#1c1c22" stroke="#0a0a0c" strokeWidth="0.6" />
      <rect x="20" y="92" width="276" height="4" fill="url(#vsLime)" />
      <text x="78" y="112" fontSize="6" fontWeight="800" fill="#0a0a0c" style={{ fontFamily: "Bricolage Grotesque, sans-serif", letterSpacing: "0.16em" }}>
        ALTCORP
      </text>
      <rect x="74" y="106" width="2" height="8" fill="#bce416" />
      <ellipse cx="294" cy="112" rx="3" ry="4" fill="#fff7d6" stroke="#0a0a0c" strokeWidth="0.5" />
      <ellipse cx="24" cy="112" rx="2" ry="3.5" fill="#ff3d2e" stroke="#0a0a0c" strokeWidth="0.5" />
      {[68, 252].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="140" r="14" fill="#0a0a0c" />
          <circle cx={cx} cy="140" r="10" fill="#1c1c22" stroke="#46464e" strokeWidth="0.6" />
          <circle cx={cx} cy="140" r="5.5" fill="#ececef" />
          <circle cx={cx} cy="140" r="2" fill="#0a0a0c" />
        </g>
      ))}
    </g>
  );
}

function BusTop() {
  return (
    <g filter="url(#vsShadow)">
      <rect x="32" y="22" width="256" height="136" rx="22" fill="url(#vsBody)" stroke="#0a0a0c" strokeWidth="1.4" />
      <rect x="270" y="36" width="22" height="108" rx="6" fill="#ececef" stroke="#0a0a0c" strokeWidth="0.8" />
      <rect x="28" y="36" width="22" height="108" rx="6" fill="#ececef" stroke="#0a0a0c" strokeWidth="0.8" />
      {[80, 130, 180, 230].map((x, i) => (
        <rect key={i} x={x} y="68" width="32" height="44" rx="4" fill="#1c1c22" stroke="#0a0a0c" strokeWidth="0.5" />
      ))}
      <rect x="50" y="22" width="220" height="3" fill="url(#vsLime)" />
      <rect x="50" y="155" width="220" height="3" fill="url(#vsLime)" />
      <path d="M 296,84 L 304,90 L 296,96 Z" fill="#0a0a0c" />
    </g>
  );
}

function BusRear() {
  return (
    <g filter="url(#vsShadow)">
      <ellipse cx="160" cy="170" rx="92" ry="3" fill="rgba(10,10,12,0.18)" />
      <rect x="68" y="22" width="184" height="138" rx="14" fill="url(#vsBody)" stroke="#0a0a0c" strokeWidth="1.4" />
      <rect x="92" y="42" width="136" height="50" rx="6" fill="url(#vsWindow)" stroke="#0a0a0c" strokeWidth="0.8" />
      <rect x="68" y="94" width="184" height="4" fill="url(#vsLime)" />
      <rect x="138" y="118" width="44" height="14" rx="2" fill="#ffffff" stroke="#0a0a0c" strokeWidth="0.8" />
      <rect x="76" y="106" width="14" height="20" rx="3" fill="#ff3d2e" stroke="#0a0a0c" strokeWidth="0.5" />
      <rect x="230" y="106" width="14" height="20" rx="3" fill="#ff3d2e" stroke="#0a0a0c" strokeWidth="0.5" />
      <ellipse cx="100" cy="160" rx="14" ry="6" fill="#0a0a0c" />
      <ellipse cx="220" cy="160" rx="14" ry="6" fill="#0a0a0c" />
    </g>
  );
}

/* ---------- Car illustration ---------- */

function CarArt({ view }: { view: ViewKey }) {
  if (view === "top") return <CarTop />;
  if (view === "rear") return <CarRear />;
  return <CarSide />;
}

function CarSide() {
  return (
    <g filter="url(#vsShadow)">
      <ellipse cx="160" cy="158" rx="128" ry="3.5" fill="rgba(10,10,12,0.18)" />
      {/* Lower body */}
      <path
        d="M 24,128 L 24,108 Q 24,100 34,98 L 96,96 L 122,62 Q 126,56 136,56 L 224,56 Q 234,56 240,64 L 262,96 L 296,104 Q 304,106 304,116 L 304,128 Q 304,134 296,134 L 30,134 Q 24,134 24,128 Z"
        fill="url(#vsBody)"
        stroke="#0a0a0c"
        strokeWidth="1.4"
      />
      {/* Cabin glass */}
      <path d="M 130,64 L 152,64 L 152,94 L 110,94 Z" fill="url(#vsWindow)" stroke="#0a0a0c" strokeWidth="0.7" />
      <path d="M 160,64 L 222,64 Q 230,64 234,72 L 244,94 L 160,94 Z" fill="url(#vsWindow)" stroke="#0a0a0c" strokeWidth="0.7" />
      <rect x="153" y="64" width="6" height="30" fill="#0a0a0c" />
      {/* Lime accent */}
      <rect x="30" y="110" width="268" height="3.4" fill="url(#vsLime)" />
      {/* Door seam */}
      <line x1="156" y1="96" x2="156" y2="128" stroke="rgba(10,10,12,0.25)" strokeWidth="0.6" />
      <circle cx="148" cy="112" r="1.6" fill="#0a0a0c" />
      <circle cx="166" cy="112" r="1.6" fill="#0a0a0c" />
      {/* Lights */}
      <path d="M 296,106 L 304,110 L 304,118 L 296,118 Z" fill="#fff7d6" stroke="#0a0a0c" strokeWidth="0.5" />
      <path d="M 24,108 L 32,108 L 32,120 L 24,120 Z" fill="#ff3d2e" stroke="#0a0a0c" strokeWidth="0.5" />
      <text x="74" y="126" fontSize="5.4" fontWeight="800" fill="#0a0a0c" style={{ fontFamily: "Bricolage Grotesque, sans-serif", letterSpacing: "0.16em" }}>
        ALTCORP
      </text>
      {/* Wheels */}
      {[92, 244].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="134" r="18" fill="#0a0a0c" />
          <circle cx={cx} cy="134" r="12" fill="#1c1c22" stroke="#46464e" strokeWidth="0.6" />
          <circle cx={cx} cy="134" r="6" fill="#ececef" />
          <circle cx={cx} cy="134" r="2.2" fill="#0a0a0c" />
        </g>
      ))}
    </g>
  );
}

function CarTop() {
  return (
    <g filter="url(#vsShadow)">
      <rect x="48" y="34" width="224" height="112" rx="40" fill="url(#vsBody)" stroke="#0a0a0c" strokeWidth="1.4" />
      {/* Windshield + rear glass */}
      <path d="M 214,52 Q 232,56 238,72 L 238,108 Q 232,124 214,128 Z" fill="url(#vsWindow)" stroke="#0a0a0c" strokeWidth="0.6" />
      <path d="M 106,54 L 106,126 Q 90,122 84,108 L 84,72 Q 90,58 106,54 Z" fill="url(#vsWindow)" stroke="#0a0a0c" strokeWidth="0.6" />
      {/* Roof panel */}
      <rect x="116" y="58" width="92" height="64" rx="14" fill="#ececef" stroke="#0a0a0c" strokeWidth="0.6" />
      <rect x="60" y="34" width="200" height="3" fill="url(#vsLime)" />
      <rect x="60" y="143" width="200" height="3" fill="url(#vsLime)" />
      <path d="M 280,84 L 288,90 L 280,96 Z" fill="#0a0a0c" />
    </g>
  );
}

function CarRear() {
  return (
    <g filter="url(#vsShadow)">
      <ellipse cx="160" cy="158" rx="86" ry="3.5" fill="rgba(10,10,12,0.18)" />
      <path
        d="M 84,150 L 84,58 Q 84,40 104,38 L 216,38 Q 236,40 236,58 L 236,150 Q 236,154 230,154 L 90,154 Q 84,154 84,150 Z"
        fill="url(#vsBody)"
        stroke="#0a0a0c"
        strokeWidth="1.4"
      />
      <path d="M 100,52 L 220,52 L 212,86 L 108,86 Z" fill="url(#vsWindow)" stroke="#0a0a0c" strokeWidth="0.7" />
      <rect x="84" y="100" width="152" height="3.6" fill="url(#vsLime)" />
      <rect x="136" y="124" width="48" height="14" rx="2" fill="#ffffff" stroke="#0a0a0c" strokeWidth="0.8" />
      <rect x="92" y="96" width="22" height="14" rx="3" fill="#ff3d2e" stroke="#0a0a0c" strokeWidth="0.5" />
      <rect x="206" y="96" width="22" height="14" rx="3" fill="#ff3d2e" stroke="#0a0a0c" strokeWidth="0.5" />
      <ellipse cx="108" cy="154" rx="16" ry="6" fill="#0a0a0c" />
      <ellipse cx="212" cy="154" rx="16" ry="6" fill="#0a0a0c" />
    </g>
  );
}
