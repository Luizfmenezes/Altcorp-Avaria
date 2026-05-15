import { useEffect } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { useAuth } from "./stores/auth";

const loadDashboard = async () => {
  const { Dashboard } = await import("./pages/Dashboard");
  return { Component: Dashboard };
};

const loadFeed = async () => {
  const { Feed } = await import("./pages/Feed");
  return { Component: Feed };
};

const loadHeatmap = async () => {
  const { Heatmap } = await import("./pages/Heatmap");
  return { Component: Heatmap };
};

const loadVehicles = async () => {
  const { Vehicles } = await import("./pages/Vehicles");
  return { Component: Vehicles };
};

const loadVehicleDetail = async () => {
  const { VehicleDetail } = await import("./pages/VehicleDetail");
  return { Component: VehicleDetail };
};

const loadUsers = async () => {
  const { Users } = await import("./pages/Users");
  return { Component: Users };
};

function Protected() {
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  useEffect(() => {
    if (token && user?.role === "inspector") {
      logout();
    }
  }, [logout, token, user?.role]);

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === "inspector") return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AdminOnly() {
  const user = useAuth((s) => s.user);
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <Protected />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, lazy: loadDashboard },
          { path: "/feed", lazy: loadFeed },
          { path: "/heatmap", lazy: loadHeatmap },
          { path: "/vehicles", lazy: loadVehicles },
          { path: "/vehicles/:id", lazy: loadVehicleDetail },
          {
            element: <AdminOnly />,
            children: [{ path: "/users", lazy: loadUsers }],
          },
        ],
      },
    ],
  },
]);
