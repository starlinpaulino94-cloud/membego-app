export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type EmployeeRole = 'ADMIN_EMPRESA' | 'EMPLEADO'

// Operational sub-roles are metadata only until the schema adds an operationalRole field.
// These map to display labels shown in the UI.
export const OPERATIONAL_ROLES = ['manager', 'cashier', 'validator', 'viewer'] as const
export type OperationalRole = (typeof OPERATIONAL_ROLES)[number]

export interface EmployeeUser {
  id: string
  email: string
  name: string
  phone: string | null
  avatarUrl: string | null
  isActive: boolean
}

export interface Employee {
  id: string
  userId: string
  companyId: string
  branchId: string | null
  role: EmployeeRole
  status: EmployeeStatus
  createdAt: Date
  updatedAt: Date
  user: EmployeeUser
  company?: { id: string; name: string }
  branch?: { id: string; name: string } | null
}

export interface CreateEmployeeInput {
  companyId: string
  branchId?: string
  role: EmployeeRole
  name: string
  email: string
  phone?: string
}

export interface UpdateEmployeeInput {
  branchId?: string | null
  role?: EmployeeRole
  name?: string
  phone?: string
}
