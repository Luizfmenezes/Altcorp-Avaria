import { useEffect, useState } from "react";
import { Truck, AlertTriangle, ClipboardCheck, Clock, TrendingUp, Download } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { api } from "../api/client";
import { StatCard } from "../components/StatCard";

interface Metrics {
  vehicles_with_damage_week: number;
  inspections_week: number;
  total_vehicles: number;
  damages_month: number;
  avg_hours_between_inspections: number | null;
  daily: { day: string; total: number }[];
}

interface TopVehicle {
  id: number;
  plate: string;
  model: string;
  damages: number;
}

function csvEscape(value: string | number | null | undefined) {
  const normalized = `${value ?? ""}`.replace(/"/g, '""');
  return `"${normalized}"`;
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => csvEscape(cell)).join(";"))
    .join("\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

function formatAverage(hours: number | null | undefined) {
  if (hours == null) return "—";
  if (hours >= 24) return `${(hours / 24).toFixed(1)}d`;
  return `${hours.toFixed(1)}h`;
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [top, setTop] = useState<TopVehicle[]>([]);

  useEffect(() => {
    api.get("/api/v1/dashboard/metrics").then((r) => setMetrics(r.data));
    api.get("/api/v1/dashboard/top-vehicles").then((r) => setTop(r.data));
  }, []);

  function exportSummary() {
    if (!metrics) return;
    downloadCsv(
      "dashboard-metricas.csv",
      ["Indicador", "Valor"],
      [
        ["Veículos com avaria (7d)", metrics.vehicles_with_damage_week],
        ["Vistorias na semana", metrics.inspections_week],
        ["Frota total", metrics.total_vehicles],
        ["Avarias no mês", metrics.damages_month],
        ["Tempo médio entre vistorias (horas)", metrics.avg_hours_between_inspections],
      ]
    );
  }

  function exportDaily() {
    if (!metrics) return;
    downloadCsv(
      "dashboard-vistorias-diarias.csv",
      ["Dia", "Total"],
      metrics.daily.map((item) => [item.day, item.total])
    );
  }

  function exportTopVehicles() {
    downloadCsv(
      "dashboard-veiculos-criticos.csv",
      ["Placa", "Modelo", "Avarias"],
      top.map((item) => [item.plate, item.model, item.damages])
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header and Main Card */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        
        {/* Main Metric Card (Neobank style) */}
        <div className="w-full lg:w-[400px] rounded-[32px] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-navy-100/50">
          <div className="text-[15px] font-medium text-navy-500">Frota total ativa</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-5xl font-extrabold tracking-tight text-navy-900">
              {metrics?.total_vehicles ?? "—"}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50">
              <Truck size={24} className="text-navy-900" />
            </div>
          </div>
          <button className="mt-8 w-full rounded-full bg-[#1c1c1c] py-4 text-[15px] font-bold text-white transition-all hover:bg-black active:scale-[0.98]">
            Ver todos os veículos
          </button>
        </div>

        {/* Header Actions (Desktop) */}
        <div className="hidden lg:flex flex-col items-end gap-4">
          <div className="text-right">
            <h1 className="text-3xl font-bold tracking-tight text-navy-900">Dashboard</h1>
            <p className="mt-1 text-sm text-navy-500">Visão consolidada da operação.</p>
          </div>
          <button onClick={exportSummary} disabled={!metrics} className="btn-secondary rounded-full">
            <Download size={16} /> Exportar métricas
          </button>
        </div>
      </div>

      {/* Other Metrics - Horizontal Scroll on Mobile */}
      <div>
        <div className="mb-4 flex items-center justify-between px-2">
          <h2 className="text-lg font-bold text-navy-900">Seus indicadores</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x px-2 lg:grid lg:grid-cols-4 lg:snap-none lg:overflow-visible lg:px-0">
          <div className="min-w-[160px] snap-center">
            <StatCard
              label="Avarias (7d)"
              value={metrics?.vehicles_with_damage_week ?? "—"}
              icon={AlertTriangle}
              accent="rose"
            />
          </div>
          <div className="min-w-[160px] snap-center">
            <StatCard
              label="Vistorias"
              value={metrics?.inspections_week ?? "—"}
              icon={ClipboardCheck}
              accent="brand"
            />
          </div>
          <div className="min-w-[160px] snap-center">
            <StatCard
              label="Mês Atual"
              value={metrics?.damages_month ?? "—"}
              icon={TrendingUp}
              accent="amber"
            />
          </div>
          <div className="min-w-[160px] snap-center">
            <StatCard
              label="Média (h)"
              value={formatAverage(metrics?.avg_hours_between_inspections)}
              icon={Clock}
              accent="navy"
            />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2 rounded-[32px]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy-900">Vistorias diárias</h3>
              <p className="text-sm text-navy-500">Volume no mês corrente.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportDaily} disabled={!metrics} className="btn-secondary rounded-full px-3 py-2 text-sm">
                <Download size={14} /> CSV
              </button>
            </div>
          </div>
          <div className="mt-8 h-72">
            <ResponsiveContainer>
              <LineChart data={metrics?.daily ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ecf6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#5d77b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#5d77b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", padding: "12px" }}
                />
                <Line type="monotone" dataKey="total" stroke="#bce416" strokeWidth={4} dot={{ r: 4, fill: "#bce416", strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 rounded-[32px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-navy-900">Top críticos</h3>
              <p className="text-sm text-navy-500">Mais avarias acumuladas.</p>
            </div>
            <button onClick={exportTopVehicles} disabled={top.length === 0} className="btn-secondary rounded-full px-3 py-2 text-sm">
              <Download size={14} />
            </button>
          </div>
          <div className="mt-8 h-72">
            <ResponsiveContainer>
              <BarChart data={top} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ecf6" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#5d77b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="plate" tick={{ fontSize: 12, fill: "#1c1c1c", fontWeight: 600 }} width={70} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }} cursor={{ fill: "#f4f6fb" }} />
                <Bar dataKey="damages" fill="#1c1c1c" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
