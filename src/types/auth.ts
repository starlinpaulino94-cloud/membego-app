export type UserRole = 'SUPERADMIN' | 'ADMIN_EMPRESA' | 'EMPLEADO' | 'CLIENTE'

export interface AuthUser {
  id: string
  email: string
  rol: UserRole
  empresaId?: string
  sucursalId?: string
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}
