"use client";
import { useState } from "react";
import { useStore } from "./store";
import { api } from "./api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Lock, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";

export function AdminLogin() {
  const { setUser, navigate, logout, showToast } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Ingresa email y contraseña");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ user: any }>("/api/auth", { email, password });
      if (!res.user) {
        setError("No se pudo iniciar sesión");
        setLoading(false);
        return;
      }
      if (res.user.rol === "CLIENTE") {
        // No es personal administrativo
        logout();
        setError("Esta cuenta no tiene acceso administrativo");
        setLoading(false);
        return;
      }
      setUser(res.user);
      showToast("Bienvenido, " + res.user.nombre, "success");
      navigate("admin-app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-slate-200">
            <CardHeader className="space-y-3 text-center pb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Acceso administrativo</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Panel interno — solo personal autorizado
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
                <ShieldAlert className="h-3 w-3" /> Acceso restringido
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@empresa.com"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="admin-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pl-8"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ingresando...
                    </>
                  ) : (
                    "Ingresar"
                  )}
                </Button>
              </form>

              <p className="mt-4 text-[11px] text-center text-muted-foreground/80">
                El acceso no autorizado queda registrado. Use solo credenciales provistas por el administrador.
              </p>

              <div className="mt-4 pt-3 border-t text-center">
                <button
                  type="button"
                  onClick={() => navigate("landing")}
                  className="inline-flex items-center text-xs text-muted-foreground hover:text-slate-900 hover:underline"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" /> Sitio público
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
