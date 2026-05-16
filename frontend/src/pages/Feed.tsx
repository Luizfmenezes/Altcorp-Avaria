import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, User, Wifi, WifiOff, ImageOff, Camera } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api, API_URL } from "../api/client";
import { useAuth } from "../stores/auth";

interface FeedItem {
  id: number;
  vehicle_plate?: string | null;
  vehicle_model?: string | null;
  inspector_name?: string | null;
  inspection_type: string;
  status: string;
  performed_at: string;
  notes?: string | null;
  damages: { id: number; area_code: string; severity: string; description?: string | null }[];
  photos: { id: number; url?: string | null }[];
}

export function Feed() {
  const token = useAuth((s) => s.token);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    api.get("/api/v1/inspections", { params: { limit: 50 } }).then((r) => setItems(r.data));
  }, []);

  useEffect(() => {
    if (!token) return;
    const url = API_URL.replace(/^http/, "ws") + `/api/v1/ws/feed?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.event === "inspection.created") {
          setItems((prev) => [msg.data as FeedItem, ...prev].slice(0, 100));
        }
      } catch {}
    };
    return () => ws.close();
  }, [token]);

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow">Operação</div>
          <h1 className="display-lg mt-1 text-balance text-ink-900">Feed em tempo real</h1>
          <p className="mt-2 max-w-xl text-[14px] text-ink-500">
            Stream das vistorias do pátio. Cada nova vistoria entra no topo automaticamente.
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider ${
            connected
              ? "border-success-500/30 bg-success-500/10 text-success-600"
              : "border-danger-500/30 bg-danger-500/10 text-danger-600"
          }`}
        >
          {connected ? (
            <>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success-500" />
              </span>
              <Wifi size={12} /> Tempo real
            </>
          ) : (
            <>
              <WifiOff size={12} /> Reconectando
            </>
          )}
        </div>
      </div>

      <div className="grid gap-5 stagger sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {items.map((it, idx) => (
          <article
            key={it.id}
            className="group overflow-hidden rounded-[28px] border border-ink-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-hero"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-900">
              {it.photos[0]?.url ? (
                <img src={it.photos[0].url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-paper-50/40">
                  <ImageOff size={28} />
                  <span className="font-mono text-[10px] uppercase tracking-widest">Sem foto</span>
                </div>
              )}

              {/* Overlay badges */}
              <div className="absolute left-3 top-3 flex items-center gap-1.5">
                <span
                  className={`badge backdrop-blur-md ${
                    it.status === "with_damage"
                      ? "bg-danger-500/90 text-white"
                      : "bg-success-500/90 text-white"
                  }`}
                >
                  {it.status === "with_damage" ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                  {it.status === "with_damage" ? "Avaria" : "Aprovado"}
                </span>
                <span className="badge bg-white/85 text-ink-900 backdrop-blur-md">
                  {it.inspection_type === "exit" ? <ArrowUpFromLine size={11} /> : <ArrowDownToLine size={11} />}
                  {it.inspection_type === "exit" ? "Saída" : "Retorno"}
                </span>
              </div>

              <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink-900/85 px-2 py-1 font-mono text-[10px] text-paper-50 backdrop-blur-md">
                <Camera size={11} />
                {it.photos.length}
              </div>

              {idx < 3 && (
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-lime-400 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-ink-900">
                  <span className="h-1 w-1 rounded-full bg-ink-900" /> Novo
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-sm font-bold tracking-wider text-ink-900">{it.vehicle_plate ?? "—"}</div>
                  <div className="mt-0.5 truncate text-[11.5px] text-ink-500">{it.vehicle_model}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-500">
                <User size={11} /> {it.inspector_name ?? "—"}
              </div>

              {it.damages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {it.damages.slice(0, 4).map((d) => (
                    <span key={d.id} className="chip text-[10.5px]">{d.area_code}</span>
                  ))}
                  {it.damages.length > 4 && (
                    <span className="chip bg-ink-900 text-paper-50">+{it.damages.length - 4}</span>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink-100 pt-3 text-[10.5px]">
                <span className="font-mono uppercase tracking-wider text-ink-400">
                  {format(new Date(it.performed_at), "dd MMM · HH:mm", { locale: ptBR })}
                </span>
                <span className="font-mono text-ink-300">#{String(it.id).padStart(4, "0")}</span>
              </div>
            </div>
          </article>
        ))}

        {items.length === 0 && (
          <div className="col-span-full rounded-[28px] border border-dashed border-ink-200 bg-white p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper-100 text-ink-400">
              <Camera size={20} />
            </div>
            <h3 className="display mt-4 text-lg font-semibold text-ink-900">Aguardando primeiras vistorias…</h3>
            <p className="mt-1 text-[13px] text-ink-500">O feed atualiza automaticamente assim que chegar dado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
