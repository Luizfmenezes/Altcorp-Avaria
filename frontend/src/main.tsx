import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./index.css";

function RouteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50/40 p-8">
      <div className="card flex w-full max-w-md items-center gap-4 p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-200 border-t-navy-900" />
        <div>
          <div className="text-sm font-semibold text-navy-900">Carregando modulo</div>
          <div className="text-xs uppercase tracking-widest text-navy-400">Altcorp Avarias</div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} fallbackElement={<RouteLoading />} />
  </React.StrictMode>
);
