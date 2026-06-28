'use server'

import { revalidatePath } from 'next/cache'
import { requireRole, requireCompanyAccess } from '@/lib/auth/guards'
import type { ActionResult } from '@/types/auth'
import { createAssignmentSchema, renewAssignmentSchema, confirmPaymentSchema } from '../validations'
import {
  createAssignment,
  activateAssignment,
  confirmPayment,
  cancelAssignment,
  blockAssignment,
  renewAssignment,
  expireAssignment,
} from '../mutations'
import { getAssignmentById, assignmentBelongsToCompany, getActiveAssignmentForPromotion } from '../queries'
import type { Assignment } from '../types'

// ─── Guards ──────────────────────────────────────────────────────────────────

async function resolveCompanyId(
  user: Awaited<ReturnType<typeof requireRole>>,
  targetCompanyId?: string
): Promise<string> {
  if (user.role === 'SUPERADMIN') {
    if (!targetCompanyId) throw new Error('companyId requerido para SUPERADMIN')
    return targetCompanyId
  }
  await requireCompanyAccess(user.companyId!)
  return user.companyId!
}

async function assertAssignmentAccess(
  user: Awaited<ReturnType<typeof requireRole>>,
  assignmentId: string
): Promise<void> {
  if (user.role === 'SUPERADMIN') return
  const owned = await assignmentBelongsToCompany(assignmentId, user.companyId!)
  if (!owned) throw new Error('No autorizado.')
}

function revalidateAssignment(customerId: string, assignmentId?: string) {
  revalidatePath(`/dashboard/clientes/${customerId}`)
  revalidatePath(`/admin/clientes/${customerId}`)
  if (assignmentId) {
    revalidatePath(`/dashboard/clientes/${customerId}/asignaciones/${assignmentId}`)
    revalidatePath(`/admin/clientes/${customerId}/asignaciones/${assignmentId}`)
  }
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createAssignmentAction(
  customerId: string,
  targetCompanyId: string,
  _prev: ActionResult<Assignment>,
  formData: FormData
): Promise<ActionResult<Assignment>> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')
    const companyId = await resolveCompanyId(user, targetCompanyId)

    const raw = {
      promotionId: formData.get('promotionId'),
      usesAllowed: formData.get('usesAllowed') || undefined,
      progressTarget: formData.get('progressTarget') || undefined,
      paymentAmount: formData.get('paymentAmount') || undefined,
      requiresPayment: formData.get('requiresPayment') === 'on',
      expiresAt: formData.get('expiresAt') || undefined,
      notes: formData.get('notes') || undefined,
    }

    const parsed = createAssignmentSchema.safeParse(raw)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    // Prevent duplicate active assignment
    const existing = await getActiveAssignmentForPromotion(customerId, parsed.data.promotionId)
    if (existing) {
      return {
        success: false,
        error: 'El cliente ya tiene una asignación activa o pendiente para esta promoción.',
      }
    }

    const assignment = await createAssignment({
      ...parsed.data,
      customerId,
      companyId,
      actorUserId: user.dbUserId,
    })

    revalidateAssignment(customerId)
    return { success: true, data: assignment }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error inesperado' }
  }
}

// ─── Activate ────────────────────────────────────────────────────────────────

export async function activateAssignmentAction(assignmentId: string): Promise<ActionResult<Assignment>> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')
    await assertAssignmentAccess(user, assignmentId)

    const a = await activateAssignment(assignmentId, user.dbUserId, user.companyId ?? undefined)

    revalidateAssignment(a.customerId, assignmentId)
    return { success: true, data: a }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error inesperado' }
  }
}

// ─── Confirm Payment ─────────────────────────────────────────────────────────

export async function confirmPaymentAction(
  assignmentId: string,
  _prev: ActionResult<Assignment>,
  formData: FormData
): Promise<ActionResult<Assignment>> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')
    await assertAssignmentAccess(user, assignmentId)

    const parsed = confirmPaymentSchema.safeParse({ paymentAmount: formData.get('paymentAmount') })
    if (!parsed.success) {
      return {
        success: false,
        error: 'Monto inválido',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const a = await confirmPayment(
      assignmentId,
      parsed.data.paymentAmount,
      user.dbUserId,
      user.companyId ?? undefined
    )

    revalidateAssignment(a.customerId, assignmentId)
    return { success: true, data: a }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error inesperado' }
  }
}

// ─── Cancel ──────────────────────────────────────────────────────────────────

export async function cancelAssignmentAction(
  assignmentId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')
    await assertAssignmentAccess(user, assignmentId)

    const existing = await getAssignmentById(assignmentId)
    const a = await cancelAssignment(assignmentId, reason, user.dbUserId, user.companyId ?? undefined)

    revalidateAssignment(existing?.customerId ?? a.customerId, assignmentId)
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error inesperado' }
  }
}

// ─── Block ────────────────────────────────────────────────────────────────────

export async function blockAssignmentAction(
  assignmentId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')
    await assertAssignmentAccess(user, assignmentId)

    const existing = await getAssignmentById(assignmentId)
    const a = await blockAssignment(assignmentId, reason, user.dbUserId, user.companyId ?? undefined)

    revalidateAssignment(existing?.customerId ?? a.customerId, assignmentId)
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error inesperado' }
  }
}

// ─── Renew ────────────────────────────────────────────────────────────────────

export async function renewAssignmentAction(
  assignmentId: string,
  _prev: ActionResult<Assignment>,
  formData: FormData
): Promise<ActionResult<Assignment>> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')
    await assertAssignmentAccess(user, assignmentId)

    const parsed = renewAssignmentSchema.safeParse({ expiresAt: formData.get('expiresAt') })
    if (!parsed.success) {
      return {
        success: false,
        error: 'Fecha inválida',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const a = await renewAssignment(
      assignmentId,
      parsed.data.expiresAt,
      user.dbUserId,
      user.companyId ?? undefined
    )

    revalidateAssignment(a.customerId, assignmentId)
    return { success: true, data: a }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error inesperado' }
  }
}

// ─── Expire ───────────────────────────────────────────────────────────────────

export async function expireAssignmentAction(assignmentId: string): Promise<ActionResult> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')
    await assertAssignmentAccess(user, assignmentId)

    const existing = await getAssignmentById(assignmentId)
    const a = await expireAssignment(assignmentId, user.dbUserId, user.companyId ?? undefined)

    revalidateAssignment(existing?.customerId ?? a.customerId, assignmentId)
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error inesperado' }
  }
}
