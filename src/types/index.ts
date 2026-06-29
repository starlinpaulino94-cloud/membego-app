export type AppRole = 'SUPERADMIN' | 'ADMIN_EMPRESA' | 'EMPLEADO' | 'CLIENTE'

export type MembershipEstado = 'PENDIENTE' | 'ACTIVA' | 'VENCIDA' | 'CANCELADA'

export interface AppMetadata {
  role: AppRole
  dbUserId: string
  clienteId?: string | null
  companyId?: string | null
}

export interface SessionUser {
  supabaseId: string
  email: string
  metadata: AppMetadata
}

export const ROLE_HOME: Record<AppRole, string> = {
  SUPERADMIN: '/superadmin/dashboard',
  ADMIN_EMPRESA: '/admin/dashboard',
  EMPLEADO: '/scanner',
  CLIENTE: '/dashboard',
}
