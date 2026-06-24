"use client";
import { useEffect, useState, useCallback } from "react";
import { useStore, fmtMonto, fmtFecha, fmtFechaHora, type AppSection } from "../store";
import { api, type Cliente, type Estrategia, type ClienteEstrategia, type Transaccion, type Integracion, type IntegrationLog, type TipoNegocio } from "../api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SectionHeader, EstadoBadge, TipoEstrategiaBadge, StatCard, EmptyState, RolBadge } from "../shared";
import { TIPOS_ESTRATEGIA, TIPOS_INTEGRACION, EVENTOS_SINCRONIZACION, SERVICIOS_NEGOCIO } from "@/lib/constants";
import { Users, Sparkles, CreditCard, History, Plug, BarChart3, Plus, Search, QrCode, DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Trash2, RotateCcw, Gift } from "lucide-react";
import { ScannerFlow } from "./ScannerFlow";
import { cn } from "@/lib/utils";

export function EmpresaPanel({ section }: { section: AppSection }) {
  const { user } = useStore();
  const empresaId = user?.empresaId;

  if (section === "escanear") return <ScannerFlow />;
  if (section === "dashboard") return <EmpresaDashboard empresaId={empresaId!} />;
  if (section === "clientes") return <ClientesManager empresaId={empresaId!} />;
  if (section === "estrategias") return <EstrategiasManager empresaId={empresaId!} />;
  if (section === "pagos") return <PagosManager empresaId={empresaId!} />;
  if (section === "historial") return <HistorialManager empresaId={empresaId!} />;
  if (section === "integraciones") return <IntegracionesManager empresaId={empresaId!} />;
  if (section === "reportes") return <ReportesEmpresa empresaId={empresaId!} />;
  return null;
}

function useEmpresaTipo(empresaId: string) {
  const [tipo, setTipo] = useState<TipoNegocio | null>(null);
  useEffect(() => {
    api.get<{ empresa: any }>(`/api/empresas/${empresaId}`).then((r) => setTipo(r.empresa.tipoNegocio)).catch(() => {});
  }, [empresaId]);
  return tipo;
}

function EmpresaDashboard({ empresaId }: { empresaId: string }) {
  const [rep, setRep] = useState<any>(null);
  useEffect(() => {
    api.get(`/api/reportes?tipo=empresa&empresaId=${empresaId}`).then((r) => setRep(r)).catch(() => {});
  }, [empresaId]);
  if (!rep) return <p className="text-muted-foreground">Cargando dashboard...</p>;
  return (
    <div>
      <SectionHeader title="Dashboard" description="Resumen de tu empresa" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clientes registrados" value={rep.clientesRegistrados} icon={<Users className="h-5 w-5" />} accent="text-sky-600 bg-sky-50" />
        <StatCard label="Clientes activos" value={rep.clientesActivos} icon={<CheckCircle2 className="h-5 w-5" />} accent="text-emerald-600 bg-emerald-50" />
        <StatCard label="Estrategias activas" value={rep.estrategiasActivas} icon={<Sparkles className="h-5 w-5" />} accent="text-violet-600 bg-violet-50" />
        <StatCard label="Consumos totales" value={rep.totalConsumos} icon={<TrendingUp className="h-5 w-5" />} accent="text-amber-600 bg-amber-50" />
        <StatCard label="Ingresos membresías" value={fmtMonto(rep.ingresosMembresias)} icon={<DollarSign className="h-5 w-5" />} accent="text-emerald-600 bg-emerald-50" />
        <StatCard label="Beneficios usados" value={rep.beneficiosUsados} icon={<Gift />} accent="text-pink-600 bg-pink-50" />
        <StatCard label="Pagos pendientes" value={rep.estrategiasClienteEstado.pendientes} icon={<CreditCard className="h-5 w-5" />} accent="text-amber-600 bg-amber-50" />
        <StatCard label="Errores sync" value={rep.erroresSync} icon={<AlertTriangle className="h-5 w-5" />} accent="text-red-600 bg-red-50" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Consumos últimos 14 días</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {rep.transaccionesPorDia.map((d: any) => (
                <div key={d.fecha} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-sky-500 rounded-t" style={{ height: `${Math.max(2, (d.total / Math.max(...rep.transaccionesPorDia.map((x: any) => x.total))) * 100)}%` }} />
                  <span className="text-[9px] text-muted-foreground">{d.fecha.slice(5)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Consumos por tipo</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {rep.consumosPorTipo.length === 0 && <p className="text-sm text-muted-foreground">Sin datos</p>}
            {rep.consumosPorTipo.map((c: any) => (
              <div key={c.tipo} className="flex items-center justify-between text-sm">
                <span>{c.tipo}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-slate-700" style={{ width: `${(c.total / Math.max(1, ...rep.consumosPorTipo.map((x: any) => x.total))) * 100}%` }} /></div>
                  <span className="font-medium w-6 text-right">{c.total}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-sm">Clientes frecuentes</CardTitle></CardHeader>
        <CardContent>
          {rep.clientesFrecuentes.length === 0 ? <p className="text-sm text-muted-foreground">Sin datos</p> : (
            <div className="space-y-1">
              {rep.clientesFrecuentes.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                  <span className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">{i + 1}</span> {c.nombre}</span>
                  <span className="text-muted-foreground">{c.visitas} visitas</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ClientesManager({ empresaId }: { empresaId: string }) {
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
    api.get<{ clientes: Cliente[] }>(`/api/clientes?empresaId=${empresaId}${q ? `&q=${q}` : ""}`).then((r) => setClientes(r.clientes)).catch(() => showToast("Error al cargar clientes", "error")).finally(() => setLoading(false));
  }, [empresaId, q, showToast]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);

  return (
    <div>
      <SectionHeader title="Clientes" description="Gestiona los clientes de tu empresa" action={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Nuevo cliente</Button>} />
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre, email, teléfono..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
      </div>
      {loading ? <p className="text-muted-foreground">Cargando...</p> : clientes.length === 0 ? (
        <EmptyState title="Sin clientes" description="Crea el primer cliente de tu empresa" icon={<Users className="h-10 w-10" />} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition cursor-pointer" >
              <CardContent className="p-4" onClick={() => { setSelected(c); setDetailOpen(true); }}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.nombre}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.email || c.telefono || "Sin contacto"}</p>
                  </div>
                  <EstadoBadge estado={c.estado} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.estrategias?.slice(0, 2).map((e) => <TipoEstrategiaBadge key={e.id} tipo={e.estrategia.tipoEstrategia} />)}
                  {c.qrTokens && c.qrTokens[0] && <span className="inline-flex items-center gap-0.5 text-xs text-slate-500"><QrCode className="h-3 w-3" /> QR</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {open && tipo && <ClienteForm empresaId={empresaId} tipo={tipo} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
      {detailOpen && selected && <ClienteDetail cliente={selected} empresaId={empresaId} onClose={() => setDetailOpen(false)} />}
    </div>
  );
}

function ClienteForm({ empresaId, tipo, onClose, onSaved }: { empresaId: string; tipo: TipoNegocio; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useStore();
  const [form, setForm] = useState<any>({ nombre: "", telefono: "", email: "", fechaNacimiento: "", crearUsuario: true, password: "", campos: {} });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.nombre) { showToast("Nombre obligatorio", "error"); return; }
    setSaving(true);
    try {
      await api.post("/api/clientes", { ...form, empresaId, tipoNegocioId: tipo.id });
      showToast("Cliente creado", "success");
      onSaved();
    } catch (e) { showToast(e instanceof Error ? e.message : "Error", "error"); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nuevo cliente</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Nombre *</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
          <div><Label>Teléfono</Label><Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Fecha nacimiento</Label><Input type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} /></div>
        </div>
        {tipo.camposDef.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t">
            <p className="col-span-full text-sm font-medium">Datos de {tipo.nombre}</p>
            {tipo.camposDef.map((c) => (
              <div key={c.clave}>
                <Label>{c.etiqueta}{c.requerido ? " *" : ""}</Label>
                {c.tipo === "textarea" ? (
                  <Textarea value={form.campos[c.clave] || ""} onChange={(e) => setForm({ ...form, campos: { ...form.campos, [c.clave]: e.target.value } })} />
                ) : c.tipo === "select" ? (
                  <Select value={form.campos[c.clave] || ""} onValueChange={(v) => setForm({ ...form, campos: { ...form.campos, [c.clave]: v } })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>{(c.opciones ? JSON.parse(c.opciones) : []).map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input type={c.tipo === "number" ? "number" : "text"} value={form.campos[c.clave] || ""} onChange={(e) => setForm({ ...form, campos: { ...form.campos, [c.clave]: e.target.value } })} />
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Switch checked={form.crearUsuario} onCheckedChange={(v) => setForm({ ...form, crearUsuario: v })} />
          <Label>Crear cuenta de acceso para el cliente (requiere email)</Label>
        </div>
        {form.crearUsuario && <div><Label>Contraseña temporal</Label><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Se genera una si se deja vacío" /></div>}
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Crear cliente"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClienteDetail({ cliente, empresaId, onClose }: { cliente: Cliente; empresaId: string; onClose: () => void }) {
  const { showToast } = useStore();
  const [estrategias, setEstrategias] = useState<Estrategia[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  useEffect(() => {
    api.get<{ estrategias: Estrategia[] }>(`/api/estrategias?empresaId=${empresaId}`).then((r) => setEstrategias(r.estrategias)).catch(() => {});
  }, [empresaId]);
  async function asignar(estrategiaId: string) {
    try {
      await api.post("/api/cliente-estrategias", { clienteId: cliente.id, estrategiaId });
      showToast("Estrategia asignada", "success");
      setAssignOpen(false);
    } catch (e) { showToast(e instanceof Error ? e.message : "Error", "error"); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{cliente.nombre}</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <p><span className="text-muted-foreground">Email:</span> {cliente.email || "—"}</p>
            <p><span className="text-muted-foreground">Tel:</span> {cliente.telefono || "—"}</p>
            <p><span className="text-muted-foreground">Estado:</span> <EstadoBadge estado={cliente.estado} /></p>
            <p><span className="text-muted-foreground">Registro:</span> {fmtFecha(cliente.fechaNacimiento)}</p>
          </div>
          {cliente.camposDinamicos && cliente.camposDinamicos.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-3">
              {cliente.camposDinamicos.map((c) => <p key={c.id}><span className="text-muted-foreground capitalize">{c.clave}:</span> {c.valor}</p>)}
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Estrategias</p>
              <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}><Plus className="mr-1 h-3 w-3" /> Asignar</Button>
            </div>
            <div className="space-y-1.5">
              {cliente.estrategias?.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                  <div><p className="font-medium">{e.estrategia.nombre}</p><p className="text-xs text-muted-foreground">{e.estrategia.tipoEstrategia}</p></div>
                  <div className="flex items-center gap-2"><EstadoBadge estado={e.estado} /></div>
                </div>
              )) || <p className="text-muted-foreground text-xs">Sin estrategias</p>}
            </div>
          </div>
          {cliente.qrTokens && cliente.qrTokens[0] && (
            <div className="bg-slate-900 text-white rounded-lg p-3 font-mono text-xs break-all">{cliente.qrTokens[0].token}</div>
          )}
        </div>
        {assignOpen && (
          <div className="border-t pt-3 space-y-1.5">
            <p className="text-sm font-medium">Asignar estrategia:</p>
            {estrategias.filter((e) => !cliente.estrategias?.some((ce) => ce.estrategiaId === e.id)).map((e) => (
              <button key={e.id} onClick={() => asignar(e.id)} className="w-full text-left rounded-lg border p-2 hover:bg-slate-50 text-sm">
                <span className="font-medium">{e.nombre}</span> <span className="text-xs text-muted-foreground">· {e.tipoEstrategia}</span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EstrategiasManager({ empresaId }: { empresaId: string }) {
  const { showToast } = useStore();
  const tipo = useEmpresaTipo(empresaId);
  const [estrategias, setEstrategias] = useState<Estrategia[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Estrategia | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get<{ estrategias: Estrategia[] }>(`/api/estrategias?empresaId=${empresaId}`).then((r) => setEstrategias(r.estrategias)).catch(() => showToast("Error", "error")).finally(() => setLoading(false));
  }, [empresaId, showToast]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);

  async function toggle(e: Estrategia) {
    try { await api.patch(`/api/estrategias/${e.id}`, { estado: e.estado === "ACTIVA" ? "INACTIVA" : "ACTIVA" }); load(); showToast("Actualizado", "success"); } catch (err) { showToast(err instanceof Error ? err.message : "Error", "error"); }
  }

  return (
    <div>
      <SectionHeader title="Estrategias de fidelización" description="Crea y administra promociones y membresías" action={<Button onClick={() => { setEdit(null); setOpen(true); }}><Plus className="mr-1.5 h-4 w-4" /> Nueva estrategia</Button>} />
      {loading ? <p className="text-muted-foreground">Cargando...</p> : estrategias.length === 0 ? (
        <EmptyState title="Sin estrategias" description="Crea tu primera estrategia de fidelización" icon={<Sparkles className="h-10 w-10" />} />
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
                    <p className="text-xs text-muted-foreground mt-1">{e.descripcion}</p>
                  </div>
                  <EstadoBadge estado={e.estado} />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {e.requierePago && <span className="font-semibold text-slate-700">{fmtMonto(e.precio)}</span>}
                  {e.duracionDias > 0 && <span>{e.duracionDias} días</span>}
                  {e.tipoEstrategia === "MEMBRESIA" && <span>{e.cantidadUsos} usos</span>}
                  {e.tipoEstrategia === "CONTEO_VISITAS" && <span>Meta: {e.metaVisitas}</span>}
                  {e.tipoEstrategia === "PUNTOS" && <span>+{e.puntosPorConsumo} pts/consumo</span>}
                  {(e.tipoEstrategia === "CUPON" || e.tipoEstrategia === "PROMOCION_TIEMPO") && <span>{e.descuentoPct}% desc.</span>}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEdit(e); setOpen(true); }}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={() => toggle(e)}>{e.estado === "ACTIVA" ? "Desactivar" : "Activar"}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {open && tipo && <EstrategiaForm empresaId={empresaId} tipoId={tipo.id} edit={edit} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
    </div>
  );
}

function EstrategiaForm({ empresaId, tipoId, edit, onClose, onSaved }: { empresaId: string; tipoId: string; edit: Estrategia | null; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useStore();
  const [f, setF] = useState<any>(edit ? { ...edit } : { nombre: "", tipoEstrategia: "MEMBRESIA", descripcion: "", requierePago: false, precio: 0, duracionDias: 30, cantidadUsos: 0, metaVisitas: 0, puntosPorConsumo: 0, puntosPorMonto: 0, descuentoPct: 0, recompensa: "", estado: "ACTIVA" });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!f.nombre) { showToast("Nombre obligatorio", "error"); return; }
    setSaving(true);
    try {
      if (edit) await api.patch(`/api/estrategias/${edit.id}`, f);
      else await api.post("/api/estrategias", { ...f, empresaId, tipoNegocioId: tipoId });
      showToast("Estrategia guardada", "success");
      onSaved();
    } catch (e) { showToast(e instanceof Error ? e.message : "Error", "error"); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{edit ? "Editar estrategia" : "Nueva estrategia"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Nombre *</Label><Input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></div>
          <div><Label>Tipo de estrategia</Label>
            <Select value={f.tipoEstrategia} onValueChange={(v) => setF({ ...f, tipoEstrategia: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TIPOS_ESTRATEGIA.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Estado</Label>
            <Select value={f.estado} onValueChange={(v) => setF({ ...f, estado: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="ACTIVA">Activa</SelectItem><SelectItem value="INACTIVA">Inactiva</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2"><Label>Descripción</Label><Textarea value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} /></div>
          <div className="sm:col-span-2 flex items-center gap-2"><Switch checked={f.requierePago} onCheckedChange={(v) => setF({ ...f, requierePago: v })} /><Label>Requiere pago</Label></div>
          {f.requierePago && <div><Label>Precio (RD$)</Label><Input type="number" value={f.precio} onChange={(e) => setF({ ...f, precio: Number(e.target.value) })} /></div>}
          <div><Label>Duración (días)</Label><Input type="number" value={f.duracionDias} onChange={(e) => setF({ ...f, duracionDias: Number(e.target.value) })} /></div>
          {f.tipoEstrategia === "MEMBRESIA" && <div><Label>Cantidad de usos incluidos</Label><Input type="number" value={f.cantidadUsos} onChange={(e) => setF({ ...f, cantidadUsos: Number(e.target.value) })} /></div>}
          {f.tipoEstrategia === "CONTEO_VISITAS" && <>
            <div><Label>Meta de visitas</Label><Input type="number" value={f.metaVisitas} onChange={(e) => setF({ ...f, metaVisitas: Number(e.target.value) })} /></div>
            <div><Label>Descuento al alcanzar (%)</Label><Input type="number" value={f.descuentoPct} onChange={(e) => setF({ ...f, descuentoPct: Number(e.target.value) })} /></div>
          </>}
          {f.tipoEstrategia === "PUNTOS" && <>
            <div><Label>Puntos por consumo</Label><Input type="number" value={f.puntosPorConsumo} onChange={(e) => setF({ ...f, puntosPorConsumo: Number(e.target.value) })} /></div>
            <div><Label>1 punto por cada RD$</Label><Input type="number" value={f.puntosPorMonto} onChange={(e) => setF({ ...f, puntosPorMonto: Number(e.target.value) })} /></div>
          </>}
          {(f.tipoEstrategia === "CUPON" || f.tipoEstrategia === "PROMOCION_TIEMPO") && <div><Label>Descuento (%)</Label><Input type="number" value={f.descuentoPct} onChange={(e) => setF({ ...f, descuentoPct: Number(e.target.value) })} /></div>}
          {f.tipoEstrategia === "PROMOCION_TIEMPO" && <>
            <div><Label>Inicio</Label><Input type="date" value={f.fechaInicio ? String(f.fechaInicio).slice(0, 10) : ""} onChange={(e) => setF({ ...f, fechaInicio: e.target.value })} /></div>
            <div><Label>Fin</Label><Input type="date" value={f.fechaFin ? String(f.fechaFin).slice(0, 10) : ""} onChange={(e) => setF({ ...f, fechaFin: e.target.value })} /></div>
          </>}
          <div className="sm:col-span-2"><Label>Recompensa (descripción)</Label><Input value={f.recompensa || ""} onChange={(e) => setF({ ...f, recompensa: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PagosManager({ empresaId }: { empresaId: string }) {
  const { showToast } = useStore();
  const [items, setItems] = useState<(ClienteEstrategia & { cliente?: Cliente; estrategia?: Estrategia })[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    api.get<{ clienteEstrategias: any[] }>(`/api/cliente-estrategias?empresaId=${empresaId}&estado=PENDIENTE`).then((r) => setItems(r.clienteEstrategias)).catch(() => {}).finally(() => setLoading(false));
  }, [empresaId]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);
  async function confirmar(id: string) {
    try { await api.post(`/api/cliente-estrategias/${id}/confirmar-pago`, {}); showToast("Pago confirmado y membresía activada", "success"); load(); } catch (e) { showToast(e instanceof Error ? e.message : "Error", "error"); }
  }
  return (
    <div>
      <SectionHeader title="Pagos pendientes" description="Confirma pagos para activar membresías pendientes" />
      {loading ? <p className="text-muted-foreground">Cargando...</p> : items.length === 0 ? (
        <EmptyState title="Sin pagos pendientes" icon={<CheckCircle2 className="h-10 w-10" />} />
      ) : (
        <div className="space-y-3">
          {items.map((ce) => (
            <Card key={ce.id}><CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{ce.cliente?.nombre}</p>
                <p className="text-sm text-muted-foreground">{ce.estrategia?.nombre} · {fmtMonto(ce.estrategia?.precio)}</p>
                <p className="text-xs text-muted-foreground">Solicitado: {fmtFecha(ce.createdAt)}</p>
              </div>
              <Button onClick={() => confirmar(ce.id)}><CheckCircle2 className="mr-1.5 h-4 w-4" /> Confirmar pago</Button>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}

function HistorialManager({ empresaId }: { empresaId: string }) {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get<{ transacciones: Transaccion[] }>(`/api/transacciones?empresaId=${empresaId}&limit=200`).then((r) => setTransacciones(r.transacciones)).catch(() => {}).finally(() => setLoading(false));
  }, [empresaId]);
  return (
    <div>
      <SectionHeader title="Historial de consumos" description="Todas las transacciones registradas" />
      {loading ? <p className="text-muted-foreground">Cargando...</p> : transacciones.length === 0 ? (
        <EmptyState title="Sin transacciones" icon={<History className="h-10 w-10" />} />
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
                      <td className="p-3 text-xs text-muted-foreground">{fmtFechaHora(t.fechaTransaccion)}</td>
                      <td className="p-3 font-medium">{t.cliente?.nombre || "—"}</td>
                      <td className="p-3">{t.tipoConsumo}</td>
                      <td className="p-3 text-xs">{t.beneficioAplicado || "—"}</td>
                      <td className="p-3 text-right">{t.montoConsumo > 0 ? fmtMonto(t.montoConsumo) : "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground">{t.empleado?.nombre || "—"}</td>
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

function IntegracionesManager({ empresaId }: { empresaId: string }) {
  const { showToast } = useStore();
  const [items, setItems] = useState<Integracion[]>([]);
  const [open, setOpen] = useState(false);
  const [logsFor, setLogsFor] = useState<Integracion | null>(null);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get<{ integraciones: Integracion[] }>(`/api/integraciones?empresaId=${empresaId}`).then((r) => setItems(r.integraciones)).catch(() => {}).finally(() => setLoading(false));
  }, [empresaId]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);

  async function viewLogs(integ: Integracion) {
    setLogsFor(integ);
    const r = await api.get<{ logs: IntegrationLog[] }>(`/api/integraciones/${integ.id}/logs?limit=100`);
    setLogs(r.logs);
  }
  async function retry(log: IntegrationLog) {
    try { await api.post(`/api/integration-logs/${log.id}/retry`); showToast("Reintento enviado", "success"); if (logsFor) viewLogs(logsFor); } catch (e) { showToast("Error", "error"); }
  }
  async function toggle(integ: Integracion) {
    try { await api.patch(`/api/integraciones/${integ.id}`, { estado: integ.estado === "ACTIVA" ? "INACTIVA" : "ACTIVA" }); load(); } catch (e) { showToast("Error", "error"); }
  }
  async function remove(id: string) {
    try { await api.del(`/api/integraciones/${id}`); showToast("Eliminada", "success"); load(); } catch (e) { showToast("Error", "error"); }
  }

  return (
    <div>
      <SectionHeader title="Integraciones" description="Sincroniza con el sistema externo de tu negocio" action={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Nueva integración</Button>} />
      {loading ? <p className="text-muted-foreground">Cargando...</p> : items.length === 0 ? (
        <EmptyState title="Sin integraciones" description="Configura la sincronización con tu sistema externo" icon={<Plug className="h-10 w-10" />} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((i) => (
            <Card key={i.id}><CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold flex items-center gap-2"><Plug className="h-4 w-4 text-violet-600" /> {TIPOS_INTEGRACION.find((t) => t.value === i.tipoIntegracion)?.label || i.tipoIntegracion}</p>
                  <p className="text-xs text-muted-foreground mt-1">{i.webhookUrl || i.apiUrl || "Sin URL"}</p>
                </div>
                <EstadoBadge estado={i.estado} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(i.eventos ? JSON.parse(i.eventos) : []).map((ev: string) => <span key={ev} className="text-[10px] bg-violet-100 text-violet-700 rounded px-1.5 py-0.5">{EVENTOS_SINCRONIZACION.find((e) => e.value === ev)?.label || ev}</span>)}
              </div>
              {i.ultimaSincronizacion && <p className="text-xs text-muted-foreground mt-2">Última sync: {fmtFechaHora(i.ultimaSincronizacion)}</p>}
              <div className="mt-3 flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => viewLogs(i)}>Ver logs ({i._count?.logs || 0})</Button>
                <Button size="sm" variant="ghost" onClick={() => toggle(i)}>{i.estado === "ACTIVA" ? "Pausar" : "Activar"}</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(i.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      {open && <IntegracionForm empresaId={empresaId} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
      {logsFor && (
        <Dialog open onOpenChange={(o) => !o && setLogsFor(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Logs de sincronización</DialogTitle></DialogHeader>
            <div className="space-y-2">
              {logs.length === 0 && <p className="text-sm text-muted-foreground">Sin logs</p>}
              {logs.map((l) => (
                <div key={l.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{l.evento}</span>
                    <div className="flex items-center gap-2"><EstadoBadge estado={l.estado} />{l.estado === "ERROR" && <Button size="sm" variant="ghost" onClick={() => retry(l)}><RotateCcw className="h-3 w-3" /></Button>}</div>
                  </div>
                  <p className="text-xs text-muted-foreground">{fmtFechaHora(l.createdAt)}</p>
                  {l.error && <p className="text-xs text-red-600 mt-1">{l.error}</p>}
                  {l.respuesta && <pre className="text-[10px] bg-slate-50 p-2 rounded mt-1 overflow-x-auto max-h-24">{l.respuesta}</pre>}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function IntegracionForm({ empresaId, onClose, onSaved }: { empresaId: string; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useStore();
  const [f, setF] = useState<any>({ tipoIntegracion: "WEBHOOK", apiUrl: "", webhookUrl: "", apiKey: "", tokenSecreto: "", eventos: [] });
  const [saving, setSaving] = useState(false);
  function toggleEv(ev: string) { setF({ ...f, eventos: f.eventos.includes(ev) ? f.eventos.filter((e: string) => e !== ev) : [...f.eventos, ev] }); }
  async function save() {
    setSaving(true);
    try { await api.post("/api/integraciones", { ...f, empresaId }); showToast("Integración creada", "success"); onSaved(); } catch (e) { showToast(e instanceof Error ? e.message : "Error", "error"); } finally { setSaving(false); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nueva integración</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Tipo</Label><Select value={f.tipoIntegracion} onValueChange={(v) => setF({ ...f, tipoIntegracion: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIPOS_INTEGRACION.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
          {(f.tipoIntegracion === "WEBHOOK") && <div><Label>Webhook URL</Label><Input value={f.webhookUrl} onChange={(e) => setF({ ...f, webhookUrl: e.target.value })} placeholder="https://..." /></div>}
          {(f.tipoIntegracion === "API_REST") && <div><Label>API URL</Label><Input value={f.apiUrl} onChange={(e) => setF({ ...f, apiUrl: e.target.value })} placeholder="https://..." /></div>}
          <div><Label>API Key</Label><Input value={f.apiKey} onChange={(e) => setF({ ...f, apiKey: e.target.value })} /></div>
          <div><Label>Token secreto</Label><Input value={f.tokenSecreto} onChange={(e) => setF({ ...f, tokenSecreto: e.target.value })} /></div>
          <div>
            <Label>Eventos a sincronizar</Label>
            <div className="grid grid-cols-2 gap-1.5 mt-1 max-h-48 overflow-y-auto">
              {EVENTOS_SINCRONIZACION.map((e) => (
                <label key={e.value} className="flex items-center gap-2 text-sm rounded border p-1.5 cursor-pointer">
                  <input type="checkbox" checked={f.eventos.includes(e.value)} onChange={() => toggleEv(e.value)} /> {e.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReportesEmpresa({ empresaId }: { empresaId: string }) {
  const [rep, setRep] = useState<any>(null);
  useEffect(() => { api.get(`/api/reportes?tipo=empresa&empresaId=${empresaId}`).then(setRep).catch(() => {}); }, [empresaId]);
  if (!rep) return <p className="text-muted-foreground">Cargando...</p>;
  return <EmpresaDashboard empresaId={empresaId} />;
}
