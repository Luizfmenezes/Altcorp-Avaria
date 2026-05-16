import { LogOut, Bell, Search, Command } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../stores/auth";
import { useNavigate } from "react-router-dom";
import { openCommandSearch } from "./CommandSearch";

export function Topbar() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const nav = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  function doLogout() {
    logout();
    nav("/login");
  }

  const hour = now.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user?.name?.split(" ")[0] ?? "Operador";

  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-ink-100/60 bg-paper-50/85 px-4 backdrop-blur-xl lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <div className="lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 p-1.5">
            <img src="/altcorp-logo.png" alt="Altcorp" className="h-full w-full object-contain brightness-0 invert" />
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-400">{greeting} ·</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-900">{firstName}</span>
          </div>
          <div className="font-display text-[18px] font-semibold tracking-tightest text-ink-900">
            Painel de Operação
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Command search trigger */}
        <button
          type="button"
          onClick={openCommandSearch}
          className="flex items-center gap-2 rounded-full border border-ink-100 bg-white/80 px-3.5 py-2 text-[12px] text-ink-500 transition-all hover:border-ink-300 hover:text-ink-900"
        >
          <Search size={14} />
          <span className="hidden md:inline">Buscar veículo</span>
          <span className="ml-1 hidden items-center gap-1 rounded-md border border-ink-100 bg-paper-100 px-1.5 py-0.5 font-mono text-[9.5px] text-ink-500 md:flex">
            <Command size={9} />K
          </span>
        </button>

        {/* Clock */}
        <div className="hidden items-center rounded-full border border-ink-100 bg-white/80 px-3 py-2 lg:flex">
          <div className="text-right leading-tight">
            <div className="font-mono text-[11px] font-bold tracking-wider text-ink-900">{timeStr}</div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-ink-400">{dateStr}</div>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-900 transition-all hover:border-ink-900">
          <Bell size={16} />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={doLogout}
          className="hidden items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2 text-[12px] font-semibold text-ink-900 transition-all hover:border-ink-900 lg:flex"
        >
          <LogOut size={14} /> Sair
        </button>
      </div>
    </header>
  );
}
