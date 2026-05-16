/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope;

type PendingInspection = {
  uuid: string;
  vehicle_plate: string;
  inspection_type: "exit" | "return";
  status: "approved" | "with_damage";
  notes?: string;
  damages: { area_code: string; severity: string; description?: string; x_pct?: number; y_pct?: number }[];
  performed_at: string;
  photos: { id: string; blob: Blob; content_type: string }[];
  created_at: number;
  attempts: number;
  last_error?: string;
  next_retry_at?: number;
  status_sync: "pending" | "syncing" | "synced" | "failed" | "blocked";
  server_id?: number;
};

type AppSetting = {
  key: string;
  value: string;
  updated_at: number;
};

type ManifestEntry = {
  url: string;
  revision?: string | null;
};

type BackgroundSyncEvent = ExtendableEvent & {
  tag: string;
};

type SyncFailureError = Error & {
  status?: number;
};

const DB_NAME = "altcorp-avarias";
// Deve casar com a maior versão declarada em src/db/dexie.ts.
const DB_VERSION = 2;
const INSPECTIONS_STORE = "inspections";
const SETTINGS_STORE = "settings";
const SYNC_TAG = "inspection-sync";
// Mesmo nome do Web Lock usado em syncQueue.ts — serializa página + SW.
const SYNC_LOCK = "altcorp-inspection-sync";
const INSPECTION_TIMEOUT = 30_000;
const PHOTO_UPLOAD_TIMEOUT = 90_000;

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
const precacheManifest = self.__WB_MANIFEST as ManifestEntry[];

precacheAndRoute(precacheManifest);

const appShellEntry = precacheManifest.find((entry) => {
  return entry.url === "index.html" || entry.url === "/index.html" || entry.url.endsWith("/index.html");
});

if (appShellEntry) {
  registerRoute(new NavigationRoute(createHandlerBoundToURL(appShellEntry.url)));
}

self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (event.data?.type === "SYNC_PENDING_INSPECTIONS") {
    event.waitUntil(syncPendingInspections());
  }
});

self.addEventListener("sync", (event: Event) => {
  const syncEvent = event as BackgroundSyncEvent;
  if (syncEvent.tag === SYNC_TAG) {
    syncEvent.waitUntil(syncPendingInspections());
  }
});

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(INSPECTIONS_STORE)) {
        const inspections = database.createObjectStore(INSPECTIONS_STORE, { keyPath: "uuid" });
        inspections.createIndex("status_sync", "status_sync");
        inspections.createIndex("created_at", "created_at");
      }
      if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
        database.createObjectStore(SETTINGS_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Falha ao abrir IndexedDB no service worker."));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Falha de leitura no IndexedDB."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("Transação abortada."));
    transaction.onerror = () => reject(transaction.error ?? new Error("Transação com falha."));
  });
}

async function getPendingInspections(database: IDBDatabase): Promise<PendingInspection[]> {
  const transaction = database.transaction(INSPECTIONS_STORE, "readonly");
  const store = transaction.objectStore(INSPECTIONS_STORE);
  const items = await requestToPromise(store.getAll()) as PendingInspection[];
  await transactionDone(transaction);
  const now = Date.now();
  return items
    .filter((item) => item.status_sync === "pending" || item.status_sync === "failed")
    // Respeita o backoff: só reenvia quando o próximo retry já chegou.
    .filter((item) => !item.next_retry_at || item.next_retry_at <= now)
    .sort((left, right) => left.created_at - right.created_at);
}

async function getSetting(database: IDBDatabase, key: string): Promise<string | undefined> {
  const transaction = database.transaction(SETTINGS_STORE, "readonly");
  const store = transaction.objectStore(SETTINGS_STORE);
  const setting = await requestToPromise(store.get(key)) as AppSetting | undefined;
  await transactionDone(transaction);
  return setting?.value;
}

async function putInspection(database: IDBDatabase, item: PendingInspection): Promise<void> {
  const transaction = database.transaction(INSPECTIONS_STORE, "readwrite");
  transaction.objectStore(INSPECTIONS_STORE).put(item);
  await transactionDone(transaction);
}

async function deleteInspection(database: IDBDatabase, uuid: string): Promise<void> {
  const transaction = database.transaction(INSPECTIONS_STORE, "readwrite");
  transaction.objectStore(INSPECTIONS_STORE).delete(uuid);
  await transactionDone(transaction);
}

async function readError(response: Response): Promise<string> {
  try {
    const data = await response.clone().json() as { detail?: string };
    if (data.detail) return data.detail;
  } catch {
    // Segue para texto bruto.
  }

  const text = await response.text();
  return text || `Erro HTTP ${response.status}`;
}

function isPermanentFailure(status: number | undefined) {
  return status === 400 || status === 404;
}

/** Backoff exponencial: 5s, 10s, 20s, 40s, 80s, 160s — teto 5min. */
function retryDelay(attempts: number): number {
  const step = Math.min(Math.max(attempts, 1), 6);
  return Math.min(5_000 * 2 ** (step - 1), 5 * 60_000);
}

/** AbortSignal que dispara após `ms` — sem ele um fetch travado pendura o sync. */
function timeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

async function notifyClients() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "QUEUE_UPDATED" });
  }
}

/**
 * Envelopa o passe de sync no Web Lock global. Página e service worker
 * compartilham o mesmo lock — assim a mesma vistoria nunca é enviada duas
 * vezes em paralelo (causa raiz das fotos duplicadas). `ifAvailable` faz o
 * SW desistir de imediato quando a página já está sincronizando.
 */
async function syncPendingInspections(): Promise<void> {
  const locks = self.navigator?.locks;
  if (!locks?.request) {
    await runSyncPass();
    return;
  }
  await locks.request(SYNC_LOCK, { ifAvailable: true }, async (lock) => {
    if (!lock) return; // A página (ou outro SW) já está sincronizando.
    await runSyncPass();
  });
}

async function runSyncPass(): Promise<void> {
  const database = await openDatabase();

  try {
    const token = await getSetting(database, "auth_token");
    const apiUrl = (await getSetting(database, "api_url")) ?? self.location.origin;
    if (!token) {
      return;
    }

    const pending = await getPendingInspections(database);

    for (const item of pending) {
      try {
        await putInspection(database, { ...item, status_sync: "syncing", last_error: undefined });

        const inspectionTimeout = timeoutSignal(INSPECTION_TIMEOUT);
        let inspectionResponse: Response;
        try {
          inspectionResponse = await fetch(`${apiUrl}/api/v1/inspections`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_uuid: item.uuid,
              vehicle_plate: item.vehicle_plate,
              inspection_type: item.inspection_type,
              status: item.status,
              notes: item.notes,
              damages: item.damages,
              performed_at: item.performed_at,
            }),
            signal: inspectionTimeout.signal,
          });
        } finally {
          inspectionTimeout.clear();
        }

        if (!inspectionResponse.ok) {
          const error = new Error(await readError(inspectionResponse)) as SyncFailureError;
          error.status = inspectionResponse.status;
          throw error;
        }

        const inspectionData = await inspectionResponse.json() as { id: number };
        for (const photo of item.photos) {
          const formData = new FormData();
          formData.append("file", photo.blob, `${photo.id}.jpg`);

          const photoTimeout = timeoutSignal(PHOTO_UPLOAD_TIMEOUT);
          let photoResponse: Response;
          try {
            photoResponse = await fetch(`${apiUrl}/api/v1/inspections/${inspectionData.id}/photos`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
              signal: photoTimeout.signal,
            });
          } finally {
            photoTimeout.clear();
          }

          if (!photoResponse.ok) {
            const error = new Error(await readError(photoResponse)) as SyncFailureError;
            error.status = photoResponse.status;
            throw error;
          }
        }

        await deleteInspection(database, item.uuid);
      } catch (error) {
        const failure = error as SyncFailureError;
        const message = failure.name === "AbortError"
          ? "Tempo de envio esgotado — tentaremos novamente."
          : failure.message || "Falha ao sincronizar em background.";
        const blocked = isPermanentFailure(failure.status);
        const attempts = (item.attempts ?? 0) + 1;
        await putInspection(database, {
          ...item,
          status_sync: blocked ? "blocked" : "failed",
          attempts,
          last_error: message,
          next_retry_at: blocked ? undefined : Date.now() + retryDelay(attempts),
        });
      }
    }
  } finally {
    database.close();
    await notifyClients();
  }
}