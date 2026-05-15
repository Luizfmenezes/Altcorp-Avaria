interface Area {
  code: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const BUS_AREAS: Area[] = [
  { code: "front_bumper", label: "Para-choque dianteiro", x: 5, y: 40, w: 8, h: 20 },
  { code: "rear_bumper", label: "Para-choque traseiro", x: 87, y: 40, w: 8, h: 20 },
  { code: "left_side_front", label: "Lateral esquerda dianteira", x: 15, y: 20, w: 30, h: 18 },
  { code: "left_side_rear", label: "Lateral esquerda traseira", x: 50, y: 20, w: 32, h: 18 },
  { code: "right_side_front", label: "Lateral direita dianteira", x: 15, y: 62, w: 30, h: 18 },
  { code: "right_side_rear", label: "Lateral direita traseira", x: 50, y: 62, w: 32, h: 18 },
  { code: "roof", label: "Teto", x: 18, y: 40, w: 65, h: 20 },
  { code: "windshield", label: "Para-brisa", x: 12, y: 38, w: 6, h: 24 },
];

interface Props {
  counts?: Record<string, number>;
  onPick?: (area: Area, x: number, y: number) => void;
  highlightArea?: string | null;
}

export function VehicleSilhouette({ counts = {}, onPick, highlightArea }: Props) {
  const max = Math.max(1, ...Object.values(counts));

  function intensity(code: string): string {
    const v = counts[code] ?? 0;
    if (v === 0) return "rgba(59, 102, 255, 0.05)";
    const ratio = v / max;
    return `rgba(220, 38, 38, ${0.15 + ratio * 0.55})`;
  }

  function handleClick(e: React.MouseEvent<SVGSVGElement>, area: Area) {
    if (!onPick) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onPick(area, x, y);
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-navy-50 to-white p-6">
      <svg
        viewBox="0 0 100 100"
        className="h-72 w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect x="10" y="22" width="80" height="56" rx="6" fill="#fff" stroke="#010118" strokeWidth="0.6" />
        <rect x="14" y="26" width="72" height="48" rx="3" fill="#f4f6fb" />
        {BUS_AREAS.map((a) => (
          <g key={a.code} onClick={(e) => handleClick(e as any, a)} className={onPick ? "cursor-pointer" : ""}>
            <rect
              x={a.x}
              y={a.y}
              width={a.w}
              height={a.h}
              fill={intensity(a.code)}
              stroke={highlightArea === a.code ? "#3b66ff" : "#c5d0e8"}
              strokeWidth={highlightArea === a.code ? "0.6" : "0.2"}
              rx="1"
            />
            {counts[a.code] > 0 && (
              <text x={a.x + a.w / 2} y={a.y + a.h / 2 + 1} textAnchor="middle" fontSize="3" fill="#010118" fontWeight="700">
                {counts[a.code]}
              </text>
            )}
          </g>
        ))}
        <circle cx="25" cy="80" r="4" fill="#010118" />
        <circle cx="75" cy="80" r="4" fill="#010118" />
        <circle cx="25" cy="20" r="4" fill="#010118" />
        <circle cx="75" cy="20" r="4" fill="#010118" />
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-navy-600">
        {BUS_AREAS.map((a) => (
          <div key={a.code} className="flex justify-between">
            <span>{a.label}</span>
            <span className="font-semibold text-navy-900">{counts[a.code] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
