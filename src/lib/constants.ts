// Tipos y constantes compartidas de FIDELIX QR

export type Rol = "SUPERADMIN" | "ADMIN_EMPRESA" | "EMPLEADO" | "CLIENTE";

export const ROLES: Rol[] = ["SUPERADMIN", "ADMIN_EMPRESA", "EMPLEADO", "CLIENTE"];

export const ROL_LABEL: Record<Rol, string> = {
  SUPERADMIN: "Superadmin",
  ADMIN_EMPRESA: "Admin Empresa",
  EMPLEADO: "Empleado",
  CLIENTE: "Cliente",
};

export type TipoEstrategia =
  | "MEMBRESIA"
  | "CONTEO_VISITAS"
  | "PUNTOS"
  | "CUPON"
  | "PROMOCION_TIEMPO";

export const TIPOS_ESTRATEGIA: { value: TipoEstrategia; label: string; descripcion: string }[] = [
  { value: "MEMBRESIA", label: "Membresía", descripcion: "Plan mensual con usos incluidos (ej. 4 lavados al mes)" },
  { value: "CONTEO_VISITAS", label: "Conteo de visitas", descripcion: "Lava/compra N veces y la siguiente es gratis o con descuento" },
  { value: "PUNTOS", label: "Programa de puntos", descripcion: "Acumula puntos por consumo, canjeables por recompensas" },
  { value: "CUPON", label: "Cupón digital", descripcion: "Descuento directo en próxima compra" },
  { value: "PROMOCION_TIEMPO", label: "Promoción por tiempo", descripcion: "Descuento válido en un rango de fechas" },
];

export type TipoIntegracion = "API_REST" | "WEBHOOK" | "CSV" | "MANUAL";

export const TIPOS_INTEGRACION: { value: TipoIntegracion; label: string }[] = [
  { value: "API_REST", label: "API REST" },
  { value: "WEBHOOK", label: "Webhook" },
  { value: "CSV", label: "Importación/Exportación CSV" },
  { value: "MANUAL", label: "Manual" },
];

export const EVENTOS_SINCRONIZACION: { value: string; label: string }[] = [
  { value: "CLIENTE_CREADO", label: "Cliente creado" },
  { value: "CLIENTE_ACTUALIZADO", label: "Cliente actualizado" },
  { value: "QR_GENERADO", label: "QR generado" },
  { value: "MEMBRESIA_ACTIVADA", label: "Membresía activada" },
  { value: "BENEFICIO_USADO", label: "Beneficio usado" },
  { value: "VISITA_REGISTRADA", label: "Visita registrada" },
  { value: "PAGO_CONFIRMADO", label: "Pago confirmado" },
  { value: "ESTRATEGIA_RENOVADA", label: "Estrategia renovada" },
  { value: "ESTRATEGIA_VENCIDA", label: "Estrategia vencida" },
];

// Servicios/consumos por tipo de negocio
export const SERVICIOS_NEGOCIO: Record<string, string[]> = {
  carwash: ["Lavado básico", "Lavado premium", "Lavado especial", "Detallado", "Otro"],
  restaurante: ["Desayuno", "Almuerzo", "Cena", "Combo", "Bebida", "Otro"],
};

export const ESTADO_LABEL: Record<string, string> = {
  ACTIVA: "Activa",
  ACTIVO: "Activo",
  INACTIVA: "Inactiva",
  INACTIVO: "Inactivo",
  SUSPENDIDA: "Suspendida",
  PENDIENTE: "Pendiente",
  VENCIDA: "Vencida",
  CANCELADA: "Cancelada",
  EXITOSO: "Exitoso",
  ERROR: "Error",
};

export const ESTADO_COLOR: Record<string, string> = {
  ACTIVA: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ACTIVO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIVA: "bg-zinc-100 text-zinc-600 border-zinc-200",
  INACTIVO: "bg-zinc-100 text-zinc-600 border-zinc-200",
  SUSPENDIDA: "bg-red-100 text-red-700 border-red-200",
  PENDIENTE: "bg-amber-100 text-amber-700 border-amber-200",
  VENCIDA: "bg-red-100 text-red-700 border-red-200",
  CANCELADA: "bg-zinc-100 text-zinc-600 border-zinc-200",
  EXITOSO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ERROR: "bg-red-100 text-red-700 border-red-200",
};
