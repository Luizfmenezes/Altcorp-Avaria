import { FormEvent, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Shield, Loader2 } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../stores/auth";

export function Login() {
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const setAuth = useAuth((s) => s.setAuth);
  const logout = useAuth((s) => s.logout);
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@altcorp.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailInputId = "web-login-email";
  const passwordInputId = "web-login-password";

  if (token && user?.role !== "inspector") return <Navigate to="/" replace />;
  if (token && user?.role === "inspector") {
    logout();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/api/v1/auth/login/json", { email, password });
      if (data.user.role === "inspector") {
        setError("Inspetores usam exclusivamente o app mobile de vistoria.");
        return;
      }
      setAuth(data.access_token, data.user);
      nav("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-stretch bg-white">
      <div className="hidden flex-1 flex-col justify-between bg-navy-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
            <Shield size={22} />
          </div>
          <div>
            <div className="text-xl font-bold">Altcorp</div>
            <div className="text-xs uppercase tracking-widest text-navy-300">Controle de Avarias</div>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Operação de pátio sem perda de dados.</h1>
          <p className="mt-4 max-w-md text-navy-200">
            Plataforma de missão crítica para registro fotográfico de avarias, prontuário de frota e
            inteligência operacional em tempo real.
          </p>
        </div>
        <div className="text-xs text-navy-400">© Altcorp · Sistema interno corporativo</div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white">
              <Shield size={18} />
            </div>
            <div className="text-lg font-bold text-navy-900">Altcorp</div>
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Acesso à plataforma</h2>
          <p className="mt-1 text-sm text-navy-500">Use suas credenciais corporativas para entrar.</p>

          <div className="mt-8 space-y-4">
            <div>
              <label htmlFor={emailInputId} className="label-form">E-mail</label>
              <input
                id={emailInputId}
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label htmlFor={passwordInputId} className="label-form">Senha</label>
              <input
                id={passwordInputId}
                type="password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Entrar
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-navy-100 bg-navy-50/50 p-4 text-xs text-navy-500">
            <div className="font-semibold uppercase tracking-widest text-navy-700">Contas de teste</div>
            <div className="mt-2 space-y-0.5">
              <div>admin@altcorp.com / admin123</div>
              <div>analista@altcorp.com / analista123</div>
              <div>inspetor@altcorp.com / inspetor123 (somente PWA)</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
