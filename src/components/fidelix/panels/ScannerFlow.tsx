"use client";
import { useState } from "react";
import { useStore, fmtMonto, fmtFechaHora } from "../store";
import { api, type ScanResult } from "../api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrScanner, ManualTokenInput } from "../QrComponents";
import { SectionHeader, EstadoBadge, TipoEstrategiaBadge, EmptyState } from "../shared";
import { SERVICIOS_NEGOCIO } from "@/lib/constants";
import { ScanLine, CheckCircle2, AlertCircle, User, Sparkles, History, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScannerFlow() {
  const { showToast } = useStore();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scannedToken, setScannedToken] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCE, setSelectedCE] = useState<string | null>(null);
  const [tipoConsumo, setTipoConsumo] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState<{ beneficio: string | null } | null>(null);

  const servicios = result ? SERVICIOS_NEGOCIO[result.cliente.tipoNegocio.slug] || ["Otro"] : [];

  async function handleToken(token: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    setScannedToken(token);
    setConfirmed(null);
    setSelectedCE(null);
    setTipoConsumo("");
    setMonto("");
    try {
      const r = await api.post<{ cliente: ScanResult["cliente"]; estrategias: any[]; historial: any[] }>("/api/qr/scan", { token });
      setResult({ cliente: r.cliente, estrategias: r.estrategias, historial: r.historial });
      const activa = r.estrategias.find((e) => e.estado === "ACTIVA");
      if (activa) setSelectedCE(activa.id);
      showToast("QR validado correctamente", "success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "QR inválido");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    if (!result || !tipoConsumo) { showToast("Selecciona el tipo de consumo", "error"); return; }
    setConfirming(true);
    try {
      const r = await api.post<{ beneficioAplicado: string | null }>("/api/qr/confirm", {
        token: scannedToken,
        clienteEstrategiaId: selectedCE,
        tipoConsumo,
        montoConsumo: monto ? Number(monto) : 0,
      });
      // Necesitamos el token: lo guardamos al escanear. Recuperamos del último scan.
      setConfirmed({ beneficio: r.beneficioAplicado });
      showToast("Uso registrado", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al confirmar", "error");
    } finally {
      setConfirming(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setConfirmed(null);
    setSelectedCE(null);
    setTipoConsumo("");
    setMonto("");
    setScannedToken("");
  }

  if (confirmed) {
    return (
      <div>
        <SectionHeader title="Uso confirmado" />
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-10 flex flex-col items-center text-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 mb-3" />
            <p className="text-lg font-semibold">Transacción registrada</p>
            {confirmed.beneficio && <p className="text-sm text-emerald-700 mt-1">{confirmed.beneficio}</p>}
            <Button className="mt-6" onClick={reset}><RotateCcw className="mr-1.5 h-4 w-4" /> Escanear otro QR</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Escanear QR" description="Valida el QR del cliente y confirma el uso. El escaneo NO consume beneficios." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ScanLine className="h-4 w-4" /> Escáner</CardTitle></CardHeader>
          <CardContent>
            <QrScanner onScan={handleToken} onError={(m) => setError(m)} />
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-1.5">¿Sin cámara? Pega el token manualmente:</p>
              <ManualTokenInput onSubmit={handleToken} />
            </div>
          </CardContent>
        </Card>

        <div>
          {loading && <Card><CardContent className="py-10 text-center text-muted-foreground">Validando QR...</CardContent></Card>}
          {error && (
            <Card className="border-red-200 bg-red-50"><CardContent className="py-6 flex items-center gap-3 text-red-700">
              <AlertCircle className="h-6 w-6 shrink-0" /><p className="text-sm">{error}</p>
            </CardContent></Card>
          )}
          {result && (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Cliente</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="font-semibold text-base">{result.cliente.nombre}</p>
                  <p className="text-muted-foreground">{result.cliente.empresa.nombre} · {result.cliente.tipoNegocio.nombre}</p>
                  {result.cliente.telefono && <p>Tel: {result.cliente.telefono}</p>}
                  {result.cliente.email && <p>Email: {result.cliente.email}</p>}
                  <div className="mt-2 pt-2 border-t">
                    {result.cliente.camposDinamicos.map((c) => (
                      <p key={c.id}><span className="text-muted-foreground capitalize">{c.clave}:</span> {c.valor}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4" /> Beneficios</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {result.estrategias.length === 0 && <p className="text-sm text-muted-foreground">Sin beneficios asignados.</p>}
                  {result.estrategias.map((e) => (
                    <button key={e.id} onClick={() => e.estado === "ACTIVA" && setSelectedCE(e.id)} disabled={e.estado !== "ACTIVA"}
                      className={cn("w-full text-left rounded-lg border p-3 transition", selectedCE === e.id ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white", e.estado !== "ACTIVA" && "opacity-50 cursor-not-allowed")}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{e.estrategia.nombre}</span>
                        <TipoEstrategiaBadge tipo={e.estrategia.tipoEstrategia} />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <EstadoBadge estado={e.estado} />
                        {e.estrategia.tipoEstrategia === "MEMBRESIA" && <span>Usos: {e.usosDisponibles} disp.</span>}
                        {e.estrategia.tipoEstrategia === "CONTEO_VISITAS" && <span>{e.visitasAcumuladas}/{e.estrategia.metaVisitas}</span>}
                        {e.estrategia.tipoEstrategia === "PUNTOS" && <span>{e.puntosAcumulados.toFixed(0)} pts</span>}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Confirmar uso</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Tipo de consumo *</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {servicios.map((s) => (
                        <button key={s} onClick={() => setTipoConsumo(s)} className={cn("rounded-full border px-3 py-1 text-sm", tipoConsumo === s ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 bg-white")}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Monto consumido (RD$)</Label>
                    <Input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" />
                  </div>
                  <Button className="w-full" onClick={confirm} disabled={confirming || !tipoConsumo}>
                    {confirming ? "Confirmando..." : <><CheckCircle2 className="mr-1.5 h-4 w-4" /> Confirmar uso</>}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Solo al confirmar se descuenta el uso del beneficio.</p>
                </CardContent>
              </Card>

              {result.historial.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" /> Últimos usos</CardTitle></CardHeader>
                  <CardContent className="space-y-1.5 max-h-48 overflow-y-auto">
                    {result.historial.map((t) => (
                      <div key={t.id} className="flex justify-between text-sm border-b last:border-0 pb-1.5 last:pb-0">
                        <div><p>{t.tipoConsumo}</p><p className="text-xs text-muted-foreground">{fmtFechaHora(t.fechaTransaccion)}</p></div>
                        {t.montoConsumo > 0 && <span className="font-medium">{fmtMonto(t.montoConsumo)}</span>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          {!loading && !error && !result && (
            <Card><CardContent className="py-10 text-center text-muted-foreground">Escanea un QR para ver la información del cliente</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
