import { FormEvent, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Loader2, ArrowRight, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
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

  if (token && user?.role !== "inspector") return <Navigate to="/" replace />;
  if (token && user?.role === "inspector") logout();

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
      setError(err?.response?.data?.detail ?? "Não foi possível autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-stretch bg-paper-50">
      {/* LEFT HERO PANEL */}
      <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-ink-900 p-10 text-paper-50 lg:flex">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-lime-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[360px] w-[360px] rounded-full bg-brand-500/10 blur-3xl" />

        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/10 backdrop-blur-sm">
              <img src="/altcorp-logo.png" alt="Altcorp" className="h-full w-full object-contain brightness-0 invert" />
            </div>
            <div>
              <div className="font-display text-xl font-semibold tracking-tightest">Altcorp</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-lime-400">Controle de Avarias</div>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10.5px] font-medium uppercase tracking-wider backdrop-blur-sm xl:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400" />
            </span>
            Sistema ativo
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles size={14} className="text-lime-400" />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-paper-50/70">
              Operação de pátio · 2026
            </span>
          </div>
          <h1 className="display-xl text-balance">
            Cada avaria<br />
            <span className="relative inline-block">
              <span className="relative z-10">documentada.</span>
              <span className="absolute inset-x-0 bottom-2 -z-0 h-3 bg-lime-400/80" />
            </span>
            <br />
            Zero perda<br /> de dados.
          </h1>
          <p className="mt-7 max-w-md text-[15px] leading-relaxed text-paper-50/70">
            Plataforma de missão crítica para registro fotográfico de avarias, prontuário digital
            de frota e inteligência operacional em tempo real.
          </p>

          {/* Marquee stats */}
          <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
            {[
              { v: "100%", k: "Offline-first" },
              { v: "<2s", k: "Sincronização" },
              { v: "24/7", k: "Operação" },
            ].map((s) => (
              <div key={s.k}>
                <div className="stat-num text-3xl font-medium text-lime-400">{s.v}</div>
                <div className="mt-1 text-[10.5px] uppercase tracking-wider text-paper-50/60">{s.k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-paper-50/45">
          <span className="font-mono uppercase tracking-wider">© Altcorp · interno</span>
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-lime-400" />
            <span>Conexão criptografada TLS 1.3</span>
          </div>
        </div>
      </aside>

      {/* RIGHT FORM PANEL */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        {/* Mobile brand */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 p-1.5">
            <img src="/altcorp-logo.png" alt="Altcorp" className="h-full w-full object-contain brightness-0 invert" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold tracking-tightest text-ink-900">Altcorp</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-500">Avarias</div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[440px] animate-slide-up rounded-[32px] border border-ink-100 bg-white p-8 shadow-hero sm:p-10"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="eyebrow">Acesso restrito</span>
            <span className="h-px flex-1 bg-ink-100" />
            <span className="font-mono text-[10px] text-ink-400">01 / 01</span>
          </div>
          <h2 className="display text-3xl font-semibold leading-tight tracking-tightest text-ink-900">
            Bem-vindo de volta
          </h2>
          <p className="mt-1.5 text-[13.5px] text-ink-500">
            Entre com sua conta corporativa para continuar.
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label htmlFor="login-email" className="label-form">E-mail</label>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  id="login-email"
                  type="email"
                  required
                  className="input pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="label-form">Senha</label>
              <div className="relative">
                <Lock size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  id="login-password"
                  type="password"
                  required
                  className="input pl-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-danger-500/20 bg-danger-500/5 px-4 py-3 text-[13px] font-medium text-danger-600 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-ink-900 py-4 text-[14px] font-bold uppercase tracking-[0.14em] text-paper-50 transition-all hover:bg-ink-800 active:scale-[0.98] disabled:opacity-50"
            >
              <span className="absolute inset-y-0 left-0 w-0 bg-lime-400 transition-all duration-500 group-hover:w-full" />
              <span className="relative flex items-center gap-2 transition-colors group-hover:text-ink-900">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? "Autenticando" : "Entrar"}
              </span>
            </button>
          </div>

          {/* Test accounts */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-ink-100 bg-paper-50">
            <div className="flex items-center justify-between border-b border-ink-100 bg-white px-4 py-2.5">
              <span className="eyebrow">Contas de teste</span>
              <span className="font-mono text-[10px] text-ink-400">demo</span>
            </div>
            <div className="divide-y divide-ink-100 text-[12.5px]">
              <button
                type="button"
                onClick={() => { setEmail("admin@altcorp.com"); setPassword("admin123"); }}
                className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-white"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
                  <span className="font-semibold text-ink-900">Administrador</span>
                </span>
                <span className="font-mono text-ink-500">admin@altcorp.com</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("analista@altcorp.com"); setPassword("analista123"); }}
                className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-white"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  <span className="font-semibold text-ink-900">Analista</span>
                </span>
                <span className="font-mono text-ink-500">analista@altcorp.com</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-ink-400">
            Inspetores acessam pelo <span className="font-semibold text-ink-700">app mobile</span> de vistoria.
          </p>
        </form>
      </div>
    </div>
  );
}
