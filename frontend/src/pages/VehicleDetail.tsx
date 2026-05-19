import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, ImageIcon, AlertTriangle, CheckCircle2, Calendar, Hash, Tag, Truck, Car, MapPin, X,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "../api/client";
import { VehicleSilhouette, type VehicleType } from "../components/VehicleSilhouette";
import { Bus3DModal } from "../components/Bus3DModal";
import { VehicleTrackingModal } from "../components/VehicleTrackingModal";

interface Vehicle {
  id: number; plate: string; prefix?: string | null; model: string; year?: number | null;
  vehicle_type: string; default_photo_url?: string | null;
}
interface Inspection {
  id: number;
  inspection_type: string;
  status: string;
  performed_at: string;
  inspector_name?: string | null;
  notes?: string | null;
  damages: { id: number; area_code: string; severity: string }[];
  photos: { id: number; url?: string | null }[];
}

type Period = "all" | "last" | "month" | "day";

const todayISO = () => new Date().toISOString().slice(0, 10);
const thisMonthISO = () => new Date().toISOString().slice(0, 7);

export function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [history, setHistory] = useState<Inspection[]>([]);
  const [show3d, setShow3d] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [period, setPeriod] = useState<Period>("all");
  const [day, setDay] = useState(todayISO());
  const [month, setMonth] = useState(thisMonthISO());

  const isBus = vehicle?.vehicle_type !== "car";
  const vType: VehicleType = isBus ? "bus" : "car";

  useEffect(() => {
    if (!id) return;
    api.get(`/api/v1/vehicles/${id}`).then((r) => setVehicle(r.data));
  }, [id]);

  const loadHistory = useCallback(() => {
    if (!id) return;
    const params: Record<string, string | number> = {};
    if (period === "last") params.limit = 10;
    else if (period === "day") params.day = day;
    else if (period === "month") params.month = month;
    api.get(`/api/v1/vehicles/${id}/history`, { params }).then((r) => setHistory(r.data));
  }, [id, period, day, month]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const counts: Record<string, number> = {};
  for (const i of history) for (const d of i.damages) counts[d.area_code] = (counts[d.area_code] ?? 0) + 1;

  const damageInspections = history.filter((h) => h.status === "with_damage").length;
  const approvedInspections = history.length - damageInspections;

  return (
    <div className="mx-auto max-w-[1480px] space-y-4 sm:space-y-6">
      <Link to="/vehicles" className="btn-ghost">
        <ArrowLeft size={14} /> Voltar
      </Link>

      {vehicle && (
        <div className="relative overflow-hidden rounded-[32px] bg-ink-900 p-5 text-paper-50 shadow-hero sm:p-8 lg:rounded-[36px] lg:p-12">
          <div className="pointer-events-none absolute -right-32 -top-32 hidden h-[420px] w-[420px] rounded-full bg-lime-400/10 blur-3xl sm:block" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] sm:opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex gap-4 sm:gap-6">
              {vehicle.default_photo_url && (
                <div className="hidden h-28 w-36 shrink-0 overflow-hidden rounded-3xl border border-white/15 sm:block lg:h-32 lg:w-44">
                  <img src={vehicle.default_photo_url} alt={vehicle.plate} className="h-full w-full object-cover" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  {isBus ? <Truck size={14} className="text-lime-400" /> : <Car size={14} className="text-lime-400" />}
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-paper-50/70">Prontuário do veículo</span>
                </div>
                <h1 className="mt-5 font-mono text-[2.4rem] font-bold tracking-wider leading-none text-paper-50 sm:text-[clamp(2.5rem,5vw,4rem)]">
                  {vehicle.plate}
                </h1>
                <div className="mt-3 font-display text-xl font-medium text-paper-50/85">{vehicle.model}</div>
                <div className="mt-4 flex flex-wrap gap-3 text-[12px] text-paper-50/70 sm:gap-4">
                  <span className="inline-flex items-center gap-1.5"><Tag size={12} className="text-lime-400" /> Prefixo · {vehicle.prefix ?? "—"}</span>
                  <span className="inline-flex items-center gap-1.5"><Calendar size={12} className="text-lime-400" /> {vehicle.year ?? "—"}</span>
                  <span className="inline-flex items-center gap-1.5"><Hash size={12} className="text-lime-400" /> ID #{vehicle.id}</span>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-lime-300">
                {isBus ? <Truck size={12} /> : <Car size={12} />}
                {isBus ? "Ônibus" : "Carro"}
              </span>
              {isBus && (
                <button type="button" onClick={() => setShowMap(true)} className="btn-lime w-full sm:w-auto">
                  <MapPin size={14} /> Ver no mapa
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4 stagger">
        <div className="card p-5">
          <div className="eyebrow">Total de vistorias</div>
          <div className="mt-2 stat-num text-3xl font-medium text-ink-900">{history.length}</div>
        </div>
        <div className="card p-5">
          <div className="eyebrow">Vistorias OK</div>
          <div className="mt-2 stat-num text-3xl font-medium text-success-500">{approvedInspections}</div>
        </div>
        <div className="card p-5">
          <div className="eyebrow">Com avaria</div>
          <div className="mt-2 stat-num text-3xl font-medium text-danger-500">{damageInspections}</div>
        </div>
      </div>

      {/* History filter */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div>
              <label className="label-form">Recorte do histórico</label>
              <div className="grid grid-cols-2 gap-1 rounded-[20px] border border-ink-100 bg-paper-50 p-1 sm:grid-cols-4 sm:rounded-full">
                {([
                  ["all", "Tudo"],
                  ["last", "Últimas saídas"],
                  ["month", "Ver mês"],
                  ["day", "Ver dia"],
                ] as [Period, string][]).map(([key, lbl]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPeriod(key)}
                    className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                      period === key ? "bg-ink-900 text-paper-50" : "text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {period === "day" && (
              <div>
                <label className="label-form">Data</label>
                <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="input py-2.5 text-[14px]" />
              </div>
            )}
            {period === "month" && (
              <div>
                <label className="label-form">Mês</label>
                <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input py-2.5 text-[14px]" />
              </div>
            )}
            <div className="font-mono text-[11px] text-ink-400 sm:pb-3">
              {history.length} {history.length === 1 ? "registro" : "registros"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="eyebrow">Heatmap individual</div>
              <h3 className="display mt-1 text-lg font-semibold text-ink-900">Concentração de avarias</h3>
            </div>
          </div>
          <VehicleSilhouette counts={counts} compact vehicleType={vType} onShow3D={() => setShow3d(true)} />
        </div>

        <div className="card p-4 sm:p-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="eyebrow">Histórico</div>
              <h3 className="display mt-1 text-lg font-semibold text-ink-900">Linha do tempo</h3>
              <p className="text-[12.5px] text-ink-500">{history.length} registros</p>
            </div>
          </div>
          <ol className="relative space-y-4 lg:max-h-[36rem] lg:overflow-y-auto lg:pr-2">
            <div className="absolute left-[18px] top-1 bottom-1 w-px bg-ink-100" />
            {history.map((i) => (
              <li key={i.id} className="relative pl-12">
                <div
                  className={`absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-sm ${
                    i.status === "with_damage" ? "bg-danger-500 text-white" : "bg-success-500 text-white"
                  }`}
                >
                  {i.status === "with_damage" ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                </div>
                <div className="rounded-2xl border border-ink-100 bg-white p-4 transition-all hover:border-ink-900">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-display text-[14px] font-semibold text-ink-900">
                        {i.inspection_type === "exit" ? "Vistoria de Saída" : "Vistoria de Retorno"}
                      </div>
                      <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wider text-ink-400">
                        {format(new Date(i.performed_at), "dd MMM yyyy · HH:mm", { locale: ptBR })}
                        {i.inspector_name && ` · ${i.inspector_name}`}
                      </div>
                    </div>
                    {i.photos.length > 0 && (
                      <span className="badge bg-paper-100 text-ink-700">
                        <ImageIcon size={11} /> {i.photos.length}
                      </span>
                    )}
                  </div>
                  {i.notes && <p className="mt-2 text-[13px] text-ink-600">{i.notes}</p>}
                  {i.damages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {i.damages.map((d) => <span key={d.id} className="chip text-[10.5px]">{d.area_code}</span>)}
                    </div>
                  )}
                  {i.photos.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {i.photos.map((p) => (
                        <a key={p.id} href={p.url ?? "#"} target="_blank" rel="noreferrer"
                          className="block h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-100 transition-all hover:ring-2 hover:ring-ink-900 sm:h-20 sm:w-28">
                          {p.url && <img src={p.url} className="h-full w-full object-cover" />}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
            {history.length === 0 && (
              <li className="py-12 text-center text-[13px] text-ink-400">Sem vistorias para o recorte selecionado.</li>
            )}
          </ol>
        </div>
      </div>

      <Bus3DModal open={show3d} onClose={() => setShow3d(false)} counts={counts} vehicleType={vType} lockType />
      {vehicle && isBus && (
        <VehicleTrackingModal
          open={showMap}
          onClose={() => setShowMap(false)}
          prefix={vehicle.prefix ?? vehicle.plate}
          plate={vehicle.plate}
        />
      )}
    </div>
  );
}
