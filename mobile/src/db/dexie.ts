import Dexie, { Table } from "dexie";

export interface PendingInspection {
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
  status_sync: "pending" | "syncing" | "synced" | "failed" | "blocked";
  server_id?: number;
}

export interface AppSetting {
  key: string;
  value: string;
  updated_at: number;
}

class AppDB extends Dexie {
  inspections!: Table<PendingInspection, string>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super("altcorp-avarias");
    this.version(1).stores({
      inspections: "uuid, status_sync, created_at",
    });
    this.version(2).stores({
      inspections: "uuid, status_sync, created_at",
      settings: "key",
    });
  }
}

export const db = new AppDB();
