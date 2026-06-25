"use client";
import { useEffect, useState } from "react";
import { useStore } from "./store";
import { api, type TipoNegocio, type Empresa, type Estrategia, type SessionUser } from "./api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  ArrowLeft,
  QrCode,
  Car,
  UtensilsCrossed,
  Building2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  Gift,
  UserPlus,
  ScanLine,
  MapPin,
  Clock,
  Tag,
  Coins,
  CalendarDays,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TIPOS_BENEFICIO } from "@/lib/constants";

const ICONS: Record<string, React.ReactNode> = {
  Car: <Car className="h-5 w-5" />,
  UtensilsCrossed: <UtensilsCrossed className="h-5 w-5" />,
};

function tipoLabel(tipo: string): string {
  return TIPOS_BENEFICIO.find((t) => t.value === tipo)?.label || tipo;
}

// ===================== LANDING =====================
export function Landing() {
  const { navigate } = useStore();
  const [tipos, setTipos] = useState<TipoNegocio[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    api
      .get<{ tipos: TipoNegocio[]; empresas: Empresa[] }>("/api/datos-publicos")
      .then((r) => {
        setTipos(r.tipos || []);
        setEmpresas(r.empresas || []);
      })
      .catch(() => {});
  }, []);

  const beneficios: { empresa: Empresa; estrategia: Estrategia }[] = [];
  for (const emp of empresas) {
    for (const est of emp.estrategias || []) {
      beneficios.push({ empresa: emp, estrategia: est });
    }
  }

  function scrollToBeneficios() {
    if (typeof document !== "undefined") {
      const el = document.getElementById("beneficios");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold leading-none tracking-tight">Club de Beneficios QR</p>
              <p className="text-[11px] text-muted-foreground">Beneficios exclusivos</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("cliente-login")}>
            <QrCode className="mr-1.5 h-4 w-4" /> Ver mi QR
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" /> Beneficios exclusivos
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Aprovecha beneficios exclusivos con tu <span className="text-emerald-600">código QR</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg">
                Regístrate gratis, elige una promoción disponible y recibe tu código QR personal
                para aprovechar beneficios en nuestros negocios participantes.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate("registro")} className="text-base">
                  Registrarme ahora <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={scrollToBeneficios} className="text-base">
                  Ver beneficios disponibles
                </Button>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { icon: <Building2 className="h-5 w-5" />, t: "Varios negocios" },
                  { icon: <ShieldCheck className="h-5 w-5" />, t: "QR seguro" },
                  { icon: <Zap className="h-5 w-5" />, t: "Al instante" },
                ].map((f) => (
                  <div
                    key={f.t}
                    className="flex flex-col items-center gap-1.5 rounded-lg border bg-white p-3 text-center"
                  >
                    <span className="text-emerald-600">{f.icon}</span>
                    <span className="text-xs font-medium">{f.t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cómo funciona */}
            <Card className="overflow-hidden border-slate-200 shadow-xl">
              <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white">
                <p className="text-sm text-slate-300">¿Cómo funciona?</p>
                <p className="mt-1 text-lg font-semibold">Tu beneficio en 6 pasos</p>
              </div>
              <CardContent className="p-6">
                <ol className="space-y-3.5">
                  {[
                    { icon: <Building2 className="h-3.5 w-3.5" />, t: "Elige el negocio" },
                    { icon: <Sparkles className="h-3.5 w-3.5" />, t: "Selecciona una promoción disponible" },
                    { icon: <UserPlus className="h-3.5 w-3.5" />, t: "Regístrate con tus datos" },
                    { icon: <QrCode className="h-3.5 w-3.5" />, t: "Recibe tu código QR" },
                    { icon: <ScanLine className="h-3.5 w-3.5" />, t: "Presenta tu QR cuando visites el negocio" },
                    { icon: <Gift className="h-3.5 w-3.5" />, t: "Aprovecha tu beneficio" },
                  ].map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-700 pt-0.5 flex items-center gap-2">
                        <span className="text-emerald-600">{s.icon}</span>
                        {s.t}
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Negocios disponibles */}
        <section className="border-y bg-white" id="negocios">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Negocios disponibles</h2>
              <p className="mt-2 text-muted-foreground">
                Conoce los negocios participantes y aprovecha sus beneficios.
              </p>
            </div>

            {tipos.length === 0 ? (
              <p className="mt-10 text-center text-sm text-muted-foreground">
                Aún no hay negocios disponibles. Vuelve pronto.
              </p>
            ) : (
              <div className="mt-10 space-y-10">
                {tipos.map((tipo) => {
                  const empresasTipo = empresas.filter((e) => e.tipoNegocioId === tipo.id);
                  return (
                    <div key={tipo.id}>
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: (tipo.color || "#0f766e") + "22",
                            color: tipo.color || "#0f766e",
                          }}
                        >
                          {ICONS[tipo.icono || ""] || <Building2 className="h-4 w-4" />}
                        </span>
                        <h3 className="text-lg font-semibold">{tipo.nombre}</h3>
                        {tipo.descripcion && (
                          <span className="text-sm text-muted-foreground hidden sm:inline">
                            · {tipo.descripcion}
                          </span>
                        )}
                      </div>
                      {empresasTipo.length === 0 ? (
                        <p className="text-sm text-muted-foreground pl-10">
                          Próximamente negocios disponibles aquí.
                        </p>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {empresasTipo.map((emp) => (
                            <EmpresaCard key={emp.id} empresa={emp} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Beneficios disponibles */}
        <section className="bg-slate-50" id="beneficios">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Beneficios disponibles</h2>
              <p className="mt-2 text-muted-foreground">
                Promociones activas que puedes aprovechar hoy mismo.
              </p>
            </div>

            {beneficios.length === 0 ? (
              <div className="mt-10 rounded-lg border border-dashed py-12 text-center">
                <Gift className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-medium">Próximamente nuevos beneficios</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Estamos preparando promociones especiales para ti. Vuelve pronto.
                </p>
              </div>
            ) : (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {beneficios.map(({ empresa, estrategia }) => (
                  <BeneficioCard
                    key={estrategia.id}
                    empresa={empresa}
                    estrategia={estrategia}
                  />
                ))}
              </div>
            )}

            <div className="mt-10 text-center">
              <Button size="lg" onClick={() => navigate("registro")}>
                Registrarme ahora <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Preguntas frecuentes</h2>
              <p className="mt-2 text-muted-foreground">Todo lo que necesitas saber para aprovechar tu QR.</p>
            </div>
            <Accordion type="single" collapsible className="rounded-lg border bg-white px-4">
              {[
                {
                  q: "¿Cómo obtengo mi código QR?",
                  a: "Regístrate, elige una promoción y recibes tu QR al instante.",
                },
                {
                  q: "¿El registro tiene costo?",
                  a: "El registro es gratis. Algunas promociones como membresías tienen costo y se activan al confirmar el pago.",
                },
                {
                  q: "¿Dónde puedo usar mi QR?",
                  a: "En cualquiera de nuestros negocios participantes.",
                },
                {
                  q: "¿Puedo tener beneficios en varios negocios?",
                  a: "¡Sí! Puedes registrarte en cada negocio que desees.",
                },
                {
                  q: "¿Mis datos están seguros?",
                  a: "Tu QR contiene un código seguro, no tus datos personales.",
                },
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          Club de Beneficios QR · Beneficios exclusivos para nuestros clientes
        </div>
      </footer>
    </div>
  );
}

function EmpresaCard({ empresa }: { empresa: Empresa }) {
  const color = empresa.colorPrincipal || "#0f766e";
  return (
    <Card
      className="overflow-hidden transition hover:shadow-md"
      style={{ borderColor: color + "33" }}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {empresa.logo ? (
            <img
              src={empresa.logo}
              alt={empresa.nombre}
              className="h-11 w-11 rounded-lg object-cover"
            />
          ) : (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg"
              style={{ backgroundColor: color + "22", color }}
            >
              {ICONS[empresa.tipoNegocio?.icono || ""] || <Building2 className="h-5 w-5" />}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight truncate">{empresa.nombre}</p>
            {empresa.tipoNegocio && (
              <p className="text-xs text-muted-foreground">{empresa.tipoNegocio.nombre}</p>
            )}
          </div>
        </div>
        {empresa.descripcionPublica && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{empresa.descripcionPublica}</p>
        )}
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {empresa.direccion && (
            <p className="flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                {empresa.direccion}
                {empresa.ciudad ? ` · ${empresa.ciudad}` : ""}
              </span>
            </p>
          )}
          {empresa.horario && (
            <p className="flex items-start gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{empresa.horario}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BeneficioCard({ empresa, estrategia }: { empresa: Empresa; estrategia: Estrategia }) {
  const color = empresa.colorPrincipal || "#0f766e";
  const gratis = !estrategia.requierePago || estrategia.precio <= 0;
  return (
    <Card className="flex flex-col overflow-hidden transition hover:shadow-md" style={{ borderColor: color + "33" }}>
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: color + "1a", color }}
          >
            <Building2 className="h-3 w-3" /> {empresa.nombre}
          </span>
          <Badge variant="outline" className="text-[10px]">
            {tipoLabel(estrategia.tipoEstrategia)}
          </Badge>
        </div>
        <p className="mt-3 font-semibold leading-tight">{estrategia.nombre}</p>
        {estrategia.descripcion && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{estrategia.descripcion}</p>
        )}

        <div className="mt-3 flex items-center gap-1.5">
          {gratis ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <Gift className="h-3 w-3" /> Gratis
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
              <Tag className="h-3 w-3" /> RD$ {estrategia.precio.toLocaleString("es-DO")}
            </span>
          )}
        </div>

        {estrategia.terminos && (
          <p className="mt-3 text-[11px] text-muted-foreground border-t pt-2 line-clamp-2">
            {estrategia.terminos}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ===================== CLIENT LOGIN =====================
export function ClientLogin() {
  const { navigate, showToast } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ user: SessionUser }>("/api/auth", { email, password });
      if (res.user.rol !== "CLIENTE") {
        // No es cuenta de cliente: invalidar sesión y mostrar error
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        showToast("Esta cuenta no es de cliente", "error");
        setEmail("");
        setPassword("");
        return;
      }
      useStore.getState().setUser(res.user);
      showToast("¡Bienvenido " + res.user.nombre + "!", "success");
      navigate("cliente-app");
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
            <CardTitle className="text-2xl">Ver mi QR</CardTitle>
            <p className="text-sm text-muted-foreground">Ingresa para ver tu código QR y beneficios</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@correo.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>

            <div className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
              <p className="font-semibold mb-1">Cuenta de demostración:</p>
              <p>
                Cliente: <span className="font-mono">cliente@fidelix.com</span> /{" "}
                <span className="font-mono">cliente123</span>
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => navigate("landing")}
                className="text-muted-foreground hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Volver
              </button>
              <button
                type="button"
                onClick={() => navigate("registro")}
                className="text-emerald-600 hover:underline"
              >
                ¿No tienes cuenta? Registrarme ahora
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-auto border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          Club de Beneficios QR · Beneficios exclusivos para nuestros clientes
        </div>
      </footer>
    </div>
  );
}

// ===================== REGISTER SCREEN =====================
export function RegisterScreen() {
  const { navigate, showToast } = useStore();
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
    api
      .get<{ tipos: TipoNegocio[] }>("/api/tipos-negocio")
      .then((r) => setTipos(r.tipos || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!tipoId) return;
    api
      .get<{ empresas: Empresa[] }>(`/api/empresas?public=1&tipoNegocioId=${tipoId}`)
      .then((r) => setEmpresas(r.empresas || []))
      .catch(() => {});
    setEmpresaId("");
    setEstrategias([]);
  }, [tipoId]);

  useEffect(() => {
    if (!empresaId) return;
    api
      .get<{ estrategias: Estrategia[] }>(`/api/estrategias?public=1&empresaId=${empresaId}`)
      .then((r) => setEstrategias(r.estrategias || []))
      .catch(() => {});
  }, [empresaId]);

  const tipoSel = tipos.find((t) => t.id === tipoId);
  const empresaSel = empresas.find((e) => e.id === empresaId);
  const estrSel = estrategias.find((e) => e.id === estrategiaId);

  async function submit() {
    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        nombre,
        email,
        password,
        telefono,
        fechaNacimiento: fechaNacimiento || undefined,
        tipoNegocioId: tipoId,
        empresaId,
        estrategiaId: estrategiaId || undefined,
        campos,
      });
      showToast("¡Registro exitoso! Tu QR está listo.", "success");
      useStore.getState().setUser(res.user);
      navigate("cliente-app");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al registrar", "error");
    } finally {
      setLoading(false);
    }
  }

  const camposReqOk =
    !tipoSel?.camposDef ||
    tipoSel.camposDef.every((c) => !c.requerido || (campos[c.clave] && campos[c.clave].trim() !== ""));
  const canSubmit =
    !!nombre && !!email && !!password && !!telefono && !!tipoId && !!empresaId && camposReqOk;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("landing")}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <QrCode className="h-4 w-4" />
            </div>
            <span className="font-bold">Club de Beneficios QR</span>
          </button>
          <button
            onClick={() => navigate("landing")}
            className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn(
                "h-2 w-8 rounded-full transition",
                step >= n ? "bg-emerald-600" : "bg-slate-200"
              )}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold">Elige el tipo de negocio</h1>
            <p className="text-muted-foreground mt-1">¿Dónde quieres aprovechar un beneficio?</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {tipos.map((t) => {
                const color = t.color || "#0f766e";
                return (
                  <button
                    key={t.id}
                    onClick={() => setTipoId(t.id)}
                    className={cn(
                      "text-left rounded-xl border-2 p-5 transition",
                      tipoId === t.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-lg"
                        style={{ backgroundColor: color + "22", color }}
                      >
                        {ICONS[t.icono || ""] || <Building2 className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="font-semibold">{t.nombre}</p>
                        {t.descripcion && (
                          <p className="text-xs text-muted-foreground">{t.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {tipos.length === 0 && (
              <p className="mt-6 text-sm text-muted-foreground">
                No hay tipos de negocio disponibles por ahora.
              </p>
            )}
            {tipoId && (
              <Button className="mt-6 w-full" onClick={() => setStep(2)}>
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold">Selecciona el negocio</h1>
            <p className="text-muted-foreground mt-1">{tipoSel?.nombre} disponibles</p>
            <div className="mt-6 space-y-3">
              {empresas.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay negocios activos para este tipo.
                </p>
              )}
              {empresas.map((e) => {
                const color = e.colorPrincipal || "#0f766e";
                return (
                  <button
                    key={e.id}
                    onClick={() => setEmpresaId(e.id)}
                    className={cn(
                      "w-full text-left rounded-xl border-2 p-4 transition",
                      empresaId === e.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {e.logo ? (
                          <img
                            src={e.logo}
                            alt={e.nombre}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: color + "22", color }}
                          >
                            {ICONS[e.tipoNegocio?.icono || ""] || <Building2 className="h-5 w-5" />}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{e.nombre}</p>
                          {e.direccion && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {e.direccion}
                              {e.ciudad ? ` · ${e.ciudad}` : ""}
                            </p>
                          )}
                          {e.horario && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" /> {e.horario}
                            </p>
                          )}
                        </div>
                      </div>
                      {e.estrategias && e.estrategias.length > 0 && (
                        <span className="shrink-0 text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">
                          {e.estrategias.length} promociones
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {empresaId && estrategias.length > 0 && (
              <div className="mt-6">
                <p className="font-semibold text-sm mb-2">Elige una promoción (opcional)</p>
                <div className="space-y-2">
                  {estrategias.map((es) => {
                    const gratis = !es.requierePago || es.precio <= 0;
                    return (
                      <button
                        key={es.id}
                        onClick={() => setEstrategiaId(estrategiaId === es.id ? "" : es.id)}
                        className={cn(
                          "w-full text-left rounded-lg border p-3 transition",
                          estrategiaId === es.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm">{es.nombre}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {es.descripcion}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            {gratis ? (
                              <p className="text-sm font-bold text-emerald-600">Gratis</p>
                            ) : (
                              <p className="text-sm font-bold text-slate-900">
                                RD$ {es.precio.toLocaleString("es-DO")}
                              </p>
                            )}
                            {estrategiaId === es.id && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 ml-auto" />
                            )}
                          </div>
                        </div>
                        {es.requierePago && (
                          <p className="text-[11px] text-amber-600 mt-1">
                            Queda pendiente hasta confirmar el pago
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Atrás
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)} disabled={!empresaId}>
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold">Tus datos</h1>
            <p className="text-muted-foreground mt-1">
              {empresaSel?.nombre}
              {estrSel ? ` · Promoción: ${estrSel.nombre}` : ""}
            </p>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" /> Nombre completo *
                  </Label>
                  <Input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Teléfono *
                  </Label>
                  <Input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                    placeholder="809-000-0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Correo electrónico *
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu@correo.com"
                  />
                  <p className="text-[11px] text-muted-foreground">Lo usarás para ver tu QR</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Contraseña *
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /> Fecha de nacimiento (opcional)
                  </Label>
                  <Input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                  />
                </div>
              </div>

              {tipoSel?.camposDef && tipoSel.camposDef.length > 0 && (
                <div>
                  <p className="font-semibold text-sm mb-2">Datos de {tipoSel.nombre}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {tipoSel.camposDef
                      .slice()
                      .sort((a, b) => a.orden - b.orden)
                      .map((c) => (
                        <div key={c.clave} className="space-y-1.5">
                          <Label>
                            {c.etiqueta}
                            {c.requerido ? " *" : ""}
                          </Label>
                          {c.tipo === "textarea" ? (
                            <textarea
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={campos[c.clave] || ""}
                              onChange={(e) =>
                                setCampos({ ...campos, [c.clave]: e.target.value })
                              }
                            />
                          ) : c.tipo === "select" ? (
                            <select
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                              value={campos[c.clave] || ""}
                              onChange={(e) =>
                                setCampos({ ...campos, [c.clave]: e.target.value })
                              }
                            >
                              <option value="">Seleccionar...</option>
                              {(c.opciones ? JSON.parse(c.opciones) : []).map(
                                (o: string) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                )
                              )}
                            </select>
                          ) : (
                            <Input
                              type={c.tipo === "number" ? "number" : "text"}
                              value={campos[c.clave] || ""}
                              onChange={(e) =>
                                setCampos({ ...campos, [c.clave]: e.target.value })
                              }
                            />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Atrás
              </Button>
              <Button
                className="flex-1"
                onClick={submit}
                disabled={loading || !canSubmit}
              >
                {loading ? "Registrando..." : "Completar registro"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-auto border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          Club de Beneficios QR · Beneficios exclusivos para nuestros clientes
        </div>
      </footer>
    </div>
  );
}
