import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Shield, Loader2 } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../stores/auth";
import { scheduleBackgroundSync, syncNow } from "../sync/syncQueue";

export function Login() {
  const token = useAuth((s) => s.token);
  const setAuth = useAuth((s) => s.setAuth);
  const nav = useNavigate();
  const [email, setEmail] = useState("inspetor@altcorp.com");
  const [password, setPassword] = useState("inspetor123");
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
      setError(err?.response?.data?.detail ?? "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-navy-900 text-white">
      <div className="flex flex-1 flex-col justify-center px-6">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Shield size={22} />
          </div>
          <div>
            <div className="text-lg font-bold">Altcorp Vistorias</div>
            <div className="text-xs uppercase tracking-widest text-navy-300">Operação de pátio</div>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor={emailInputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-navy-300">E-mail</label>
            <input id={emailInputId} type="email" required className="input text-navy-900" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor={passwordInputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-navy-300">Senha</label>
            <input id={passwordInputId} type="password" required className="input text-navy-900" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</div>}
          <button disabled={loading} className="btn-primary w-full bg-white text-navy-900">
            {loading && <Loader2 size={16} className="animate-spin" />} Entrar
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-navy-300">
          Funciona offline. Dados ficam salvos no aparelho até sincronizar.
        </p>
      </div>
    </div>
  );
}
