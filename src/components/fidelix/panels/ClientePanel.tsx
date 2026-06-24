"use client";
import { useEffect, useState } from "react";
import { useStore, fmtMonto, fmtFecha, fmtFechaHora, type AppSection } from "../store";
import { api, type Cliente, type Transaccion, type Estrategia } from "../api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrDisplay, QrScanner, ManualTokenInput } from "../QrComponents";
import { SectionHeader, EstadoBadge, TipoEstrategiaBadge, StatCard, EmptyState } from "../shared";
import { QrCode, Building2, Calendar, Coins, Gift, History, Plus, Sparkles, User, ScanLine, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScanResult, ClienteEstrategia } from "../api-client";

export function ClientePanel({ section }: { section: AppSection }) {
  const { user, showToast, setView } = useStore();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get<{ clientes: Cliente[] }>("/api/clientes").then((r) => {
      setClientes(r.clientes);
      if (!selectedId && r.clientes.length) setSelectedId(r.clientes[0].id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  if (section === "historial") return <ClienteHistorial />;
  if (section === "mis-empresas") return <MisEmpresas clientes={clientes} loading={loading} onSelect={(id) => { setSelectedId(id); useStore.getState().setSection("mi-qr"); }} onRegister={() => setView("register")} />;

  // mi-qr
  const selected = clientes.find((c) => c.id === selectedId) || clientes[0];
  if (loading) return <div className="text-muted-foreground">Cargando...</div>;
  if (!selected) {
    return (
      <div>
        <SectionHeader title="Mi QR" description="Aún no estás registrado en ninguna empresa" />
        <EmptyState title="No tienes memberships aún" description="Regístrate en una empresa para obtener tu QR" icon={<QrCode className="h-10 w-10" />} />
        <div className="mt-4 text-center">
          <Button onClick={() => setView("register")}><Plus className="mr-1.5 h-4 w-4" /> Registrarme en una empresa</Button>
        </div>
      </div>
    );
  }

  const qr = selected.qrTokens?.[0];
  const estrategiasActivas = selected.estrategias?.filter((e) => e.estado === "ACTIVA") || [];
  const estrategiaPrincipal = estrategiasActivas[0];

  return (
    <div>
      <SectionHeader title="Mi QR" description="Presenta este código en el negocio para tus beneficios" />

      {clientes.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {clientes.map((c) => (
            <button key={c.id} onClick={() => setSelectedId(c.id)} className={cn("shrink-0 rounded-lg border-2 px-3 py-1.5 text-sm", selectedId === c.id ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white")}>
              {c.empresa?.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> {selected.empresa?.nombre}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {qr ? <QrDisplay token={qr.token} label="Código QR único" /> : <p className="text-sm text-muted-foreground">Sin QR asignado</p>}
            <div className="mt-4 w-full rounded-lg bg-slate-50 p-3 text-sm">
              <p><span className="text-muted-foreground">Tipo:</span> {selected.tipoNegocio?.nombre}</p>
              <p><span className="text-muted-foreground">Cliente:</span> {selected.nombre}</p>
              {selected.camposDinamicos?.map((c) => (
                <p key={c.id}><span className="text-muted-foreground">{c.clave}:</span> {c.valor}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {estrategiaPrincipal ? (
            <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-white">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-sky-600" /> Estrategia activa</span>
                  <TipoEstrategiaBadge tipo={estrategiaPrincipal.estrategia.tipoEstrategia} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold">{estrategiaPrincipal.estrategia.nombre}</p>
                  <p className="text-sm text-muted-foreground">{estrategiaPrincipal.estrategia.descripcion}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {estrategiaPrincipal.estrategia.tipoEstrategia === "MEMBRESIA" && (
                    <>
                      <div className="rounded-lg bg-white p-2 border"><p className="text-xs text-muted-foreground">Usos disponibles</p><p className="text-lg font-bold text-emerald-600">{estrategiaPrincipal.usosDisponibles}</p></div>
                      <div className="rounded-lg bg-white p-2 border"><p className="text-xs text-muted-foreground">Usos consumidos</p><p className="text-lg font-bold">{estrategiaPrincipal.usosConsumidos}</p></div>
                    </>
                  )}
                  {estrategiaPrincipal.estrategia.tipoEstrategia === "CONTEO_VISITAS" && (
                    <div className="col-span-2 rounded-lg bg-white p-3 border">
                      <p className="text-xs text-muted-foreground">Progreso hacia recompensa</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-violet-500" style={{ width: `${Math.min(100, (estrategiaPrincipal.visitasAcumuladas / estrategiaPrincipal.estrategia.metaVisitas) * 100)}%` }} />
                        </div>
                        <span className="text-sm font-medium">{estrategiaPrincipal.visitasAcumuladas}/{estrategiaPrincipal.estrategia.metaVisitas}</span>
                      </div>
                    </div>
                  )}
                  {estrategiaPrincipal.estrategia.tipoEstrategia === "PUNTOS" && (
                    <div className="col-span-2 rounded-lg bg-white p-3 border flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Puntos acumulados</span>
                      <span className="text-2xl font-bold text-amber-600 flex items-center gap-1"><Coins className="h-5 w-5" />{estrategiaPrincipal.puntosAcumulados.toFixed(0)}</span>
                    </div>
                  )}
                  {estrategiaPrincipal.estrategia.tipoEstrategia === "CUPON" && (
                    <div className="col-span-2 rounded-lg bg-white p-3 border"><p className="text-xs text-muted-foreground">Descuento disponible</p><p className="text-lg font-bold text-pink-600">{estrategiaPrincipal.estrategia.descuentoPct}%</p></div>
                  )}
                  {estrategiaPrincipal.estrategia.tipoEstrategia === "PROMOCION_TIEMPO" && (
                    <div className="col-span-2 rounded-lg bg-white p-3 border"><p className="text-xs text-muted-foreground">Descuento vigente</p><p className="text-lg font-bold text-emerald-600">{estrategiaPrincipal.estrategia.descuentoPct}%</p></div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Vence: {fmtFecha(estrategiaPrincipal.fechaVencimiento)}</span>
                  <EstadoBadge estado={estrategiaPrincipal.estado} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No tienes estrategias activas en esta empresa.</CardContent></Card>
          )}

          {estrategiasActivas.length > 1 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Otras estrategias activas</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {estrategiasActivas.slice(1).map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                    <span>{e.estrategia.nombre}</span>
                    <TipoEstrategiaBadge tipo={e.estrategia.tipoEstrategia} />
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

function ClienteHistorial() {
  const { showToast } = useStore();
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get<{ transacciones: Transaccion[] }>("/api/transacciones").then((r) => setTransacciones(r.transacciones)).catch(() => showToast("Error al cargar historial", "error")).finally(() => setLoading(false));
  }, []);
  return (
    <div>
      <SectionHeader title="Mi historial" description="Tus consumos y beneficios aplicados" />
      {loading ? <p className="text-muted-foreground">Cargando...</p> : transacciones.length === 0 ? (
        <EmptyState title="Sin consumos registrados" icon={<History className="h-10 w-10" />} />
      ) : (
        <div className="space-y-2">
          {transacciones.map((t) => (
            <Card key={t.id}><CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-medium">{t.tipoConsumo} · <span className="text-muted-foreground text-sm">{t.empresa?.nombre || ""}</span></p>
                <p className="text-xs text-muted-foreground">{fmtFechaHora(t.fechaTransaccion)}</p>
                {t.beneficioAplicado && <p className="text-xs text-emerald-600 mt-1">{t.beneficioAplicado}</p>}
              </div>
              <div className="text-right">
                {t.montoConsumo > 0 && <p className="font-semibold">{fmtMonto(t.montoConsumo)}</p>}
                {t.puntosGenerados > 0 && <p className="text-xs text-amber-600">+{t.puntosGenerados} pts</p>}
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MisEmpresas({ clientes, loading, onSelect, onRegister }: { clientes: Cliente[]; loading: boolean; onSelect: (id: string) => void; onRegister: () => void }) {
  return (
    <div>
      <SectionHeader title="Mis empresas" description="Empresas donde estás registrado" action={<Button onClick={onRegister}><Plus className="mr-1.5 h-4 w-4" /> Nueva</Button>} />
      {loading ? <p className="text-muted-foreground">Cargando...</p> : clientes.length === 0 ? (
        <EmptyState title="No estás registrado en ninguna empresa" description="Regístrate para obtener tu QR y beneficios" icon={<Building2 className="h-10 w-10" />} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clientes.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition cursor-pointer" >
              <CardContent className="p-4" onClick={() => onSelect(c.id)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{c.empresa?.nombre}</p>
                    <p className="text-xs text-muted-foreground">{c.tipoNegocio?.nombre} · {c.empresa?.direccion}</p>
                  </div>
                  <EstadoBadge estado={c.estado} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.estrategias?.filter((e) => e.estado === "ACTIVA").map((e) => (
                    <span key={e.id} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs">{e.estrategia.nombre}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
