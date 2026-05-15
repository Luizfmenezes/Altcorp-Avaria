import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent?: "navy" | "brand" | "amber" | "rose";
}

const accents: Record<string, string> = {
  navy: "bg-[#eaf1bc] text-[#1c1c1c]", // lime/neo-green style for accent
  brand: "bg-[#1c1c1c] text-white",     // dark style
  amber: "bg-[#f4f6fb] text-[#1c1c1c]", // light style
  rose: "bg-rose-500 text-white",
};

export function StatCard({ label, value, icon: Icon, hint, accent = "navy" }: Props) {
  // Overwrite base card color for specific accents to get the colorful neobank card look
  const bgClass = accent === 'brand' ? 'bg-[#bce416] border-none' : accent === 'navy' ? 'bg-[#1c1c1c] text-white border-none' : 'bg-white border-navy-100/50';
  const textClass = accent === 'navy' ? 'text-white' : 'text-navy-900';
  const labelClass = accent === 'navy' ? 'text-white/70' : 'text-navy-500';
  
  return (
    <div className={`group p-6 transition-all hover:-translate-y-0.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-slide-up rounded-[28px] border ${bgClass}`}>
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="flex items-start justify-between">
          <div className={`text-[13px] font-medium tracking-wide ${labelClass}`}>{label}</div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${accents[accent]}`}>
            <Icon size={18} />
          </div>
        </div>
        <div>
          <div className={`text-3xl font-extrabold tracking-tight ${textClass}`}>{value}</div>
          {hint && <div className={`mt-1 text-xs ${labelClass}`}>{hint}</div>}
        </div>
      </div>
    </div>
  );
}
