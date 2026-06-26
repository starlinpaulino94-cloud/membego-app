"use client";
import { useEffect, useState, useCallback } from "react";
import { useStore, fmtMonto, fmtFecha, fmtFechaHora, type AdminSection } from "../store";
import {
  api,
  type Cliente,
  type Estrategia,
  type ClienteEstrategia,
  type Transaccion,
  type Integracion,
  type IntegrationLog,
  type TipoNegocio,
  type Empresa,
  type Config,
} from "../api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  SectionHeader,
  EstadoBadge,
  TipoEstrategiaBadge,
  StatCard,
  EmptyState,
  RolBadge,
} from "../shared";
import {
  TIPOS_BENEFICIO,
  TIPOS_INTEGRACION,
  EVENTOS_SINCRONIZACION,
  ESCASEZ_TIPOS,
} from "@/lib/constants";
import {
  Users,
  Sparkles,
  CreditCard,
  History,
  Plug,
  BarChart3,
  Plus,
  Search,
  QrCode,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Gift,
  ArrowLeft,
  Building2,
  Settings,
  Star,
  Image as ImageIcon,
  List,
  Flame,
  Save,
} from "lucide-react";
import { ScannerFlow } from "./ScannerFlow";
import { cn } from "@/lib/utils";

export function EmpresaPanel({ section }: { section: AdminSection }) {
  const { user } = useStore();
  const empresaId = user?.empresaId;

  if (!empresaId) {
    return (
      <EmptyState
        title="Sin empresa asignada"
        description="Tu usuario no tiene una empresa asociada. Contacta al administrador."
        icon={<Building2 className="h-10 w-10" />}
      />
    );
  }

  if (section === "escanear") return <ScannerFlow />;
  if (section === "dashboard") return <EmpresaDashboard empresaId={empresaId} />;
  if (section === "clientes") return <ClientesManager empresaId={empresaId} />;
  if (section === "beneficios") return <BeneficiosManager empresaId={empresaId} />;
  if (section === "pagos") return <PagosManager empresaId={empresaId} />;
  if (section === "usos") return <UsosManager empresaId={empresaId} />;
  if (section === "configuracion")
    return <ConfiguracionManager empresaId={empresaId} />;
  if (section === "reportes") return <ReportesEmpresa empresaId={empresaId} />;
  return null;
}

/* ──────────────────────────────────────────────────────────
   Helpers compartidos
   ────────────────────────────────────────────────────────── */

function useEmpresaTipo(empresaId: string) {
  const [tipo, setTipo] = useState<TipoNegocio | null>(null);
  useEffect(() => {
    api
      .get<{ empresa: Empresa }>(`/api/empresas/${empresaId}`)
      .then((r) => setTipo(r.empresa.tipoNegocio || null))
      .catch(() => setTipo(null));
  }, [empresaId]);
  return tipo;
}

// Hook para actualizar campos del formulario de empresa de manera tipada
type EmpresaFormState = Record<string, any>;

function estadoEmpresaLabel(estado: string): string {
  if (estado === "ACTIVA") return "Activa";
  if (estado === "INACTIVA") return "Inactiva";
  if (estado === "SUSPENDIDA") return "Suspendida";
  return estado;
}

// Convierte un valor JSON (string o array) almacenado en la BD a texto multilinea
// para editar en un textarea. Cada linea es un elemento.
function jsonArrayToText(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map((s) => String(s)).join("\n");
  if (typeof v === "string") {
    if (v.trim() === "") return "";
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map((s: unknown) => String(s)).join("\n");
      return v;
    } catch {
      return v;
    }
  }
  return "";
}

// Convierte el texto de un textarea (una linea por elemento) a un string JSON array.
function textToJsonArrayString(text: string): string {
  const arr = text
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return JSON.stringify(arr);
}

/* ──────────────────────────────────────────────────────────
   Dashboard de empresa
   ────────────────────────────────────────────────────────── */

export function EmpresaDashboard({ empresaId }: { empresaId: string }) {
  const [rep, setRep] = useState<any>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  useEffect(() => {
    api
      .get(`/api/reportes?tipo=empresa&empresaId=${empresaId}`)
      .then((r) => setRep(r))
      .catch(() => {});
    api
      .get<{ empresa: Empresa }>(`/api/empresas/${empresaId}`)
      .then((r) => setEmpresa(r.empresa))
      .catch(() => {});
  }, [empresaId]);

  if (!rep)
    return <p className="text-muted-foreground">Cargando dashboard...</p>;

  return (
    <div>
      <SectionHeader
        title="Dashboard"
        description={empresa ? `Resumen de ${empresa.nombre}` : "Resumen de tu empresa"}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Empresas activas"
          value={empresa?.estado === "ACTIVA" ? 1 : 0}
          icon={<Building2 className="h-5 w-5" />}
          accent="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          label="Clientes registrados"
          value={rep.clientesRegistrados ?? 0}
          icon={<Users className="h-5 w-5" />}
          accent="text-sky-600 bg-sky-50"
        />
        <StatCard
          label="Beneficios activos"
          value={rep.estrategiasActivas ?? 0}
          icon={<Sparkles className="h-5 w-5" />}
          accent="text-violet-600 bg-violet-50"
        />
        <StatCard
          label="Beneficios pendientes de pago"
          value={rep.estrategiasClienteEstado?.pendientes ?? 0}
          icon={<CreditCard className="h-5 w-5" />}
          accent="text-amber-600 bg-amber-50"
        />
        <StatCard
          label="Usos registrados hoy"
          value={rep.usosHoy ?? 0}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="text-pink-600 bg-pink-50"
        />
        <StatCard
          label="Ingresos membresías"
          value={fmtMonto(rep.ingresosMembresias)}
          icon={<DollarSign className="h-5 w-5" />}
          accent="text-emerald-600 bg-emerald-50"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Consumos últimos 14 días</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Promociones más usadas</CardTitle>
          </CardHeader>
          <CardContent>
            {(rep.promocionesMasUsadas || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos aún</p>
            ) : (
              <div className="space-y-1.5">
                {rep.promocionesMasUsadas.map((p: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
                        {i + 1}
                      </span>
                      {p.nombre}
                    </span>
                    <span className="font-medium">{p.total} usos</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Clientes frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            {(rep.clientesFrecuentes || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <div className="space-y-1">
                {rep.clientesFrecuentes.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
                        {i + 1}
                      </span>
                      {c.nombre}
                    </span>
                    <span className="text-muted-foreground">{c.visitas} visitas</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Consumos por tipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(rep.consumosPorTipo || []).length === 0 && (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            )}
            {(rep.consumosPorTipo || []).map((c: any) => {
              const max = Math.max(
                1,
                ...(rep.consumosPorTipo || []).map((x: any) => x.total)
              );
              return (
                <div
                  key={c.tipo}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{c.tipo}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-slate-700"
                        style={{ width: `${(c.total / max) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium w-6 text-right">{c.total}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Clientes
   ────────────────────────────────────────────────────────── */

export function ClientesManager({
  empresaId,
  onBack,
}: {
  empresaId: string;
  onBack?: () => void;
}) {
  const { showToast } = useStore();
  const tipo = useEmpresaTipo(empresaId);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ clientes: Cliente[] }>(
        `/api/clientes?empresaId=${empresaId}${q ? `&q=${encodeURIComponent(q)}` : ""}`
      )
      .then((r) => setClientes(r.clientes))
      .catch(() => showToast("Error al cargar clientes", "error"))
      .finally(() => setLoading(false));
  }, [empresaId, q, showToast]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);

  return (
    <div>
      <SectionHeader
        title="Clientes"
        description="Gestiona los clientes de la empresa"
        action={
          <div className="flex gap-2">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Cambiar empresa
              </Button>
            )}
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Nuevo cliente
            </Button>
          </div>
        }
      />
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, teléfono..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-8"
        />
      </div>
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : clientes.length === 0 ? (
        <EmptyState
          title="Sin clientes"
          description="Crea el primer cliente de la empresa"
          icon={<Users className="h-10 w-10" />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition cursor-pointer">
              <CardContent
                className="p-4"
                onClick={() => {
                  setSelected(c);
                  setDetailOpen(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.nombre}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.email || c.telefono || "Sin contacto"}
                    </p>
                  </div>
                  <EstadoBadge estado={c.estado} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.estrategias
                    ?.slice(0, 2)
                    .map((e) => (
                      <TipoEstrategiaBadge key={e.id} tipo={e.estrategia.tipoEstrategia} />
                    ))}
                  {c.qrTokens && c.qrTokens[0] && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-slate-500">
                      <QrCode className="h-3 w-3" /> QR
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {open && tipo && (
        <ClienteForm
          empresaId={empresaId}
          tipo={tipo}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      )}
      {detailOpen && selected && (
        <ClienteDetail
          cliente={selected}
          empresaId={empresaId}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}

function ClienteForm({
  empresaId,
  tipo,
  onClose,
  onSaved,
}: {
  empresaId: string;
  tipo: TipoNegocio;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useStore();
  const [form, setForm] = useState<any>({
    nombre: "",
    telefono: "",
    email: "",
    fechaNacimiento: "",
    crearUsuario: true,
    password: "",
    campos: {},
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.nombre) {
      showToast("Nombre obligatorio", "error");
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/clientes", { ...form, empresaId, tipoNegocioId: tipo.id });
      showToast("Cliente creado", "success");
      onSaved();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Nombre *</Label>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Fecha nacimiento</Label>
            <Input
              type="date"
              value={form.fechaNacimiento}
              onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
            />
          </div>
        </div>
        {tipo.camposDef.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t">
            <p className="col-span-full text-sm font-medium">Datos de {tipo.nombre}</p>
            {tipo.camposDef.map((c) => (
              <div key={c.clave}>
                <Label>
                  {c.etiqueta}
                  {c.requerido ? " *" : ""}
                </Label>
                {c.tipo === "textarea" ? (
                  <Textarea
                    value={form.campos[c.clave] || ""}
                    onChange={(e) =>
                      setForm({ ...form, campos: { ...form.campos, [c.clave]: e.target.value } })
                    }
                  />
                ) : c.tipo === "select" ? (
                  <Select
                    value={form.campos[c.clave] || ""}
                    onValueChange={(v) =>
                      setForm({ ...form, campos: { ...form.campos, [c.clave]: v } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(c.opciones ? JSON.parse(c.opciones) : []).map((o: string) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={c.tipo === "number" ? "number" : "text"}
                    value={form.campos[c.clave] || ""}
                    onChange={(e) =>
                      setForm({ ...form, campos: { ...form.campos, [c.clave]: e.target.value } })
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Switch
            checked={form.crearUsuario}
            onCheckedChange={(v) => setForm({ ...form, crearUsuario: v })}
          />
          <Label>Crear cuenta de acceso para el cliente (requiere email)</Label>
        </div>
        {form.crearUsuario && (
          <div>
            <Label>Contraseña temporal</Label>
            <Input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Se genera una si se deja vacío"
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Crear cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClienteDetail({
  cliente,
  empresaId,
  onClose,
}: {
  cliente: Cliente;
  empresaId: string;
  onClose: () => void;
}) {
  const { showToast } = useStore();
  const [estrategias, setEstrategias] = useState<Estrategia[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  useEffect(() => {
    api
      .get<{ estrategias: Estrategia[] }>(`/api/estrategias?empresaId=${empresaId}`)
      .then((r) => setEstrategias(r.estrategias))
      .catch(() => {});
  }, [empresaId]);
  async function asignar(estrategiaId: string) {
    try {
      await api.post("/api/cliente-estrategias", { clienteId: cliente.id, estrategiaId });
      showToast("Beneficio asignado", "success");
      setAssignOpen(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error", "error");
    }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente.nombre}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <p>
              <span className="text-muted-foreground">Email:</span> {cliente.email || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Tel:</span> {cliente.telefono || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Estado:</span>{" "}
              <EstadoBadge estado={cliente.estado} />
            </p>
          </div>
          {cliente.camposDinamicos && cliente.camposDinamicos.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-3">
              {cliente.camposDinamicos.map((c) => (
                <p key={c.id}>
                  <span className="text-muted-foreground capitalize">{c.clave}:</span>{" "}
                  {c.valor}
                </p>
              ))}
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Beneficios</p>
              <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
                <Plus className="mr-1 h-3 w-3" /> Asignar
              </Button>
            </div>
            <div className="space-y-1.5">
              {cliente.estrategias?.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border p-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{e.estrategia.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.estrategia.tipoEstrategia}
                    </p>
                  </div>
                  <EstadoBadge estado={e.estado} />
                </div>
              )) || <p className="text-muted-foreground text-xs">Sin beneficios</p>}
            </div>
          </div>
          {cliente.qrTokens && cliente.qrTokens[0] && (
            <div className="bg-slate-900 text-white rounded-lg p-3 font-mono text-xs break-all">
              {cliente.qrTokens[0].token}
            </div>
          )}
        </div>
        {assignOpen && (
          <div className="border-t pt-3 space-y-1.5">
            <p className="text-sm font-medium">Asignar beneficio:</p>
            {estrategias
              .filter((e) => !cliente.estrategias?.some((ce) => ce.estrategiaId === e.id))
              .map((e) => (
                <button
                  key={e.id}
                  onClick={() => asignar(e.id)}
                  className="w-full text-left rounded-lg border p-2 hover:bg-slate-50 text-sm"
                >
                  <span className="font-medium">{e.nombre}</span>{" "}
                  <span className="text-xs text-muted-foreground">· {e.tipoEstrategia}</span>
                </button>
              ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────────────────────────────────────────
   Beneficios (antes Estrategias)
   ────────────────────────────────────────────────────────── */

export function BeneficiosManager({
  empresaId,
  onBack,
}: {
  empresaId: string;
  onBack?: () => void;
}) {
  const { showToast } = useStore();
  const tipo = useEmpresaTipo(empresaId);
  const [estrategias, setEstrategias] = useState<Estrategia[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Estrategia | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ estrategias: Estrategia[] }>(`/api/estrategias?empresaId=${empresaId}`)
      .then((r) => setEstrategias(r.estrategias))
      .catch(() => showToast("Error", "error"))
      .finally(() => setLoading(false));
  }, [empresaId, showToast]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);

  async function toggle(e: Estrategia) {
    try {
      await api.patch(`/api/estrategias/${e.id}`, {
        estado: e.estado === "ACTIVA" ? "INACTIVA" : "ACTIVA",
      });
      load();
      showToast("Actualizado", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    }
  }

  return (
    <div>
      <SectionHeader
        title="Beneficios"
        description="Membresías, conteos de visitas y cupones para tus clientes"
        action={
          <div className="flex gap-2">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Cambiar empresa
              </Button>
            )}
            <Button
              onClick={() => {
                setEdit(null);
                setOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Nuevo beneficio
            </Button>
          </div>
        }
      />
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : estrategias.length === 0 ? (
        <EmptyState
          title="Sin beneficios"
          description="Crea tu primera promoción disponible para los clientes"
          icon={<Sparkles className="h-10 w-10" />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {estrategias.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{e.nombre}</p>
                      <TipoEstrategiaBadge tipo={e.tipoEstrategia} />
                    </div>
                    {e.descripcion && (
                      <p className="text-xs text-muted-foreground mt-1">{e.descripcion}</p>
                    )}
                  </div>
                  <EstadoBadge estado={e.estado} />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {e.requierePago && (
                    <span className="font-semibold text-slate-700">{fmtMonto(e.precio)}</span>
                  )}
                  {e.duracionDias > 0 && <span>{e.duracionDias} días</span>}
                  {e.tipoEstrategia === "MEMBRESIA" && <span>{e.cantidadUsos} usos</span>}
                  {e.tipoEstrategia === "CONTEO_VISITAS" && (
                    <span>Meta: {e.metaVisitas} visitas</span>
                  )}
                  {e.tipoEstrategia === "CUPON" && <span>{e.descuentoPct}% desc.</span>}
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {open && tipo && (
        <BeneficioForm
          empresaId={empresaId}
          tipoId={tipo.id}
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

function BeneficioForm({
  empresaId,
  tipoId,
  edit,
  onClose,
  onSaved,
}: {
  empresaId: string;
  tipoId: string;
  edit: Estrategia | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useStore();
  const [f, setF] = useState<any>(
    edit
      ? {
          ...edit,
          fechaFin: edit.fechaFin ? String(edit.fechaFin).slice(0, 10) : "",
          incluye: jsonArrayToText(edit.incluye),
          escasezTipo: edit.escasezTipo || "none",
        }
      : {
          nombre: "",
          tipoEstrategia: "MEMBRESIA",
          descripcion: "",
          requierePago: false,
          precio: 0,
          duracionDias: 30,
          cantidadUsos: 0,
          metaVisitas: 5,
          descuentoPct: 100,
          recompensa: "",
          fechaFin: "",
          terminos: "",
          incluye: "",
          limiteCupos: 0,
          cuposDisponibles: 0,
          destacada: false,
          escasezTipo: "none",
          estado: "ACTIVA",
        }
  );
  const [saving, setSaving] = useState(false);

  const tipoSel = TIPOS_BENEFICIO.find((t) => t.value === f.tipoEstrategia);

  async function save() {
    if (!f.nombre) {
      showToast("Nombre obligatorio", "error");
      return;
    }
    // Limpiar campos irrelevantes según tipo
    const payload: any = {
      ...f,
      incluye: textToJsonArrayString(String(f.incluye ?? "")),
      limiteCupos: Number(f.limiteCupos) || 0,
      cuposDisponibles: Number(f.cuposDisponibles) || 0,
      destacada: !!f.destacada,
      escasezTipo:
        f.escasezTipo && f.escasezTipo !== "none" ? f.escasezTipo : null,
    };
    if (payload.fechaFin === "") payload.fechaFin = null;
    setSaving(true);
    try {
      if (edit) await api.patch(`/api/estrategias/${edit.id}`, payload);
      else
        await api.post("/api/estrategias", {
          ...payload,
          empresaId,
          tipoNegocioId: tipoId,
        });
      showToast("Beneficio guardado", "success");
      onSaved();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{edit ? "Editar beneficio" : "Nuevo beneficio"}</DialogTitle>
          {tipoSel && (
            <p className="text-xs text-muted-foreground mt-0.5">{tipoSel.descripcion}</p>
          )}
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nombre *</Label>
            <Input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
          </div>
          <div>
            <Label>Tipo de beneficio</Label>
            <Select
              value={f.tipoEstrategia}
              onValueChange={(v) => setF({ ...f, tipoEstrategia: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_BENEFICIO.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Estado</Label>
            <Select value={f.estado} onValueChange={(v) => setF({ ...f, estado: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVA">Activa</SelectItem>
                <SelectItem value="INACTIVA">Inactiva</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Descripción</Label>
            <Textarea
              value={f.descripcion || ""}
              onChange={(e) => setF({ ...f, descripcion: e.target.value })}
              rows={2}
            />
          </div>

          {/* Campos por tipo */}
          {f.tipoEstrategia === "MEMBRESIA" && (
            <>
              <div className="sm:col-span-2 flex items-center gap-2">
                <Switch
                  checked={!!f.requierePago}
                  onCheckedChange={(v) => setF({ ...f, requierePago: v })}
                />
                <Label>Requiere pago</Label>
              </div>
              {f.requierePago && (
                <div>
                  <Label>Precio (RD$)</Label>
                  <Input
                    type="number"
                    value={f.precio}
                    onChange={(e) => setF({ ...f, precio: Number(e.target.value) })}
                  />
                </div>
              )}
              <div>
                <Label>Duración (días)</Label>
                <Input
                  type="number"
                  value={f.duracionDias}
                  onChange={(e) => setF({ ...f, duracionDias: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Cantidad de usos incluidos</Label>
                <Input
                  type="number"
                  value={f.cantidadUsos}
                  onChange={(e) => setF({ ...f, cantidadUsos: Number(e.target.value) })}
                />
              </div>
            </>
          )}

          {f.tipoEstrategia === "CONTEO_VISITAS" && (
            <>
              <div>
                <Label>Meta de visitas</Label>
                <Input
                  type="number"
                  value={f.metaVisitas}
                  onChange={(e) => setF({ ...f, metaVisitas: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Descuento al alcanzar (%) — 100 = gratis</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={f.descuentoPct}
                  onChange={(e) => setF({ ...f, descuentoPct: Number(e.target.value) })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Recompensa (descripción)</Label>
                <Input
                  value={f.recompensa || ""}
                  onChange={(e) => setF({ ...f, recompensa: e.target.value })}
                  placeholder="Ej: Lavado gratis en la 6ta visita"
                />
              </div>
            </>
          )}

          {f.tipoEstrategia === "CUPON" && (
            <>
              <div>
                <Label>Descuento (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={f.descuentoPct}
                  onChange={(e) => setF({ ...f, descuentoPct: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Cantidad de usos (default 1)</Label>
                <Input
                  type="number"
                  value={f.cantidadUsos}
                  onChange={(e) => setF({ ...f, cantidadUsos: Number(e.target.value) })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Fecha de vencimiento (opcional)</Label>
                <Input
                  type="date"
                  value={f.fechaFin || ""}
                  onChange={(e) => setF({ ...f, fechaFin: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <Label>Términos y condiciones</Label>
            <Textarea
              value={f.terminos || ""}
              onChange={(e) => setF({ ...f, terminos: e.target.value })}
              rows={3}
              placeholder="Términos visibles al cliente (vigencia, restricciones, etc.)"
            />
          </div>

          <div className="sm:col-span-2 mt-2 pt-3 border-t">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-600" />
              Presentacion en la landing (conversion)
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Optimiza como se muestra este beneficio en la pagina publica para impulsar la conversion.
            </p>
          </div>
          <div className="sm:col-span-2">
            <Label>Incluye (lista de bullets)</Label>
            <Textarea
              value={String(f.incluye ?? "")}
              onChange={(e) => setF({ ...f, incluye: e.target.value })}
              rows={4}
              placeholder={"Un bullet por linea\nEj: 4 lavados basicos al mes\nPrioridad en agenda"}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lista con ticks verdes que se muestra en la tarjeta de la promocion. Vende la experiencia.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Switch
              checked={!!f.destacada}
              onCheckedChange={(v) => setF({ ...f, destacada: v })}
            />
            <Label className="font-normal">
              Marcar como "La favorita de nuestros clientes" (badge dorado en la landing)
            </Label>
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
              Limite de cupos
            </Label>
            <Input
              type="number"
              min={0}
              value={String(f.limiteCupos ?? 0)}
              onChange={(e) => setF({ ...f, limiteCupos: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              0 = ilimitado. Si &gt; 0, se muestra como escasez.
            </p>
          </div>
          <div>
            <Label>Cupos disponibles</Label>
            <Input
              type="number"
              min={0}
              value={String(f.cuposDisponibles ?? 0)}
              onChange={(e) => setF({ ...f, cuposDisponibles: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cupos restantes. Se muestra cuando hay limite.
            </p>
          </div>
          <div className="sm:col-span-2">
            <Label className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              Tipo de escasez
            </Label>
            <Select
              value={String(f.escasezTipo ?? "none")}
              onValueChange={(v) => setF({ ...f, escasezTipo: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ninguna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna</SelectItem>
                {ESCASEZ_TIPOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Mensaje de urgencia que aparece en la tarjeta.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────────────────────────────────────────
   Pagos pendientes
   ────────────────────────────────────────────────────────── */

export function PagosManager({
  empresaId,
  onBack,
}: {
  empresaId: string;
  onBack?: () => void;
}) {
  const { showToast } = useStore();
  const [items, setItems] = useState<
    (ClienteEstrategia & { cliente?: Cliente; estrategia?: Estrategia })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ clienteEstrategias: any[] }>(
        `/api/cliente-estrategias?empresaId=${empresaId}&estado=PENDIENTE`
      )
      .then((r) => setItems(r.clienteEstrategias))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [empresaId]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);
  async function confirmar(id: string) {
    try {
      await api.post(`/api/cliente-estrategias/${id}/confirmar-pago`, {});
      showToast("Pago confirmado y membresía activada", "success");
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error", "error");
    }
  }
  return (
    <div>
      <SectionHeader
        title="Pagos pendientes"
        description="Confirma pagos para activar membresías pendientes"
        action={
          onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Cambiar empresa
            </Button>
          )
        }
      />
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : items.length === 0 ? (
        <EmptyState title="Sin pagos pendientes" icon={<CheckCircle2 className="h-10 w-10" />} />
      ) : (
        <div className="space-y-3">
          {items.map((ce) => (
            <Card key={ce.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{ce.cliente?.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {ce.estrategia?.nombre} · {fmtMonto(ce.estrategia?.precio)}
                  </p>
                </div>
                <Button onClick={() => confirmar(ce.id)}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Confirmar pago
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Usos registrados (antes Historial)
   ────────────────────────────────────────────────────────── */

export function UsosManager({
  empresaId,
  onBack,
  empleadoId,
}: {
  empresaId: string;
  onBack?: () => void;
  empleadoId?: string;
}) {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get<{ transacciones: Transaccion[] }>(
        `/api/transacciones?empresaId=${empresaId}&limit=200`
      )
      .then((r) => {
        const list = empleadoId
          ? r.transacciones.filter((t) => t.empleado?.id === empleadoId)
          : r.transacciones;
        setTransacciones(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [empresaId, empleadoId]);
  return (
    <div>
      <SectionHeader
        title="Usos registrados"
        description={empleadoId ? "Consumos que has registrado" : "Todas las transacciones registradas"}
        action={
          onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Cambiar empresa
            </Button>
          )
        }
      />
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : transacciones.length === 0 ? (
        <EmptyState
          title="Sin usos registrados"
          description="Escanea un QR para registrar el primero"
          icon={<History className="h-10 w-10" />}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="max-h-[70vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Fecha</th>
                    <th className="text-left p-3 font-medium">Cliente</th>
                    <th className="text-left p-3 font-medium">Consumo</th>
                    <th className="text-left p-3 font-medium">Beneficio</th>
                    <th className="text-right p-3 font-medium">Monto</th>
                    <th className="text-left p-3 font-medium">Empleado</th>
                  </tr>
                </thead>
                <tbody>
                  {transacciones.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="p-3 text-xs text-muted-foreground">
                        {fmtFechaHora(t.fechaTransaccion)}
                      </td>
                      <td className="p-3 font-medium">{t.cliente?.nombre || "—"}</td>
                      <td className="p-3">{t.tipoConsumo}</td>
                      <td className="p-3 text-xs">{t.beneficioAplicado || "—"}</td>
                      <td className="p-3 text-right">
                        {t.montoConsumo > 0 ? fmtMonto(t.montoConsumo) : "—"}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {t.empleado?.nombre || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Configuración = Integraciones (admin empresa)
   ────────────────────────────────────────────────────────── */

export function SocialProofConfig() {
  const { showToast } = useStore();
  const [f, setF] = useState<{
    socialClientes: string;
    socialVisitas: string;
    socialPromociones: string;
    socialNegocios: string;
    socialVehiculos: string;
    heroTitulo: string;
    heroSubtitulo: string;
  }>({
    socialClientes: "0",
    socialVisitas: "0",
    socialPromociones: "0",
    socialNegocios: "0",
    socialVehiculos: "0",
    heroTitulo: "",
    heroSubtitulo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<{ config: Config }>("/api/config")
      .then((r) => {
        const c = r.config;
        setF({
          socialClientes: String(c.socialClientes ?? 0),
          socialVisitas: String(c.socialVisitas ?? 0),
          socialPromociones: String(c.socialPromociones ?? 0),
          socialNegocios: String(c.socialNegocios ?? 0),
          socialVehiculos: String(c.socialVehiculos ?? 0),
          heroTitulo: c.heroTitulo ?? "",
          heroSubtitulo: c.heroSubtitulo ?? "",
        });
      })
      .catch(() => showToast("Error al cargar la configuracion", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  async function save() {
    setSaving(true);
    try {
      await api.patch("/api/config", {
        socialClientes: Number(f.socialClientes) || 0,
        socialVisitas: Number(f.socialVisitas) || 0,
        socialPromociones: Number(f.socialPromociones) || 0,
        socialNegocios: Number(f.socialNegocios) || 0,
        socialVehiculos: Number(f.socialVehiculos) || 0,
        heroTitulo: f.heroTitulo || null,
        heroSubtitulo: f.heroSubtitulo || null,
      });
      showToast("Prueba social actualizada", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Cargando configuracion...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-600" />
          Prueba social (numeros visibles en la landing)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Clientes registrados</Label>
            <Input
              type="number"
              min={0}
              value={f.socialClientes}
              onChange={(e) => setF({ ...f, socialClientes: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Texto: "Mas de X clientes registrados".
            </p>
          </div>
          <div>
            <Label>Promociones utilizadas</Label>
            <Input
              type="number"
              min={0}
              value={f.socialPromociones}
              onChange={(e) => setF({ ...f, socialPromociones: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Texto: "Miles de promociones ya utilizadas".
            </p>
          </div>
          <div>
            <Label>Visitas registradas</Label>
            <Input
              type="number"
              min={0}
              value={f.socialVisitas}
              onChange={(e) => setF({ ...f, socialVisitas: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Usado para la barra social de la landing.
            </p>
          </div>
          <div>
            <Label>Negocios participantes</Label>
            <Input
              type="number"
              min={0}
              value={f.socialNegocios}
              onChange={(e) => setF({ ...f, socialNegocios: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cantidad de negocios que aparecen en la landing.
            </p>
          </div>
          <div>
            <Label>Vehiculos atendidos</Label>
            <Input
              type="number"
              min={0}
              value={f.socialVehiculos}
              onChange={(e) => setF({ ...f, socialVehiculos: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Texto: "Mas de X vehiculos atendidos".
            </p>
          </div>
        </div>
        <Separator />
        <div>
          <Label>Titulo del hero (opcional)</Label>
          <Input
            value={f.heroTitulo}
            onChange={(e) => setF({ ...f, heroTitulo: e.target.value })}
            placeholder="Tu Pase Digital abre la puerta a promociones privadas"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Si lo dejas vacio, se usa el texto por defecto.
          </p>
        </div>
        <div>
          <Label>Subtitulo del hero (opcional)</Label>
          <Textarea
            value={f.heroSubtitulo}
            onChange={(e) => setF({ ...f, heroSubtitulo: e.target.value })}
            rows={2}
            placeholder="Subtitulo que acompana al titulo principal de la landing."
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfiguracionManager({
  empresaId,
  onBack,
}: {
  empresaId: string;
  onBack?: () => void;
}) {
  return (
    <div>
      <SectionHeader
        title="Configuración"
        description="Prueba social, integraciones con sistemas externos y sincronización"
        action={
          onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Cambiar empresa
            </Button>
          )
        }
      />
      <div className="space-y-6">
        <SocialProofConfig />
        <IntegracionesManager empresaId={empresaId} />
      </div>
    </div>
  );
}

function IntegracionesManager({ empresaId }: { empresaId: string }) {
  const { showToast } = useStore();
  const [items, setItems] = useState<Integracion[]>([]);
  const [open, setOpen] = useState(false);
  const [logsFor, setLogsFor] = useState<Integracion | null>(null);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ integraciones: Integracion[] }>(`/api/integraciones?empresaId=${empresaId}`)
      .then((r) => setItems(r.integraciones))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [empresaId]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);

  async function viewLogs(integ: Integracion) {
    setLogsFor(integ);
    try {
      const r = await api.get<{ logs: IntegrationLog[] }>(
        `/api/integraciones/${integ.id}/logs?limit=100`
      );
      setLogs(r.logs);
    } catch {
      setLogs([]);
    }
  }
  async function retry(log: IntegrationLog) {
    try {
      await api.post(`/api/integration-logs/${log.id}/retry`);
      showToast("Reintento enviado", "success");
      if (logsFor) viewLogs(logsFor);
    } catch (e) {
      showToast("Error", "error");
    }
  }
  async function toggle(integ: Integracion) {
    try {
      await api.patch(`/api/integraciones/${integ.id}`, {
        estado: integ.estado === "ACTIVA" ? "INACTIVA" : "ACTIVA",
      });
      load();
    } catch (e) {
      showToast("Error", "error");
    }
  }
  async function remove(id: string) {
    try {
      await api.del(`/api/integraciones/${id}`);
      showToast("Eliminada", "success");
      load();
    } catch (e) {
      showToast("Error", "error");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-violet-600" />
          <p className="font-semibold">Integraciones</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Nueva integración
        </Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin integraciones"
          description="Configura la sincronización con tu sistema externo"
          icon={<Plug className="h-10 w-10" />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((i) => (
            <Card key={i.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <Plug className="h-4 w-4 text-violet-600" />{" "}
                      {TIPOS_INTEGRACION.find((t) => t.value === i.tipoIntegracion)?.label ||
                        i.tipoIntegracion}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {i.webhookUrl || i.apiUrl || "Sin URL"}
                    </p>
                  </div>
                  <EstadoBadge estado={i.estado} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(i.eventos ? JSON.parse(i.eventos) : []).map((ev: string) => (
                    <span
                      key={ev}
                      className="text-[10px] bg-violet-100 text-violet-700 rounded px-1.5 py-0.5"
                    >
                      {EVENTOS_SINCRONIZACION.find((e) => e.value === ev)?.label || ev}
                    </span>
                  ))}
                </div>
                {i.ultimaSincronizacion && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Última sync: {fmtFechaHora(i.ultimaSincronizacion)}
                  </p>
                )}
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => viewLogs(i)}>
                    Ver logs ({i._count?.logs || 0})
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggle(i)}>
                    {i.estado === "ACTIVA" ? "Pausar" : "Activar"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(i.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {open && (
        <IntegracionForm
          empresaId={empresaId}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      )}
      {logsFor && (
        <Dialog open onOpenChange={(o) => !o && setLogsFor(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Logs de sincronización</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {logs.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin logs</p>
              )}
              {logs.map((l) => (
                <div key={l.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{l.evento}</span>
                    <div className="flex items-center gap-2">
                      <EstadoBadge estado={l.estado} />
                      {l.estado === "ERROR" && (
                        <Button size="sm" variant="ghost" onClick={() => retry(l)}>
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {fmtFechaHora(l.createdAt)}
                  </p>
                  {l.error && <p className="text-xs text-red-600 mt-1">{l.error}</p>}
                  {l.respuesta && (
                    <pre className="text-[10px] bg-slate-50 p-2 rounded mt-1 overflow-x-auto max-h-24">
                      {l.respuesta}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function IntegracionForm({
  empresaId,
  onClose,
  onSaved,
}: {
  empresaId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useStore();
  const [f, setF] = useState<any>({
    tipoIntegracion: "WEBHOOK",
    apiUrl: "",
    webhookUrl: "",
    apiKey: "",
    tokenSecreto: "",
    eventos: [],
  });
  const [saving, setSaving] = useState(false);
  function toggleEv(ev: string) {
    setF({
      ...f,
      eventos: f.eventos.includes(ev)
        ? f.eventos.filter((e: string) => e !== ev)
        : [...f.eventos, ev],
    });
  }
  async function save() {
    setSaving(true);
    try {
      await api.post("/api/integraciones", { ...f, empresaId });
      showToast("Integración creada", "success");
      onSaved();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva integración</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Tipo</Label>
            <Select
              value={f.tipoIntegracion}
              onValueChange={(v) => setF({ ...f, tipoIntegracion: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_INTEGRACION.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {f.tipoIntegracion === "WEBHOOK" && (
            <div>
              <Label>Webhook URL</Label>
              <Input
                value={f.webhookUrl}
                onChange={(e) => setF({ ...f, webhookUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          )}
          {f.tipoIntegracion === "API_REST" && (
            <div>
              <Label>API URL</Label>
              <Input
                value={f.apiUrl}
                onChange={(e) => setF({ ...f, apiUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          )}
          <div>
            <Label>API Key</Label>
            <Input value={f.apiKey} onChange={(e) => setF({ ...f, apiKey: e.target.value })} />
          </div>
          <div>
            <Label>Token secreto</Label>
            <Input
              value={f.tokenSecreto}
              onChange={(e) => setF({ ...f, tokenSecreto: e.target.value })}
            />
          </div>
          <div>
            <Label>Eventos a sincronizar</Label>
            <div className="grid grid-cols-2 gap-1.5 mt-1 max-h-48 overflow-y-auto">
              {EVENTOS_SINCRONIZACION.map((e) => (
                <label
                  key={e.value}
                  className="flex items-center gap-2 text-sm rounded border p-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={f.eventos.includes(e.value)}
                    onChange={() => toggleEv(e.value)}
                  />{" "}
                  {e.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────────────────────────────────────────
   Reportes (empresa)
   ────────────────────────────────────────────────────────── */

function ReportesEmpresa({ empresaId }: { empresaId: string }) {
  return <EmpresaDashboard empresaId={empresaId} />;
}

/* ──────────────────────────────────────────────────────────
   Empresa Form con branding completo (exportado para Superadmin)
   ────────────────────────────────────────────────────────── */

type RedesSociales = { instagram?: string; facebook?: string };

function parseRedes(s: string | null | undefined): RedesSociales {
  if (!s) return {};
  try {
    return JSON.parse(s) as RedesSociales;
  } catch {
    return {};
  }
}

export function EmpresaForm({
  tipos,
  edit,
  onClose,
  onSaved,
}: {
  tipos: TipoNegocio[];
  edit: Empresa | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useStore();
  const redesIniciales = parseRedes(edit?.redesSociales);
  const [f, setF] = useState<EmpresaFormState>(
    edit
      ? {
          nombre: edit.nombre,
          tipoNegocioId: edit.tipoNegocioId,
          estado: edit.estado,
          logo: edit.logo || "",
          imagenPortada: edit.imagenPortada || "",
          colorPrincipal: edit.colorPrincipal || "#0f172a",
          colorSecundario: edit.colorSecundario || "#64748b",
          telefono: edit.telefono || "",
          whatsapp: edit.whatsapp || "",
          direccion: edit.direccion || "",
          ciudad: edit.ciudad || "",
          horario: edit.horario || "",
          instagram: redesIniciales.instagram || "",
          facebook: redesIniciales.facebook || "",
          descripcionPublica: edit.descripcionPublica || "",
          textoBienvenida: edit.textoBienvenida || "",
          terminosCondiciones: edit.terminosCondiciones || "",
          calificacion: edit.calificacion ?? 0,
          servicios: jsonArrayToText(edit.servicios),
          galeria: jsonArrayToText(edit.galeria),
          destacada: !!edit.destacada,
          urlPersonalizada: edit.urlPersonalizada || "",
        }
      : {
          nombre: "",
          tipoNegocioId: "",
          estado: "ACTIVA",
          logo: "",
          imagenPortada: "",
          colorPrincipal: "#0f172a",
          colorSecundario: "#64748b",
          telefono: "",
          whatsapp: "",
          direccion: "",
          ciudad: "",
          horario: "",
          instagram: "",
          facebook: "",
          descripcionPublica: "",
          textoBienvenida: "",
          terminosCondiciones: "",
          calificacion: 0,
          servicios: "",
          galeria: "",
          destacada: false,
          urlPersonalizada: "",
        }
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!f.nombre || !f.tipoNegocioId) {
      showToast("Nombre y tipo de negocio son obligatorios", "error");
      return;
    }
    // Componer redesSociales como JSON
    const redes: RedesSociales = {};
    if (f.instagram) redes.instagram = String(f.instagram);
    if (f.facebook) redes.facebook = String(f.facebook);
    const payload = {
      nombre: f.nombre,
      tipoNegocioId: f.tipoNegocioId,
      estado: f.estado,
      logo: f.logo || null,
      imagenPortada: f.imagenPortada || null,
      colorPrincipal: f.colorPrincipal || null,
      colorSecundario: f.colorSecundario || null,
      telefono: f.telefono || null,
      whatsapp: f.whatsapp || null,
      direccion: f.direccion || null,
      ciudad: f.ciudad || null,
      horario: f.horario || null,
      redesSociales: Object.keys(redes).length ? JSON.stringify(redes) : null,
      descripcionPublica: f.descripcionPublica || null,
      textoBienvenida: f.textoBienvenida || null,
      terminosCondiciones: f.terminosCondiciones || null,
      calificacion: Number(f.calificacion) || 0,
      servicios: textToJsonArrayString(String(f.servicios ?? "")),
      galeria: textToJsonArrayString(String(f.galeria ?? "")),
      destacada: !!f.destacada,
      urlPersonalizada: f.urlPersonalizada || null,
    };
    setSaving(true);
    try {
      if (edit) await api.patch(`/api/empresas/${edit.id}`, payload);
      else await api.post("/api/empresas", payload);
      showToast("Empresa guardada", "success");
      onSaved();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  }

  function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 col-span-full mt-2 mb-1 first:mt-0">
        {children}
      </p>
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{edit ? "Editar empresa" : "Nueva empresa"}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Configura la información básica, identidad visual, contacto y textos públicos.
          </p>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldLabel>Información básica</FieldLabel>
          <div className="sm:col-span-2">
            <Label>Nombre *</Label>
            <Input value={String(f.nombre)} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
          </div>
          <div>
            <Label>Tipo de negocio *</Label>
            <Select
              value={String(f.tipoNegocioId)}
              onValueChange={(v) => setF({ ...f, tipoNegocioId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {tipos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Estado</Label>
            <Select
              value={String(f.estado)}
              onValueChange={(v) => setF({ ...f, estado: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVA">Activa</SelectItem>
                <SelectItem value="INACTIVA">Inactiva</SelectItem>
                <SelectItem value="SUSPENDIDA">Suspendida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FieldLabel>Identidad visual</FieldLabel>
          <div>
            <Label>Logo (URL)</Label>
            <Input
              value={String(f.logo)}
              onChange={(e) => setF({ ...f, logo: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Imagen de portada (URL)</Label>
            <Input
              value={String(f.imagenPortada)}
              onChange={(e) => setF({ ...f, imagenPortada: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Color principal</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={String(f.colorPrincipal)}
                onChange={(e) => setF({ ...f, colorPrincipal: e.target.value })}
                className="h-9 w-12 rounded border border-input bg-background p-1"
              />
              <Input
                value={String(f.colorPrincipal)}
                onChange={(e) => setF({ ...f, colorPrincipal: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <div>
            <Label>Color secundario</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={String(f.colorSecundario)}
                onChange={(e) => setF({ ...f, colorSecundario: e.target.value })}
                className="h-9 w-12 rounded border border-input bg-background p-1"
              />
              <Input
                value={String(f.colorSecundario)}
                onChange={(e) => setF({ ...f, colorSecundario: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
          </div>
          {((f.logo as string) || (f.imagenPortada as string)) && (
            <div className="sm:col-span-2 flex gap-3 mt-1">
              {f.logo && (
                <div className="rounded-lg border p-2 bg-slate-50">
                  <img
                    src={String(f.logo)}
                    alt="Logo preview"
                    className="h-12 w-12 object-contain"
                  />
                </div>
              )}
              {f.imagenPortada && (
                <div className="rounded-lg border overflow-hidden bg-slate-50">
                  <img
                    src={String(f.imagenPortada)}
                    alt="Portada preview"
                    className="h-12 w-32 object-cover"
                  />
                </div>
              )}
            </div>
          )}

          <FieldLabel>Perfil premium (autoridad y prueba social)</FieldLabel>
          <div>
            <Label className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500" /> Calificacion
            </Label>
            <Input
              type="number"
              step={0.1}
              min={0}
              max={5}
              value={String(f.calificacion ?? 0)}
              onChange={(e) => setF({ ...f, calificacion: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Calificacion visible en la landing (0-5 estrellas).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={!!f.destacada}
              onCheckedChange={(v) => setF({ ...f, destacada: v })}
            />
            <Label className="font-normal">
              Marcar como establecimiento destacado (aparece primero en la landing)
            </Label>
          </div>
          <div className="sm:col-span-2">
            <Label className="flex items-center gap-1.5">
              <List className="h-3.5 w-3.5 text-slate-500" /> Servicios
            </Label>
            <Textarea
              value={String(f.servicios ?? "")}
              onChange={(e) => setF({ ...f, servicios: e.target.value })}
              rows={4}
              placeholder={"Un servicio por linea\nEj: Lavado basico\nLavado premium"}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Servicios que se muestran como chips en la tarjeta del establecimiento. Un servicio por linea.
            </p>
          </div>
          <div className="sm:col-span-2">
            <Label className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-slate-500" /> Galeria (URLs de imagenes, opcional)
            </Label>
            <Textarea
              value={String(f.galeria ?? "")}
              onChange={(e) => setF({ ...f, galeria: e.target.value })}
              rows={3}
              placeholder={"Una URL por linea\nhttps://..."}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Opcional. Una URL de imagen por linea. Se muestra como carrusel en la tarjeta.
            </p>
          </div>

          <FieldLabel>Contacto y ubicación</FieldLabel>
          <div>
            <Label>Teléfono</Label>
            <Input
              value={String(f.telefono)}
              onChange={(e) => setF({ ...f, telefono: e.target.value })}
            />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input
              value={String(f.whatsapp)}
              onChange={(e) => setF({ ...f, whatsapp: e.target.value })}
              placeholder="809-000-0000"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Dirección</Label>
            <Input
              value={String(f.direccion)}
              onChange={(e) => setF({ ...f, direccion: e.target.value })}
            />
          </div>
          <div>
            <Label>Ciudad</Label>
            <Input
              value={String(f.ciudad)}
              onChange={(e) => setF({ ...f, ciudad: e.target.value })}
            />
          </div>
          <div>
            <Label>Horario</Label>
            <Input
              value={String(f.horario)}
              onChange={(e) => setF({ ...f, horario: e.target.value })}
              placeholder="Lun-Vie 8am-6pm, Sab 8am-2pm"
            />
          </div>
          <div>
            <Label>Instagram (URL)</Label>
            <Input
              value={String(f.instagram)}
              onChange={(e) => setF({ ...f, instagram: e.target.value })}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <Label>Facebook (URL)</Label>
            <Input
              value={String(f.facebook)}
              onChange={(e) => setF({ ...f, facebook: e.target.value })}
              placeholder="https://facebook.com/..."
            />
          </div>

          <FieldLabel>Textos públicos</FieldLabel>
          <div>
            <Label>URL personalizada (slug)</Label>
            <Input
              value={String(f.urlPersonalizada)}
              onChange={(e) => setF({ ...f, urlPersonalizada: e.target.value })}
              placeholder="mi-empresa"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Descripción pública</Label>
            <Textarea
              value={String(f.descripcionPublica)}
              onChange={(e) => setF({ ...f, descripcionPublica: e.target.value })}
              rows={2}
              placeholder="Descripción corta que ven los clientes en la landing"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Texto de bienvenida</Label>
            <Textarea
              value={String(f.textoBienvenida)}
              onChange={(e) => setF({ ...f, textoBienvenida: e.target.value })}
              rows={2}
              placeholder="Mensaje que verá el cliente al registrarse"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Términos y condiciones</Label>
            <Textarea
              value={String(f.terminosCondiciones)}
              onChange={(e) => setF({ ...f, terminosCondiciones: e.target.value })}
              rows={4}
              placeholder="Términos legales que el cliente acepta al registrarse"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
