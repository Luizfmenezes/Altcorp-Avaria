import { useEffect, useRef, useState } from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  delta?: number;
  variant?: "ink" | "lime" | "paper" | "white";
}

const variants: Record<string, { bg: string; text: string; sub: string; chip: string }> = {
  ink:   { bg: "bg-ink-900 text-paper-50",  text: "text-paper-50", sub: "text-paper-50/65", chip: "bg-white/10 text-paper-50" },
  lime:  { bg: "bg-lime-400 text-ink-900",  text: "text-ink-900",  sub: "text-ink-700",      chip: "bg-ink-900 text-lime-400" },
  paper: { bg: "bg-paper-100 text-ink-900", text: "text-ink-900",  sub: "text-ink-500",      chip: "bg-ink-900 text-paper-50" },
  white: { bg: "bg-white text-ink-900",     text: "text-ink-900",  sub: "text-ink-500",      chip: "bg-ink-50 text-ink-900" },
};

function useCountUp(target: number, duration = 800) {
  const [n, setN] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const animate = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    startRef.current = null;
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

export function StatCard({ label, value, icon: Icon, hint, delta, variant = "white" }: Props) {
  const isNumeric = typeof value === "number";
  const animated = useCountUp(isNumeric ? value : 0);
  const display = isNumeric ? animated : value;
  const v = variants[variant];

  return (
    <div
      className={`group relative overflow-hidden rounded-[24px] border border-ink-100/60 p-4 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-hero sm:rounded-[28px] sm:p-5 ${v.bg}`}
    >
      {/* Decorative corner ring */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-current opacity-10 transition-transform duration-700 group-hover:scale-125" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full border border-current opacity-5 transition-transform duration-700 group-hover:scale-110" />

      <div className="relative flex items-start justify-between">
        <div className={`text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-[10.5px] ${v.sub}`}>{label}</div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${v.chip} transition-transform duration-300 group-hover:rotate-12 sm:h-9 sm:w-9`}>
          <Icon size={15} strokeWidth={2.4} />
        </div>
      </div>

      <div className="relative mt-6 flex items-end justify-between gap-3">
        <div className={`stat-num text-[36px] font-medium leading-none sm:text-[44px] ${v.text}`}>
          {display}
        </div>
        {typeof delta === "number" && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
              delta >= 0 ? "bg-success-500/15 text-success-500" : "bg-danger-500/15 text-danger-500"
            }`}
          >
            {delta >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>

      {hint && <div className={`relative mt-2 text-[11px] sm:text-[11.5px] ${v.sub}`}>{hint}</div>}

      {/* Bottom ticker line */}
      <div className="relative mt-4 h-px w-full overflow-hidden">
        <div
          className={`h-px w-1/3 ${variant === "lime" ? "bg-ink-900" : "bg-current"} opacity-60 transition-all duration-500 group-hover:w-full`}
        />
      </div>
    </div>
  );
}
