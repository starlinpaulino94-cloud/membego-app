'use server'

import { revalidatePath } from 'next/cache'
import { requireSuperAdmin, requireRole, requireCompanyAccess } from '@/lib/auth/guards'
import type { ActionResult } from '@/types/auth'
import { createCompanySchema, updateCompanySchema, createBranchSchema, updateBranchSchema } from '../validations'
import { createCompany, updateCompany, setCompanyStatus, createBranch, updateBranch, setBranchStatus, updateCompanySettings, writeAuditLog } from '../mutations'
import { getCompanyById, getBranchById } from '../queries'
import type { Company, Branch, CompanyStatus } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function auditLog(args: Parameters<typeof writeAuditLog>[0]) {
  if (!args.userId) {
    console.warn('[audit] writeAuditLog called without userId — event will be unattributed', {
      event: args.event,
      entityType: args.entityType,
      entityId: args.entityId,
    })
  }
  return writeAuditLog(args)
}

// ─── Company Actions ──────────────────────────────────────────────────────────

export async function createCompanyAction(
  _prev: ActionResult<Company>,
  formData: FormData
): Promise<ActionResult<Company>> {
  try {
    const user = await requireSuperAdmin()

    const raw = {
      name: formData.get('name'),
      legalName: formData.get('legalName'),
      industry: formData.get('industry'),
      description: formData.get('description'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      city: formData.get('city'),
    }

    const parsed = createCompanySchema.safeParse(raw)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const company = await createCompany(parsed.data)

    await auditLog({
      companyId: company.id,
      userId: user.dbUserId,
      event: 'COMPANY_CREATED',
      entityType: 'Company',
      entityId: company.id,
      payload: { name: company.name, industry: company.industry },
    })

    revalidatePath('/admin/empresas')
    return { success: true, data: company }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    return { success: false, error: message }
  }
}

export async function updateCompanyAction(
  companyId: string,
  _prev: ActionResult<Company>,
  formData: FormData
): Promise<ActionResult<Company>> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')

    // Non-superadmin must own this company (read from JWT, not client input)
    if (user.role !== 'SUPERADMIN') {
      await requireCompanyAccess(companyId)
    }

    const raw = {
      name: formData.get('name'),
      legalName: formData.get('legalName'),
      industry: formData.get('industry'),
      description: formData.get('description'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      city: formData.get('city'),
    }

    const parsed = updateCompanySchema.safeParse(raw)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const company = await updateCompany(companyId, parsed.data)

    await auditLog({
      companyId,
      userId: user.dbUserId,
      event: 'COMPANY_UPDATED',
      entityType: 'Company',
      entityId: companyId,
      payload: parsed.data as Record<string, unknown>,
    })

    revalidatePath(`/admin/empresas/${companyId}`)
    revalidatePath(`/admin/empresas/${companyId}/editar`)
    revalidatePath('/dashboard/empresa')
    return { success: true, data: company }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    return { success: false, error: message }
  }
}

export async function setCompanyStatusAction(
  companyId: string,
  status: CompanyStatus
): Promise<ActionResult> {
  try {
    const user = await requireSuperAdmin()

    const existing = await getCompanyById(companyId)
    if (!existing) return { success: false, error: 'Empresa no encontrada' }

    await setCompanyStatus(companyId, status)

    const eventMap: Record<CompanyStatus, string> = {
      ACTIVE: 'COMPANY_ACTIVATED',
      SUSPENDED: 'COMPANY_SUSPENDED',
      INACTIVE: 'COMPANY_DEACTIVATED',
      PENDING: 'COMPANY_SET_PENDING',
    }

    await auditLog({
      companyId,
      userId: user.dbUserId,
      event: eventMap[status],
      entityType: 'Company',
      entityId: companyId,
      payload: { previousStatus: existing.status, newStatus: status },
    })

    revalidatePath('/admin/empresas')
    revalidatePath(`/admin/empresas/${companyId}`)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    return { success: false, error: message }
  }
}

// ─── Branch Actions ───────────────────────────────────────────────────────────

export async function createBranchAction(
  companyId: string,
  _prev: ActionResult<Branch>,
  formData: FormData
): Promise<ActionResult<Branch>> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')

    if (user.role !== 'SUPERADMIN') {
      await requireCompanyAccess(companyId)
    }

    const raw = {
      name: formData.get('name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
    }

    const parsed = createBranchSchema.safeParse(raw)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const branch = await createBranch({ companyId, ...parsed.data })

    await auditLog({
      companyId,
      userId: user.dbUserId,
      event: 'BRANCH_CREATED',
      entityType: 'Branch',
      entityId: branch.id,
      payload: { name: branch.name, companyId },
    })

    revalidatePath('/dashboard/sucursales')
    revalidatePath(`/admin/empresas/${companyId}`)
    return { success: true, data: branch }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    return { success: false, error: message }
  }
}

export async function updateBranchAction(
  branchId: string,
  _prev: ActionResult<Branch>,
  formData: FormData
): Promise<ActionResult<Branch>> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')

    const existing = await getBranchById(branchId)
    if (!existing) return { success: false, error: 'Sucursal no encontrada' }

    if (user.role !== 'SUPERADMIN') {
      await requireCompanyAccess(existing.companyId)
    }

    const raw = {
      name: formData.get('name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
    }

    const parsed = updateBranchSchema.safeParse(raw)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const branch = await updateBranch(branchId, parsed.data)

    await auditLog({
      companyId: existing.companyId,
      userId: user.dbUserId,
      event: 'BRANCH_UPDATED',
      entityType: 'Branch',
      entityId: branchId,
      payload: parsed.data as Record<string, unknown>,
    })

    revalidatePath('/dashboard/sucursales')
    revalidatePath(`/admin/empresas/${existing.companyId}`)
    return { success: true, data: branch }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    return { success: false, error: message }
  }
}

export async function toggleBranchStatusAction(branchId: string): Promise<ActionResult> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')

    const existing = await getBranchById(branchId)
    if (!existing) return { success: false, error: 'Sucursal no encontrada' }

    if (user.role !== 'SUPERADMIN') {
      await requireCompanyAccess(existing.companyId)
    }

    const newStatus = existing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await setBranchStatus(branchId, newStatus)

    await auditLog({
      companyId: existing.companyId,
      userId: user.dbUserId,
      event: newStatus === 'ACTIVE' ? 'BRANCH_ENABLED' : 'BRANCH_DISABLED',
      entityType: 'Branch',
      entityId: branchId,
      payload: { previousStatus: existing.status, newStatus },
    })

    revalidatePath('/dashboard/sucursales')
    revalidatePath(`/admin/empresas/${existing.companyId}`)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    return { success: false, error: message }
  }
}

// ─── Settings Actions ─────────────────────────────────────────────────────────

export async function updateCompanySettingsAction(
  companyId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireRole('ADMIN_EMPRESA')
    await requireCompanyAccess(companyId)

    const allowMultiple = formData.get('allowMultipleActiveAssignments') === 'on'
    const requirePayment = formData.get('requirePaymentConfirmation') === 'on'
    const durationRaw = formData.get('defaultAssignmentDurationDays')
    const maxRaw = formData.get('maxAssignmentsPerCustomer')
    const cooldownRaw = formData.get('validationCooldownHours')
    const notificationsEmail = formData.get('notificationsEmail') as string | null
    const webhookUrl = formData.get('webhookUrl') as string | null

    await updateCompanySettings(companyId, {
      allowMultipleActiveAssignments: allowMultiple,
      requirePaymentConfirmation: requirePayment,
      defaultAssignmentDurationDays: durationRaw ? Number(durationRaw) : null,
      maxAssignmentsPerCustomer: maxRaw ? Number(maxRaw) : null,
      validationCooldownHours: cooldownRaw ? Number(cooldownRaw) : null,
      notificationsEmail: notificationsEmail || null,
      webhookUrl: webhookUrl || null,
    })

    await auditLog({
      companyId,
      userId: user.dbUserId,
      event: 'COMPANY_SETTINGS_UPDATED',
      entityType: 'CompanySettings',
      entityId: companyId,
      payload: { allowMultiple, requirePayment },
    })

    revalidatePath('/dashboard/empresa')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    return { success: false, error: message }
  }
}
