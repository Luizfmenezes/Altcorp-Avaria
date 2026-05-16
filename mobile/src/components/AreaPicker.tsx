import { useState } from "react";

export interface Area {
  code: string;
  label: string;
  view: "side" | "top" | "rear";
  path: string;
  anchor: [number, number];
}

const AREAS: Area[] = [
  // SIDE
  { code: "front_bumper",     label: "Para-choque dianteiro",  view: "side", path: "M 286,118 L 304,118 L 304,138 L 286,138 Z", anchor: [295,128] },
  { code: "windshield",       label: "Para-brisa",             view: "side", path: "M 256,38 L 286,38 L 286,90 L 264,90 Z",     anchor: [274,64] },
  { code: "left_side_front",  label: "Lateral dianteira",      view: "side", path: "M 168,40 L 254,40 L 254,128 L 168,128 Z",   anchor: [210,82] },
  { code: "left_side_rear",   label: "Lateral traseira",       view: "side", path: "M 32,40  L 166,40 L 166,128 L 32,128  Z",   anchor: [98,82]  },
  { code: "rear_bumper",      label: "Para-choque traseiro",   view: "side", path: "M 14,118 L 30,118 L 30,138 L 14,138 Z",     anchor: [22,128] },
  { code: "roof",             label: "Teto",                   view: "side", path: "M 28,22 L 290,22 L 286,38 L 32,38 Z",       anchor: [160,30] },
  // TOP
  { code: "roof",             label: "Teto",                   view: "top",  path: "M 40,30 L 280,30 L 280,150 L 40,150 Z",     anchor: [160,90] },
  { code: "front_bumper",     label: "Para-choque dianteiro",  view: "top",  path: "M 278,40 L 304,40 L 304,140 L 278,140 Z",   anchor: [291,90] },
  { code: "rear_bumper",      label: "Para-choque traseiro",   view: "top",  path: "M 16,40  L 42,40  L 42,140  L 16,140  Z",   anchor: [29,90]  },
  { code: "left_side_front",  label: "Lat. esq. diant.",       view: "top",  path: "M 160,18 L 274,18 L 274,32 L 160,32 Z",     anchor: [217,25] },
  { code: "left_side_rear",   label: "Lat. esq. tras.",        view: "top",  path: "M 46,18  L 158,18 L 158,32 L 46,32 Z",      anchor: [102,25] },
  { code: "right_side_front", label: "Lat. dir. diant.",       view: "top",  path: "M 160,148 L 274,148 L 274,162 L 160,162 Z", anchor: [217,155] },
  { code: "right_side_rear",  label: "Lat. dir. tras.",        view: "top",  path: "M 46,148 L 158,148 L 158,162 L 46,162 Z",   anchor: [102,155] },
  // REAR
  { code: "rear_bumper",      label: "Para-choque traseiro",   view: "rear", path: "M 84,150 L 236,150 L 236,168 L 84,168 Z",   anchor: [160,159] },
  { code: "roof",             label: "Teto",                   view: "rear", path: "M 76,24 L 244,24 L 244,38 L 76,38 Z",       anchor: [160,31] },
  { code: "left_side_rear",   label: "Lateral esquerda",       view: "rear", path: "M 76,38 L 100,38 L 100,150 L 76,150 Z",     anchor: [88,94]  },
  { code: "right_side_rear",  label: "Lateral direita",        view: "rear", path: "M 220,38 L 244,38 L 244,150 L 220,150 Z",   anchor: [232,94] },
  { code: "windshield",       label: "Vidro traseiro",         view: "rear", path: "M 104,42 L 216,42 L 216,90 L 104,90 Z",     anchor: [160,66] },
];

const VIEW_LABELS: Record<string, string> = { side: "Lateral", top: "Superior", rear: "Traseira" };

interface Props {
  marks: { area_code: string; x_pct?: number; y_pct?: number }[];
  onPick: (area: { code: string; label: string }, x: number, y: number) => void;
}

export function AreaPicker({ marks, onPick }: Props) {
  const [view, setView] = useState<"side" | "top" | "rear">("side");
  const [picked, setPicked] = useState<string | null>(null);

  function handle(e: React.MouseEvent<SVGElement>, area: Area) {
    const svg = (e.currentTarget.ownerSVGElement ?? e.currentTarget) as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPicked(area.code);
    onPick({ code: area.code, label: area.label }, x, y);
    setTimeout(() => setPicked(null), 400);
  }

  const areasOnView = AREAS.filter((a) => a.view === view);
  const markCount: Record<string, number> = {};
  for (const m of marks) markCount[m.area_code] = (markCount[m.area_code] ?? 0) + 1;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-100 bg-gradient-to-br from-paper-50 via-white to-paper-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(10,10,12,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,12,0.04) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="relative flex items-start justify-between gap-2 px-4 pt-4">
        <div>
          <div className="eyebrow text-ink-500">Marcar avaria</div>
          <div className="text-[15px] font-bold text-ink-900">Toque na região</div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-ink-100 bg-white p-1 shadow-sm">
          {(["side", "top", "rear"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                view === v ? "bg-ink-900 text-paper-50" : "text-ink-500"
              }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      <div className="relative px-2 py-2">
        <svg viewBox="0 0 320 180" className="h-56 w-full select-none drop-shadow-[0_18px_24px_rgba(10,10,12,0.10)]">
          <defs>
            <linearGradient id="busBodyM" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0eee5" />
            </linearGradient>
            <linearGradient id="busWindowM" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c1c22" />
              <stop offset="100%" stopColor="#46464e" />
            </linearGradient>
            <linearGradient id="limeM" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#bce416" />
              <stop offset="100%" stopColor="#d2ef55" />
            </linearGradient>
          </defs>

          {view === "side" && <BusSide />}
          {view === "top" && <BusTop />}
          {view === "rear" && <BusRear />}

          {/* Hot zones */}
          {areasOnView.map((a) => {
            const isPicked = picked === a.code;
            const hits = markCount[a.code] ?? 0;
            return (
              <g key={a.code + a.view}>
                <path
                  d={a.path}
                  fill={hits > 0 ? "rgba(255,61,46,0.18)" : "rgba(188,228,22,0.08)"}
                  stroke={hits > 0 ? "rgba(255,61,46,0.6)" : "rgba(10,10,12,0.18)"}
                  strokeWidth={isPicked ? "1.2" : "0.4"}
                  strokeDasharray={hits === 0 ? "2 2" : undefined}
                  onClick={(e) => handle(e as any, a)}
                  className="cursor-pointer transition-all"
                />
              </g>
            );
          })}

          {/* Mark pins */}
          {marks.map((m, i) =>
            m.x_pct != null && m.y_pct != null ? (
              <g key={i}>
                <circle cx={m.x_pct * 3.2} cy={m.y_pct * 1.8} r="3.6" fill="#ff3d2e" stroke="#ffffff" strokeWidth="0.8" />
                <circle cx={m.x_pct * 3.2} cy={m.y_pct * 1.8} r="3.6" fill="none" stroke="#ff3d2e" strokeWidth="0.8" className="damage-pulse" />
              </g>
            ) : null
          )}
        </svg>
      </div>

      <div className="relative border-t border-ink-100 bg-white/60 px-4 py-2 text-[10px] text-ink-400">
        <span className="font-mono uppercase tracking-wider">Pontos marcados:</span>{" "}
        <span className="font-bold text-ink-900">{marks.length}</span>
      </div>
    </div>
  );
}

function BusSide() {
  return (
    <g>
      <ellipse cx="160" cy="170" rx="120" ry="3" fill="rgba(10,10,12,0.18)" />
      <rect x="20" y="38" width="276" height="100" rx="14" fill="url(#busBodyM)" stroke="#0a0a0c" strokeWidth="1.4" />
      <rect x="28" y="20" width="262" height="20" rx="10" fill="#ececef" stroke="#0a0a0c" strokeWidth="1.2" />
      <path d="M 256,40 L 290,40 L 290,90 L 264,90 Z" fill="url(#busWindowM)" stroke="#0a0a0c" strokeWidth="0.8" />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={36 + i * 30} y={48} width={26} height={38} rx="3" fill="url(#busWindowM)" stroke="#0a0a0c" strokeWidth="0.6" />
      ))}
      <rect x="246" y="92" width="18" height="42" rx="2" fill="#1c1c22" stroke="#0a0a0c" strokeWidth="0.6" />
      <rect x="20" y="92" width="276" height="4" fill="url(#limeM)" />
      <text x="78" y="112" fontSize="6" fontWeight="800" fill="#0a0a0c" style={{ fontFamily: "Bricolage Grotesque, sans-serif", letterSpacing: "0.16em" }}>
        ALTCORP
      </text>
      <rect x="74" y="106" width="2" height="8" fill="#bce416" />
      <ellipse cx="294" cy="112" rx="3" ry="4" fill="#fff7d6" stroke="#0a0a0c" strokeWidth="0.5" />
      <ellipse cx="24" cy="112" rx="2" ry="3.5" fill="#ff3d2e" stroke="#0a0a0c" strokeWidth="0.5" />
      <g>
        <circle cx="68" cy="140" r="14" fill="#0a0a0c" />
        <circle cx="68" cy="140" r="10" fill="#1c1c22" />
        <circle cx="68" cy="140" r="5.5" fill="#ececef" />
        <circle cx="68" cy="140" r="2" fill="#0a0a0c" />
      </g>
      <g>
        <circle cx="252" cy="140" r="14" fill="#0a0a0c" />
        <circle cx="252" cy="140" r="10" fill="#1c1c22" />
        <circle cx="252" cy="140" r="5.5" fill="#ececef" />
        <circle cx="252" cy="140" r="2" fill="#0a0a0c" />
      </g>
    </g>
  );
}

function BusTop() {
  return (
    <g>
      <rect x="32" y="22" width="256" height="136" rx="22" fill="url(#busBodyM)" stroke="#0a0a0c" strokeWidth="1.4" />
      <rect x="270" y="36" width="22" height="108" rx="6" fill="#ececef" stroke="#0a0a0c" strokeWidth="0.8" />
      <rect x="28" y="36" width="22" height="108" rx="6" fill="#ececef" stroke="#0a0a0c" strokeWidth="0.8" />
      {[80, 130, 180, 230].map((x, i) => (
        <rect key={i} x={x} y="68" width="32" height="44" rx="4" fill="#1c1c22" stroke="#0a0a0c" strokeWidth="0.5" />
      ))}
      <line x1="50" y1="90" x2="270" y2="90" stroke="rgba(10,10,12,0.15)" strokeWidth="0.4" strokeDasharray="3 3" />
      <rect x="50" y="22" width="220" height="3" fill="url(#limeM)" />
      <rect x="50" y="155" width="220" height="3" fill="url(#limeM)" />
      <path d="M 296,84 L 304,90 L 296,96 Z" fill="#0a0a0c" />
    </g>
  );
}

function BusRear() {
  return (
    <g>
      <ellipse cx="160" cy="170" rx="92" ry="3" fill="rgba(10,10,12,0.18)" />
      <rect x="68" y="22" width="184" height="138" rx="14" fill="url(#busBodyM)" stroke="#0a0a0c" strokeWidth="1.4" />
      <rect x="92" y="42" width="136" height="50" rx="6" fill="url(#busWindowM)" stroke="#0a0a0c" strokeWidth="0.8" />
      <rect x="68" y="94" width="184" height="4" fill="url(#limeM)" />
      <rect x="138" y="118" width="44" height="14" rx="2" fill="#ffffff" stroke="#0a0a0c" strokeWidth="0.8" />
      <text x="160" y="128" fontSize="6.5" fontWeight="800" fill="#0a0a0c" textAnchor="middle" style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.12em" }}>
        ALT-2024
      </text>
      <rect x="76" y="106" width="14" height="20" rx="3" fill="#ff3d2e" stroke="#0a0a0c" strokeWidth="0.5" />
      <rect x="230" y="106" width="14" height="20" rx="3" fill="#ff3d2e" stroke="#0a0a0c" strokeWidth="0.5" />
      <ellipse cx="100" cy="160" rx="14" ry="6" fill="#0a0a0c" />
      <ellipse cx="220" cy="160" rx="14" ry="6" fill="#0a0a0c" />
    </g>
  );
}
