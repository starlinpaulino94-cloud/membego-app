"use client";
import { cn } from "@/lib/utils";
import { ESTADO_LABEL, ESTADO_COLOR, TIPOS_ESTRATEGIA } from "@/lib/constants";
import { Card } from "@/components/ui/card";

export function EstadoBadge({ estado }: { estado: string }) {
  const label = ESTADO_LABEL[estado] || estado;
  const color = ESTADO_COLOR[estado] || "bg-zinc-100 text-zinc-600 border-zinc-200";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", color)}>
      {label}
    </span>
  );
}

export function TipoEstrategiaBadge({ tipo }: { tipo: string }) {
  const t = TIPOS_ESTRATEGIA.find((x) => x.value === tipo);
  const colores: Record<string, string> = {
    MEMBRESIA: "bg-sky-100 text-sky-700 border-sky-200",
    CONTEO_VISITAS: "bg-violet-100 text-violet-700 border-violet-200",
    PUNTOS: "bg-amber-100 text-amber-700 border-amber-200",
    CUPON: "bg-pink-100 text-pink-700 border-pink-200",
    PROMOCION_TIEMPO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", colores[tipo] || "bg-zinc-100 text-zinc-700")}>
      {t?.label || tipo}
    </span>
  );
}

export function RolBadge({ rol }: { rol: string }) {
  const labels: Record<string, string> = {
    SUPERADMIN: "Superadmin",
    ADMIN_EMPRESA: "Admin Empresa",
    EMPLEADO: "Empleado",
    CLIENTE: "Cliente",
  };
  const colores: Record<string, string> = {
    SUPERADMIN: "bg-slate-800 text-white border-slate-900",
    ADMIN_EMPRESA: "bg-sky-100 text-sky-700 border-sky-200",
    EMPLEADO: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CLIENTE: "bg-violet-100 text-violet-700 border-violet-200",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", colores[rol] || "bg-zinc-100")}>
      {labels[rol] || rol}
    </span>
  );
}

export function StatCard({
  label, value, icon, accent = "text-sky-600 bg-sky-50",
}: { label: string; value: string | number; icon?: React.ReactNode; accent?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", accent)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
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

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
    </div>
  );
}
