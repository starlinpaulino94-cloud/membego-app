"use client";
import { useEffect, useState } from "react";
import { useStore, fmtMonto, fmtFecha, fmtFechaHora, type ClienteSection } from "./store";
import { api, type Cliente, type Transaccion } from "./api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrDisplay } from "./QrComponents";
import {
  QrCode,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TIPOS_BENEFICIO } from "@/lib/constants";

type NavItem = { section: ClienteSection; label: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  { section: "mi-qr", label: "Mi QR", icon: <QrCode className="h-4 w-4" /> },
  { section: "mis-empresas", label: "Mis empresas", icon: <Wallet className="h-4 w-4" /> },
  { section: "historial", label: "Historial", icon: <History className="h-4 w-4" /> },
];

function tipoBeneficioLabel(tipo: string): string {
  return TIPOS_BENEFICIO.find((t) => t.value === tipo)?.label || tipo;
}

export function ClienteShell() {
  const { user, clienteSection, setClienteSection, logout, showToast, navigate } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
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
                <p className="font-bold leading-none tracking-tight">Club de Beneficios QR</p>
                <p className="text-[11px] text-muted-foreground">Tu panel de cliente</p>
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
            <Badge className="bg-violet-100 text-violet-700 border-violet-200">Cliente</Badge>
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
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map((item) => (
              <button
                key={item.section}
                onClick={() => setClienteSection(item.section)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                  clienteSection === item.section
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t">
            <p className="text-[11px] text-muted-foreground">Club de Beneficios QR</p>
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
                <span className="font-bold">Menú</span>
                <button onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
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
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
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
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
            {clienteSection === "mi-qr" && <MiQrView onRegister={() => navigate("registro")} />}
            {clienteSection === "mis-empresas" && (
              <MisEmpresasView onRegister={() => navigate("registro")} onSelect={() => setClienteSection("mi-qr")} />
            )}
            {clienteSection === "historial" && <HistorialView />}
          </div>
        </main>
      </div>

      <footer className="mt-auto border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          Club de Beneficios QR · Beneficios exclusivos para nuestros clientes
        </div>
      </footer>
    </div>
  );
}

// ============== MI QR VIEW ==============
function MiQrView({ onRegister }: { onRegister: () => void }) {
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
      .catch(() => showToast("Error al cargar tu QR", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) return <p className="text-muted-foreground">Cargando...</p>;

  if (clientes.length === 0) {
    return (
      <div>
        <SectionHeader title="Mi QR" description="Aún no estás registrado en ningún negocio" />
        <EmptyState
          title="No tienes beneficios aún"
          description="Regístrate en un negocio para obtener tu código QR y aprovechar promociones."
          icon={<QrCode className="h-10 w-10" />}
        />
        <div className="mt-4 text-center">
          <Button onClick={onRegister}>
            <Plus className="mr-1.5 h-4 w-4" /> Registrarme en un negocio
          </Button>
        </div>
      </div>
    );
  }

  const selected = clientes.find((c) => c.id === selectedId) || clientes[0];
  const qr = selected.qrTokens?.[0];
  const estrategiasActivas = selected.estrategias?.filter((e) => e.estado === "ACTIVA") || [];
  const beneficioPrincipal = estrategiasActivas[0];
  const colorEmpresa = selected.empresa?.colorPrincipal || "#0f766e";

  return (
    <div>
      <SectionHeader
        title="Mi QR"
        description="Presenta este código en el negocio para tus beneficios"
      />

      {clientes.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 max-h-96">
          {clientes.map((c) => {
            const color = c.empresa?.colorPrincipal || "#0f766e";
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "shrink-0 rounded-lg border-2 px-3 py-1.5 text-sm transition",
                  selectedId === c.id
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
                style={selectedId === c.id ? { borderColor: color, backgroundColor: color + "10" } : undefined}
              >
                {c.empresa?.nombre}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> {selected.empresa?.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {qr ? (
              <QrDisplay token={qr.token} label="Tu código QR personal" />
            ) : (
              <p className="text-sm text-muted-foreground">Sin QR asignado</p>
            )}
            <div className="mt-4 w-full rounded-lg bg-slate-50 p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Tipo:</span>{" "}
                {selected.tipoNegocio?.nombre}
              </p>
              <p>
                <span className="text-muted-foreground">Cliente:</span> {selected.nombre}
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
          {beneficioPrincipal ? (
            <Card style={{ borderColor: colorEmpresa + "44" }} className="bg-gradient-to-br from-slate-50 to-white">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: colorEmpresa }} /> Beneficio activo
                  </span>
                  <Badge variant="outline">{tipoBeneficioLabel(beneficioPrincipal.estrategia.tipoEstrategia)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold">{beneficioPrincipal.estrategia.nombre}</p>
                  {beneficioPrincipal.estrategia.descripcion && (
                    <p className="text-sm text-muted-foreground">
                      {beneficioPrincipal.estrategia.descripcion}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {beneficioPrincipal.estrategia.tipoEstrategia === "MEMBRESIA" && (
                    <>
                      <div className="rounded-lg bg-white p-2 border">
                        <p className="text-xs text-muted-foreground">Usos disponibles</p>
                        <p className="text-lg font-bold text-emerald-600">
                          {beneficioPrincipal.usosDisponibles}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 border">
                        <p className="text-xs text-muted-foreground">Usos consumidos</p>
                        <p className="text-lg font-bold">{beneficioPrincipal.usosConsumidos}</p>
                      </div>
                    </>
                  )}
                  {beneficioPrincipal.estrategia.tipoEstrategia === "CONTEO_VISITAS" && (
                    <div className="col-span-2 rounded-lg bg-white p-3 border">
                      <p className="text-xs text-muted-foreground">Progreso hacia tu recompensa</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              backgroundColor: colorEmpresa,
                              width: `${Math.min(
                                100,
                                (beneficioPrincipal.visitasAcumuladas /
                                  (beneficioPrincipal.estrategia.metaVisitas || 1)) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {beneficioPrincipal.visitasAcumuladas}/
                          {beneficioPrincipal.estrategia.metaVisitas}
                        </span>
                      </div>
                    </div>
                  )}
                  {beneficioPrincipal.estrategia.tipoEstrategia === "CUPON" && (
                    <div className="col-span-2 rounded-lg bg-white p-3 border">
                      <p className="text-xs text-muted-foreground">Descuento disponible</p>
                      <p className="text-lg font-bold text-pink-600">
                        {beneficioPrincipal.estrategia.descuentoPct}%
                      </p>
                    </div>
                  )}
                </div>
                {beneficioPrincipal.fechaVencimiento && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Vence:{" "}
                      {fmtFecha(beneficioPrincipal.fechaVencimiento)}
                    </span>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Activa</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No tienes beneficios activos en este negocio.
              </CardContent>
            </Card>
          )}

          {estrategiasActivas.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Otros beneficios activos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {estrategiasActivas.slice(1).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0"
                  >
                    <span>{e.estrategia.nombre}</span>
                    <Badge variant="outline">{tipoBeneficioLabel(e.estrategia.tipoEstrategia)}</Badge>
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

// ============== MIS EMPRESAS VIEW ==============
function MisEmpresasView({
  onRegister,
  onSelect,
}: {
  onRegister: () => void;
  onSelect: () => void;
}) {
  const { showToast } = useStore();
  const { setSelectedClienteId } = useStore();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ clientes: Cliente[] }>("/api/clientes")
      .then((r) => setClientes(r.clientes || []))
      .catch(() => showToast("Error al cargar tus empresas", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) return <p className="text-muted-foreground">Cargando...</p>;

  return (
    <div>
      <SectionHeader
        title="Mis empresas"
        description="Negocios donde tienes beneficios"
        action={
          <Button onClick={onRegister}>
            <Plus className="mr-1.5 h-4 w-4" /> Registrarme en otra
          </Button>
        }
      />
      {clientes.length === 0 ? (
        <EmptyState
          title="No estás registrado en ningún negocio"
          description="Regístrate en un negocio para obtener tu QR y beneficios."
          icon={<Building2 className="h-10 w-10" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => {
            const color = c.empresa?.colorPrincipal || "#0f766e";
            const beneficiosActivos = c.estrategias?.filter((e) => e.estado === "ACTIVA") || [];
            return (
              <Card
                key={c.id}
                className="overflow-hidden transition hover:shadow-md cursor-pointer"
                onClick={() => {
                  setSelectedClienteId(c.id);
                  onSelect();
                }}
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{c.empresa?.nombre}</p>
                      <p className="text-xs text-muted-foreground">{c.tipoNegocio?.nombre}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Activo</Badge>
                  </div>

                  {c.empresa?.direccion && (
                    <p className="mt-2 text-xs text-muted-foreground flex items-start gap-1">
                      <MapPin className="h-3 w-3 shrink-0 mt-0.5" /> {c.empresa.direccion}
                      {c.empresa.ciudad ? ` · ${c.empresa.ciudad}` : ""}
                    </p>
                  )}
                  {c.empresa?.horario && (
                    <p className="mt-1 text-xs text-muted-foreground flex items-start gap-1">
                      <Clock className="h-3 w-3 shrink-0 mt-0.5" /> {c.empresa.horario}
                    </p>
                  )}

                  <div className="mt-3">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                      Beneficios activos
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {beneficiosActivos.length === 0 ? (
                        <span className="text-[11px] text-muted-foreground">
                          Sin beneficios activos
                        </span>
                      ) : (
                        beneficiosActivos.map((e) => (
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============== HISTORIAL VIEW ==============
function HistorialView() {
  const { showToast } = useStore();
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ transacciones: Transaccion[] }>("/api/transacciones")
      .then((r) => setTransacciones(r.transacciones || []))
      .catch(() => showToast("Error al cargar historial", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div>
      <SectionHeader title="Mi historial" description="Tus consumos y beneficios aplicados" />
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : transacciones.length === 0 ? (
        <EmptyState
          title="Sin consumos registrados"
          description="Cuando uses un beneficio en un negocio, aparecerá aquí."
          icon={<History className="h-10 w-10" />}
        />
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scroll">
          {transacciones.map((t) => {
            const color = "#0f766e";
            return (
              <Card key={t.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {t.tipoConsumo}
                      {t.empresa?.nombre ? (
                        <span className="text-muted-foreground text-sm">
                          {" · "}
                          <span
                            className="inline-flex items-center gap-1"
                            style={{ color }}
                          >
                            <Building2 className="h-3 w-3" /> {t.empresa?.nombre}
                          </span>
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fmtFechaHora(t.fechaTransaccion)}
                    </p>
                    {t.beneficioAplicado && (
                      <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> {t.beneficioAplicado}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {t.montoConsumo > 0 && <p className="font-semibold">{fmtMonto(t.montoConsumo)}</p>}
                    {t.usosDescontados > 0 && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                        <Tag className="h-3 w-3" /> {t.usosDescontados} uso(s)
                      </p>
                    )}
                    {t.puntosGenerados > 0 && (
                      <p className="text-xs text-amber-600 flex items-center gap-1 justify-end">
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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <p className="font-medium">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
    </div>
  );
}
