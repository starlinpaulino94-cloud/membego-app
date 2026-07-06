export type AppRole =
  | 'SUPERADMIN'
  | 'ADMINISTRADOR'
  | 'GERENTE'
  | 'CAJERO'
  | 'RECEPCION'
  | 'EMPLEADO'
  | 'CLIENTE'
  // Legacy (se mantiene para no romper usuarios existentes)
  | 'ADMIN_EMPRESA'

export type MembershipEstado =
  | 'PENDIENTE'
  | 'PENDIENTE_PAGO'
  | 'RECHAZADA'
  | 'ACTIVA'
  | 'VENCIDA'
  | 'CANCELADA'

export type PaymentEstado = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'CANCELADO'
export type PaymentMetodo = 'TRANSFERENCIA' | 'PRESENCIAL'
export type QrTokenEstado = 'ACTIVO' | 'CONSUMIDO' | 'REVOCADO'
export type ReceiptTipo = 'PAGO' | 'CONSUMO'

export interface AppMetadata {
  role: AppRole
  dbUserId: string
  clienteId?: string | null
  companyId?: string | null
  sucursalId?: string | null
}

export interface SessionUser {
  supabaseId: string
  email: string
  metadata: AppMetadata
}

// Redirección por defecto al iniciar sesión, según rol.
// Los roles administrativos van al panel /admin;
// RECEPCION y EMPLEADO van al escáner;
// CLIENTE va a su panel.
export const ROLE_HOME: Record<AppRole, string> = {
  SUPERADMIN: '/superadmin/dashboard',
  ADMINISTRADOR: '/admin/dashboard',
  GERENTE: '/admin/dashboard',
  CAJERO: '/admin/dashboard',
  RECEPCION: '/empleado/scanner',
  EMPLEADO: '/empleado/scanner',
  CLIENTE: '/cliente/dashboard',
  // Legacy
  ADMIN_EMPRESA: '/admin/dashboard',
}

// Roles que pueden acceder al panel administrativo /admin/*
export const ADMIN_ROLES: AppRole[] = [
  'SUPERADMIN',
  'ADMINISTRADOR',
  'GERENTE',
  'CAJERO',
  'ADMIN_EMPRESA', // legacy
]

// Roles que pueden acceder al escáner /empleado/*
export const SCANNER_ROLES: AppRole[] = [
  'SUPERADMIN',
  'ADMINISTRADOR',
  'GERENTE',
  'CAJERO',
  'RECEPCION',
  'EMPLEADO',
  'ADMIN_EMPRESA', // legacy
]

/**
 * Fuente única de verdad para la protección de rutas por prefijo.
 * La consume el edge (`src/proxy.ts`) y debe mantenerse alineada con los
 * guards de cada layout de route-group. Agregar un rol nuevo se hace aquí,
 * en un solo lugar, para evitar drift entre el edge y los layouts.
 */
export const ROUTE_PROTECTION: { prefix: string; roles: AppRole[] }[] = [
  { prefix: '/superadmin', roles: ['SUPERADMIN'] },
  { prefix: '/admin', roles: ADMIN_ROLES },
  { prefix: '/empleado', roles: SCANNER_ROLES },
  { prefix: '/cliente', roles: ['CLIENTE'] },
]
