import { api, API_URL } from "../api/client";
import { db, type PendingInspection } from "../db/dexie";
import { useAuth } from "../stores/auth";

let running = false;
const listeners = new Set<() => void>();
const SYNC_TAG = "inspection-sync";
/** Nome do Web Lock — compartilhado entre abas E service worker. */
const SYNC_LOCK = "altcorp-inspection-sync";

/** Upload de foto em rede móvel lenta precisa de timeout generoso (3 min). */
const PHOTO_UPLOAD_TIMEOUT = 180_000;
/** Após este número de falhas, a vistoria é bloqueada para correção manual. */
const MAX_SYNC_ATTEMPTS = 10;
/** POST da vistoria é JSON pequeno — timeout curto basta. */
const INSPECTION_TIMEOUT = 30_000;

type SyncRegistration = ServiceWorkerRegistration & {
  sync?: {
    register: (tag: string) => Promise<void>;
  };
};

/** Estado de progresso do envio, consumido pela tela Fila. */
export type SyncProgress = {
  active: boolean;
  total: number;
  completed: number;
  label: string | null;
  photo: number;
  photoTotal: number;
};

let progress: SyncProgress = {
  active: false,
  total: 0,
  completed: 0,
  label: null,
  photo: 0,
  photoTotal: 0,
};

export function getSyncProgress(): SyncProgress {
  return progress;
}

function setProgress(patch: Partial<SyncProgress>) {
  progress = { ...progress, ...patch };
  notify();
}

export function onSyncChange(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
function notify() { listeners.forEach((f) => f()); }

function classifySyncFailure(err: any): { status: PendingInspection["status_sync"]; message: string } {
  const httpStatus = err?.response?.status as number | undefined;
  const message = err?.response?.data?.detail ?? err?.message ?? "erro";

  if (httpStatus === 400 || httpStatus === 404) {
    return { status: "blocked", message };
  }

  return { status: "failed", message };
}

/** Backoff exponencial: 5s, 10s, 20s, 40s, 80s, 160s — teto 5min. */
function retryDelay(attempts: number): number {
  const step = Math.min(Math.max(attempts, 1), 6);
  return Math.min(5_000 * 2 ** (step - 1), 5 * 60_000);
}

async function persistRuntimeSettings() {
  await db.settings.put({ key: "api_url", value: API_URL, updated_at: Date.now() });
  const token = useAuth.getState().token;
  if (token) {
    await db.settings.put({ key: "auth_token", value: token, updated_at: Date.now() });
  }
}

function hasAuthToken() {
  return Boolean(useAuth.getState().token);
}

export async function scheduleBackgroundSync(): Promise<void> {
  await persistRuntimeSettings();
  if (!("serviceWorker" in navigator)) return;

  const registration = (await navigator.serviceWorker.ready) as SyncRegistration;
  if (registration.sync?.register) {
    try {
      await registration.sync.register(SYNC_TAG);
      return;
    } catch {
      // Fallback abaixo para navegadores sem suporte completo.
    }
  }

  registration.active?.postMessage({ type: "SYNC_PENDING_INSPECTIONS" });
}

/**
 * Roda `run` sob o Web Lock global. Garante que página e service worker
 * nunca enviem a mesma vistoria ao mesmo tempo (evita fotos duplicadas).
 * `ifAvailable` evita empilhar passes quando outro contexto já sincroniza.
 */
async function withSyncLock(run: () => Promise<void>): Promise<void> {
  const locks = navigator.locks;
  if (!locks?.request) {
    // Navegador sem Web Locks API — guarda apenas pela flag de aba.
    await run();
    return;
  }
  let acquired = false;
  try {
    await locks.request(SYNC_LOCK, { ifAvailable: true }, async (lock) => {
      if (!lock) return; // Outra aba / service worker já está sincronizando.
      acquired = true;
      await run();
    });
  } catch {
    // Web Locks falhou silenciosamente — roda direto como fallback.
    await run();
    return;
  }
  if (!acquired) {
    // Lock estava ocupado por outro contexto: reagenda um novo passe em breve.
    globalThis.setTimeout(() => { void syncNow(); }, 2000);
  }
}

export async function syncNow(): Promise<void> {
  if (running) return;
  if (!navigator.onLine) return;
  if (!hasAuthToken()) return;

  // Marca a flag ANTES de qualquer await: evita que duas chamadas
  // concorrentes passem pelo guard `if (running)` ao mesmo tempo.
  running = true;
  try {
    await persistRuntimeSettings();
    await withSyncLock(runSyncPass);
  } finally {
    running = false;
    notify();
  }
}

async function runSyncPass(): Promise<void> {
  const now = Date.now();
  const queued = await db.inspections
    .where("status_sync").anyOf("pending", "failed").toArray();
  // Respeita o backoff: pula itens cujo próximo retry ainda não chegou.
  const ready = queued
    .filter((item) => !item.next_retry_at || item.next_retry_at <= now)
    .sort((left, right) => left.created_at - right.created_at);

  if (ready.length === 0) return;

  setProgress({ active: true, total: ready.length, completed: 0, label: null, photo: 0, photoTotal: 0 });

  try {
    for (const item of ready) {
      try {
        await db.inspections.update(item.uuid, { status_sync: "syncing", last_error: undefined });
        setProgress({ label: item.vehicle_plate, photo: 0, photoTotal: item.photos.length });

        const { data } = await api.post("/api/v1/inspections", {
          client_uuid: item.uuid,
          vehicle_plate: item.vehicle_plate,
          vehicle_prefix: item.vehicle_prefix,
          inspection_type: item.inspection_type,
          status: item.status,
          notes: item.notes,
          damages: item.damages,
          performed_at: item.performed_at,
        }, { timeout: INSPECTION_TIMEOUT });
        const inspectionId = data.id;

        let uploaded = 0;
        for (const ph of item.photos) {
          const fd = new FormData();
          fd.append("file", new File([ph.blob], `${ph.id}.jpg`, { type: ph.content_type }));
          await api.post(`/api/v1/inspections/${inspectionId}/photos`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: PHOTO_UPLOAD_TIMEOUT,
          });
          uploaded += 1;
          setProgress({ photo: uploaded });
        }
        await db.inspections.update(item.uuid, {
          status_sync: "synced",
          server_id: inspectionId,
          last_error: undefined,
          next_retry_at: undefined,
        });
      } catch (err: any) {
        const failure = classifySyncFailure(err);
        const attempts = (item.attempts ?? 0) + 1;
        // Teto de tentativas: esgotado o limite, bloqueia para correção manual
        // em vez de reentrar no filtro de retry indefinidamente.
        const exhausted = attempts >= MAX_SYNC_ATTEMPTS;
        const status = exhausted ? "blocked" : failure.status;
        await db.inspections.update(item.uuid, {
          status_sync: status,
          attempts,
          last_error: exhausted
            ? `${failure.message} (limite de ${MAX_SYNC_ATTEMPTS} tentativas atingido)`
            : failure.message,
          // "blocked" exige correção manual — não agenda retry automático.
          next_retry_at: status === "failed" ? Date.now() + retryDelay(attempts) : undefined,
        });
      } finally {
        setProgress({ completed: progress.completed + 1 });
      }
    }
    await db.inspections.where("status_sync").equals("synced").delete();
  } finally {
    setProgress({ active: false, label: null, photo: 0, photoTotal: 0 });
  }
}

export async function listQueuedInspections(): Promise<PendingInspection[]> {
  return db.inspections.orderBy("created_at").reverse().toArray();
}

export async function discardQueuedInspection(uuid: string): Promise<void> {
  await db.inspections.delete(uuid);
  notify();
}

export async function requeueInspection(uuid: string): Promise<void> {
  // Reenvio manual zera o backoff e o contador de tentativas.
  await db.inspections.update(uuid, {
    status_sync: "pending",
    last_error: undefined,
    next_retry_at: undefined,
    attempts: 0,
  });
  notify();
}

export function startSyncLoop() {
  const triggerSync = () => {
    void scheduleBackgroundSync();
    void syncNow();
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") {
      triggerSync();
    }
  };
  const onServiceWorkerMessage = (event: MessageEvent<{ type?: string }>) => {
    if (event.data?.type === "QUEUE_UPDATED") {
      notify();
    }
  };

  globalThis.addEventListener("online", triggerSync);
  globalThis.addEventListener("focus", triggerSync);
  document.addEventListener("visibilitychange", onVisible);
  navigator.serviceWorker?.addEventListener?.("message", onServiceWorkerMessage);

  const id = globalThis.setInterval(triggerSync, 15000);
  triggerSync();

  return () => {
    globalThis.removeEventListener("online", triggerSync);
    globalThis.removeEventListener("focus", triggerSync);
    document.removeEventListener("visibilitychange", onVisible);
    navigator.serviceWorker?.removeEventListener?.("message", onServiceWorkerMessage);
    globalThis.clearInterval(id);
  };
}

export async function pendingCount(): Promise<number> {
  return db.inspections.where("status_sync").anyOf("pending", "failed", "syncing").count();
}
