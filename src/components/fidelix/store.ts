"use client";
import { create } from "zustand";
import type { SessionUser } from "./api-client";

export type View =
  | "landing"
  | "login"
  | "register"
  | "app";

export type AppSection =
  | "dashboard"
  | "empresas"
  | "tipos"
  | "usuarios"
  | "clientes"
  | "estrategias"
  | "pagos"
  | "escanear"
  | "historial"
  | "integraciones"
  | "reportes"
  | "mi-qr"
  | "mis-empresas";

type State = {
  user: SessionUser | null;
  loading: boolean;
  view: View;
  section: AppSection;
  // Cliente: perfil seleccionado (cuál de sus empresas está viendo)
  selectedClienteId: string | null;
  // Empresa/admin: empresa activa (para superadmin que navega)
  selectedEmpresaId: string | null;
  toast: { msg: string; type: "success" | "error" | "info" } | null;

  setUser: (u: SessionUser | null) => void;
  setLoading: (b: boolean) => void;
  setView: (v: View) => void;
  setSection: (s: AppSection) => void;
  setSelectedClienteId: (id: string | null) => void;
  setSelectedEmpresaId: (id: string | null) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  clearToast: () => void;
  logout: () => void;
};

export const useStore = create<State>((set) => ({
  user: null,
  loading: true,
  view: "landing",
  section: "dashboard",
  selectedClienteId: null,
  selectedEmpresaId: null,
  toast: null,
  setUser: (u) => set({ user: u }),
  setLoading: (b) => set({ loading: b }),
  setView: (v) => set({ view: v }),
  setSection: (s) => set({ section: s }),
  setSelectedClienteId: (id) => set({ selectedClienteId: id }),
  setSelectedEmpresaId: (id) => set({ selectedEmpresaId: id }),
  showToast: (msg, type = "success") => {
    set({ toast: { msg, type } });
    setTimeout(() => set({ toast: null }), 3500);
  },
  clearToast: () => set({ toast: null }),
  logout: () => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    set({ user: null, view: "landing", section: "dashboard", selectedClienteId: null, selectedEmpresaId: null });
  },
}));

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
