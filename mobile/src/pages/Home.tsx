import { Link, useNavigate } from "react-router-dom";
import { ArrowUpFromLine, ArrowDownToLine, Inbox, LogOut, Shield, ChevronRight } from "lucide-react";
import { NetworkBadge } from "../components/NetworkBadge";
import { useAuth } from "../stores/auth";

export function Home() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const nav = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-paper-50">
      <header className="flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-lime-400">
            <Shield size={16} />
          </div>
          <div>
            <div className="font-display text-sm font-semibold tracking-tightest text-ink-900">Altcorp</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">Vistorias</div>
          </div>
        </div>
        <NetworkBadge />
      </header>

      <main className="flex flex-1 flex-col gap-4 p-5">
        <div className="animate-fade-in">
          <div className="eyebrow">Bem-vindo</div>
          <div className="font-display text-2xl font-semibold tracking-tightest text-ink-900">{user?.name}</div>
        </div>

        <Link
          to="/inspection/exit"
          className="card-ink group p-7 shadow-hero transition-transform active:scale-[0.98] animate-slide-up"
        >
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-lime-400/25 blur-2xl" />
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-ink-900">
              <ArrowUpFromLine size={24} />
            </div>
            <div className="mt-6 font-display text-2xl font-semibold leading-tight tracking-tightest">Vistoria de Saída</div>
            <div className="mt-1 text-sm text-paper-50/60">Veículo deixando a garagem</div>
          </div>
        </Link>

        <Link
          to="/inspection/return"
          className="card group p-7 transition-transform active:scale-[0.98] animate-slide-up"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
            <ArrowDownToLine size={24} />
          </div>
          <div className="mt-6 font-display text-2xl font-semibold leading-tight tracking-tightest text-ink-900">Vistoria de Retorno</div>
          <div className="mt-1 text-sm text-ink-500">Veículo retornando ao pátio</div>
        </Link>

        <Link to="/queue" className="card flex items-center justify-between p-5 transition-transform active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-50 text-ink-700">
              <Inbox size={18} />
            </div>
            <div>
              <div className="font-semibold text-ink-900">Fila de envio</div>
              <div className="text-xs text-ink-500">Vistorias aguardando sincronização</div>
            </div>
          </div>
          <ChevronRight size={18} className="text-ink-300" />
        </Link>

        <button onClick={() => { logout(); nav("/login"); }} className="btn-secondary mt-auto">
          <LogOut size={16} /> Sair
        </button>
      </main>
    </div>
  );
}
