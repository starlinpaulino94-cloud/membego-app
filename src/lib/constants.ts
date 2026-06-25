// Tipos y constantes compartidas — Pase Digital QR

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
  | "CUPON"
  | "PUNTOS"
  | "PROMOCION_TIEMPO";

// Tipos de beneficio visibles en la interfaz (fase actual).
// PUNTOS y PROMOCION_TIEMPO se mantienen en el backend para fases futuras pero no se muestran.
export const TIPOS_BENEFICIO: { value: TipoEstrategia; label: string; descripcion: string }[] = [
  { value: "MEMBRESIA", label: "Membresía por usos", descripcion: "Plan con cantidad de usos incluidos (ej. 4 lavados al mes por RD$999)" },
  { value: "CONTEO_VISITAS", label: "Conteo de visitas", descripcion: "Acumula N visitas y la siguiente es gratis o con descuento" },
  { value: "CUPON", label: "Cupón simple", descripcion: "Descuento directo en próxima visita" },
];

// Lista completa interna (incluye tipos de fases futuras)
export const TIPOS_ESTRATEGIA = TIPOS_BENEFICIO;

export type TipoIntegracion = "API_REST" | "WEBHOOK" | "CSV" | "MANUAL";

export const TIPOS_INTEGRACION: { value: TipoIntegracion; label: string }[] = [
  { value: "API_REST", label: "API REST" },
  { value: "WEBHOOK", label: "Webhook" },
  { value: "CSV", label: "Importación/Exportación CSV" },
  { value: "MANUAL", label: "Manual" },
];

export const EVENTOS_SINCRONIZACION: { value: string; label: string }[] = [
  { value: "CLIENTE_CREADO", label: "Cliente creado" },
  { value: "QR_GENERADO", label: "QR generado" },
  { value: "BENEFICIO_ACTIVADO", label: "Beneficio activado" },
  { value: "USO_CONFIRMADO", label: "Uso confirmado" },
  { value: "PAGO_CONFIRMADO", label: "Pago confirmado" },
];

// Servicios/consumos por tipo de negocio
export const SERVICIOS_NEGOCIO: Record<string, string[]> = {
  carwash: ["Lavado básico", "Lavado premium", "Lavado especial", "Detallado", "Otro"],
  restaurante: ["Desayuno", "Almuerzo", "Cena", "Combo", "Bebida", "Otro"],
};

// Tipos de escasez configurables (Cialdini - Escasez)
export const ESCASEZ_TIPOS: { value: string; label: string; mensaje: string }[] = [
  { value: "tiempo_limitado", label: "Por tiempo limitado", mensaje: "Disponible por tiempo limitado" },
  { value: "este_mes", label: "Solo este mes", mensaje: "Solo por este mes" },
  { value: "ultimos_cupos", label: "Últimos cupos", mensaje: "Últimos cupos disponibles" },
];

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
