import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Truck, Car, CornerDownLeft, Loader2 } from "lucide-react";
import { api } from "../api/client";

const OPEN_EVENT = "altcorp:open-command";

/** Trigger the global command palette from anywhere. */
export function openCommandSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

interface VehicleHit {
  id: number;
  plate: string;
  prefix?: string | null;
  model: string;
  vehicle_type: string;
  is_active: boolean;
}

export function CommandSearch() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<VehicleHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open via Cmd/Ctrl+K or the global event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  // Reset + focus on open, lock body scroll.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setHits([]);
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Debounced search by plate, prefix or model.
  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (!term) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      api
        .get("/api/v1/vehicles", { params: { q: term }, signal: ctrl.signal })
        .then((r) => {
          setHits(r.data);
          setActive(0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open]);

  function go(hit: VehicleHit) {
    setOpen(false);
    nav(`/vehicles/${hit.id}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      go(hits[active]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center p-3 pt-6 animate-fade-in sm:p-4 sm:pt-[12vh]">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-md" onClick={() => setOpen(false)} />

      <div className="relative w-full max-w-xl overflow-hidden rounded-[22px] border border-ink-100 bg-white shadow-hero animate-scale-in sm:rounded-[24px]">
        <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-4 sm:px-5">
          <Search size={18} className="shrink-0 text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar veículo por placa, prefixo ou modelo…"
            className="w-full bg-transparent text-[15px] text-ink-900 placeholder:text-ink-300 outline-none"
          />
          {loading && <Loader2 size={15} className="shrink-0 animate-spin text-ink-300" />}
          <kbd className="hidden shrink-0 rounded-md border border-ink-100 bg-paper-100 px-1.5 py-0.5 font-mono text-[9.5px] text-ink-400 sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {!query.trim() && (
            <div className="px-5 py-8 text-center text-[13px] text-ink-400">
              Digite para localizar uma unidade da frota.
            </div>
          )}
          {query.trim() && !loading && hits.length === 0 && (
            <div className="px-5 py-8 text-center text-[13px] text-ink-400">
              Nenhum veículo para <span className="font-semibold text-ink-700">"{query.trim()}"</span>.
            </div>
          )}
          {hits.map((h, i) => {
            const Icon = h.vehicle_type === "car" ? Car : Truck;
            return (
              <button
                key={h.id}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(h)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  active === i ? "bg-ink-900 text-paper-50" : "hover:bg-paper-50"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    active === i ? "bg-lime-400 text-ink-900" : "bg-paper-100 text-ink-500"
                  }`}
                >
                  <Icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[13.5px] font-bold tracking-wider">{h.plate}</span>
                  <span className={`block truncate text-[11.5px] ${active === i ? "text-paper-50/70" : "text-ink-500"}`}>
                    {h.prefix ? `${h.prefix} · ` : ""}
                    {h.model}
                  </span>
                </span>
                {!h.is_active && (
                  <span className={`badge ${active === i ? "bg-white/15 text-paper-50" : "bg-ink-100 text-ink-600"}`}>
                    Inativo
                  </span>
                )}
                {active === i && <CornerDownLeft size={14} className="shrink-0 text-paper-50/60" />}
              </button>
            );
          })}
        </div>

        <div className="hidden items-center justify-between border-t border-ink-100 bg-paper-50 px-5 py-2.5 text-[10.5px] text-ink-400 sm:flex">
          <span className="font-mono uppercase tracking-wider">Busca de frota</span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-ink-100 bg-white px-1.5 py-0.5 font-mono">↑↓</kbd> navegar
            <kbd className="rounded border border-ink-100 bg-white px-1.5 py-0.5 font-mono">↵</kbd> abrir
          </span>
        </div>
      </div>
    </div>
  );
}
