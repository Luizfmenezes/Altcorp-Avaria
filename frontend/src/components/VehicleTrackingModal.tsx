import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, RefreshCw, Loader2, SatelliteDish, TriangleAlert } from "lucide-react";
import { api, extractErrorMsg } from "../api/client";
import type { TrackPosition } from "./TrackingMap";

const TrackingMap = lazy(() => import("./TrackingMap"));

// Refresh cadence for live tracking (40s — within the 30-60s window).
const REFRESH_MS = 40_000;

interface Props {
  open: boolean;
  onClose: () => void;
  prefix: string;
  plate: string;
}

interface LocateResponse {
  fleet_prefix?: string | number;
  lat?: number;
  lng?: number;
  updated_at?: string;
  line_sign?: string;
}

export function VehicleTrackingModal({ open, onClose, prefix, plate }: Props) {
  const [position, setPosition] = useState<TrackPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const timerRef = useRef<number | null>(null);

  const fetchPosition = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<LocateResponse>("/api/v1/sptrans/locate", { params: { prefix } });
      if (data.lat == null || data.lng == null) {
        throw new Error("Posição indisponível para este veículo.");
      }
      setPosition({
        lat: data.lat,
        lng: data.lng,
        label: `${plate} · prefixo ${data.fleet_prefix ?? prefix}`,
        sublabel: data.line_sign ? `Linha ${data.line_sign}` : "Em operação",
      });
      setLastSync(new Date());
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) setError("Veículo fora de operação no momento. Tente novamente mais tarde.");
      else if (status === 503) setError(extractErrorMsg(err, "Integração Olho Vivo não configurada no servidor."));
      else setError(extractErrorMsg(err, err?.message ?? "Não foi possível obter a posição."));
    } finally {
      setLoading(false);
    }
  }, [prefix, plate]);

  useEffect(() => {
    if (!open) return;
    setPosition(null);
    void fetchPosition();
    timerRef.current = window.setInterval(() => void fetchPosition(), REFRESH_MS);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, fetchPosition, onClose]);

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
            className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-ink-100 bg-paper-50 shadow-hero sm:rounded-[32px]"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <div className="flex flex-col gap-3 border-b border-ink-100 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="eyebrow flex items-center gap-1.5 text-ink-400">
                  <SatelliteDish size={11} /> Rastreamento Olho Vivo · SPTrans
                </div>
                <h2 className="display mt-1 text-xl font-semibold text-ink-900 sm:text-2xl">{plate} no mapa</h2>
                <div className="mt-1 font-mono text-[11px] text-ink-400">
                  {lastSync
                    ? `Atualizado ${lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · auto a cada 40s`
                    : "Buscando posição…"}
                </div>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                <button
                  type="button"
                  onClick={() => void fetchPosition()}
                  disabled={loading}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-ink-900 transition-all hover:border-ink-900 active:scale-[0.98] sm:flex-none"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Atualizar
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

            <div className="relative h-[56vh] min-h-[280px] sm:h-[520px]">
              {position ? (
                <Suspense
                  fallback={
                    <div className="grid h-full place-items-center">
                      <Loader2 size={26} className="animate-spin text-ink-300" />
                    </div>
                  }
                >
                  <TrackingMap position={position} />
                </Suspense>
              ) : (
                <div className="grid h-full place-items-center px-8 text-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 text-ink-400">
                      <Loader2 size={28} className="animate-spin" />
                      <span className="font-mono text-[11px] uppercase tracking-wider">Localizando veículo</span>
                    </div>
                  ) : error ? (
                    <div className="flex max-w-sm flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warn-500/15 text-warn-500">
                        <TriangleAlert size={24} />
                      </div>
                      <div className="font-display text-[15px] font-semibold text-ink-900">Sem posição agora</div>
                      <p className="text-[13px] text-ink-500">{error}</p>
                      <button type="button" onClick={() => void fetchPosition()} className="btn-secondary mt-1">
                        <RefreshCw size={14} /> Tentar de novo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-ink-400">
                      <MapPin size={26} />
                      <span className="text-[13px]">Aguardando dados.</span>
                    </div>
                  )}
                </div>
              )}

              {position && error && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-warn-500/30 bg-warn-500/10 px-3.5 py-1.5 text-[11px] font-medium text-warn-600 backdrop-blur-sm">
                  Falha na última atualização — exibindo posição anterior.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
