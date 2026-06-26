"use client";
import { useEffect } from "react";
import { useStore, type AppSection } from "./store";
import { api } from "./api-client";
import { Button } from "@/components/ui/button";
import { QrCode, LayoutDashboard, Building2, Users, Sparkles, CreditCard, ScanLine, History, Plug, BarChart3, Wallet, UserCircle, Boxes, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { RolBadge } from "./shared";
import { ClientePanel } from "./panels/ClientePanel";
import { EmpresaPanel } from "./panels/EmpresaPanel";
import { SuperadminPanel } from "./panels/SuperadminPanel";
import { EmpleadoPanel } from "./panels/EmpleadoPanel";

type NavItem = { section: AppSection; label: string; icon: React.ReactNode };

export function AppShell() {
  const { user, section, setSection, logout, showToast } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [empresaNombre, setEmpresaNombre] = useState<string | null>(null);

  useEffect(() => {
    if (user?.empresaId) {
      api.get<{ empresa: any }>(`/api/empresas/${user.empresaId}`).then((r) => setEmpresaNombre(r.empresa.nombre)).catch(() => {});
    }
  }, [user?.empresaId]);

  if (!user) return null;

  const navByRole: Record<string, NavItem[]> = {
    SUPERADMIN: [
      { section: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { section: "empresas", label: "Empresas", icon: <Building2 className="h-4 w-4" /> },
      { section: "tipos", label: "Tipos de negocio", icon: <Boxes className="h-4 w-4" /> },
      { section: "usuarios", label: "Usuarios", icon: <Users className="h-4 w-4" /> },
      { section: "reportes", label: "Reportes globales", icon: <BarChart3 className="h-4 w-4" /> },
    ],
    ADMIN_EMPRESA: [
      { section: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { section: "clientes", label: "Clientes", icon: <Users className="h-4 w-4" /> },
      { section: "estrategias", label: "Estrategias", icon: <Sparkles className="h-4 w-4" /> },
      { section: "pagos", label: "Pagos pendientes", icon: <CreditCard className="h-4 w-4" /> },
      { section: "escanear", label: "Escanear QR", icon: <ScanLine className="h-4 w-4" /> },
      { section: "historial", label: "Historial", icon: <History className="h-4 w-4" /> },
      { section: "integraciones", label: "Integraciones", icon: <Plug className="h-4 w-4" /> },
      { section: "reportes", label: "Reportes", icon: <BarChart3 className="h-4 w-4" /> },
    ],
    EMPLEADO: [
      { section: "escanear", label: "Escanear QR", icon: <ScanLine className="h-4 w-4" /> },
      { section: "historial", label: "Historial", icon: <History className="h-4 w-4" /> },
    ],
    CLIENTE: [
      { section: "mi-qr", label: "Mi QR", icon: <QrCode className="h-4 w-4" /> },
      { section: "mis-empresas", label: "Mis empresas", icon: <Wallet className="h-4 w-4" /> },
      { section: "historial", label: "Historial", icon: <History className="h-4 w-4" /> },
    ],
  };

  const nav = navByRole[user.rol] || [];

  function renderPanel() {
    if (user.rol === "SUPERADMIN") return <SuperadminPanel section={section} />;
    if (user.rol === "ADMIN_EMPRESA") return <EmpresaPanel section={section} />;
    if (user.rol === "EMPLEADO") return <EmpleadoPanel section={section} />;
    return <ClientePanel section={section} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <QrCode className="h-4 w-4" />
              </div>
              <div className="hidden sm:block">
                <p className="font-bold leading-none tracking-tight">Pase Digital QR</p>
                {empresaNombre && <p className="text-[11px] text-muted-foreground">{empresaNombre}</p>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              <div className="text-right">
                <p className="text-sm font-medium leading-none">{user.nombre}</p>
                <p className="text-[11px] text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <RolBadge rol={user.rol} />
            <Button variant="ghost" size="icon" onClick={() => { logout(); showToast("Sesión cerrada", "info"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex w-60 flex-col border-r bg-white">
          <nav className="flex-1 p-3 space-y-1">
            {nav.map((item) => (
              <button
                key={item.section}
                onClick={() => setSection(item.section)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                  section === item.section ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t">
            <p className="text-[11px] text-muted-foreground">Pase Digital QR · Panel interno</p>
          </div>
        </aside>

        {/* Sidebar mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 bg-white border-r flex flex-col">
              <div className="flex items-center justify-between p-3 border-b">
                <span className="font-bold">Menú</span>
                <button onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {nav.map((item) => (
                  <button
                    key={item.section}
                    onClick={() => { setSection(item.section); setSidebarOpen(false); }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                      section === item.section ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  );
}
