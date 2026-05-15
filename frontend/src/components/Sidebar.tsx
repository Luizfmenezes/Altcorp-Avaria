import { NavLink } from "react-router-dom";
import { LayoutDashboard, Activity, Flame, Truck, Users as UsersIcon, Shield } from "lucide-react";
import { useAuth } from "../stores/auth";
import clsx from "clsx";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "analyst"] },
  { to: "/feed", label: "Operação", icon: Activity, roles: ["admin", "analyst"] },
  { to: "/heatmap", label: "Mapa", icon: Flame, roles: ["admin", "analyst"] },
  { to: "/vehicles", label: "Veículos", icon: Truck, roles: ["admin", "analyst"] },
  { to: "/users", label: "Usuários", icon: UsersIcon, roles: ["admin"] },
];

export function Sidebar() {
  const user = useAuth((s) => s.user);
  const role = user?.role ?? "analyst";

  return (
    <>
      <aside className="hidden w-72 flex-col border-r border-navy-100 bg-white px-5 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white">
            <Shield size={20} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-navy-900">Altcorp</div>
            <div className="text-[11px] uppercase tracking-widest text-navy-400">Controle de Avarias</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {items
            .filter((i) => i.roles.includes(role))
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  clsx(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-navy-900 text-white shadow-soft"
                      : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                  )
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
        </nav>

        <div className="mt-6 rounded-2xl bg-navy-900 p-4 text-white">
          <div className="text-xs uppercase tracking-widest text-navy-300">Conectado</div>
          <div className="mt-1 truncate text-sm font-semibold">{user?.name}</div>
          <div className="text-xs text-navy-300">{user?.email}</div>
          <span className="badge mt-3 bg-brand-500/20 text-brand-200 capitalize">{user?.role}</span>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around rounded-t-3xl border-t border-navy-100/30 bg-white px-2 py-2 pb-6 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] lg:hidden">
        {items
          .filter((i) => i.roles.includes(role))
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex flex-col items-center gap-1 p-2 transition-all",
                  isActive ? "text-navy-900" : "text-navy-400 hover:text-navy-600"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={clsx(
                      "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                      isActive ? "bg-[#eaf1bc] text-[#1c1c1c]" : "bg-transparent"
                    )}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={clsx("text-[10px] transition-all", isActive ? "font-bold" : "font-medium")}>
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
