import { useEffect, useState } from "react";
import { Flame, Activity, AlertOctagon, Box } from "lucide-react";
import { api } from "../api/client";
import { VehicleSilhouette } from "../components/VehicleSilhouette";
import { Bus3DModal } from "../components/Bus3DModal";

export function Heatmap() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [show3d, setShow3d] = useState(false);

  useEffect(() => {
    api.get("/api/v1/dashboard/heatmap").then((r) => {
      const m: Record<string, number> = {};
      for (const x of r.data) m[x.area] = x.count;
      setCounts(m);
    });
  }, []);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const hottest = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow">Inteligência operacional</div>
          <h1 className="display-lg mt-1 text-balance text-ink-900">
            Mapa de calor<br />
            <span className="text-ink-400">de avarias</span>
          </h1>
          <p className="mt-2 max-w-xl text-[14px] text-ink-500">
            Concentração agregada de impactos por região do veículo. Use para diagnosticar padrões de operação.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className="inline-flex items-center gap-2 rounded-full border border-danger-500/25 bg-danger-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-danger-600">
            <Flame size={13} /> Hot zones
          </span>
          <button type="button" onClick={() => setShow3d(true)} className="group btn-primary">
            <Box size={15} className="transition-transform duration-300 group-hover:rotate-[20deg]" />
            Ver modelo 3D
            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-lime-400" />
          </button>
        </div>
      </div>

      <div className="grid gap-5 stagger md:grid-cols-3">
        <div className="card overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Impactos totais</span>
            <Activity size={14} className="text-ink-400" />
          </div>
          <div className="mt-4 stat-num text-5xl font-medium text-ink-900">{total}</div>
          <div className="mt-2 text-[12px] text-ink-500">Acumulado em toda a frota</div>
        </div>
        <div className="card overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Área crítica</span>
            <AlertOctagon size={14} className="text-danger-500" />
          </div>
          <div className="mt-4 font-display text-xl font-semibold text-ink-900">
            {hottest?.[0] ?? "—"}
          </div>
          <div className="mt-2 text-[12px] text-ink-500">
            {hottest ? `${hottest[1]} ocorrências` : "Sem dados"}
          </div>
        </div>
        <div className="card overflow-hidden bg-ink-900 p-6 text-paper-50">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-paper-50/60">Regiões com impacto</span>
            <Flame size={14} className="text-lime-400" />
          </div>
          <div className="mt-4 stat-num text-5xl font-medium">{Object.keys(counts).length}</div>
          <div className="mt-2 text-[12px] text-paper-50/60">de regiões cadastradas</div>
        </div>
      </div>

      <VehicleSilhouette counts={counts} />

      <Bus3DModal open={show3d} onClose={() => setShow3d(false)} counts={counts} />
    </div>
  );
}
