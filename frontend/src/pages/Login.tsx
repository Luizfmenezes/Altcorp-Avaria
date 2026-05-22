import { FormEvent, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Loader2, ArrowRight, Lock, User, Sparkles } from "lucide-react";
import { api, extractErrorMsg } from "../api/client";
import { useAuth } from "../stores/auth";

export function Login() {
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const setAuth = useAuth((s) => s.setAuth);
  const logout = useAuth((s) => s.logout);
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(extractErrorMsg(err, "Não foi possível autenticar."));
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
            <img src="/altcorp-logo.png" alt="Altcorp" className="h-4 w-4 object-contain brightness-0 invert" />
            <span>Conexão criptografada TLS 1.3</span>
          </div>
        </div>
      </aside>

      {/* RIGHT FORM PANEL */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-4 sm:p-12">
        {/* Mobile brand */}
        <div className="mb-6 w-full max-w-[440px] lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 p-1.5">
              <img src="/altcorp-logo.png" alt="Altcorp" className="h-full w-full object-contain brightness-0 invert" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-tightest text-ink-900">Altcorp</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-500">Avarias</div>
            </div>
          </div>
          <div className="mt-4 rounded-[28px] border border-ink-100 bg-white px-5 py-4 shadow-card">
            <div className="eyebrow">Acesso web</div>
            <div className="mt-2 font-display text-[1.7rem] font-semibold leading-none tracking-tightest text-ink-900">
              Gestão pronta para toque.
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-500">
              Consulte frota, heatmap e histórico operacional mesmo longe da mesa, com foco em leitura rápida no celular.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[440px] animate-slide-up rounded-[28px] border border-ink-100 bg-white p-6 shadow-hero sm:rounded-[32px] sm:p-10"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="eyebrow">Acesso restrito</span>
            <span className="h-px flex-1 bg-ink-100" />
            <span className="font-mono text-[10px] text-ink-400">01 / 01</span>
          </div>
          <h2 className="display text-[2rem] font-semibold leading-tight tracking-tightest text-ink-900 sm:text-3xl">
            Bem-vindo de volta
          </h2>
          <p className="mt-1.5 text-[13.5px] text-ink-500">
            Entre com sua conta corporativa para continuar.
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label htmlFor="login-email" className="label-form">Usuário</label>
              <div className="relative">
                <User size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  id="login-email"
                  type="text"
                  required
                  autoComplete="off"
                  className="input pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

          <p className="mt-8 text-center text-[11px] text-ink-400">
            Inspetores acessam pelo <span className="font-semibold text-ink-700">app mobile</span> de vistoria.
          </p>
        </form>
      </div>
    </div>
  );
}
