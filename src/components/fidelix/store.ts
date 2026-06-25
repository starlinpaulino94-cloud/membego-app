"use client";
import { create } from "zustand";
import type { SessionUser } from "./api-client";

// Rutas (via hash, todo bajo / para respetar el sandbox de preview)
// ""            → landing pública
// "#registro"   → registro de cliente
// "#mi-qr"      → login cliente → app cliente
// "#admin-login"→ login admin (oculto, no linkeado desde landing)
// "#admin"      → app admin (requiere auth admin/superadmin/empleado)
export type Route = "landing" | "registro" | "cliente-login" | "cliente-app" | "admin-login" | "admin-app";

export type AdminSection =
  | "dashboard"
  | "empresas"
  | "clientes"
  | "beneficios"
  | "pagos"
  | "escanear"
  | "usos"
  | "reportes"
  | "configuracion";

export type ClienteSection = "mi-qr" | "mis-empresas" | "historial";

function hashToRoute(hash: string): Route {
  const h = hash.replace(/^#/, "");
  if (h === "registro") return "registro";
  if (h === "mi-qr") return "cliente-login";
  if (h === "admin-login") return "admin-login";
  if (h === "admin") return "admin-app";
  return "landing";
}

function routeToHash(route: Route): string {
  switch (route) {
    case "registro": return "#registro";
    case "cliente-login": return "#mi-qr";
    case "cliente-app": return "#mi-qr";
    case "admin-login": return "#admin-login";
    case "admin-app": return "#admin";
    default: return "";
  }
}

type State = {
  user: SessionUser | null;
  loading: boolean;
  route: Route;
  adminSection: AdminSection;
  clienteSection: ClienteSection;
  selectedClienteId: string | null;
  toast: { msg: string; type: "success" | "error" | "info" } | null;

  setUser: (u: SessionUser | null) => void;
  setLoading: (b: boolean) => void;
  navigate: (route: Route) => void;
  setRoute: (route: Route) => void;
  setAdminSection: (s: AdminSection) => void;
  setClienteSection: (s: ClienteSection) => void;
  setSelectedClienteId: (id: string | null) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  clearToast: () => void;
  logout: () => void;
};

export const useStore = create<State>((set, get) => ({
  user: null,
  loading: true,
  route: hashToRoute(typeof window !== "undefined" ? window.location.hash : ""),
  adminSection: "dashboard",
  clienteSection: "mi-qr",
  selectedClienteId: null,
  toast: null,

  setUser: (u) => set({ user: u }),
  setLoading: (b) => set({ loading: b }),

  navigate: (route) => {
    const hash = routeToHash(route);
    if (typeof window !== "undefined") {
      if (hash) window.location.hash = hash;
      else history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    set({ route });
  },
  setRoute: (route) => set({ route }),
  setAdminSection: (s) => set({ adminSection: s }),
  setClienteSection: (s) => set({ clienteSection: s }),
  setSelectedClienteId: (id) => set({ selectedClienteId: id }),

  showToast: (msg, type = "success") => {
    set({ toast: { msg, type } });
    setTimeout(() => set({ toast: null }), 3500);
  },
  clearToast: () => set({ toast: null }),

  logout: () => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    set({ user: null, route: "landing", adminSection: "dashboard", clienteSection: "mi-qr", selectedClienteId: null });
    if (typeof window !== "undefined") history.replaceState(null, "", window.location.pathname + window.location.search);
  },
}));

// Sincroniza el estado cuando cambia el hash (botones atrás/adelante, edición manual)
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    const newRoute = hashToRoute(window.location.hash);
    if (get().route !== newRoute) set({ route: newRoute });
  });
}

// Utilidades de formato
export function fmtMonto(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return "RD$ " + Number(n).toLocaleString("es-DO", { maximumFractionDigits: 2 });
}
export function fmtFecha(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("es-DO", { year: "numeric", month: "short", day: "numeric" });
}
export function fmtFechaHora(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleString("es-DO", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
