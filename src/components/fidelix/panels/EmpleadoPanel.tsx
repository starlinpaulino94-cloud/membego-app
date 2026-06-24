"use client";
import { useEffect, useState } from "react";
import { useStore, fmtFechaHora, type AppSection } from "../store";
import { api, type Transaccion } from "../api-client";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader, EmptyState } from "../shared";
import { History } from "lucide-react";
import { ScannerFlow } from "./ScannerFlow";

export function EmpleadoPanel({ section }: { section: AppSection }) {
  const { user } = useStore();
  if (!user) return null;
  if (section === "escanear") return <ScannerFlow />;
  // historial del empleado
  return <EmpleadoHistorial empresaId={user.empresaId!} empleadoId={user.id} />;
}

function EmpleadoHistorial({ empresaId, empleadoId }: { empresaId: string; empleadoId: string }) {
  const { showToast } = useStore();
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get<{ transacciones: Transaccion[] }>(`/api/transacciones?empresaId=${empresaId}&limit=100`).then((r) => {
      setTransacciones(r.transacciones.filter((t) => t.empleado?.id === empleadoId));
    }).catch(() => showToast("Error", "error")).finally(() => setLoading(false));
  }, [empresaId, empleadoId, showToast]);
  return (
    <div>
      <SectionHeader title="Mi historial" description="Consumos que has registrado" />
      {loading ? <p className="text-muted-foreground">Cargando...</p> : transacciones.length === 0 ? (
        <EmptyState title="Sin consumos registrados" description="Escanea un QR para registrar el primero" icon={<History className="h-10 w-10" />} />
      ) : (
        <div className="space-y-2">
          {transacciones.map((t) => (
            <Card key={t.id}><CardContent className="p-3 flex items-center justify-between">
              <div><p className="font-medium text-sm">{t.tipoConsumo} · {t.cliente?.nombre}</p><p className="text-xs text-muted-foreground">{fmtFechaHora(t.fechaTransaccion)}</p>{t.beneficioAplicado && <p className="text-xs text-emerald-600">{t.beneficioAplicado}</p>}</div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
