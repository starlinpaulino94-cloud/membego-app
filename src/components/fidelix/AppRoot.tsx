"use client";
import { useEffect } from "react";
import { useStore } from "./store";
import { api } from "./api-client";
import { Landing, Login, Register } from "./AuthScreens";
import { AppShell } from "./AppShell";

export function AppRoot() {
  const { user, loading, view, setUser, setLoading, setView, toast, clearToast } = useStore();

  useEffect(() => {
    api.get<{ user: any }>("/api/auth")
      .then((r) => {
        if (r.user) { setUser(r.user); setView("app"); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setUser, setLoading, setView]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white animate-pulse">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h7v7h-7z" /></svg>
          </div>
          <p className="text-sm text-muted-foreground">FIDELIX QR</p>
        </div>
      </div>
    );
  }

  if (user && view === "app") {
    return (
      <>
        <AppShell />
        <Toast toast={toast} onClose={clearToast} />
      </>
    );
  }

  return (
    <>
      {view === "login" ? <Login /> : view === "register" ? <Register /> : <Landing />}
      <Toast toast={toast} onClose={clearToast} />
    </>
  );
}

function Toast({ toast, onClose }: { toast: { msg: string; type: "success" | "error" | "info" } | null; onClose: () => void }) {
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
        <button onClick={onClose} className="text-white/70 hover:text-white">×</button>
      </div>
    </div>
  );
}
