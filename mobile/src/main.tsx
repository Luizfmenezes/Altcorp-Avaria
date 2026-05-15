import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { router } from "./router";
import { scheduleBackgroundSync, startSyncLoop } from "./sync/syncQueue";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento root não encontrado.");
}

registerSW({
  immediate: true,
  onRegisteredSW() {
    void scheduleBackgroundSync();
  },
});

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

startSyncLoop();
