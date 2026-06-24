"use client";
import { useEffect, useState, useCallback } from "react";
import { useStore, fmtFecha, fmtMonto, type AppSection } from "../store";
import { api, type Empresa, type TipoNegocio, type Transaccion } from "../api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeader, EstadoBadge, StatCard, EmptyState, RolBadge } from "../shared";
import { Building2, Boxes, Users, BarChart3, Plus, Trash2, Building, CheckCircle2, TrendingUp, Car, UtensilsCrossed } from "lucide-react";

export function SuperadminPanel({ section }: { section: AppSection }) {
  if (section === "empresas") return <EmpresasManager />;
  if (section === "tipos") return <TiposManager />;
  if (section === "usuarios") return <UsuariosManager />;
  if (section === "reportes") return <ReportesGlobal />;
  return <SuperadminDashboard />;
}

function SuperadminDashboard() {
  const [rep, setRep] = useState<any>(null);
  useEffect(() => { api.get(`/api/reportes?tipo=general`).then(setRep).catch(() => {}); }, []);
  if (!rep) return <p className="text-muted-foreground">Cargando...</p>;
  return (
    <div>
      <SectionHeader title="Dashboard global" description="Vista general de la plataforma FIDELIX QR" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Empresas totales" value={rep.totalEmpresas} icon={<Building2 className="h-5 w-5" />} accent="text-sky-600 bg-sky-50" />
        <StatCard label="Empresas activas" value={rep.empresasActivas} icon={<CheckCircle2 className="h-5 w-5" />} accent="text-emerald-600 bg-emerald-50" />
        <StatCard label="Clientes totales" value={rep.totalClientes} icon={<Users className="h-5 w-5" />} accent="text-violet-600 bg-violet-50" />
        <StatCard label="Transacciones totales" value={rep.totalTransacciones} icon={<TrendingUp className="h-5 w-5" />} accent="text-amber-600 bg-amber-50" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Tipos de negocio</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {rep.tiposNegocio.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">{t.nombre === "Carwash" ? <Car className="h-4 w-4 text-sky-600" /> : <UtensilsCrossed className="h-4 w-4 text-orange-600" />}{t.nombre}</span>
                <span className="text-muted-foreground text-xs">{t.empresas} empresas · {t.clientes} clientes</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Transacciones por tipo de negocio</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {rep.transaccionesPorTipo.map((t: any) => (
              <div key={t.tipo} className="flex items-center justify-between text-sm">
                <span>{t.tipo}</span><span className="font-medium">{t.total}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-sm">Estrategias más usadas</CardTitle></CardHeader>
        <CardContent>
          {rep.estrategiasMasUsadas.length === 0 ? <p className="text-sm text-muted-foreground">Sin datos</p> : (
            <div className="space-y-1">
              {rep.estrategiasMasUsadas.map((e: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                  <span><span className="text-muted-foreground">{i + 1}.</span> {e.nombre} <span className="text-xs text-muted-foreground">({e.empresa})</span></span>
                  <span className="font-medium">{e.total}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmpresasManager() {
  const { showToast } = useStore();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [tipos, setTipos] = useState<TipoNegocio[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Empresa | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get<{ empresas: Empresa[] }>("/api/empresas").then((r) => setEmpresas(r.empresas)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);
  useEffect(() => { api.get<{ tipos: TipoNegocio[] }>("/api/tipos-negocio").then((r) => setTipos(r.tipos)).catch(() => {}); }, []);

  async function toggle(e: Empresa) {
    try { await api.patch(`/api/empresas/${e.id}`, { estado: e.estado === "ACTIVA" ? "INACTIVA" : "ACTIVA" }); load(); } catch (err) { showToast("Error", "error"); }
  }
  async function remove(id: string) {
    if (!confirm("¿Desactivar esta empresa?")) return;
    try { await api.del(`/api/empresas/${id}`); showToast("Empresa desactivada", "success"); load(); } catch (e) { showToast("Error", "error"); }
  }

  return (
    <div>
      <SectionHeader title="Empresas" description="Administra las empresas de la plataforma" action={<Button onClick={() => { setEdit(null); setOpen(true); }}><Plus className="mr-1.5 h-4 w-4" /> Nueva empresa</Button>} />
      {loading ? <p className="text-muted-foreground">Cargando...</p> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {empresas.map((e) => (
            <Card key={e.id}><CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100"><Building className="h-4 w-4" /></div>
                  <div><p className="font-semibold">{e.nombre}</p><p className="text-xs text-muted-foreground">{e.tipoNegocio?.nombre}</p></div>
                </div>
                <EstadoBadge estado={e.estado} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{e.direccion} · {e.telefono}</p>
              <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                <span>{e._count?.clientes || 0} clientes</span>
                <span>{e._count?.estrategias || 0} estrategias</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEdit(e); setOpen(true); }}>Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => toggle(e)}>{e.estado === "ACTIVA" ? "Desactivar" : "Activar"}</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      {open && <EmpresaForm tipos={tipos} edit={edit} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
    </div>
  );
}

function EmpresaForm({ tipos, edit, onClose, onSaved }: { tipos: TipoNegocio[]; edit: Empresa | null; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useStore();
  const [f, setF] = useState<any>(edit ? { nombre: edit.nombre, tipoNegocioId: edit.tipoNegocioId, telefono: edit.telefono, direccion: edit.direccion, logo: edit.logo, estado: edit.estado } : { nombre: "", tipoNegocioId: "", telefono: "", direccion: "", logo: "", estado: "ACTIVA" });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.nombre || !f.tipoNegocioId) { showToast("Nombre y tipo son obligatorios", "error"); return; }
    setSaving(true);
    try {
      if (edit) await api.patch(`/api/empresas/${edit.id}`, f);
      else await api.post("/api/empresas", f);
      showToast("Empresa guardada", "success"); onSaved();
    } catch (e) { showToast(e instanceof Error ? e.message : "Error", "error"); } finally { setSaving(false); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{edit ? "Editar empresa" : "Nueva empresa"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nombre *</Label><Input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></div>
          <div><Label>Tipo de negocio *</Label>
            <Select value={f.tipoNegocioId} onValueChange={(v) => setF({ ...f, tipoNegocioId: v })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>{tipos.map((t) => <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Teléfono</Label><Input value={f.telefono || ""} onChange={(e) => setF({ ...f, telefono: e.target.value })} /></div>
          <div><Label>Dirección</Label><Input value={f.direccion || ""} onChange={(e) => setF({ ...f, direccion: e.target.value })} /></div>
          <div><Label>Estado</Label><Select value={f.estado} onValueChange={(v) => setF({ ...f, estado: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVA">Activa</SelectItem><SelectItem value="INACTIVA">Inactiva</SelectItem><SelectItem value="SUSPENDIDA">Suspendida</SelectItem></SelectContent></Select></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TiposManager() {
  const [tipos, setTipos] = useState<TipoNegocio[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get<{ tipos: TipoNegocio[] }>("/api/tipos-negocio").then((r) => setTipos(r.tipos)).catch(() => {}).finally(() => setLoading(false)); }, []);
  return (
    <div>
      <SectionHeader title="Tipos de negocio" description="Categorías de empresas soportadas por la plataforma" />
      {loading ? <p className="text-muted-foreground">Cargando...</p> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {tipos.map((t) => (
            <Card key={t.id}><CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: (t.color || "#0ea5e9") + "22", color: t.color || "#0ea5e9" }}>
                  {t.icono === "Car" ? <Car className="h-6 w-6" /> : t.icono === "UtensilsCrossed" ? <UtensilsCrossed className="h-6 w-6" /> : <Boxes className="h-6 w-6" />}
                </div>
                <div><p className="font-semibold">{t.nombre}</p><p className="text-xs text-muted-foreground">{t.descripcion}</p></div>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Campos personalizados:</p>
                <div className="flex flex-wrap gap-1">
                  {t.camposDef.map((c) => <span key={c.id} className="text-xs bg-slate-100 rounded px-2 py-0.5">{c.etiqueta}{c.requerido ? " *" : ""}</span>)}
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}

function UsuariosManager() {
  const { showToast } = useStore();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [empresaFilter, setEmpresaFilter] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api.get<{ usuarios: any[] }>(`/api/usuarios${empresaFilter ? `?empresaId=${empresaFilter}` : ""}`).then((r) => setUsuarios(r.usuarios)).catch(() => {}).finally(() => setLoading(false));
  }, [empresaFilter]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);
  useEffect(() => { api.get<{ empresas: Empresa[] }>("/api/empresas").then((r) => setEmpresas(r.empresas)).catch(() => {}); }, []);

  return (
    <div>
      <SectionHeader title="Usuarios" description="Admins de empresa y empleados" action={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Nuevo usuario</Button>} />
      <div className="mb-4 max-w-xs">
        <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
          <SelectTrigger><SelectValue placeholder="Todas las empresas" /></SelectTrigger>
          <SelectContent><SelectItem value="">Todas las empresas</SelectItem>{empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {loading ? <p className="text-muted-foreground">Cargando...</p> : usuarios.length === 0 ? (
        <EmptyState title="Sin usuarios" icon={<Users className="h-10 w-10" />} />
      ) : (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b"><tr><th className="text-left p-3 font-medium">Nombre</th><th className="text-left p-3 font-medium">Email</th><th className="text-left p-3 font-medium">Rol</th><th className="text-left p-3 font-medium">Empresa</th></tr></thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-3 font-medium">{u.nombre}</td><td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3"><RolBadge rol={u.rol} /></td>
                    <td className="p-3 text-muted-foreground">{u.empresa?.nombre || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}
      {open && <UsuarioForm empresas={empresas} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); showToast("Usuario creado", "success"); }} />}
    </div>
  );
}

function UsuarioForm({ empresas, onClose, onSaved }: { empresas: Empresa[]; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useStore();
  const [f, setF] = useState<any>({ nombre: "", email: "", password: "", telefono: "", rol: "EMPLEADO", empresaId: "" });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.nombre || !f.email || !f.password || !f.empresaId) { showToast("Completa todos los campos", "error"); return; }
    setSaving(true);
    try { await api.post("/api/usuarios", f); onSaved(); } catch (e) { showToast(e instanceof Error ? e.message : "Error", "error"); } finally { setSaving(false); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nuevo usuario</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nombre</Label><Input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><Label>Contraseña</Label><Input type="text" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          <div><Label>Teléfono</Label><Input value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} /></div>
          <div><Label>Rol</Label><Select value={f.rol} onValueChange={(v) => setF({ ...f, rol: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ADMIN_EMPRESA">Admin Empresa</SelectItem><SelectItem value="EMPLEADO">Empleado</SelectItem></SelectContent></Select></div>
          <div><Label>Empresa</Label><Select value={f.empresaId} onValueChange={(v) => setF({ ...f, empresaId: v })}><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent>{empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReportesGlobal() {
  const [rep, setRep] = useState<any>(null);
  useEffect(() => { api.get(`/api/reportes?tipo=general`).then(setRep).catch(() => {}); }, []);
  if (!rep) return <p className="text-muted-foreground">Cargando...</p>;
  return (
    <div>
      <SectionHeader title="Reportes globales" description="Métricas de toda la plataforma" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Empresas" value={rep.totalEmpresas} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label="Activas" value={rep.empresasActivas} icon={<CheckCircle2 className="h-5 w-5" />} accent="text-emerald-600 bg-emerald-50" />
        <StatCard label="Clientes" value={rep.totalClientes} icon={<Users className="h-5 w-5" />} accent="text-violet-600 bg-violet-50" />
        <StatCard label="Transacciones" value={rep.totalTransacciones} icon={<TrendingUp className="h-5 w-5" />} accent="text-amber-600 bg-amber-50" />
      </div>
      <Card className="mt-4">
        <CardHeader><CardTitle className="text-sm">Transacciones últimos 14 días</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {rep.transaccionesPorDia.map((d: any) => (
              <div key={d.fecha} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-sky-500 rounded-t" style={{ height: `${Math.max(2, (d.total / Math.max(1, ...rep.transaccionesPorDia.map((x: any) => x.total))) * 100)}%` }} />
                <span className="text-[9px] text-muted-foreground">{d.fecha.slice(5)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-sm">Por tipo de negocio</CardTitle></CardHeader><CardContent className="space-y-2">
          {rep.transaccionesPorTipo.map((t: any) => <div key={t.tipo} className="flex justify-between text-sm"><span>{t.tipo}</span><span className="font-medium">{t.total}</span></div>)}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Estrategias más usadas</CardTitle></CardHeader><CardContent className="space-y-2">
          {rep.estrategiasMasUsadas.map((e: any, i: number) => <div key={i} className="flex justify-between text-sm"><span>{e.nombre}</span><span className="font-medium">{e.total}</span></div>)}
        </CardContent></Card>
      </div>
    </div>
  );
}
