import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Inspection } from "./pages/Inspection";
import { Queue } from "./pages/Queue";
import { useAuth } from "./stores/auth";

function Protected() {
  const token = useAuth((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <Protected />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/inspection/:type", element: <Inspection /> },
      { path: "/queue", element: <Queue /> },
    ],
  },
]);
