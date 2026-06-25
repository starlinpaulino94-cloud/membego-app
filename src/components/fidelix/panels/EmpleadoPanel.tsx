"use client";
import { useStore, type AdminSection } from "../store";
import { EmptyState } from "../shared";
import { Building2 } from "lucide-react";
import { ScannerFlow } from "./ScannerFlow";
import { UsosManager } from "./EmpresaPanel";

export function EmpleadoPanel({ section }: { section: AdminSection }) {
  const { user } = useStore();
  if (!user) return null;

  if (!user.empresaId) {
    return (
      <EmptyState
        title="Sin empresa asignada"
        description="Tu usuario no tiene una empresa asociada. Contacta al administrador."
        icon={<Building2 className="h-10 w-10" />}
      />
    );
  }

  if (section === "escanear") return <ScannerFlow />;
  // Usos registrados por este empleado
  return (
    <UsosManager empresaId={user.empresaId} empleadoId={user.id} />
  );
}
