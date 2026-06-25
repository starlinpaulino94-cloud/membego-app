"use client";
import { useEffect, useState } from "react";
import { useStore, fmtMonto, fmtFecha, fmtFechaHora, type ClienteSection } from "./store";
import { api, type Cliente, type Transaccion } from "./api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrDisplay } from "./QrComponents";
import {
  Building2,
  Calendar,
  Coins,
  Gift,
  History,
  Plus,
  Sparkles,
  CheckCircle2,
  LogOut,
  Menu,
  X,
  Wallet,
  UserCircle,
  MapPin,
  Clock,
  Tag,
  Star,
  Crown,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TIPOS_BENEFICIO } from "@/lib/constants";

type NavItem = { section: ClienteSection; label: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  { section: "mi-qr", label: "Mi Pase", icon: <KeyRound className="h-4 w-4" /> },
  { section: "mis-empresas", label: "Mis establecimientos", icon: <Wallet className="h-4 w-4" /> },
  { section: "historial", label: "Mi actividad", icon: <History className="h-4 w-4" /> },
];

// Extendemos Transaccion para incluir `empresa` (devuelto por /api/transacciones para CLIENTE)
type TransaccionConEmpresa = Transaccion & {
  empresa?: {
    id: string;
    nombre: string;
    colorPrincipal: string | null;
    ciudad: string | null;
  } | null;
};

function tipoBeneficioLabel(tipo: string): string {
  return TIPOS_BENEFICIO.find((t) => t.value === tipo)?.label || tipo;
}

export function ClienteShell() {
  const { user, clienteSection, setClienteSection, logout, showToast, navigate } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-amber-50/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-amber-100 bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-sm">
                <KeyRound className="h-4 w-4" />
              </div>
              <div className="hidden sm:block">
                <p className="font-extrabold leading-none tracking-tight">PASE DIGITAL</p>
                <p className="text-[11px] text-amber-700/80">Acceso Exclusivo</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              <div className="text-right">
                <p className="text-sm font-medium leading-none">{user.nombre}</p>
                <p className="text-[11px] text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Badge className="inline-flex items-center gap-1 border-amber-200 bg-amber-100 text-amber-800">
              <Crown className="h-3 w-3" /> Titular del Pase
            </Badge>
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
        <aside className="hidden w-60 flex-col border-r border-amber-100 bg-white lg:flex">
          <nav className="flex-1 space-y-1 p-3">
            {NAV.map((item) => (
              <button
                key={item.section}
                onClick={() => setClienteSection(item.section)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                  clienteSection === item.section
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-amber-50"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="border-t border-amber-100 p-3">
            <p className="text-[11px] text-muted-foreground">Pase Digital · Acceso Exclusivo</p>
          </div>
        </aside>

        {/* Sidebar mobile (drawer) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-amber-100 bg-white">
              <div className="flex items-center justify-between border-b border-amber-100 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-white">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <span className="font-bold">PASE DIGITAL</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 p-3">
                {NAV.map((item) => (
                  <button
                    key={item.section}
                    onClick={() => {
                      setClienteSection(item.section);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                      clienteSection === item.section
                        ? "bg-amber-600 text-white"
                        : "text-slate-700 hover:bg-amber-50"
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

        {/* Main */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
            {clienteSection === "mi-qr" && <MiPaseView onRegister={() => navigate("registro")} />}
            {clienteSection === "mis-empresas" && (
              <MisEstablecimientosView
                onRegister={() => navigate("registro")}
                onSelect={() => setClienteSection("mi-qr")}
              />
            )}
            {clienteSection === "historial" && <MiActividadView />}
          </div>
        </main>
      </div>

      <footer className="mt-auto border-t border-amber-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          Pase Digital · Acceso Exclusivo a promociones privadas
        </div>
      </footer>
    </div>
  );
}

// ============== MI PASE VIEW ==============
function MiPaseView({ onRegister }: { onRegister: () => void }) {
  const { showToast } = useStore();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ clientes: Cliente[] }>("/api/clientes")
      .then((r) => {
        setClientes(r.clientes || []);
        if (r.clientes && r.clientes.length > 0) setSelectedId(r.clientes[0].id);
      })
      .catch(() => showToast("Error al cargar tu Pase", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) return <p className="text-muted-foreground">Cargando...</p>;

  if (clientes.length === 0) {
    return (
      <div>
        <SectionHeader
          title="Tu Pase Digital"
          description="Aún no estás registrado en ningún establecimiento"
        />
        <EmptyState
          title="No tienes tu Pase Digital aún"
          description="Regístrate en un establecimiento para activar tu Pase Digital y aprovechar promociones exclusivas."
          icon={<KeyRound className="h-10 w-10" />}
        />
        <div className="mt-4 text-center">
          <Button
            onClick={onRegister}
            className="bg-amber-600 text-white hover:bg-amber-700"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Activar mi Pase
          </Button>
        </div>
      </div>
    );
  }

  const selected = clientes.find((c) => c.id === selectedId) || clientes[0];
  const qr = selected.qrTokens?.[0];
  const estrategiasActivas = selected.estrategias?.filter((e) => e.estado === "ACTIVA") || [];
  const promocionPrincipal = estrategiasActivas[0];
  const colorEmpresa = selected.empresa?.colorPrincipal || "#b45309";

  return (
    <div>
      <SectionHeader
        title="Tu Pase Digital"
        description="Presenta este Pase en el establecimiento para tus promociones"
      />

      {clientes.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {clientes.map((c) => {
            const color = c.empresa?.colorPrincipal || "#b45309";
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "shrink-0 rounded-lg border-2 px-3 py-1.5 text-sm transition",
                  selectedId === c.id
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 bg-white hover:border-amber-200"
                )}
                style={
                  selectedId === c.id
                    ? { borderColor: color, backgroundColor: color + "10" }
                    : undefined
                }
              >
                {c.empresa?.nombre}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-amber-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" /> {selected.empresa?.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {qr ? (
              <QrDisplay
                token={qr.token}
                label={`Pase Digital · ${selected.empresa?.nombre || ""}`}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Tu Pase Digital aún no está asignado</p>
            )}
            <div className="mt-4 w-full rounded-lg bg-amber-50/60 p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Tipo:</span>{" "}
                {selected.tipoNegocio?.nombre}
              </p>
              <p>
                <span className="text-muted-foreground">Titular:</span> {selected.nombre}
              </p>
              {selected.camposDinamicos?.map((c) => (
                <p key={c.id}>
                  <span className="text-muted-foreground">{c.clave}:</span> {c.valor}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {promocionPrincipal ? (
            <Card
              style={{ borderColor: colorEmpresa + "44" }}
              className="bg-gradient-to-br from-amber-50/40 to-white"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: colorEmpresa }} /> Promoción
                    activa
                  </span>
                  <Badge variant="outline" className="border-amber-200 text-amber-700">
                    {tipoBeneficioLabel(promocionPrincipal.estrategia.tipoEstrategia)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-bold text-slate-900">
                    {promocionPrincipal.estrategia.nombre}
                  </p>
                  {promocionPrincipal.estrategia.descripcion && (
                    <p className="text-sm text-muted-foreground">
                      {promocionPrincipal.estrategia.descripcion}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {promocionPrincipal.estrategia.tipoEstrategia === "MEMBRESIA" && (
                    <>
                      <div className="rounded-lg border bg-white p-2.5">
                        <p className="text-xs text-muted-foreground">Usos disponibles</p>
                        <p className="text-lg font-bold text-amber-700">
                          {promocionPrincipal.usosDisponibles}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Te quedan {promocionPrincipal.usosDisponibles} usos disponibles
                        </p>
                      </div>
                      <div className="rounded-lg border bg-white p-2.5">
                        <p className="text-xs text-muted-foreground">Usos disfrutados</p>
                        <p className="text-lg font-bold">{promocionPrincipal.usosConsumidos}</p>
                      </div>
                    </>
                  )}
                  {promocionPrincipal.estrategia.tipoEstrategia === "CONTEO_VISITAS" && (
                    <div className="col-span-2 rounded-lg border bg-white p-3">
                      <p className="text-xs text-muted-foreground">
                        Va {promocionPrincipal.visitasAcumuladas} de{" "}
                        {promocionPrincipal.estrategia.metaVisitas} — tu recompensa está cerca
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: colorEmpresa,
                              width: `${Math.min(
                                100,
                                (promocionPrincipal.visitasAcumuladas /
                                  (promocionPrincipal.estrategia.metaVisitas || 1)) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold">
                          {promocionPrincipal.visitasAcumuladas}/
                          {promocionPrincipal.estrategia.metaVisitas}
                        </span>
                      </div>
                    </div>
                  )}
                  {promocionPrincipal.estrategia.tipoEstrategia === "CUPON" && (
                    <div className="col-span-2 rounded-lg border bg-white p-3 text-center">
                      <p className="text-xs text-muted-foreground">Descuento disponible</p>
                      <p className="text-2xl font-extrabold text-amber-700">
                        {promocionPrincipal.estrategia.descuentoPct}%
                      </p>
                    </div>
                  )}
                </div>
                {promocionPrincipal.fechaVencimiento && (
                  <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Vence:{" "}
                      {fmtFecha(promocionPrincipal.fechaVencimiento)}
                    </span>
                    <Badge className="border-amber-200 bg-amber-100 text-amber-800">Activa</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No tienes promociones activas en este establecimiento.
              </CardContent>
            </Card>
          )}

          {estrategiasActivas.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Otras promociones activas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {estrategiasActivas.slice(1).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between border-b pb-2 text-sm last:border-0 last:pb-0"
                  >
                    <span>{e.estrategia.nombre}</span>
                    <Badge variant="outline" className="border-amber-200 text-amber-700">
                      {tipoBeneficioLabel(e.estrategia.tipoEstrategia)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== MIS ESTABLECIMIENTOS VIEW ==============
function MisEstablecimientosView({
  onRegister,
  onSelect,
}: {
  onRegister: () => void;
  onSelect: () => void;
}) {
  const { showToast, setSelectedClienteId } = useStore();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ clientes: Cliente[] }>("/api/clientes")
      .then((r) => setClientes(r.clientes || []))
      .catch(() => showToast("Error al cargar tus establecimientos", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) return <p className="text-muted-foreground">Cargando...</p>;

  return (
    <div>
      <SectionHeader
        title="Mis establecimientos"
        description="Lugares donde tienes tu Pase Digital activo"
        action={
          <Button
            onClick={onRegister}
            className="bg-amber-600 text-white hover:bg-amber-700"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Activar otro Pase
          </Button>
        }
      />
      {clientes.length === 0 ? (
        <EmptyState
          title="Aún no tienes tu Pase Digital"
          description="Regístrate en un establecimiento para activar tu Pase y aprovechar promociones exclusivas."
          icon={<Building2 className="h-10 w-10" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => {
            const color = c.empresa?.colorPrincipal || "#b45309";
            const promocionesActivas =
              c.estrategias?.filter((e) => e.estado === "ACTIVA") || [];
            return (
              <Card
                key={c.id}
                className="cursor-pointer overflow-hidden rounded-2xl border-amber-100 transition hover:shadow-md"
                onClick={() => {
                  setSelectedClienteId(c.id);
                  onSelect();
                }}
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">{c.empresa?.nombre}</p>
                      <p className="text-xs text-muted-foreground">{c.tipoNegocio?.nombre}</p>
                      {c.empresa?.calificacion && c.empresa.calificacion > 0 && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-amber-700">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />{" "}
                          {c.empresa.calificacion.toFixed(1)}/5
                        </p>
                      )}
                    </div>
                    <Badge className="border-amber-200 bg-amber-100 text-amber-800">Activo</Badge>
                  </div>

                  {c.empresa?.direccion && (
                    <p className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {c.empresa.direccion}
                      {c.empresa.ciudad ? ` · ${c.empresa.ciudad}` : ""}
                    </p>
                  )}
                  {c.empresa?.horario && (
                    <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                      <Clock className="mt-0.5 h-3 w-3 shrink-0" /> {c.empresa.horario}
                    </p>
                  )}

                  <div className="mt-3">
                    <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                      Promociones activas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {promocionesActivas.length === 0 ? (
                        <span className="text-[11px] text-muted-foreground">
                          Sin promociones activas
                        </span>
                      ) : (
                        promocionesActivas.map((e) => (
                          <span
                            key={e.id}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                            style={{ backgroundColor: color + "1a", color }}
                          >
                            <Gift className="h-2.5 w-2.5" /> {e.estrategia.nombre}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full border-amber-300 text-amber-800 hover:bg-amber-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClienteId(c.id);
                      onSelect();
                    }}
                  >
                    Ver mi Pase
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============== MI ACTIVIDAD VIEW ==============
function MiActividadView() {
  const { showToast } = useStore();
  const [transacciones, setTransacciones] = useState<TransaccionConEmpresa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ transacciones: TransaccionConEmpresa[] }>("/api/transacciones")
      .then((r) => setTransacciones(r.transacciones || []))
      .catch(() => showToast("Error al cargar tu actividad", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div>
      <SectionHeader title="Mi actividad" description="Tus visitas y promociones aprovechadas" />
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : transacciones.length === 0 ? (
        <EmptyState
          title="Sin actividad aún"
          description="Cuando uses una promoción en un establecimiento, aparecerá aquí."
          icon={<History className="h-10 w-10" />}
        />
      ) : (
        <div className="max-h-[calc(100vh-220px)] space-y-2 overflow-y-auto pr-1">
          {transacciones.map((t) => {
            const color = t.empresa?.colorPrincipal || "#b45309";
            return (
              <Card key={t.id} className="border-amber-100">
                <CardContent className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="font-medium">
                      Visitaste{" "}
                      {t.empresa?.nombre && (
                        <span className="font-semibold" style={{ color }}>
                          {t.empresa.nombre}
                        </span>
                      )}
                      {" · "}
                      <span className="text-muted-foreground">{t.tipoConsumo}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fmtFechaHora(t.fechaTransaccion)}
                    </p>
                    {t.beneficioAplicado && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700">
                        <CheckCircle2 className="h-3 w-3" /> Aprovechaste: {t.beneficioAplicado}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {t.montoConsumo > 0 && <p className="font-semibold">{fmtMonto(t.montoConsumo)}</p>}
                    {t.usosDescontados > 0 && (
                      <p className="flex items-center justify-end gap-1 text-xs text-slate-500">
                        <Tag className="h-3 w-3" /> {t.usosDescontados} uso(s)
                      </p>
                    )}
                    {t.puntosGenerados > 0 && (
                      <p className="flex items-center justify-end gap-1 text-xs text-amber-600">
                        <Coins className="h-3 w-3" /> +{t.puntosGenerados} pts
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============== SHARED UI ==============
function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-200 py-12 text-center">
      {icon && <div className="mb-3 text-amber-400">{icon}</div>}
      <p className="font-medium text-slate-900">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
