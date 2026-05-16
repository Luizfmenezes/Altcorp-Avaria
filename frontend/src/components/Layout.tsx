import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandSearch } from "./CommandSearch";

export function Layout() {
  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col pb-24 lg:pb-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-6 lg:p-10 animate-fade-in">
          <Outlet />
        </main>
      </div>
      <CommandSearch />
    </div>
  );
}
