"use client";
import { useEffect, useState } from "react";
import { useStore } from "./store";
import { api, type TipoNegocio, type Empresa, type Estrategia } from "./api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, QrCode, Car, UtensilsCrossed, Building2, ShieldCheck, Zap, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  Car: <Car className="h-6 w-6" />,
  UtensilsCrossed: <UtensilsCrossed className="h-6 w-6" />,
};

export function Landing() {
  const { setView } = useStore();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold leading-none tracking-tight">FIDELIX <span className="text-sky-600">QR</span></p>
              <p className="text-[11px] text-muted-foreground">Fidelización de clientes</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setView("login")}>
            Acceder al panel
          </Button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              <Zap className="h-3.5 w-3.5" /> Plataforma SaaS multiempresa
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Fideliza a tus clientes con <span className="text-sky-600">códigos QR</span> únicos
            </h1>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg">
              Registra clientes, crea estrategias de fidelización (membresías, conteo de visitas, puntos, cupones),
              genera QR únicos por cliente y sincronízalo con el sistema de tu negocio. Carwash, restaurante y más.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => setView("register")} className="text-base">
                Soy cliente, registrarme <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setView("login")} className="text-base">
                Iniciar sesión
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: <Building2 className="h-5 w-5" />, t: "Multiempresa" },
                { icon: <ShieldCheck className="h-5 w-5" />, t: "Tokens seguros" },
                { icon: <RefreshCw className="h-5 w-5" />, t: "Integraciones" },
              ].map((f) => (
                <div key={f.t} className="flex flex-col items-center gap-1.5 rounded-lg border bg-white p-3 text-center">
                  <span className="text-sky-600">{f.icon}</span>
                  <span className="text-xs font-medium">{f.t}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200 shadow-xl">
            <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white">
              <p className="text-sm text-slate-300">¿Cómo funciona?</p>
              <p className="mt-1 text-lg font-semibold">Flujo del cliente</p>
            </div>
            <CardContent className="p-6">
              <ol className="space-y-4">
                {[
                  "Selecciona el tipo de negocio (Carwash o Restaurante)",
                  "Elige la empresa donde quieres fidelizarte",
                  "Regístrate con tus datos y selecciona una promoción",
                  "Recibe tu código QR único para presentar en el negocio",
                  "Acumula beneficios con cada consumo",
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700 pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          FIDELIX QR — Plataforma de fidelización de clientes con códigos QR · Multiempresa
        </div>
      </footer>
    </div>
  );
}

export function Login() {
  const { setView, setUser, showToast } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ user: any }>("/api/auth", { email, password });
      setUser(res.user);
      showToast("Bienvenido " + res.user.nombre, "success");
      setView("app");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al iniciar sesión", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
              <QrCode className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
            <p className="text-sm text-muted-foreground">Accede a tu panel de FIDELIX QR</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@correo.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
            <div className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
              <p className="font-semibold mb-1">Cuentas de demostración:</p>
              <p>Superadmin: <span className="font-mono">superadmin@fidelix.com</span> / <span className="font-mono">admin123</span></p>
              <p>Cliente: <span className="font-mono">cliente@fidelix.com</span> / <span className="font-mono">cliente123</span></p>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <button onClick={() => setView("landing")} className="text-muted-foreground hover:underline">← Volver</button>
              <button onClick={() => setView("register")} className="text-sky-600 hover:underline">Registrarme como cliente</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function Register() {
  const { setView, setUser, showToast } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tipos, setTipos] = useState<TipoNegocio[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [estrategias, setEstrategias] = useState<Estrategia[]>([]);
  const [tipoId, setTipoId] = useState<string>("");
  const [empresaId, setEmpresaId] = useState<string>("");
  const [estrategiaId, setEstrategiaId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  // datos personales
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [campos, setCampos] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<{ tipos: TipoNegocio[] }>("/api/tipos-negocio").then((r) => setTipos(r.tipos)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!tipoId) return;
    api.get<{ empresas: Empresa[] }>(`/api/empresas?public=1&tipoNegocioId=${tipoId}`).then((r) => setEmpresas(r.empresas)).catch(() => {});
    setEmpresaId("");
    setEstrategias([]);
  }, [tipoId]);

  useEffect(() => {
    if (!empresaId) return;
    api.get<{ estrategias: Estrategia[] }>(`/api/estrategias?public=1&empresaId=${empresaId}`).then((r) => setEstrategias(r.estrategias)).catch(() => {});
  }, [empresaId]);

  const tipoSel = tipos.find((t) => t.id === tipoId);
  const empresaSel = empresas.find((e) => e.id === empresaId);
  const estrSel = estrategias.find((e) => e.id === estrategiaId);

  async function submit() {
    setLoading(true);
    try {
      const res = await api.post<{ user: any }>("/api/auth/register", {
        nombre, email, password, telefono, fechaNacimiento,
        tipoNegocioId: tipoId, empresaId, estrategiaId: estrategiaId || undefined,
        campos,
      });
      setUser(res.user);
      showToast("¡Registro exitoso! Tu QR está listo.", "success");
      setView("app");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al registrar", "error");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = nombre && email && password && tipoId && empresaId &&
    (!tipoSel?.camposDef.some((c) => c.requerido) || tipoSel.camposDef.every((c) => !c.requerido || campos[c.clave]));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <button onClick={() => setView("landing")} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <QrCode className="h-4 w-4" />
            </div>
            <span className="font-bold">FIDELIX QR</span>
          </button>
          <div className="flex items-center gap-2 text-sm">
            {[1, 2, 3].map((n) => (
              <div key={n} className={cn("h-2 w-8 rounded-full", step >= n ? "bg-sky-600" : "bg-slate-200")} />
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold">Elige el tipo de negocio</h1>
            <p className="text-muted-foreground mt-1">¿Dónde quieres registrarte?</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {tipos.map((t) => (
                <button key={t.id} onClick={() => setTipoId(t.id)} className={cn("text-left rounded-xl border-2 p-5 transition hover:border-sky-400", tipoId === t.id ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white")}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: (t.color || "#0ea5e9") + "22", color: t.color || "#0ea5e9" }}>
                      {ICONS[t.icono || ""] || <Building2 className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="font-semibold">{t.nombre}</p>
                      <p className="text-xs text-muted-foreground">{t.descripcion}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {tipoId && (
              <Button className="mt-6 w-full" onClick={() => setStep(2)}>Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold">Selecciona la empresa</h1>
            <p className="text-muted-foreground mt-1">{tipoSel?.nombre} disponibles</p>
            <div className="mt-6 space-y-3">
              {empresas.length === 0 && <p className="text-sm text-muted-foreground">No hay empresas activas para este tipo.</p>}
              {empresas.map((e) => (
                <button key={e.id} onClick={() => setEmpresaId(e.id)} className={cn("w-full text-left rounded-xl border-2 p-4 transition hover:border-sky-400", empresaId === e.id ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white")}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{e.nombre}</p>
                      <p className="text-xs text-muted-foreground">{e.direccion} · {e.telefono}</p>
                    </div>
                    {e.estrategias && e.estrategias.length > 0 && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">{e.estrategias.length} promociones</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {empresaId && estrategias.length > 0 && (
              <div className="mt-6">
                <p className="font-semibold text-sm mb-2">Elige una promoción (opcional)</p>
                <div className="space-y-2">
                  {estrategias.map((es) => (
                    <button key={es.id} onClick={() => setEstrategiaId(estrategiaId === es.id ? "" : es.id)} className={cn("w-full text-left rounded-lg border p-3 transition", estrategiaId === es.id ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white")}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{es.nombre}</p>
                          <p className="text-xs text-muted-foreground">{es.descripcion}</p>
                        </div>
                        <div className="text-right">
                          {es.requierePago && <p className="text-sm font-bold text-slate-900">RD$ {es.precio}</p>}
                          {estrategiaId === es.id && <CheckCircle2 className="h-4 w-4 text-sky-600 ml-auto" />}
                        </div>
                      </div>
                      {es.requierePago && <p className="text-[11px] text-amber-600 mt-1">Queda pendiente hasta confirmar el pago</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>← Atrás</Button>
              <Button className="flex-1" onClick={() => setStep(3)} disabled={!empresaId}>Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold">Tus datos</h1>
            <p className="text-muted-foreground mt-1">{empresaSel?.nombre}</p>
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Nombre completo *</Label>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono</Label>
                  <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Contraseña *</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha de nacimiento</Label>
                  <Input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
                </div>
              </div>

              {tipoSel?.camposDef && tipoSel.camposDef.length > 0 && (
                <div>
                  <p className="font-semibold text-sm mb-2">Datos de {tipoSel.nombre}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {tipoSel.camposDef.map((c) => (
                      <div key={c.clave} className="space-y-1.5">
                        <Label>{c.etiqueta}{c.requerido ? " *" : ""}</Label>
                        {c.tipo === "textarea" ? (
                          <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={campos[c.clave] || ""} onChange={(e) => setCampos({ ...campos, [c.clave]: e.target.value })} />
                        ) : c.tipo === "select" ? (
                          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={campos[c.clave] || ""} onChange={(e) => setCampos({ ...campos, [c.clave]: e.target.value })}>
                            <option value="">Seleccionar...</option>
                            {(c.opciones ? JSON.parse(c.opciones) : []).map((o: string) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <Input type={c.tipo === "number" ? "number" : "text"} value={campos[c.clave] || ""} onChange={(e) => setCampos({ ...campos, [c.clave]: e.target.value })} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>← Atrás</Button>
              <Button className="flex-1" onClick={submit} disabled={loading || !canSubmit}>
                {loading ? "Registrando..." : "Completar registro"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
