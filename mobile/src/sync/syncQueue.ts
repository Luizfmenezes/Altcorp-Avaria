import { api, API_URL } from "../api/client";
import { db, type PendingInspection } from "../db/dexie";
import { useAuth } from "../stores/auth";

let running = false;
const listeners = new Set<() => void>();
const SYNC_TAG = "inspection-sync";

type SyncRegistration = ServiceWorkerRegistration & {
  sync?: {
    register: (tag: string) => Promise<void>;
  };
};

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

export async function syncNow(): Promise<void> {
  if (running) return;
  if (!navigator.onLine) return;
  if (!hasAuthToken()) return;

  await persistRuntimeSettings();
  running = true;
  try {
    const pending = await db.inspections
      .where("status_sync").anyOf("pending", "failed").toArray();
    pending.sort((left, right) => left.created_at - right.created_at);

    for (const item of pending) {
      try {
        await db.inspections.update(item.uuid, { status_sync: "syncing", last_error: undefined });
        notify();
        const { data } = await api.post("/api/v1/inspections", {
          client_uuid: item.uuid,
          vehicle_plate: item.vehicle_plate,
          inspection_type: item.inspection_type,
          status: item.status,
          notes: item.notes,
          damages: item.damages,
          performed_at: item.performed_at,
        });
        const inspectionId = data.id;
        for (const ph of item.photos) {
          const fd = new FormData();
          fd.append("file", new File([ph.blob], `${ph.id}.jpg`, { type: ph.content_type }));
          await api.post(`/api/v1/inspections/${inspectionId}/photos`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        await db.inspections.update(item.uuid, { status_sync: "synced", server_id: inspectionId });
      } catch (err: any) {
        const failure = classifySyncFailure(err);
        await db.inspections.update(item.uuid, {
          status_sync: failure.status,
          attempts: (item.attempts ?? 0) + 1,
          last_error: failure.message,
        });
      } finally {
        notify();
      }
    }
    await db.inspections.where("status_sync").equals("synced").delete();
    notify();
  } finally {
    running = false;
    notify();
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
  await db.inspections.update(uuid, {
    status_sync: "pending",
    last_error: undefined,
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
