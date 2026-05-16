import { NavLink } from "react-router-dom";
import { LayoutDashboard, Activity, Flame, Truck, Users as UsersIcon, ArrowUpRight } from "lucide-react";
import { useAuth } from "../stores/auth";
import clsx from "clsx";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, code: "01", roles: ["admin", "analyst"] },
  { to: "/feed", label: "Operação", icon: Activity, code: "02", roles: ["admin", "analyst"] },
  { to: "/heatmap", label: "Mapa de Calor", icon: Flame, code: "03", roles: ["admin", "analyst"] },
  { to: "/vehicles", label: "Frota", icon: Truck, code: "04", roles: ["admin", "analyst"] },
  { to: "/users", label: "Usuários", icon: UsersIcon, code: "05", roles: ["admin"] },
];

export function Sidebar() {
  const user = useAuth((s) => s.user);
  const role = user?.role ?? "analyst";

  return (
    <>
      <aside className="hidden w-[268px] shrink-0 flex-col border-r border-ink-100 bg-white px-5 py-6 lg:flex">
        {/* Brand */}
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 p-1.5 shadow-card">
            <img src="/altcorp-logo.png" alt="Altcorp" className="h-full w-full object-contain brightness-0 invert" />
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-lime-400" />
          </div>
          <div>
            <div className="font-display text-[15px] font-semibold tracking-tightest text-ink-900 leading-none">Altcorp</div>
            <div className="mt-0.5 text-[9.5px] font-mono uppercase tracking-[0.22em] text-ink-400">Controle de Avarias</div>
          </div>
        </div>

        {/* Eyebrow */}
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="eyebrow">Navegação</span>
          <span className="font-mono text-[9.5px] text-ink-300">v1.0</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {items
            .filter((i) => i.roles.includes(role))
            .map(({ to, label, icon: Icon, code }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  clsx(
                    "group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-[13.5px] font-medium transition-all",
                    isActive
                      ? "bg-ink-900 text-paper-50 shadow-card"
                      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={clsx(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all",
                        isActive ? "bg-lime-400 text-ink-900" : "bg-ink-50 text-ink-600 group-hover:bg-ink-100"
                      )}
                    >
                      <Icon size={14} strokeWidth={2.2} />
                    </span>
                    <span className="flex-1">{label}</span>
                    <span
                      className={clsx(
                        "font-mono text-[10px] tracking-wider",
                        isActive ? "text-paper-50/60" : "text-ink-300"
                      )}
                    >
                      {code}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
        </nav>

        {/* User card */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-ink-900 p-4 text-paper-50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 font-display text-sm font-bold text-ink-900">
              {(user?.name ?? "U").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold leading-tight">{user?.name}</div>
              <div className="truncate text-[10px] font-mono uppercase tracking-wider text-paper-50/60">
                {user?.role}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-[10px] uppercase tracking-wider text-paper-50/60">Status</span>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-lime-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400" />
              </span>
              Online
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between px-2 text-[10px] text-ink-400">
          <span className="font-mono">© Altcorp 2026</span>
          <ArrowUpRight size={12} />
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-ink-100/60 bg-white/95 px-2 py-2 pb-6 shadow-[0_-8px_32px_rgba(10,10,12,0.06)] backdrop-blur-xl lg:hidden">
        {items
          .filter((i) => i.roles.includes(role))
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex flex-col items-center gap-1 p-1.5 transition-all",
                  isActive ? "text-ink-900" : "text-ink-400"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={clsx(
                      "flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300",
                      isActive ? "bg-lime-400 text-ink-900 shadow-glow" : "bg-transparent"
                    )}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={clsx("text-[9.5px] uppercase tracking-wider transition-all", isActive ? "font-bold" : "font-medium")}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
      </nav>
    </>
  );
}
