"use client";
import { useEffect } from "react";
import { useStore } from "./store";
import { api } from "./api-client";
import { Landing, RegisterScreen, ClientLogin } from "./AuthScreens";
import { AdminLogin } from "./AdminLogin";
import { AdminShell } from "./AdminShell";
import { ClienteShell } from "./ClienteShell";

export function AppRoot() {
  const { user, loading, route, setUser, setLoading, navigate, setRoute } = useStore();

  useEffect(() => {
    api
      .get<{ user: any }>("/api/auth")
      .then((r) => {
        if (r.user) {
          setUser(r.user);
          // Si hay sesión y estamos en una ruta de login o landing, dirigir al app correspondiente
          const currentHash = window.location.hash.replace(/^#/, "");
          if (r.user.rol === "CLIENTE") {
            if (currentHash === "mi-qr" || currentHash === "" || currentHash === "registro") setRoute("cliente-app");
          } else {
            // admin / superadmin / empleado
            if (currentHash === "admin" || currentHash === "admin-login" || currentHash === "") setRoute("admin-app");
            else if (currentHash === "mi-qr" || currentHash === "registro") setRoute("admin-app");
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setUser, setLoading, setRoute]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white animate-pulse">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <path d="M14 14h7v7h-7z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Club de Beneficios QR</p>
        </div>
      </div>
    );
  }

  let content: React.ReactNode = null;
  if (route === "admin-app") {
    // Requiere sesión admin
    if (user && user.rol !== "CLIENTE") content = <AdminShell />;
    else content = <AdminLogin />;
  } else if (route === "admin-login") {
    if (user && user.rol !== "CLIENTE") {
      // ya autenticado como admin → ir al panel
      navigate("admin-app");
      content = <AdminShell />;
    } else content = <AdminLogin />;
  } else if (route === "cliente-app") {
    if (user && user.rol === "CLIENTE") content = <ClienteShell />;
    else content = <ClientLogin />;
  } else if (route === "cliente-login") {
    if (user && user.rol === "CLIENTE") {
      navigate("cliente-app");
      content = <ClienteShell />;
    } else content = <ClientLogin />;
  } else if (route === "registro") {
    content = <RegisterScreen />;
  } else {
    content = <Landing />;
  }

  return (
    <>
      {content}
      <Toast />
    </>
  );
}

function Toast() {
  const { toast, clearToast } = useStore();
  if (!toast) return null;
  const colors = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-slate-800",
  };
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className={`${colors[toast.type]} text-white rounded-lg shadow-lg px-4 py-3 text-sm max-w-sm flex items-start gap-2`}>
        <span className="flex-1">{toast.msg}</span>
        <button onClick={clearToast} className="text-white/70 hover:text-white">×</button>
      </div>
    </div>
  );
}
