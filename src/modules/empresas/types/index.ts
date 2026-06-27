export type CompanyStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type BranchStatus = 'ACTIVE' | 'INACTIVE'

export interface CompanySettings {
  id: string
  companyId: string
  allowMultipleActiveAssignments: boolean
  requirePaymentConfirmation: boolean
  defaultAssignmentDurationDays: number | null
  maxAssignmentsPerCustomer: number | null
  notificationsEmail: string | null
  webhookUrl: string | null
}

export interface Company {
  id: string
  name: string
  legalName: string | null
  industry: string
  logoUrl: string | null
  coverUrl: string | null
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  country: string
  status: CompanyStatus
  createdAt: Date
  updatedAt: Date
  settings?: CompanySettings | null
  _count?: {
    branches: number
    employees: number
  }
}

export interface Branch {
  id: string
  companyId: string
  name: string
  address: string | null
  phone: string | null
  status: BranchStatus
  createdAt: Date
  updatedAt: Date
  company?: { name: string }
  _count?: {
    employees: number
  }
}

export interface CreateCompanyInput {
  name: string
  legalName?: string
  industry: string
  description?: string
  phone?: string
  email?: string
  address?: string
  city?: string
}

export interface UpdateCompanyInput {
  name?: string
  legalName?: string
  industry?: string
  description?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  logoUrl?: string
  coverUrl?: string
}

export interface CreateBranchInput {
  companyId: string
  name: string
  address?: string
  phone?: string
}

export interface UpdateBranchInput {
  name?: string
  address?: string
  phone?: string
}
