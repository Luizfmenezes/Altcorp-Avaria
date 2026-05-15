interface Area { code: string; label: string; x: number; y: number; w: number; h: number; }

const AREAS: Area[] = [
  { code: "front_bumper", label: "Para-choque dianteiro", x: 5, y: 40, w: 8, h: 20 },
  { code: "rear_bumper", label: "Para-choque traseiro", x: 87, y: 40, w: 8, h: 20 },
  { code: "left_side_front", label: "Lateral esq. diant.", x: 15, y: 20, w: 30, h: 18 },
  { code: "left_side_rear", label: "Lateral esq. tras.", x: 50, y: 20, w: 32, h: 18 },
  { code: "right_side_front", label: "Lateral dir. diant.", x: 15, y: 62, w: 30, h: 18 },
  { code: "right_side_rear", label: "Lateral dir. tras.", x: 50, y: 62, w: 32, h: 18 },
  { code: "roof", label: "Teto", x: 18, y: 40, w: 65, h: 20 },
  { code: "windshield", label: "Para-brisa", x: 12, y: 38, w: 6, h: 24 },
];

interface Props {
  marks: { area_code: string; x_pct?: number; y_pct?: number }[];
  onPick: (area: Area, x: number, y: number) => void;
}

export function AreaPicker({ marks, onPick }: Props) {
  function handle(e: React.MouseEvent<SVGGElement>, area: Area) {
    const svg = e.currentTarget.ownerSVGElement!;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onPick(area, x, y);
  }

  return (
    <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-4">
      <div className="text-xs uppercase tracking-widest text-navy-500">Toque na região avariada</div>
      <svg viewBox="0 0 100 100" className="mt-2 h-64 w-full select-none">
        <rect x="10" y="22" width="80" height="56" rx="6" fill="#fff" stroke="#010118" strokeWidth="0.6" />
        <rect x="14" y="26" width="72" height="48" rx="3" fill="#f4f6fb" />
        {AREAS.map((a) => (
          <g key={a.code} onClick={(e) => handle(e, a)} className="cursor-pointer">
            <rect x={a.x} y={a.y} width={a.w} height={a.h} fill="rgba(59,102,255,0.06)" stroke="#c5d0e8" strokeWidth="0.2" rx="1" />
          </g>
        ))}
        {marks.map((m, i) => (
          m.x_pct != null && m.y_pct != null ? (
            <g key={i}>
              <circle cx={m.x_pct} cy={m.y_pct} r="2.6" fill="#dc2626" stroke="#fff" strokeWidth="0.5" />
              <circle cx={m.x_pct} cy={m.y_pct} r="4.5" fill="none" stroke="#dc2626" strokeWidth="0.4" opacity="0.5" />
            </g>
          ) : null
        ))}
        <circle cx="25" cy="80" r="4" fill="#010118" />
        <circle cx="75" cy="80" r="4" fill="#010118" />
        <circle cx="25" cy="20" r="4" fill="#010118" />
        <circle cx="75" cy="20" r="4" fill="#010118" />
      </svg>
    </div>
  );
}
