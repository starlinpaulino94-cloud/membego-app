"use client";
import { useEffect, useState } from "react";
import { useStore, type AdminSection } from "./store";
import { api, type Empresa } from "./api-client";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  LayoutDashboard,
  Building2,
  Users,
  Sparkles,
  CreditCard,
  ScanLine,
  History,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RolBadge } from "./shared";
import { SuperadminPanel } from "./panels/SuperadminPanel";
import { EmpresaPanel } from "./panels/EmpresaPanel";
import { EmpleadoPanel } from "./panels/EmpleadoPanel";

type NavItem = { section: AdminSection; label: string; icon: React.ReactNode };

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  SUPERADMIN: [
    { section: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { section: "empresas", label: "Empresas", icon: <Building2 className="h-4 w-4" /> },
    { section: "clientes", label: "Clientes", icon: <Users className="h-4 w-4" /> },
    { section: "beneficios", label: "Beneficios", icon: <Sparkles className="h-4 w-4" /> },
    { section: "pagos", label: "Pagos pendientes", icon: <CreditCard className="h-4 w-4" /> },
    { section: "escanear", label: "Escanear QR", icon: <ScanLine className="h-4 w-4" /> },
    { section: "usos", label: "Usos registrados", icon: <History className="h-4 w-4" /> },
    { section: "reportes", label: "Reportes", icon: <BarChart3 className="h-4 w-4" /> },
    { section: "configuracion", label: "Configuración", icon: <Settings className="h-4 w-4" /> },
  ],
  ADMIN_EMPRESA: [
    { section: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { section: "clientes", label: "Clientes", icon: <Users className="h-4 w-4" /> },
    { section: "beneficios", label: "Beneficios", icon: <Sparkles className="h-4 w-4" /> },
    { section: "pagos", label: "Pagos pendientes", icon: <CreditCard className="h-4 w-4" /> },
    { section: "escanear", label: "Escanear QR", icon: <ScanLine className="h-4 w-4" /> },
    { section: "usos", label: "Usos registrados", icon: <History className="h-4 w-4" /> },
    { section: "reportes", label: "Reportes", icon: <BarChart3 className="h-4 w-4" /> },
    { section: "configuracion", label: "Configuración", icon: <Settings className="h-4 w-4" /> },
  ],
  EMPLEADO: [
    { section: "escanear", label: "Escanear QR", icon: <ScanLine className="h-4 w-4" /> },
    { section: "usos", label: "Usos registrados", icon: <History className="h-4 w-4" /> },
  ],
};

type NavListProps = {
  nav: NavItem[];
  currentSection: AdminSection;
  onSelect: (s: AdminSection) => void;
  onNavigate?: () => void;
};

function NavList({ nav, currentSection, onSelect, onNavigate }: NavListProps) {
  return (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {nav.map((item) => (
        <button
          key={item.section}
          onClick={() => {
            onSelect(item.section);
            onNavigate?.();
          }}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
            currentSection === item.section
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-100"
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export function AdminShell() {
  const { user, adminSection, setAdminSection, logout, showToast } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [empresaNombre, setEmpresaNombre] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const empresaId = user?.empresaId;
    if (!empresaId) {
      // Limpieza asíncrona para evitar setState síncrono en el effect
      Promise.resolve().then(() => {
        if (!cancelled) setEmpresaNombre(null);
      });
      return () => {
        cancelled = true;
      };
    }
    api
      .get<{ empresa: Empresa }>(`/api/empresas/${empresaId}`)
      .then((r) => {
        if (!cancelled) setEmpresaNombre(r.empresa.nombre);
      })
      .catch(() => {
        if (!cancelled) setEmpresaNombre(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.empresaId]);

  if (!user) return null;

  const nav = NAV_BY_ROLE[user.rol] || [];
  // Si la sección actual no está permitida para el rol, ir a la primera disponible
  const currentSection: AdminSection = nav.some((n) => n.section === adminSection)
    ? adminSection
    : nav[0]?.section || "dashboard";

  function renderPanel() {
    if (user.rol === "SUPERADMIN") return <SuperadminPanel section={currentSection} />;
    if (user.rol === "ADMIN_EMPRESA") return <EmpresaPanel section={currentSection} />;
    if (user.rol === "EMPLEADO") return <EmpleadoPanel section={currentSection} />;
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1 -ml-1"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <QrCode className="h-4 w-4" />
              </div>
              <div className="hidden sm:block">
                <p className="font-bold leading-none tracking-tight">
                  Club de Beneficios <span className="text-slate-500">QR</span>
                </p>
                {empresaNombre && (
                  <p className="text-[11px] text-muted-foreground">{empresaNombre}</p>
                )}
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                <ShieldCheck className="h-3 w-3" /> Panel interno
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium leading-none">{user.nombre}</p>
                <p className="text-[11px] text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <RolBadge rol={user.rol} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                logout();
                showToast("Sesión cerrada", "info");
              }}
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex w-60 flex-col border-r bg-white">
          <NavList
            nav={nav}
            currentSection={currentSection}
            onSelect={setAdminSection}
          />
          <div className="p-3 border-t">
            <p className="text-[11px] text-muted-foreground">Club de Beneficios QR · v2.0</p>
          </div>
        </aside>

        {/* Sidebar mobile (drawer) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-64 bg-white border-r flex flex-col">
              <div className="flex items-center justify-between p-3 border-b">
                <span className="font-bold text-sm">Menú</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Cerrar menú"
                  className="p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavList
                nav={nav}
                currentSection={currentSection}
                onSelect={setAdminSection}
                onNavigate={() => setSidebarOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{renderPanel()}</div>
        </main>
      </div>

      {/* Sticky footer */}
      <footer className="mt-auto border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 text-center text-[11px] text-muted-foreground">
          Club de Beneficios QR · Panel interno · Acceso restringido a personal autorizado
        </div>
      </footer>
    </div>
  );
}
