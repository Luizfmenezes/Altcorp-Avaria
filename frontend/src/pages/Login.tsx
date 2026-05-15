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
    <div className="flex min-h-screen items-stretch bg-[#f4f6fb]">
      <div className="hidden flex-1 flex-col justify-between bg-[#1c1c1c] p-12 text-white lg:flex relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#bce416] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-1">
            <img src="/altcorp-logo.png" alt="Altcorp" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">Altcorp</div>
            <div className="text-xs uppercase tracking-widest text-[#bce416]">Controle de Avarias</div>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">Operação de pátio<br />sem perda de dados.</h1>
          <p className="mt-6 max-w-md text-white/70 text-lg">
            Plataforma de missão crítica para registro fotográfico de avarias, prontuário de frota e
            inteligência operacional em tempo real.
          </p>
        </div>
        <div className="text-xs text-white/40 relative z-10">© Altcorp · Sistema interno corporativo</div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-[420px] animate-slide-up bg-white p-8 sm:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-navy-100/50">
          <div className="lg:hidden mb-10 flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-navy-100 p-1">
              <img src="/altcorp-logo.png" alt="Altcorp" className="h-full w-full object-contain" />
            </div>
            <div className="text-2xl font-extrabold text-navy-900 tracking-tight">Altcorp</div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight text-center lg:text-left">Bem-vindo</h2>
          <p className="mt-2 text-[15px] text-navy-500 text-center lg:text-left">Use suas credenciais corporativas.</p>

          <div className="mt-10 space-y-5">
            <div>
              <label htmlFor={emailInputId} className="label-form">E-mail</label>
              <input
                id={emailInputId}
                type="email"
                required
                className="input py-3.5"
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
                className="input py-3.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full rounded-full bg-[#1c1c1c] py-4 text-[15px] font-bold text-white transition-all hover:bg-black active:scale-[0.98] mt-2">
              <div className="flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                Entrar
              </div>
            </button>
          </div>

          <div className="mt-10 rounded-[20px] border border-navy-100/50 bg-[#f4f6fb] p-5 text-[13px] text-navy-500">
            <div className="font-bold uppercase tracking-widest text-navy-900 mb-3 text-xs">Contas de teste</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-white py-1.5 px-3 rounded-lg border border-navy-100/50"><span>Admin</span><span className="font-medium text-navy-900">admin@altcorp.com</span></div>
              <div className="flex justify-between items-center bg-white py-1.5 px-3 rounded-lg border border-navy-100/50"><span>Analista</span><span className="font-medium text-navy-900">analista@altcorp.com</span></div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
