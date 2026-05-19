import { useEffect, useMemo, useState } from "react";
import {
  Truck,
  AlertTriangle,
  ClipboardCheck,
  Clock,
  TrendingUp,
  Download,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Area, AreaChart, ReferenceLine,
} from "recharts";
import { Link } from "react-router-dom";
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
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
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

function TooltipCard({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-card">
      <div className="font-mono text-[10px] uppercase tracking-wider text-ink-400">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
        <span className="font-display text-lg font-medium text-ink-900">{payload[0].value}</span>
        <span className="text-[10.5px] text-ink-500">vistorias</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [top, setTop] = useState<TopVehicle[]>([]);

  useEffect(() => {
    api.get("/api/v1/dashboard/metrics").then((r) => setMetrics(r.data));
    api.get("/api/v1/dashboard/top-vehicles").then((r) => setTop(r.data));
  }, []);

  const avgDaily = useMemo(() => {
    if (!metrics?.daily?.length) return 0;
    const sum = metrics.daily.reduce((a, b) => a + b.total, 0);
    return Math.round(sum / metrics.daily.length);
  }, [metrics]);

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
    downloadCsv("dashboard-vistorias-diarias.csv", ["Dia", "Total"], metrics.daily.map((i) => [i.day, i.total]));
  }
  function exportTopVehicles() {
    downloadCsv("dashboard-veiculos-criticos.csv", ["Placa", "Modelo", "Avarias"], top.map((t) => [t.plate, t.model, t.damages]));
  }

  return (
    <div className="mx-auto max-w-[1480px] space-y-6 sm:space-y-8 lg:space-y-10">
      {/* HERO */}
      <section className="grid gap-4 lg:grid-cols-[1fr_420px] lg:gap-6">
        <div className="relative overflow-hidden rounded-[32px] bg-ink-900 p-5 text-paper-50 shadow-hero sm:p-8 lg:rounded-[36px] lg:p-12">
          <div className="pointer-events-none absolute -right-32 -top-32 hidden h-[420px] w-[420px] rounded-full bg-lime-400/12 blur-3xl sm:block" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 hidden h-[320px] w-[320px] rounded-full bg-brand-500/10 blur-3xl sm:block" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] sm:opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-lime-400" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-paper-50/70">
                Painel · tempo real
              </span>
            </div>
            <h1 className="mt-6 display-lg text-balance text-paper-50">
              Operação<br />
              <span className="text-lime-400">sob controle.</span>
            </h1>
            <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-paper-50/65">
              Visão consolidada de vistorias, ocorrências e KPIs da frota corporativa.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button onClick={exportSummary} disabled={!metrics} className="btn-lime w-full sm:w-auto">
                <Download size={14} /> Exportar relatório
              </button>
              <Link to="/feed" className="btn-secondary w-full border-white/20 bg-white/10 text-paper-50 hover:bg-white/15 hover:border-white/40 sm:w-auto">
                <ArrowUpRight size={14} /> Ver feed
              </Link>
            </div>
          </div>
        </div>

        {/* Fleet card */}
        <div className="relative overflow-hidden rounded-[32px] bg-lime-400 p-5 text-ink-900 shadow-glow sm:p-8 lg:rounded-[36px]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full border-2 border-ink-900/10" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full border-2 border-ink-900/10" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-start justify-between">
              <div>
                <span className="eyebrow text-ink-700">Frota Ativa</span>
                <div className="mt-1 font-display text-[15px] font-semibold tracking-tightest">
                  Total de veículos
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 text-lime-400">
                <Truck size={18} />
              </div>
            </div>
            <div className="mt-6 flex items-baseline gap-2 sm:mt-8">
              <div className="stat-num text-[64px] font-medium leading-none sm:text-[88px]">{metrics?.total_vehicles ?? "—"}</div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-ink-700">unidades</div>
            </div>
            <div className="mt-auto pt-8">
              <Link
                to="/vehicles"
                className="group flex w-full items-center justify-between rounded-2xl border border-ink-900 bg-ink-900 px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] text-lime-400 transition-all hover:bg-ink-800"
              >
                Ver todos os veículos
                <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INDICATOR STRIP */}
      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow">Indicadores chave</div>
            <h2 className="display mt-1 text-2xl font-semibold text-ink-900">Performance dos últimos 7 dias</h2>
          </div>
          <span className="hidden font-mono text-[11px] text-ink-400 md:inline">atualizado · agora</span>
        </div>
        <div className="grid gap-3 stagger sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
          <StatCard label="Vistorias (7d)" value={metrics?.inspections_week ?? 0} icon={ClipboardCheck} hint="Total registrado" variant="ink" />
          <StatCard label="Avarias (7d)"   value={metrics?.vehicles_with_damage_week ?? 0} icon={AlertTriangle} hint="Veículos comprometidos" variant="lime" />
          <StatCard label="Mês corrente"   value={metrics?.damages_month ?? 0} icon={TrendingUp} hint="Avarias acumuladas" variant="paper" />
          <StatCard label="Tempo médio"    value={formatAverage(metrics?.avg_hours_between_inspections)} icon={Clock} hint="Entre vistorias" variant="white" />
        </div>
      </section>

      {/* CHARTS */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Daily inspections — large */}
        <div className="card overflow-hidden p-4 sm:p-7 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="eyebrow">Volume diário</div>
              <h3 className="display mt-1 text-xl font-semibold text-ink-900">Vistorias por dia</h3>
              <p className="mt-1 text-[13px] text-ink-500">Tendência do mês corrente · média {avgDaily}/dia</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">
                <span className="h-2 w-2 rounded-full bg-lime-400" />
                Total
              </span>
              <button onClick={exportDaily} disabled={!metrics} className="btn-secondary px-3.5 py-2 text-[12px]">
                <Download size={13} /> CSV
              </button>
            </div>
          </div>
          <div className="mt-6 h-[240px] sm:mt-8 sm:h-72">
            <ResponsiveContainer>
              <AreaChart data={metrics?.daily ?? []} margin={{ left: -12, top: 12, right: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaLime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bce416" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#bce416" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 4" stroke="#e7ecf6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6e6e78" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6e6e78" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<TooltipCard />} cursor={{ stroke: "#0a0a0c", strokeDasharray: "3 3", strokeWidth: 1 }} />
                {avgDaily > 0 && (
                  <ReferenceLine y={avgDaily} stroke="#0a0a0c" strokeDasharray="4 4" strokeWidth={1}
                    label={{ value: `média ${avgDaily}`, position: "right", fill: "#0a0a0c", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                )}
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#0a0a0c"
                  strokeWidth={2.2}
                  fill="url(#areaLime)"
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, fill: "#bce416", stroke: "#0a0a0c", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top critical */}
        <div className="card relative overflow-hidden p-4 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="eyebrow">Ranking</div>
              <h3 className="display mt-1 text-xl font-semibold text-ink-900">Veículos críticos</h3>
              <p className="mt-1 text-[13px] text-ink-500">Mais avarias acumuladas</p>
            </div>
            <button onClick={exportTopVehicles} disabled={top.length === 0} className="btn-secondary px-3 py-2 text-[12px]">
              <Download size={13} />
            </button>
          </div>
          <div className="mt-6 space-y-2.5">
            {top.slice(0, 6).map((v, i) => {
              const maxD = Math.max(1, ...top.map((t) => t.damages));
              const pct = (v.damages / maxD) * 100;
              return (
                <Link
                  key={v.id}
                  to={`/vehicles/${v.id}`}
                  className="group block rounded-2xl border border-ink-100 bg-paper-50 p-3 transition-all hover:border-ink-900 hover:bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] font-bold text-ink-400">#{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <div className="font-mono text-[13px] font-bold tracking-wider text-ink-900">{v.plate}</div>
                        <div className="text-[10.5px] text-ink-500">{v.model}</div>
                      </div>
                    </div>
                    <span className="font-display text-lg font-medium text-ink-900">{v.damages}</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-ink-900 transition-all duration-700 group-hover:bg-lime-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              );
            })}
            {top.length === 0 && (
              <div className="py-8 text-center text-[12px] text-ink-400">Sem dados ainda.</div>
            )}
          </div>
        </div>
      </section>

      {/* SECONDARY CHART */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card overflow-hidden p-4 sm:p-7 lg:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="eyebrow">Distribuição</div>
              <h3 className="display mt-1 text-xl font-semibold text-ink-900">Ranking de veículos · barras</h3>
              <p className="mt-1 text-[13px] text-ink-500">Comparativo entre os mais críticos da frota</p>
            </div>
          </div>
          <div className="mt-6 h-[240px] sm:h-64">
            <ResponsiveContainer>
              <BarChart data={top} margin={{ left: -10, top: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="#e7ecf6" vertical={false} />
                <XAxis dataKey="plate" tick={{ fontSize: 10, fill: "#6e6e78", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6e6e78" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip cursor={{ fill: "rgba(10,10,12,0.04)" }}
                  contentStyle={{ borderRadius: 16, border: "1px solid #ececef", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", fontSize: 12 }}
                />
                <Bar dataKey="damages" fill="#0a0a0c" radius={[8, 8, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
