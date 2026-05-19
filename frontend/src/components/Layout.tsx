import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandSearch } from "./CommandSearch";

export function Layout() {
  return (
    <div className="flex h-full min-h-screen overflow-x-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
      <CommandSearch />
    </div>
  );
}
