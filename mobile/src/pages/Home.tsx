import { Link, useNavigate } from "react-router-dom";
import { ArrowUpFromLine, ArrowDownToLine, Inbox, LogOut, Shield } from "lucide-react";
import { NetworkBadge } from "../components/NetworkBadge";
import { useAuth } from "../stores/auth";

export function Home() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const nav = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white">
            <Shield size={16} />
          </div>
          <div>
            <div className="text-sm font-bold text-navy-900">Altcorp</div>
            <div className="text-[10px] uppercase tracking-widest text-navy-400">Vistorias</div>
          </div>
        </div>
        <NetworkBadge />
      </header>

      <main className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <div className="text-xs uppercase tracking-widest text-navy-400">Bem-vindo</div>
          <div className="text-xl font-bold text-navy-900">{user?.name}</div>
        </div>

        <Link to="/inspection/exit" className="group relative overflow-hidden rounded-3xl bg-navy-900 p-7 text-white shadow-xl transition-transform active:scale-[0.98]">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl" />
          <ArrowUpFromLine size={36} />
          <div className="mt-6 text-2xl font-bold leading-tight">Vistoria de Saída</div>
          <div className="mt-1 text-sm text-navy-300">Veículo deixando a garagem</div>
        </Link>

        <Link to="/inspection/return" className="relative overflow-hidden rounded-3xl border border-navy-200 bg-white p-7 text-navy-900 shadow-md transition-transform active:scale-[0.98]">
          <ArrowDownToLine size={36} className="text-brand-500" />
          <div className="mt-6 text-2xl font-bold leading-tight">Vistoria de Retorno</div>
          <div className="mt-1 text-sm text-navy-500">Veículo retornando ao pátio</div>
        </Link>

        <Link to="/queue" className="card flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
              <Inbox size={18} />
            </div>
            <div>
              <div className="font-semibold text-navy-900">Fila de envio</div>
              <div className="text-xs text-navy-500">Vistorias aguardando sincronização</div>
            </div>
          </div>
        </Link>

        <button onClick={() => { logout(); nav("/login"); }} className="btn-secondary mt-auto">
          <LogOut size={16} /> Sair
        </button>
      </main>
    </div>
  );
}
