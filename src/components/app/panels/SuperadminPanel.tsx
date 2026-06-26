"use client";
import { useEffect, useState, useCallback } from "react";
import { useStore, fmtFecha, fmtMonto, type AdminSection } from "../store";
import { api, type Empresa, type TipoNegocio } from "../api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeader, EstadoBadge, StatCard, EmptyState } from "../shared";
import {
  Building2,
  Users,
  BarChart3,
  Plus,
  Trash2,
  Building,
  CheckCircle2,
  TrendingUp,
  Car,
  UtensilsCrossed,
  Boxes,
  CreditCard,
  Sparkles,
  ArrowLeft,
  Plug,
  ShieldCheck,
} from "lucide-react";
import { ScannerFlow } from "./ScannerFlow";
import {
  ClientesManager,
  BeneficiosManager,
  PagosManager,
  UsosManager,
  EmpresaForm,
  SocialProofConfig,
} from "./EmpresaPanel";

export function SuperadminPanel({ section }: { section: AdminSection }) {
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null);

  // Las secciones que requieren elegir una empresa primero
  const needsEmpresa =
    section === "clientes" ||
    section === "beneficios" ||
    section === "pagos" ||
    section === "usos" ||
    section === "configuracion";

  if (section === "dashboard") return <SuperadminDashboard />;
  if (section === "empresas") return <EmpresasManager />;
  if (section === "escanear") return <ScannerFlow />;
  if (section === "reportes") return <ReportesGlobal />;

  if (needsEmpresa) {
    if (!selectedEmpresaId) {
      return (
        <EmpresaSelector
          title={titleForSection(section)}
          description="Selecciona la empresa sobre la que quieres operar"
          onSelect={setSelectedEmpresaId}
        />
      );
    }
    const onBack = () => setSelectedEmpresaId(null);
    if (section === "clientes")
      return <ClientesManager empresaId={selectedEmpresaId} onBack={onBack} />;
    if (section === "beneficios")
      return <BeneficiosManager empresaId={selectedEmpresaId} onBack={onBack} />;
    if (section === "pagos")
      return <PagosManager empresaId={selectedEmpresaId} onBack={onBack} />;
    if (section === "usos")
      return <UsosManager empresaId={selectedEmpresaId} onBack={onBack} />;
    if (section === "configuracion")
      return <SuperadminConfiguracion empresaId={selectedEmpresaId} onBack={onBack} />;
  }

  return null;
}

function titleForSection(section: AdminSection): string {
  switch (section) {
    case "clientes":
      return "Clientes";
    case "beneficios":
      return "Beneficios";
    case "pagos":
      return "Pagos pendientes";
    case "usos":
      return "Usos registrados";
    case "configuracion":
      return "Configuración de integraciones";
    default:
      return "Seleccionar empresa";
  }
}

/* ──────────────────────────────────────────────────────────
   Dashboard global con nuevas métricas
   ────────────────────────────────────────────────────────── */

function SuperadminDashboard() {
  const [rep, setRep] = useState<any>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaReports, setEmpresaReports] = useState<Record<string, any>>({});

  useEffect(() => {
    api
      .get(`/api/reportes?tipo=general`)
      .then(setRep)
      .catch(() => {});
  }, []);

  useEffect(() => {
    api
      .get<{ empresas: Empresa[] }>(`/api/empresas`)
      .then((r) => setEmpresas(r.empresas))
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Cargar reportes por empresa para métricas detalladas
    let cancelled = false;
    Promise.all(
      empresas.map((e) =>
        api
          .get<any>(`/api/reportes?tipo=empresa&empresaId=${e.id}`)
          .then((r) => [e.id, r] as const)
          .catch(() => [e.id, null] as const)
      )
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, any> = {};
      results.forEach(([id, r]) => {
        if (r) map[id] = r;
      });
      setEmpresaReports(map);
    });
    return () => {
      cancelled = true;
    };
  }, [empresas]);

  if (!rep) return <p className="text-muted-foreground">Cargando dashboard...</p>;

  // Calcular agregados a partir de reportes por empresa
  const beneficiosActivos = empresas.reduce(
    (sum, e) => sum + (empresaReports[e.id]?.estrategiasActivas || 0),
    0
  );
  const beneficiosPendientesPago = empresas.reduce(
    (sum, e) => sum + (empresaReports[e.id]?.estrategiasClienteEstado?.pendientes || 0),
    0
  );
  const usosHoy = empresas.reduce(
    (sum, e) => sum + (empresaReports[e.id]?.usosHoy || 0),
    0
  );
  // Usos hoy también podría venir del general report.transaccionesPorDia de hoy
  const hoyStr = new Date().toISOString().slice(0, 10);
  const usosHoyFromGeneral =
    rep.transaccionesPorDia?.find((d: any) => d.fecha?.slice(0, 10) === hoyStr)?.total || 0;

  return (
    <div>
      <SectionHeader
        title="Dashboard"
        description="Vista global de la plataforma Pase Digital QR"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Empresas activas"
          value={rep.empresasActivas ?? 0}
          icon={<Building2 className="h-5 w-5" />}
          accent="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          label="Clientes registrados"
          value={rep.totalClientes ?? 0}
          icon={<Users className="h-5 w-5" />}
          accent="text-sky-600 bg-sky-50"
        />
        <StatCard
          label="Beneficios activos"
          value={beneficiosActivos}
          icon={<Sparkles className="h-5 w-5" />}
          accent="text-violet-600 bg-violet-50"
        />
        <StatCard
          label="Beneficios pendientes de pago"
          value={beneficiosPendientesPago}
          icon={<CreditCard className="h-5 w-5" />}
          accent="text-amber-600 bg-amber-50"
        />
        <StatCard
          label="Usos registrados hoy"
          value={Math.max(usosHoy, usosHoyFromGeneral)}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="text-pink-600 bg-pink-50"
        />
        <StatCard
          label="Transacciones totales"
          value={rep.totalTransacciones ?? 0}
          icon={<BarChart3 className="h-5 w-5" />}
          accent="text-slate-600 bg-slate-100"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tipos de negocio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(rep.tiposNegocio || []).map((t: any) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {t.nombre === "Carwash" ? (
                    <Car className="h-4 w-4 text-sky-600" />
                  ) : (
                    <UtensilsCrossed className="h-4 w-4 text-orange-600" />
                  )}
                  {t.nombre}
                </span>
                <span className="text-muted-foreground text-xs">
                  {t.empresas} empresas · {t.clientes} clientes
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Promociones más usadas</CardTitle>
          </CardHeader>
          <CardContent>
            {(rep.estrategiasMasUsadas || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <div className="space-y-1">
                {(rep.estrategiasMasUsadas || []).map((e: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate">
                        {e.nombre}{" "}
                        <span className="text-xs text-muted-foreground">({e.empresa})</span>
                      </span>
                    </span>
                    <span className="font-medium shrink-0">{e.total}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Transacciones últimos 14 días</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {(rep.transaccionesPorDia || []).map((d: any) => {
              const max = Math.max(
                1,
                ...(rep.transaccionesPorDia || []).map((x: any) => x.total)
              );
              return (
                <div
                  key={d.fecha}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-slate-700 rounded-t"
                    style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {d.fecha.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Resumen por empresa</CardTitle>
        </CardHeader>
        <CardContent>
          {empresas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin empresas</p>
          ) : (
            <div className="space-y-2">
              {empresas.map((e) => {
                const r = empresaReports[e.id];
                return (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                        <Building className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{e.nombre}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {e.ciudad || "—"} · {e.tipoNegocio?.nombre || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      <span>{r?.clientesRegistrados ?? 0} clientes</span>
                      <span>{r?.estrategiasActivas ?? 0} beneficios</span>
                      <EstadoBadge estado={e.estado} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Empresas Manager (CRUD con branding)
   ────────────────────────────────────────────────────────── */

function EmpresasManager() {
  const { showToast } = useStore();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [tipos, setTipos] = useState<TipoNegocio[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Empresa | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ empresas: Empresa[] }>(`/api/empresas`)
      .then((r) => setEmpresas(r.empresas))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);
  useEffect(() => {
    api
      .get<{ tipos: TipoNegocio[] }>(`/api/tipos-negocio`)
      .then((r) => setTipos(r.tipos))
      .catch(() => {});
  }, []);

  async function toggle(e: Empresa) {
    try {
      await api.patch(`/api/empresas/${e.id}`, {
        estado: e.estado === "ACTIVA" ? "INACTIVA" : "ACTIVA",
      });
      load();
      showToast("Estado actualizado", "success");
    } catch {
      showToast("Error", "error");
    }
  }
  async function remove(id: string) {
    if (!confirm("¿Eliminar esta empresa? Esta acción no se puede deshacer.")) return;
    try {
      await api.del(`/api/empresas/${id}`);
      showToast("Empresa eliminada", "success");
      load();
    } catch {
      showToast("Error", "error");
    }
  }

  return (
    <div>
      <SectionHeader
        title="Empresas"
        description="Administra las empresas de la plataforma con su identidad de marca"
        action={
          <Button
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Nueva empresa
          </Button>
        }
      />
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : empresas.length === 0 ? (
        <EmptyState
          title="Sin empresas"
          description="Crea la primera empresa de la plataforma"
          icon={<Building2 className="h-10 w-10" />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {empresas.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                      style={{
                        backgroundColor: (e.colorPrincipal || "#0f172a") + "22",
                        color: e.colorPrincipal || "#0f172a",
                      }}
                    >
                      {e.logo ? (
                        <img
                          src={e.logo}
                          alt={e.nombre}
                          className="h-6 w-6 object-contain"
                        />
                      ) : (
                        <Building className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{e.nombre}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {e.tipoNegocio?.nombre}
                      </p>
                    </div>
                  </div>
                  <EstadoBadge estado={e.estado} />
                </div>
                <p className="text-xs text-muted-foreground mt-2 truncate">
                  {e.direccion ? `${e.direccion} · ` : ""}
                  {e.telefono || "—"}
                </p>
                {e.ciudad && (
                  <p className="text-xs text-muted-foreground mt-0.5">{e.ciudad}</p>
                )}
                <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                  <span>{e._count?.clientes || 0} clientes</span>
                  <span>{e._count?.estrategias || 0} beneficios</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEdit(e);
                      setOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggle(e)}>
                    {e.estado === "ACTIVA" ? "Desactivar" : "Activar"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(e.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {open && (
        <EmpresaForm
          tipos={tipos}
          edit={edit}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Selector de empresa (para secciones que requieren contexto)
   ────────────────────────────────────────────────────────── */

function EmpresaSelector({
  title,
  description,
  onSelect,
}: {
  title: string;
  description: string;
  onSelect: (id: string) => void;
}) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get<{ empresas: Empresa[] }>(`/api/empresas`)
      .then((r) => setEmpresas(r.empresas))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return (
    <div>
      <SectionHeader title={title} description={description} />
      {loading ? (
        <p className="text-muted-foreground">Cargando empresas...</p>
      ) : empresas.length === 0 ? (
        <EmptyState
          title="Sin empresas disponibles"
          description="Crea una empresa primero desde la sección Empresas"
          icon={<Building2 className="h-10 w-10" />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {empresas.map((e) => (
            <button
              key={e.id}
              onClick={() => onSelect(e.id)}
              className="text-left rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-900 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                    style={{
                      backgroundColor: (e.colorPrincipal || "#0f172a") + "22",
                      color: e.colorPrincipal || "#0f172a",
                    }}
                  >
                    {e.logo ? (
                      <img
                        src={e.logo}
                        alt={e.nombre}
                        className="h-6 w-6 object-contain"
                      />
                    ) : (
                      <Building className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{e.nombre}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {e.tipoNegocio?.nombre}
                    </p>
                  </div>
                </div>
                <EstadoBadge estado={e.estado} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {e._count?.clientes || 0} clientes · {e._count?.estrategias || 0} beneficios
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Configuración para superadmin (integraciones por empresa)
   ────────────────────────────────────────────────────────── */

function SuperadminConfiguracion({
  empresaId,
  onBack,
}: {
  empresaId: string;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"integraciones" | "info">("integraciones");
  return (
    <div>
      <SectionHeader
        title="Configuración"
        description="Prueba social global + integraciones y datos de la empresa seleccionada"
        action={
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Cambiar empresa
          </Button>
        }
      />
      <div className="space-y-6">
        <SocialProofConfig />
        <div>
          <div className="mb-4 inline-flex rounded-lg border bg-white p-1 text-sm">
            <button
              onClick={() => setTab("integraciones")}
              className={`px-3 py-1.5 rounded-md font-medium ${
                tab === "integraciones"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Plug className="inline h-3.5 w-3.5 mr-1" /> Integraciones
            </button>
            <button
              onClick={() => setTab("info")}
              className={`px-3 py-1.5 rounded-md font-medium ${
                tab === "info" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="inline h-3.5 w-3.5 mr-1" /> Info
            </button>
          </div>

          {tab === "integraciones" ? (
            <SuperadminIntegraciones empresaId={empresaId} />
          ) : (
            <SuperadminEmpresaInfo empresaId={empresaId} />
          )}
        </div>
      </div>
    </div>
  );
}

function SuperadminIntegraciones({ empresaId }: { empresaId: string }) {
  const { showToast } = useStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ integraciones: any[] }>(`/api/integraciones?empresaId=${empresaId}`)
      .then((r) => setItems(r.integraciones))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [empresaId]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Las integraciones se configuran por empresa. Solo el admin de la empresa puede
          crearlas; el superadmin puede verlas y pausarlas.
        </p>
        <Button
          onClick={() => {
            showToast(
              "Crea integraciones desde el panel del admin de empresa",
              "info"
            );
          }}
          variant="outline"
          size="sm"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Nueva
        </Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin integraciones"
          description="Esta empresa no tiene integraciones configuradas"
          icon={<Plug className="h-10 w-10" />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((i) => (
            <Card key={i.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <p className="font-semibold flex items-center gap-2">
                    <Plug className="h-4 w-4 text-violet-600" /> {i.tipoIntegracion}
                  </p>
                  <EstadoBadge estado={i.estado} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {i.webhookUrl || i.apiUrl || "Sin URL"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {open && <div />}
    </div>
  );
}

function SuperadminEmpresaInfo({ empresaId }: { empresaId: string }) {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  useEffect(() => {
    api
      .get<{ empresa: Empresa }>(`/api/empresas/${empresaId}`)
      .then((r) => setEmpresa(r.empresa))
      .catch(() => {});
  }, [empresaId]);
  if (!empresa) return <p className="text-muted-foreground">Cargando...</p>;
  return (
    <Card>
      <CardContent className="p-4 space-y-2 text-sm">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{
              backgroundColor: (empresa.colorPrincipal || "#0f172a") + "22",
              color: empresa.colorPrincipal || "#0f172a",
            }}
          >
            {empresa.logo ? (
              <img src={empresa.logo} alt="" className="h-8 w-8 object-contain" />
            ) : (
              <Building className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="font-semibold">{empresa.nombre}</p>
            <p className="text-xs text-muted-foreground">{empresa.tipoNegocio?.nombre}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <p>
            <span className="text-muted-foreground">Tel:</span> {empresa.telefono || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">WhatsApp:</span>{" "}
            {empresa.whatsapp || "—"}
          </p>
          <p className="col-span-2">
            <span className="text-muted-foreground">Dirección:</span>{" "}
            {empresa.direccion || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Ciudad:</span> {empresa.ciudad || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Horario:</span> {empresa.horario || "—"}
          </p>
          {empresa.descripcionPublica && (
            <p className="col-span-2 text-muted-foreground italic">
              "{empresa.descripcionPublica}"
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────
   Reportes globales
   ────────────────────────────────────────────────────────── */

function ReportesGlobal() {
  const [rep, setRep] = useState<any>(null);
  useEffect(() => {
    api
      .get(`/api/reportes?tipo=general`)
      .then(setRep)
      .catch(() => {});
  }, []);
  if (!rep) return <p className="text-muted-foreground">Cargando...</p>;
  return (
    <div>
      <SectionHeader title="Reportes globales" description="Métricas de toda la plataforma" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Empresas"
          value={rep.totalEmpresas}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          label="Activas"
          value={rep.empresasActivas}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          label="Clientes"
          value={rep.totalClientes}
          icon={<Users className="h-5 w-5" />}
          accent="text-sky-600 bg-sky-50"
        />
        <StatCard
          label="Transacciones"
          value={rep.totalTransacciones}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="text-amber-600 bg-amber-50"
        />
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Transacciones últimos 14 días</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {(rep.transaccionesPorDia || []).map((d: any) => {
              const max = Math.max(
                1,
                ...(rep.transaccionesPorDia || []).map((x: any) => x.total)
              );
              return (
                <div
                  key={d.fecha}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-slate-700 rounded-t"
                    style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {d.fecha.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Por tipo de negocio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(rep.transaccionesPorTipo || []).map((t: any) => (
              <div key={t.tipo} className="flex justify-between text-sm">
                <span>{t.tipo}</span>
                <span className="font-medium">{t.total}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Beneficios más usados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(rep.estrategiasMasUsadas || []).length === 0 && (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            )}
            {(rep.estrategiasMasUsadas || []).map((e: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="truncate">{e.nombre}</span>
                <span className="font-medium shrink-0 ml-2">{e.total}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
