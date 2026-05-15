import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db } from "../db/dexie";

export interface User { id: number; name: string; email: string; role: string; }

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        db.settings.put({ key: "auth_token", value: token, updated_at: Date.now() }).catch(() => undefined);
        set({ token, user });
      },
      logout: () => {
        db.settings.delete("auth_token").catch(() => undefined);
        set({ token: null, user: null });
      },
    }),
    { name: "altcorp-mobile-auth" }
  )
);
