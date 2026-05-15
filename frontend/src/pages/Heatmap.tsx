import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { api } from "../api/client";
import { VehicleSilhouette } from "../components/VehicleSilhouette";

export function Heatmap() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    api.get("/api/v1/dashboard/heatmap").then((r) => {
      const m: Record<string, number> = {};
      for (const x of r.data) m[x.area] = x.count;
      setCounts(m);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Mapa de Calor de Avarias</h1>
          <p className="text-sm text-navy-500">Concentração de impactos por região do veículo (frota acumulada).</p>
        </div>
        <span className="badge bg-rose-100 text-rose-700"><Flame size={12} /> Hot zones</span>
      </div>

      <div className="card p-6">
        <VehicleSilhouette counts={counts} />
      </div>
    </div>
  );
}
