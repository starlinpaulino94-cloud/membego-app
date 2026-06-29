import { prisma } from '@/lib/prisma'
import type { Company, Branch, CompanyStatus, BranchStatus, CreateCompanyInput, UpdateCompanyInput, CreateBranchInput, UpdateBranchInput } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export async function createCompany(data: CreateCompanyInput): Promise<Company> {
  return db.company.create({
    data: {
      name: data.name,
      legalName: data.legalName || null,
      industry: data.industry,
      description: data.description || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      city: data.city || null,
      status: 'PENDING',
      settings: {
        create: {
          requirePaymentConfirmation: false,
          allowMultipleActiveAssignments: true,
        },
      },
    },
    include: { settings: true },
  })
}

export async function updateCompany(id: string, data: UpdateCompanyInput): Promise<Company> {
  return db.company.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.legalName !== undefined && { legalName: data.legalName || null }),
      ...(data.industry !== undefined && { industry: data.industry }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.address !== undefined && { address: data.address || null }),
      ...(data.city !== undefined && { city: data.city || null }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl || null }),
      ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl || null }),
    },
    include: { settings: true },
  })
}

export async function setCompanyStatus(id: string, status: CompanyStatus): Promise<Company> {
  return db.company.update({
    where: { id },
    data: { status },
  })
}

export async function createBranch(data: CreateBranchInput): Promise<Branch> {
  return db.branch.create({
    data: {
      companyId: data.companyId,
      name: data.name,
      address: data.address || null,
      phone: data.phone || null,
      status: 'ACTIVE',
    },
  })
}

export async function updateBranch(id: string, data: UpdateBranchInput): Promise<Branch> {
  return db.branch.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.address !== undefined && { address: data.address || null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
    },
  })
}

export async function setBranchStatus(id: string, status: BranchStatus): Promise<Branch> {
  return db.branch.update({
    where: { id },
    data: { status },
  })
}

export async function updateCompanySettings(
  companyId: string,
  data: {
    allowMultipleActiveAssignments?: boolean
    requirePaymentConfirmation?: boolean
    defaultAssignmentDurationDays?: number | null
    maxAssignmentsPerCustomer?: number | null
    validationCooldownHours?: number | null
    notificationsEmail?: string | null
    webhookUrl?: string | null
  }
): Promise<void> {
  await db.companySettings.upsert({
    where: { companyId },
    update: data,
    create: { companyId, ...data },
  })
}

export async function writeAuditLog(params: {
  companyId?: string
  userId?: string
  event: string
  entityType: string
  entityId: string
  payload?: Record<string, unknown>
}): Promise<void> {
  await db.auditLog.create({
    data: {
      companyId: params.companyId ?? null,
      userId: params.userId ?? null,
      event: params.event,
      entityType: params.entityType,
      entityId: params.entityId,
      payload: params.payload ?? {},
    },
  })
}
