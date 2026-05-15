import axios from "axios";
import { useAuth } from "../stores/auth";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const t = useAuth.getState().token;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      useAuth.getState().logout();
      if (location.pathname !== "/login") location.href = "/login";
    }
    return Promise.reject(err);
  }
);
