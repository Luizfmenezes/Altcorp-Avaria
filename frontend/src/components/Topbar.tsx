import { LogOut, Bell } from "lucide-react";
import { useAuth } from "../stores/auth";
import { useNavigate } from "react-router-dom";

export function Topbar() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const nav = useNavigate();

  function doLogout() {
    logout();
    nav("/login");
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user?.name?.split(' ')[0] || "Usuário";

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between bg-[#f4f6fb] px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm bg-white flex items-center justify-center p-1">
          <img src="/altcorp-logo.png" alt="Altcorp" className="h-full w-full object-contain" />
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-tight text-navy-900">{greeting}, {firstName}</div>
          <div className="text-[12px] text-navy-500 font-medium">Bem-vindo à Altcorp</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy-900 shadow-sm transition-all hover:bg-navy-50">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500"></span>
        </button>
        <button onClick={doLogout} className="hidden lg:flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition-all hover:bg-navy-50">
          <LogOut size={16} /> Sair
        </button>
      </div>
    </header>
  );
}
