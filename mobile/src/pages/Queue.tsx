import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  CloudUpload,
  Clock3,
  Inbox,
  RefreshCw,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import type { PendingInspection } from "../db/dexie";
import {
  discardQueuedInspection,
  getSyncProgress,
  listQueuedInspections,
  onSyncChange,
  requeueInspection,
  scheduleBackgroundSync,
  syncNow,
  type SyncProgress,
} from "../sync/syncQueue";

const formatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function statusLabel(status: PendingInspection["status_sync"]) {
  if (status === "syncing") return { text: "Sincronizando", className: "bg-amber-100 text-amber-700", icon: RefreshCw };
  if (status === "blocked") return { text: "Aguardando correção", className: "bg-orange-100 text-orange-700", icon: TriangleAlert };
  if (status === "failed") return { text: "Falhou", className: "bg-danger-500/15 text-danger-600", icon: TriangleAlert };
  return { text: "Na fila", className: "bg-lime-100 text-lime-800", icon: Clock3 };
}

export function Queue() {
  const [items, setItems] = useState<PendingInspection[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<SyncProgress>(getSyncProgress());

  async function load() {
    setItems(await listQueuedInspections());
  }

  useEffect(() => {
    void load();
    const off = onSyncChange(() => {
      void load();
      setProgress(getSyncProgress());
    });
    return () => off();
  }, []);

  const stats = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((item) => item.status_sync === "pending").length,
      failed: items.filter((item) => item.status_sync === "failed").length,
      blocked: items.filter((item) => item.status_sync === "blocked").length,
      syncing: items.filter((item) => item.status_sync === "syncing").length,
    };
  }, [items]);

  async function syncAll() {
    setBusy(true);
    try {
      await scheduleBackgroundSync();
      await syncNow();
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function retryOne(uuid: string) {
    setBusy(true);
    try {
      await requeueInspection(uuid);
      await scheduleBackgroundSync();
      await syncNow();
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function discard(uuid: string) {
    setBusy(true);
    try {
      await discardQueuedInspection(uuid);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-50">
      <header className="sticky top-0 z-10 border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="rounded-xl p-2 text-ink-700 active:bg-ink-50">
            <ArrowLeft size={20} />
          </Link>
          <div className="text-center">
            <div className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink-900">Fila de Envio</div>
            <div className="text-[11px] text-ink-400">Persistida no aparelho até concluir o envio</div>
          </div>
          <button onClick={syncAll} disabled={busy} className="rounded-xl p-2 text-ink-700 active:bg-ink-50 disabled:opacity-40">
            <RefreshCw size={20} className={busy ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <main className="flex-1 space-y-4 p-4 pb-10">
        <section className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <div className="eyebrow">Pendentes</div>
            <div className="stat-num mt-2 text-2xl font-semibold text-ink-900">{stats.pending}</div>
          </div>
          <div className="card p-4">
            <div className="eyebrow">Falhas</div>
            <div className="stat-num mt-2 text-2xl font-semibold text-danger-600">{stats.failed}</div>
          </div>
          <div className="card p-4">
            <div className="eyebrow">Pendentes de correção</div>
            <div className="stat-num mt-2 text-2xl font-semibold text-orange-600">{stats.blocked}</div>
          </div>
          <div className="card p-4">
            <div className="eyebrow">Em envio</div>
            <div className="stat-num mt-2 text-2xl font-semibold text-amber-600">{stats.syncing}</div>
          </div>
          <div className="card-ink col-span-2 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-paper-50/50">Total em fila</div>
            <div className="stat-num mt-2 text-2xl font-semibold text-lime-400">{stats.total}</div>
          </div>
        </section>

        {progress.active && (
          <section className="card p-4 animate-scale-in">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
                <CloudUpload size={16} className="text-lime-600" />
                Sincronizando…
              </div>
              <span className="stat-num text-sm font-semibold text-ink-900">
                {progress.completed}/{progress.total}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-lime-400 transition-all duration-300"
                style={{ width: `${progress.total ? (progress.completed / progress.total) * 100 : 0}%` }}
              />
            </div>
            {progress.label && (
              <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
                <span className="font-mono font-semibold tracking-widest text-ink-700">{progress.label}</span>
                {progress.photoTotal > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Camera size={12} />
                    {progress.photo}/{progress.photoTotal}
                  </span>
                )}
              </div>
            )}
          </section>
        )}

        {items.length === 0 ? (
          <section className="card flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={26} />
            </div>
            <h1 className="mt-4 font-display text-lg font-semibold tracking-tightest text-ink-900">Fila vazia</h1>
            <p className="mt-2 max-w-xs text-sm text-ink-500">
              Todas as vistorias locais foram sincronizadas com o backend e removidas do aparelho.
            </p>
          </section>
        ) : (
          <section className="space-y-3">
            {items.map((item) => {
              const badge = statusLabel(item.status_sync);
              const Icon = badge.icon;
              return (
                <article key={item.uuid} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xl font-bold tracking-widest text-ink-900">{item.vehicle_plate}</div>
                      <div className="mt-1 text-xs text-ink-500">
                        {item.inspection_type === "exit" ? "Vistoria de saída" : "Vistoria de retorno"}
                      </div>
                    </div>
                    <span className={`badge ${badge.className}`}>
                      <Icon size={12} className={item.status_sync === "syncing" ? "animate-spin" : ""} />
                      {badge.text}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-ink-50 px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">Registrada</div>
                      <div className="mt-1 font-semibold text-ink-700">{formatter.format(new Date(item.performed_at))}</div>
                    </div>
                    <div className="rounded-2xl bg-ink-50 px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">Tentativas</div>
                      <div className="mt-1 font-semibold text-ink-700">{item.attempts}</div>
                    </div>
                    <div className="rounded-2xl bg-ink-50 px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">Avarias</div>
                      <div className="mt-1 font-semibold text-ink-700">{item.damages.length}</div>
                    </div>
                    <div className="rounded-2xl bg-ink-50 px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">Fotos</div>
                      <div className="mt-1 inline-flex items-center gap-1 font-semibold text-ink-700">
                        <Camera size={14} />
                        {item.photos.length}
                      </div>
                    </div>
                  </div>

                  {item.notes && <p className="mt-3 text-sm text-ink-600">{item.notes}</p>}

                  {item.damages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.damages.map((damage, index) => (
                        <span key={`${item.uuid}-${damage.area_code}-${index}`} className="badge bg-amber-50 text-amber-700">
                          {damage.area_code}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.last_error && (
                    <div className="mt-3 rounded-2xl border border-danger-500/25 bg-danger-500/10 px-3 py-2 text-sm text-danger-600">
                      {item.last_error}
                    </div>
                  )}

                  {item.status_sync === "blocked" && (
                    <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
                      Corrija o cadastro ou os dados desta vistoria antes de reenviar.
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-xs text-ink-400">
                      <Inbox size={13} />
                      UUID local {item.uuid.slice(0, 8)}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => retryOne(item.uuid)} disabled={busy || item.status_sync === "syncing"} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
                        <CloudUpload size={15} />
                        Reenviar
                      </button>
                      <button onClick={() => discard(item.uuid)} disabled={busy || item.status_sync === "syncing"} className="btn-secondary px-4 py-2 text-sm text-danger-600 disabled:opacity-40">
                        <Trash2 size={15} />
                        Remover
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
