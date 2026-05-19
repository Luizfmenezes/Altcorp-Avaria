import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api, extractErrorMsg } from "../api/client";
import { useAuth } from "../stores/auth";
import { scheduleBackgroundSync, syncNow } from "../sync/syncQueue";

export function Login() {
  const token = useAuth((s) => s.token);
  const setAuth = useAuth((s) => s.setAuth);
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailInputId = "mobile-login-email";
  const passwordInputId = "mobile-login-password";

  if (token) return <Navigate to="/" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/api/v1/auth/login/json", { email, password });
      if (data.user.role !== "inspector" && data.user.role !== "admin") {
        setError("Apenas inspetores podem acessar o app de campo.");
        return;
      }
      setAuth(data.access_token, data.user);
      await scheduleBackgroundSync();
      void syncNow();
      nav("/");
    } catch (err: any) {
      setError(extractErrorMsg(err, "Erro ao fazer login"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-ink-900 text-paper-50">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-lime-400/20 blur-3xl" />
      <div className="relative flex flex-1 flex-col justify-center px-6">
        <div className="mb-10 flex items-center gap-3 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-ink-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
          </div>
          <div>
            <div className="font-display text-lg font-semibold tracking-tightest">Altcorp Vistorias</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-300">Operação de pátio</div>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4 animate-slide-up">
          <div>
            <label htmlFor={emailInputId} className="mb-2 block text-[10.5px] font-semibold uppercase tracking-[0.22em] text-ink-300">Usuário</label>
            <input id={emailInputId} type="text" required autoComplete="off" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor={passwordInputId} className="mb-2 block text-[10.5px] font-semibold uppercase tracking-[0.22em] text-ink-300">Senha</label>
            <input id={passwordInputId} type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="rounded-2xl border border-danger-500/30 bg-danger-500/15 px-3.5 py-2.5 text-sm text-red-200">{error}</div>}
          <button disabled={loading} className="btn-lime w-full">
            {loading && <Loader2 size={16} className="animate-spin" />} Entrar
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-ink-400">
          Funciona offline. Dados ficam salvos no aparelho até sincronizar.
        </p>
      </div>
    </div>
  );
}
