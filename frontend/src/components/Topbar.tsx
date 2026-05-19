import { LogOut, Bell, Search, Command } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../stores/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { openCommandSearch } from "./CommandSearch";

function getScreenMeta(pathname: string) {
  if (pathname === "/") return { eyebrow: "Visão geral", title: "Dashboard" };
  if (pathname === "/feed") return { eyebrow: "Operação", title: "Feed operacional" };
  if (pathname === "/heatmap") return { eyebrow: "Inteligência", title: "Mapa de calor" };
  if (pathname === "/vehicles") return { eyebrow: "Frota", title: "Gestão de veículos" };
  if (pathname.startsWith("/vehicles/")) return { eyebrow: "Prontuário", title: "Detalhe do veículo" };
  if (pathname === "/users") return { eyebrow: "Acesso", title: "Gestão de usuários" };
  return { eyebrow: "Altcorp", title: "Painel de operação" };
}

export function Topbar() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const nav = useNavigate();
  const location = useLocation();
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
  const screen = useMemo(() => getScreenMeta(location.pathname), [location.pathname]);

  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100/60 bg-paper-50/85 backdrop-blur-xl">
      <div className="flex min-h-[72px] items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 p-1.5">
            <img src="/altcorp-logo.png" alt="Altcorp" className="h-full w-full object-contain brightness-0 invert" />
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-400">{screen.eyebrow}</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-ink-900 sm:inline">{greeting} · {firstName}</span>
          </div>
          <div className="truncate font-display text-[17px] font-semibold tracking-tightest text-ink-900 sm:text-[18px]">
            {screen.title}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Command search trigger */}
        <button
          type="button"
          onClick={openCommandSearch}
          aria-label="Buscar veículo"
          className="flex items-center gap-2 rounded-full border border-ink-100 bg-white/80 px-3.5 py-2 text-[12px] text-ink-500 transition-all hover:border-ink-300 hover:text-ink-900"
        >
          <Search size={14} />
          <span className="hidden md:inline">Buscar veículo</span>
          <span className="ml-1 hidden items-center gap-1 rounded-md border border-ink-100 bg-paper-100 px-1.5 py-0.5 font-mono text-[9.5px] text-ink-500 md:flex">
            <Command size={9} />K
          </span>
        </button>

        {/* Clock */}
        <div className="hidden items-center rounded-full border border-ink-100 bg-white/80 px-3 py-2 sm:flex">
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

        <button
          onClick={doLogout}
          aria-label="Sair"
          className="grid h-10 w-10 place-items-center rounded-full border border-ink-100 bg-white text-ink-900 transition-all hover:border-ink-900 lg:hidden"
        >
          <LogOut size={15} />
        </button>

        {/* Logout */}
        <button
          onClick={doLogout}
          className="hidden items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2 text-[12px] font-semibold text-ink-900 transition-all hover:border-ink-900 lg:flex"
        >
          <LogOut size={14} /> Sair
        </button>
      </div>
      </div>
    </header>
  );
}
