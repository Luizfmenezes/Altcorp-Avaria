import { lazy, Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Box, MousePointer2, Flame, Bus, Car } from "lucide-react";
import { areas3dFor, heat3dIntensity, type Vehicle3DType } from "./bus3d-areas";

// three.js + drei are heavy — load them only when the modal actually opens.
const Bus3D = lazy(() => import("./Bus3D").then((m) => ({ default: m.Bus3D })));

interface Props {
  open: boolean;
  onClose: () => void;
  counts: Record<string, number>;
  /** Initial model — and, when `lockType` is set, the only one available. */
  vehicleType?: Vehicle3DType;
  /** Hide the bus/car selector (used on a single vehicle's record). */
  lockType?: boolean;
}

function CanvasLoader() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-ink-200 border-t-ink-900" />
        <div className="font-mono text-[11px] uppercase tracking-wider text-ink-400">
          Carregando modelo 3D
        </div>
      </div>
    </div>
  );
}

export function Bus3DModal({ open, onClose, counts, vehicleType = "bus", lockType = false }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [model, setModel] = useState<Vehicle3DType>(vehicleType);

  // Sync the model when reopened for a different vehicle.
  useEffect(() => {
    if (open) setModel(vehicleType);
  }, [open, vehicleType]);

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const areas = areas3dFor(model);
  const max = Math.max(1, ...Object.values(counts));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const liveZones = Object.keys(counts).filter((k) => counts[k] > 0).length;
  const hoveredArea = areas.find((a) => a.code === hovered);
  const hoveredCount = hovered ? counts[hovered] ?? 0 : 0;
  const ranked = [...areas].sort((a, b) => (counts[b.code] ?? 0) - (counts[a.code] ?? 0));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-ink-100 bg-paper-50 shadow-hero sm:rounded-[32px]"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {/* Header */}
            <div className="flex flex-col gap-3 border-b border-ink-100 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="eyebrow flex items-center gap-1.5 text-ink-400">
                  <Box size={11} /> Visualização 3D
                </div>
                <h2 className="display mt-1 text-xl font-semibold text-ink-900 sm:text-2xl">
                  {model === "car" ? "Carro" : "Ônibus"} · Mapa de calor
                </h2>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                {!lockType && (
                  <div className="grid w-full grid-cols-2 gap-1 rounded-[20px] border border-ink-200 bg-white p-1 sm:w-auto sm:auto-cols-max sm:grid-flow-col sm:rounded-full">
                    {(["bus", "car"] as const).map((t) => {
                      const Icon = t === "bus" ? Bus : Car;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setModel(t)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                            model === t ? "bg-ink-900 text-paper-50" : "text-ink-500 hover:text-ink-900"
                          }`}
                        >
                          <Icon size={12} /> {t === "bus" ? "Ônibus" : "Carro"}
                        </button>
                      );
                    })}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setResetKey((k) => k + 1)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-ink-900 transition-all hover:border-ink-900 active:scale-[0.98]"
                >
                  <RotateCcw size={13} /> Resetar vista
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="grid h-10 w-10 place-items-center rounded-full border border-ink-100 bg-white text-ink-500 transition-all hover:border-ink-900 hover:text-ink-900 active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              <div className="relative h-[260px] bg-gradient-to-br from-paper-50 via-white to-paper-100 sm:h-[440px] lg:h-[524px] lg:flex-1">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.5]"
                  style={{
                    backgroundImage: "radial-gradient(rgba(10,10,12,0.05) 1px, transparent 1px)",
                    backgroundSize: "26px 26px",
                  }}
                />
                <Suspense fallback={<CanvasLoader />}>
                  <Bus3D
                    key={`${model}-${resetKey}`}
                    counts={counts}
                    hovered={hovered}
                    onHover={setHovered}
                    vehicleType={model}
                  />
                </Suspense>

                <div className="pointer-events-none absolute left-5 top-5">
                  {hoveredArea ? (
                    <div className="animate-fade-in rounded-2xl border border-ink-100 bg-white/90 px-4 py-2.5 shadow-card backdrop-blur-sm">
                      <div className="eyebrow text-ink-400">Região</div>
                      <div className="font-display text-base font-semibold text-ink-900">
                        {hoveredArea.label}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-ink-500">
                        {hoveredCount} {hoveredCount === 1 ? "ocorrência" : "ocorrências"}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-full border border-ink-100 bg-white/80 px-3.5 py-1.5 text-[11px] font-medium text-ink-500 shadow-sm backdrop-blur-sm">
                      {total} impactos · {liveZones} regiões ativas
                    </div>
                  )}
                </div>

                <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 rounded-full border border-ink-100 bg-white/80 px-3 py-1.5 text-[10px] font-medium text-ink-500 shadow-sm backdrop-blur-sm sm:bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:px-3.5 sm:text-[10.5px]">
                  <MousePointer2 size={11} /> Arraste para girar · scroll para zoom
                </div>
              </div>

              <div className="max-h-[240px] overflow-y-auto border-t border-ink-100 lg:max-h-none lg:w-[272px] lg:border-l lg:border-t-0">
                <div className="px-5 py-4">
                  <div className="eyebrow text-ink-400">Regiões por impacto</div>
                  <div className="mt-3 space-y-1">
                    {ranked.map((a) => {
                      const c = counts[a.code] ?? 0;
                      const it = heat3dIntensity(c, max);
                      const isActive = hovered === a.code;
                      return (
                        <button
                          key={a.code}
                          type="button"
                          onMouseEnter={() => setHovered(a.code)}
                          onMouseLeave={() => setHovered(null)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all ${
                            isActive ? "bg-ink-900 text-paper-50" : "hover:bg-white"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ background: c > 0 ? it.color : "#d1d1d6" }}
                            />
                            <span className="text-[12.5px] font-medium">{a.label}</span>
                          </span>
                          <span
                            className={`font-mono text-[12px] font-bold ${
                              isActive ? "text-lime-300" : c > 0 ? "text-ink-900" : "text-ink-300"
                            }`}
                          >
                            {c}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-ink-100 bg-white/60 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-500">
                <span className="eyebrow text-ink-400">Intensidade</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-lime-400" /> Baixa
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-warn-500" /> Média
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger-500" /> Alta
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink-400">
                <Flame size={11} className="text-danger-500" /> {total} impactos
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
