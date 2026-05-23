import axios from "axios";
import { useAuth } from "../stores/auth";

function normalizeApiUrl(value?: string): string {
  const configured = value?.trim();

  if (configured) {
    if (configured === "/api" || configured === "/api/") {
      return globalThis.window?.location.origin ?? "";
    }
    return configured.replace(/\/api(?:\/v1)?\/?$/, "");
  }

  if (
    globalThis.window !== undefined &&
    !["localhost", "127.0.0.1"].includes(globalThis.window.location.hostname)
  ) {
    return globalThis.window.location.origin;
  }

  return "http://localhost:8000";
}

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

export const api = axios.create({ baseURL: API_URL, timeout: 20000 });

api.interceptors.request.use((cfg) => {
  const t = useAuth.getState().token;
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

/** Extrai mensagem legível de erro do backend (string | Pydantic array | objeto). */
export function extractErrorMsg(err: any, fallback = "Erro inesperado"): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return fallback;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => e.msg ?? JSON.stringify(e)).join("; ");
  }
  if (typeof detail === "object") return JSON.stringify(detail);
  return String(detail);
}
