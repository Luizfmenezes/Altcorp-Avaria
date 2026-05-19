import axios from "axios";
import { useAuth } from "../stores/auth";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
