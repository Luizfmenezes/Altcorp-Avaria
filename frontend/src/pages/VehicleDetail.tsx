import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ImageIcon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "../api/client";
import { VehicleSilhouette } from "../components/VehicleSilhouette";

interface Vehicle { id: number; plate: string; prefix?: string|null; model: string; year?: number|null; vehicle_type: string; }
interface Inspection {
  id: number;
  inspection_type: string;
  status: string;
  performed_at: string;
  inspector_name?: string|null;
  notes?: string|null;
  damages: { id: number; area_code: string; severity: string }[];
  photos: { id: number; url?: string|null }[];
}

export function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [history, setHistory] = useState<Inspection[]>([]);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/v1/vehicles/${id}`).then((r) => setVehicle(r.data));
    api.get(`/api/v1/vehicles/${id}/history`).then((r) => setHistory(r.data));
  }, [id]);

  const counts: Record<string, number> = {};
  for (const i of history) for (const d of i.damages) counts[d.area_code] = (counts[d.area_code] ?? 0) + 1;

  return (
    <div className="space-y-6">
      <Link to="/vehicles" className="btn-ghost"><ArrowLeft size={16} /> Voltar</Link>

      {vehicle && (
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-navy-400">Prontuário do veículo</div>
              <div className="mt-1 font-mono text-3xl font-bold text-navy-900">{vehicle.plate}</div>
              <div className="text-sm text-navy-600">{vehicle.model} · {vehicle.prefix ?? "—"} · {vehicle.year ?? "—"}</div>
            </div>
            <span className="badge bg-navy-100 text-navy-700 capitalize">{vehicle.vehicle_type === "bus" ? "Ônibus" : "Carro"}</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-navy-900">Concentração de avarias</h3>
          <p className="text-xs text-navy-500">Histórico acumulado deste veículo.</p>
          <div className="mt-4">
            <VehicleSilhouette counts={counts} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-navy-900">Linha do tempo</h3>
          <p className="text-xs text-navy-500">{history.length} vistorias registradas.</p>
          <ol className="mt-5 space-y-4 max-h-[28rem] overflow-y-auto pr-2">
            {history.map((i) => (
              <li key={i.id} className="relative rounded-xl border border-navy-100 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {i.status === "with_damage" ? <AlertTriangle size={16} className="text-rose-600" /> : <CheckCircle2 size={16} className="text-emerald-600" />}
                    <div>
                      <div className="text-sm font-semibold text-navy-900">
                        {i.inspection_type === "exit" ? "Vistoria de Saída" : "Vistoria de Retorno"}
                      </div>
                      <div className="text-xs text-navy-500">
                        {format(new Date(i.performed_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                        {i.inspector_name && ` · ${i.inspector_name}`}
                      </div>
                    </div>
                  </div>
                  {i.photos.length > 0 && (
                    <span className="badge bg-navy-50 text-navy-700"><ImageIcon size={11} /> {i.photos.length}</span>
                  )}
                </div>
                {i.notes && <p className="mt-2 text-sm text-navy-600">{i.notes}</p>}
                {i.damages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {i.damages.map((d) => <span key={d.id} className="badge bg-amber-50 text-amber-700">{d.area_code}</span>)}
                  </div>
                )}
                {i.photos.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {i.photos.map((p) => (
                      <a key={p.id} href={p.url ?? "#"} target="_blank" rel="noreferrer" className="block h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                        {p.url && <img src={p.url} className="h-full w-full object-cover" />}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
            {history.length === 0 && <li className="py-8 text-center text-sm text-navy-400">Sem vistorias registradas.</li>}
          </ol>
        </div>
      </div>
    </div>
  );
}
