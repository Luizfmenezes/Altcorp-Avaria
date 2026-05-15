import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, User, Wifi, WifiOff } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Feed Operacional</h1>
          <p className="text-sm text-navy-500">Timeline em tempo real das vistorias do pátio.</p>
        </div>
        <div className={`badge ${connected ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? "Tempo real" : "Reconectando"}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => (
          <article key={it.id} className="card overflow-hidden animate-slide-up">
            <div className="aspect-video w-full bg-navy-50">
              {it.photos[0]?.url ? (
                <img src={it.photos[0].url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-navy-300">
                  Sem foto
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm font-bold text-navy-900">{it.vehicle_plate ?? "—"}</div>
                  <div className="text-xs text-navy-500">{it.vehicle_model}</div>
                </div>
                <span
                  className={`badge ${
                    it.status === "with_damage" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {it.status === "with_damage" ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                  {it.status === "with_damage" ? "Com avaria" : "Aprovado"}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-navy-500">
                <span className="badge bg-navy-50 text-navy-700">
                  {it.inspection_type === "exit" ? <ArrowUpFromLine size={11} /> : <ArrowDownToLine size={11} />}
                  {it.inspection_type === "exit" ? "Saída" : "Retorno"}
                </span>
                <span className="inline-flex items-center gap-1"><User size={11} /> {it.inspector_name ?? "—"}</span>
              </div>
              {it.damages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {it.damages.slice(0, 4).map((d) => (
                    <span key={d.id} className="badge bg-amber-50 text-amber-700">{d.area_code}</span>
                  ))}
                  {it.damages.length > 4 && (
                    <span className="badge bg-navy-100 text-navy-700">+{it.damages.length - 4}</span>
                  )}
                </div>
              )}
              <div className="mt-3 text-xs text-navy-400">
                {format(new Date(it.performed_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            </div>
          </article>
        ))}
        {items.length === 0 && (
          <div className="col-span-full card p-12 text-center text-sm text-navy-500">
            Aguardando primeiras vistorias...
          </div>
        )}
      </div>
    </div>
  );
}
