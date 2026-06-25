"use client";
import { useEffect, useState } from "react";
import { useStore } from "./store";
import {
  api,
  type TipoNegocio,
  type Empresa,
  type Estrategia,
  type SessionUser,
  type Config,
} from "./api-client";
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
  Sparkles,
  Gift,
  MapPin,
  Clock,
  Users,
  Store,
  Ticket,
  Star,
  Flame,
  Check,
  Crown,
  TrendingUp,
  CalendarDays,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  ChevronDown,
  ChevronRight,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TIPOS_BENEFICIO, ESCASEZ_TIPOS } from "@/lib/constants";

const ICONS: Record<string, React.ReactNode> = {
  Car: <Car className="h-5 w-5" />,
  UtensilsCrossed: <UtensilsCrossed className="h-5 w-5" />,
};

function tipoLabel(tipo: string): string {
  return TIPOS_BENEFICIO.find((t) => t.value === tipo)?.label || tipo;
}

function parseJsonArray<T = string>(value: string | null | undefined, fallback: T[] = []): T[] {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed as T[];
    return fallback;
  } catch {
    return fallback;
  }
}

function escasezMensaje(tipo: string | null): string | null {
  if (!tipo) return null;
  return ESCASEZ_TIPOS.find((e) => e.value === tipo)?.mensaje || null;
}

// Count-up animation hook (Cialdini - Prueba Social)
function useCountUp(target: number, durationMs = 1200): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return val;
}

function StatPill({
  value,
  label,
  icon,
  suffix = "+",
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
}) {
  const n = useCountUp(value);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur transition hover:shadow-md">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-lg font-extrabold tracking-tight text-slate-900">
          {n.toLocaleString("es-DO")}
          {suffix}
        </p>
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      </div>
    </div>
  );
}

function scrollToPromociones() {
  if (typeof document !== "undefined") {
    const el = document.getElementById("promociones");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ===================== LANDING =====================
export function Landing() {
  const { navigate } = useStore();
  const [tipos, setTipos] = useState<TipoNegocio[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usosPorEstr, setUsosPorEstr] = useState<Record<string, number>>({});
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    api
      .get<{
        tipos: TipoNegocio[];
        empresas: Empresa[];
        usosPorEstr: Record<string, number>;
        config: Config;
        clientesReales: number;
      }>("/api/datos-publicos")
      .then((r) => {
        setTipos(r.tipos || []);
        setEmpresas(r.empresas || []);
        setUsosPorEstr(r.usosPorEstr || {});
        setConfig(r.config);
      })
      .catch(() => {});
  }, []);

  const promociones: { empresa: Empresa; estrategia: Estrategia }[] = [];
  for (const emp of empresas) {
    for (const est of emp.estrategias || []) {
      promociones.push({ empresa: emp, estrategia: est });
    }
  }

  const hasCarwash = empresas.some(
    (e) => e.tipoNegocio?.slug === "carwash" || e.tipoNegocio?.icono === "Car"
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-white to-amber-50/40">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-amber-100/60 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-sm">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold leading-none tracking-tight">PASE DIGITAL</p>
              <p className="text-[11px] text-amber-700/80">Acceso Exclusivo</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("cliente-login")}
            className="border-amber-300 text-amber-800 hover:bg-amber-50 hover:text-amber-900"
          >
            <QrCode className="mr-1.5 h-4 w-4" /> Acceder a mi Pase
          </Button>
        </div>
      </header>

      <main className="w-full flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 py-12 text-center sm:py-16 lg:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            <Crown className="h-3.5 w-3.5" /> Acceso exclusivo para clientes registrados
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {config?.heroTitulo ? (
              config.heroTitulo
            ) : (
              <>
                Tu <span className="text-amber-700">Pase Digital</span> abre la puerta a
                promociones privadas
              </>
            )}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {config?.heroSubtitulo ||
              "Regístrate gratuitamente, activa tu Pase Digital y comienza a disfrutar promociones exclusivas en nuestros establecimientos participantes."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={() => navigate("registro")}
              className="bg-amber-600 text-base text-white shadow-md hover:bg-amber-700"
            >
              <Sparkles className="mr-2 h-4 w-4" /> Quiero mi Pase Digital
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToPromociones}
              className="border-amber-300 text-base text-amber-800 hover:bg-amber-50"
            >
              Descubrir promociones <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <p className="mt-4 text-xs italic text-amber-700/80">
            Algunas promociones solo están disponibles para clientes registrados.
          </p>
        </section>

        {/* Social proof bar */}
        {config && (
          <section className="mx-auto max-w-5xl px-4 pb-12">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatPill
                value={config.socialClientes}
                label="Clientes registrados"
                icon={<Users className="h-5 w-5" />}
                suffix="+"
              />
              <StatPill
                value={config.socialVisitas}
                label="Promociones ya utilizadas"
                icon={<Ticket className="h-5 w-5" />}
                suffix="+"
              />
              <StatPill
                value={config.socialNegocios}
                label="Negocios participantes"
                icon={<Store className="h-5 w-5" />}
                suffix=""
              />
              {hasCarwash && (
                <StatPill
                  value={config.socialVehiculos}
                  label="Vehículos atendidos"
                  icon={<Car className="h-5 w-5" />}
                  suffix="+"
                />
              )}
            </div>
          </section>
        )}

        {/* Cómo funciona */}
        <section className="border-y border-amber-100/60 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                <Sparkles className="h-3.5 w-3.5" /> 5 pasos
              </span>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Activa tu Pase Digital en 5 pasos
              </h2>
              <p className="mt-2 text-muted-foreground">
                Tu acceso exclusivo está listo en minutos. Sin complicaciones.
              </p>
            </div>
            <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                {
                  icon: <KeyRound className="h-5 w-5" />,
                  t: "Activa tu Pase Digital",
                  d: "Registro gratuito en minutos",
                },
                {
                  icon: <Store className="h-5 w-5" />,
                  t: "Elige tu establecimiento",
                  d: "Entre nuestras opciones participantes",
                },
                {
                  icon: <Gift className="h-5 w-5" />,
                  t: "Descubre las promociones",
                  d: "Explora oportunidades exclusivas",
                },
                {
                  icon: <QrCode className="h-5 w-5" />,
                  t: "Presenta tu Pase QR",
                  d: "Al momento de tu visita",
                },
                {
                  icon: <Crown className="h-5 w-5" />,
                  t: "Disfruta la experiencia",
                  d: "Vive ventajas exclusivas",
                },
              ].map((s, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-amber-100 bg-gradient-to-b from-white to-amber-50/40 p-5 text-center transition hover:shadow-md"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="mt-3 flex justify-center text-amber-700">{s.icon}</div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{s.t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Establecimientos participantes */}
        <section className="bg-gradient-to-b from-amber-50/30 to-white" id="establecimientos">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                <Store className="h-3.5 w-3.5" /> Establecimientos
              </span>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Establecimientos participantes
              </h2>
              <p className="mt-2 text-muted-foreground">
                Negocios cuidadosamente seleccionados para ofrecerte las mejores experiencias.
              </p>
            </div>

            {empresas.length === 0 ? (
              <p className="mt-10 text-center text-sm text-muted-foreground">
                Aún no hay establecimientos disponibles. Vuelve pronto.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {empresas.map((emp) => (
                  <EmpresaPremiumCard
                    key={emp.id}
                    empresa={emp}
                    onVerPromociones={scrollToPromociones}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Promociones disponibles */}
        <section className="bg-white" id="promociones">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                <Ticket className="h-3.5 w-3.5" /> Oportunidades exclusivas
              </span>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Promociones disponibles
              </h2>
              <p className="mt-2 text-muted-foreground">
                Oportunidades exclusivas para titulares del Pase Digital
              </p>
            </div>

            {promociones.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-amber-200 py-12 text-center">
                <Gift className="mx-auto h-10 w-10 text-amber-400" />
                <p className="mt-3 font-medium text-slate-900">Próximamente nuevas promociones</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Estamos preparando oportunidades especiales para ti. Vuelve pronto.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {promociones.map(({ empresa, estrategia }) => (
                  <PromocionCard
                    key={estrategia.id}
                    empresa={empresa}
                    estrategia={estrategia}
                    usos={usosPorEstr[estrategia.id] || 0}
                    onObtener={() => navigate("registro")}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gradient-to-b from-white to-amber-50/40">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
            <div className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                <ShieldCheck className="h-3.5 w-3.5" /> Confianza
              </span>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Preguntas frecuentes</h2>
              <p className="mt-2 text-muted-foreground">
                Todo lo que necesitas saber sobre tu Pase Digital.
              </p>
            </div>
            <Accordion
              type="single"
              collapsible
              className="rounded-2xl border border-amber-100 bg-white px-4 shadow-sm"
            >
              {[
                {
                  q: "¿Cómo obtengo mi Pase Digital?",
                  a: "Regístrate, elige tu establecimiento y una promoción disponible. Tu Pase Digital se activa al instante.",
                },
                {
                  q: "¿El registro tiene costo?",
                  a: "Activar tu Pase Digital es gratis. Algunas promociones premium tienen costo y se activan al confirmar el pago.",
                },
                {
                  q: "¿Dónde puedo usar mi Pase?",
                  a: "En cualquiera de nuestros establecimientos participantes. Tu Pase funciona en todos.",
                },
                {
                  q: "¿Puedo tener acceso en varios establecimientos?",
                  a: "Por supuesto. Cuantos más establecimientos elijas, más oportunidades exclusivas acumulas.",
                },
                {
                  q: "¿Mis datos están seguros?",
                  a: "Tu Pase Digital contiene un identificador seguro, nunca tus datos personales.",
                },
              ].map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-amber-50 last:border-0"
                >
                  <AccordionTrigger className="text-left font-semibold text-slate-900">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-amber-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          Pase Digital · Acceso Exclusivo a promociones privadas · {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

function EmpresaPremiumCard({
  empresa,
  onVerPromociones,
}: {
  empresa: Empresa;
  onVerPromociones: () => void;
}) {
  const color = empresa.colorPrincipal || "#b45309";
  const color2 = empresa.colorSecundario || empresa.colorPrincipal || "#92400e";
  const servicios = parseJsonArray<string>(empresa.servicios).slice(0, 4);
  const rating = empresa.calificacion || 0;
  const clientesCount = empresa._count?.clientes;

  return (
    <Card className="group overflow-hidden rounded-2xl border border-amber-100/60 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      {/* Cover */}
      <div
        className="relative h-24 w-full"
        style={{
          background: empresa.imagenPortada
            ? `url(${empresa.imagenPortada}) center/cover`
            : `linear-gradient(135deg, ${color} 0%, ${color2} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
        {empresa.destacada && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-amber-700 shadow-sm">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Destacado
          </span>
        )}
      </div>
      <CardContent className="p-5 pt-0">
        {/* Logo */}
        <div className="-mt-8 mb-3 flex items-end justify-between">
          {empresa.logo ? (
            <img
              src={empresa.logo}
              alt={empresa.nombre}
              className="h-14 w-14 rounded-xl border-4 border-white bg-white object-cover shadow-md"
            />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl border-4 border-white text-xl font-extrabold text-white shadow-md"
              style={{ backgroundColor: color }}
            >
              {empresa.nombre.charAt(0).toUpperCase()}
            </div>
          )}
          {rating > 0 && (
            <span className="mb-1 inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {rating.toFixed(1)}/5
            </span>
          )}
        </div>
        <p className="font-bold leading-tight text-slate-900">{empresa.nombre}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {empresa.ciudad || empresa.direccion || "Ubicación"}
          {empresa.direccion && empresa.ciudad
            ? ` · ${empresa.direccion.split(",")[0]}`
            : ""}
        </p>

        {empresa.descripcionPublica && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {empresa.descripcionPublica}
          </p>
        )}

        {servicios.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {servicios.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ backgroundColor: color + "1a", color }}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {empresa.horario && (
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-700" /> {empresa.horario}
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-amber-700" />
            {clientesCount && clientesCount > 0
              ? `${clientesCount.toLocaleString("es-DO")} clientes satisfechos`
              : "Clientes satisfechos"}
          </p>
        </div>

        <Button
          onClick={onVerPromociones}
          variant="outline"
          className="mt-4 w-full border-amber-300 text-amber-800 hover:bg-amber-50 hover:text-amber-900"
        >
          Ver promociones <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function PromocionCard({
  empresa,
  estrategia,
  usos,
  onObtener,
}: {
  empresa: Empresa;
  estrategia: Estrategia;
  usos: number;
  onObtener: () => void;
}) {
  const color = empresa.colorPrincipal || "#b45309";
  const gratis = !estrategia.requierePago || estrategia.precio <= 0;
  const incluye = parseJsonArray<string>(estrategia.incluye).slice(0, 5);
  const escasez = escasezMensaje(estrategia.escasezTipo);
  const [showTerminos, setShowTerminos] = useState(false);

  let escasezTexto: string | null = escasez;
  if (estrategia.escasezTipo === "ultimos_cupos" && estrategia.cuposDisponibles > 0) {
    escasezTexto = `¡Solo ${estrategia.cuposDisponibles} cupos disponibles!`;
  }

  return (
    <Card
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
        estrategia.destacada ? "border-amber-300 ring-1 ring-amber-200" : "border-amber-100/60"
      )}
    >
      {/* Top badges */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 pt-4">
        {estrategia.destacada && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> La favorita de nuestros
            clientes
          </span>
        )}
        {escasezTexto && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
              estrategia.escasezTipo === "ultimos_cupos"
                ? "bg-red-100 text-red-700"
                : "bg-orange-100 text-orange-700"
            )}
          >
            <Flame className="h-3 w-3" /> {escasezTexto}
          </span>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-4 pt-3">
        {/* Empresa */}
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          {empresa.nombre}
        </p>
        <p className="mt-1 text-lg font-extrabold leading-tight text-slate-900">
          {estrategia.nombre}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className="border-amber-200 text-[10px] text-amber-700">
            {tipoLabel(estrategia.tipoEstrategia)}
          </Badge>
        </div>

        {estrategia.descripcion && (
          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
            {estrategia.descripcion}
          </p>
        )}

        {/* Incluye */}
        {incluye.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {incluye.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-3 w-3 text-emerald-600" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Prueba social */}
        {usos > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <TrendingUp className="h-3.5 w-3.5" /> Ya utilizado por {usos}+ clientes
          </p>
        )}

        <div className="mt-auto pt-4">
          {/* Precio */}
          <div className="mb-3 flex items-baseline gap-1">
            {gratis ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-700">
                <Gift className="h-4 w-4" /> Gratis
              </span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  RD$ {estrategia.precio.toLocaleString("es-DO")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {estrategia.tipoEstrategia === "MEMBRESIA" ? "/mes" : "único"}
                </span>
              </div>
            )}
          </div>

          <Button onClick={onObtener} className="w-full bg-amber-600 text-white hover:bg-amber-700">
            {estrategia.destacada ? "Quiero este plan" : "Obtener acceso"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {estrategia.terminos && (
            <button
              type="button"
              onClick={() => setShowTerminos((s) => !s)}
              className="mt-2 flex w-full items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-slate-700"
            >
              {showTerminos ? "Ocultar términos" : "Ver términos"}
              <ChevronDown
                className={cn("h-3 w-3 transition", showTerminos && "rotate-180")}
              />
            </button>
          )}
          {showTerminos && estrategia.terminos && (
            <p className="mt-1 rounded-md bg-slate-50 p-2 text-[11px] text-muted-foreground">
              {estrategia.terminos}
            </p>
          )}
        </div>
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
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        showToast("Esta cuenta no es de cliente", "error");
        setEmail("");
        setPassword("");
        return;
      }
      useStore.getState().setUser(res.user);
      showToast(`¡Bienvenido a tu Pase Digital, ${res.user.nombre}!`, "success");
      navigate("cliente-app");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al iniciar sesión", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-white to-amber-50/40">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md rounded-2xl border-amber-100/60 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md">
              <KeyRound className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              Tu Pase Digital te espera
            </CardTitle>
            <p className="text-sm text-muted-foreground">Accede a tus promociones privadas</p>
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
              <Button
                type="submit"
                className="w-full bg-amber-600 text-white hover:bg-amber-700"
                disabled={loading}
              >
                {loading ? "Accediendo..." : "Acceder a mi Pase"}
              </Button>
            </form>

            <div className="mt-4 rounded-lg bg-amber-50/60 p-3 text-xs text-amber-800">
              <p className="mb-1 flex items-center gap-1.5 font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Cuenta de demostración
              </p>
              <p>
                <span className="font-mono">cliente@fidelix.com</span> /{" "}
                <span className="font-mono">cliente123</span>
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => navigate("landing")}
                className="inline-flex items-center gap-1 text-muted-foreground hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Volver
              </button>
              <button
                type="button"
                onClick={() => navigate("registro")}
                className="font-medium text-amber-700 hover:underline"
              >
                ¿Aún no tienes tu Pase? Activar ahora
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-auto border-t border-amber-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          Pase Digital · Acceso Exclusivo a promociones privadas
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
      const res = await api.post<{ user: SessionUser }>("/api/auth/register", {
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
      useStore.getState().setUser(res.user);
      showToast("¡Tu Pase Digital está listo!", "success");
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-white to-amber-50/40">
      {/* Header */}
      <header className="border-b border-amber-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate("landing")} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-sm">
              <KeyRound className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-extrabold leading-none tracking-tight">PASE DIGITAL</p>
              <p className="text-[11px] text-amber-700/80">Acceso Exclusivo</p>
            </div>
          </button>
          <button
            onClick={() => navigate("landing")}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn(
                "h-2 rounded-full transition-all",
                step >= n ? "w-10 bg-amber-600" : "w-6 bg-slate-200"
              )}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Elige tu establecimiento</h1>
            <p className="mt-1 text-muted-foreground">¿Dónde quieres tu acceso exclusivo?</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {tipos.map((t) => {
                const color = t.color || "#b45309";
                return (
                  <button
                    key={t.id}
                    onClick={() => setTipoId(t.id)}
                    className={cn(
                      "rounded-2xl border-2 p-5 text-left transition",
                      tipoId === t.id
                        ? "border-amber-500 bg-amber-50"
                        : "border-slate-200 bg-white hover:border-amber-200 hover:shadow-md"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: color + "22", color }}
                      >
                        {ICONS[t.icono || ""] || <Store className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="font-bold">{t.nombre}</p>
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
                No hay establecimientos disponibles por ahora.
              </p>
            )}
            {tipoId && (
              <Button
                className="mt-6 w-full bg-amber-600 text-white hover:bg-amber-700"
                onClick={() => setStep(2)}
              >
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Descubre las promociones disponibles
            </h1>
            <p className="mt-1 text-muted-foreground">
              Selecciona el establecimiento y descubre las promociones disponibles
            </p>
            <div className="mt-6 space-y-3">
              {empresas.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay establecimientos activos para este tipo.
                </p>
              )}
              {empresas.map((e) => {
                const color = e.colorPrincipal || "#b45309";
                return (
                  <button
                    key={e.id}
                    onClick={() => setEmpresaId(e.id)}
                    className={cn(
                      "w-full rounded-2xl border-2 p-4 text-left transition",
                      empresaId === e.id
                        ? "border-amber-500 bg-amber-50"
                        : "border-slate-200 bg-white hover:border-amber-200"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {e.logo ? (
                          <img
                            src={e.logo}
                            alt={e.nombre}
                            className="h-11 w-11 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-11 w-11 items-center justify-center rounded-lg font-bold text-white"
                            style={{ backgroundColor: color }}
                          >
                            {e.nombre.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold">{e.nombre}</p>
                          {e.calificacion && e.calificacion > 0 && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-amber-700">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />{" "}
                              {e.calificacion.toFixed(1)}/5
                            </p>
                          )}
                          {e.direccion && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" /> {e.direccion}
                              {e.ciudad ? ` · ${e.ciudad}` : ""}
                            </p>
                          )}
                          {e.horario && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {e.horario}
                            </p>
                          )}
                        </div>
                      </div>
                      {e.estrategias && e.estrategias.length > 0 && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
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
                <p className="mb-1 text-sm font-bold">Elige una promoción (opcional)</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Puedes elegir una promoción ahora o activarla después desde tu Pase.
                </p>
                <div className="space-y-2">
                  {estrategias.map((es) => {
                    const gratis = !es.requierePago || es.precio <= 0;
                    const incluye = parseJsonArray<string>(es.incluye).slice(0, 2);
                    const escasez = escasezMensaje(es.escasezTipo);
                    let escasezTexto = escasez;
                    if (es.escasezTipo === "ultimos_cupos" && es.cuposDisponibles > 0) {
                      escasezTexto = `¡Solo ${es.cuposDisponibles} cupos!`;
                    }
                    return (
                      <button
                        key={es.id}
                        onClick={() => setEstrategiaId(estrategiaId === es.id ? "" : es.id)}
                        className={cn(
                          "w-full rounded-xl border p-3 text-left transition",
                          estrategiaId === es.id
                            ? "border-amber-500 bg-amber-50 ring-1 ring-amber-200"
                            : "border-slate-200 bg-white hover:border-amber-200"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold">{es.nombre}</p>
                              {escasezTexto && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                                  <Flame className="h-2.5 w-2.5" /> {escasezTexto}
                                </span>
                              )}
                            </div>
                            {incluye.length > 0 && (
                              <ul className="mt-1 space-y-0.5">
                                {incluye.map((it, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center gap-1 text-[11px] text-muted-foreground"
                                  >
                                    <Check className="h-3 w-3 text-emerald-600" /> {it}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {es.requierePago && (
                              <p className="mt-1 text-[11px] text-amber-700">
                                Queda pendiente hasta confirmar el pago
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            {gratis ? (
                              <p className="text-sm font-bold text-emerald-600">Gratis</p>
                            ) : (
                              <p className="text-sm font-bold text-slate-900">
                                RD$ {es.precio.toLocaleString("es-DO")}
                              </p>
                            )}
                            {estrategiaId === es.id && (
                              <Check className="ml-auto mt-1 h-4 w-4 text-amber-600" />
                            )}
                          </div>
                        </div>
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
              <Button
                className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
                onClick={() => setStep(3)}
                disabled={!empresaId}
              >
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Activa tu Pase</h1>
            <p className="mt-1 text-muted-foreground">
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
                  <p className="text-[11px] text-muted-foreground">Lo usarás para acceder a tu Pase</p>
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
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /> Fecha de
                    nacimiento (opcional)
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
                  <p className="mb-2 text-sm font-bold">Datos de {tipoSel.nombre}</p>
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
                className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
                onClick={submit}
                disabled={loading || !canSubmit}
              >
                {loading ? "Activando..." : "Activar mi Pase Digital"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-auto border-t border-amber-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          Pase Digital · Acceso Exclusivo a promociones privadas
        </div>
      </footer>
    </div>
  );
}
