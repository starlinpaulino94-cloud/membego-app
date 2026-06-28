import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/modules/empresas/mutations'
import type { Assignment, AssignmentStatus } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const ASSIGNMENT_INCLUDE = {
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      user: { select: { email: true } },
    },
  },
  promotion: {
    select: { id: true, name: true, type: true, config: true },
  },
}

export async function createAssignment(params: {
  customerId: string
  promotionId: string
  companyId: string
  usesAllowed?: number | null
  progressTarget?: number | null
  paymentAmount?: number | null
  requiresPayment?: boolean
  expiresAt?: Date | null
  notes?: string | null
  actorUserId?: string
}): Promise<Assignment> {
  const {
    actorUserId,
    requiresPayment = false,
    paymentAmount,
    ...data
  } = params

  const status: AssignmentStatus = requiresPayment ? 'PENDING_PAYMENT' : 'ACTIVE'
  const now = new Date()

  const assignment = await db.promotionAssignment.create({
    data: {
      ...data,
      status,
      usesConsumed: 0,
      progress: 0,
      paymentConfirmed: !requiresPayment,
      paymentConfirmedAt: requiresPayment ? null : now,
      paymentAmount: paymentAmount ?? null,
      startedAt: requiresPayment ? null : now,
    },
    include: ASSIGNMENT_INCLUDE,
  })

  // Increment promotion usedCount
  await db.promotion.update({
    where: { id: params.promotionId },
    data: { usedCount: { increment: 1 } },
  })

  await writeAuditLog({
    companyId: params.companyId,
    userId: actorUserId,
    event: 'ASSIGNMENT_CREATED',
    entityType: 'PromotionAssignment',
    entityId: assignment.id,
    payload: {
      customerId: params.customerId,
      promotionId: params.promotionId,
      status,
    },
  })

  return assignment
}

export async function activateAssignment(
  assignmentId: string,
  actorUserId?: string,
  companyId?: string
): Promise<Assignment> {
  const a = await db.promotionAssignment.findUnique({ where: { id: assignmentId } })
  if (!a) throw new Error('Asignación no encontrada')
  if (a.status !== 'PENDING_PAYMENT') {
    throw new Error('Solo se pueden activar asignaciones en estado Pendiente de Pago')
  }

  const updated = await db.promotionAssignment.update({
    where: { id: assignmentId },
    data: {
      status: 'ACTIVE',
      paymentConfirmed: true,
      paymentConfirmedAt: new Date(),
      startedAt: new Date(),
    },
    include: ASSIGNMENT_INCLUDE,
  })

  await writeAuditLog({
    companyId: companyId ?? a.companyId,
    userId: actorUserId,
    event: 'ASSIGNMENT_ACTIVATED',
    entityType: 'PromotionAssignment',
    entityId: assignmentId,
    payload: {},
  })

  return updated
}

export async function confirmPayment(
  assignmentId: string,
  paymentAmount?: number | null,
  actorUserId?: string,
  companyId?: string
): Promise<Assignment> {
  const a = await db.promotionAssignment.findUnique({ where: { id: assignmentId } })
  if (!a) throw new Error('Asignación no encontrada')
  if (a.status !== 'PENDING_PAYMENT') {
    throw new Error('La asignación no está pendiente de pago')
  }

  const updated = await db.promotionAssignment.update({
    where: { id: assignmentId },
    data: {
      status: 'ACTIVE',
      paymentConfirmed: true,
      paymentConfirmedAt: new Date(),
      paymentAmount: paymentAmount ?? a.paymentAmount,
      startedAt: new Date(),
    },
    include: ASSIGNMENT_INCLUDE,
  })

  await writeAuditLog({
    companyId: companyId ?? a.companyId,
    userId: actorUserId,
    event: 'ASSIGNMENT_PAYMENT_CONFIRMED',
    entityType: 'PromotionAssignment',
    entityId: assignmentId,
    payload: { paymentAmount },
  })

  return updated
}

export async function consumeUse(
  assignmentId: string,
  actorUserId?: string,
  companyId?: string
): Promise<Assignment> {
  const a = await db.promotionAssignment.findUnique({ where: { id: assignmentId } })
  if (!a) throw new Error('Asignación no encontrada')
  if (a.status !== 'ACTIVE') {
    throw new Error('Solo se pueden consumir usos en asignaciones activas')
  }
  if (a.usesAllowed != null && a.usesConsumed >= a.usesAllowed) {
    throw new Error('Esta asignación no tiene usos disponibles')
  }

  const newConsumed = a.usesConsumed + 1
  const newProgress = a.progressTarget
    ? Math.min((newConsumed / a.progressTarget) * 100, 100)
    : a.progress

  // Auto-complete when all uses consumed or progress target reached
  const isExhausted =
    (a.usesAllowed != null && newConsumed >= a.usesAllowed) ||
    (a.progressTarget != null && newConsumed >= a.progressTarget)

  const updated = await db.promotionAssignment.update({
    where: { id: assignmentId },
    data: {
      usesConsumed: newConsumed,
      progress: newProgress,
      ...(isExhausted && {
        status: 'COMPLETED',
        completedAt: new Date(),
      }),
    },
    include: ASSIGNMENT_INCLUDE,
  })

  await writeAuditLog({
    companyId: companyId ?? a.companyId,
    userId: actorUserId,
    event: isExhausted ? 'ASSIGNMENT_COMPLETED' : 'ASSIGNMENT_USE_CONSUMED',
    entityType: 'PromotionAssignment',
    entityId: assignmentId,
    payload: { usesConsumed: newConsumed, progress: newProgress },
  })

  return updated
}

export async function cancelAssignment(
  assignmentId: string,
  reason: string,
  actorUserId?: string,
  companyId?: string
): Promise<Assignment> {
  const a = await db.promotionAssignment.findUnique({ where: { id: assignmentId } })
  if (!a) throw new Error('Asignación no encontrada')
  if (['CANCELLED', 'EXPIRED', 'COMPLETED'].includes(a.status)) {
    throw new Error('No se puede cancelar una asignación en estado final')
  }

  const updated = await db.promotionAssignment.update({
    where: { id: assignmentId },
    data: { status: 'CANCELLED', notes: reason },
    include: ASSIGNMENT_INCLUDE,
  })

  await writeAuditLog({
    companyId: companyId ?? a.companyId,
    userId: actorUserId,
    event: 'ASSIGNMENT_CANCELLED',
    entityType: 'PromotionAssignment',
    entityId: assignmentId,
    payload: { reason },
  })

  return updated
}

export async function blockAssignment(
  assignmentId: string,
  reason: string,
  actorUserId?: string,
  companyId?: string
): Promise<Assignment> {
  const a = await db.promotionAssignment.findUnique({ where: { id: assignmentId } })
  if (!a) throw new Error('Asignación no encontrada')
  if (a.status !== 'ACTIVE' && a.status !== 'PENDING_PAYMENT') {
    throw new Error('Solo se pueden bloquear asignaciones activas o pendientes')
  }

  const updated = await db.promotionAssignment.update({
    where: { id: assignmentId },
    data: { status: 'BLOCKED', notes: reason },
    include: ASSIGNMENT_INCLUDE,
  })

  await writeAuditLog({
    companyId: companyId ?? a.companyId,
    userId: actorUserId,
    event: 'ASSIGNMENT_BLOCKED',
    entityType: 'PromotionAssignment',
    entityId: assignmentId,
    payload: { reason },
  })

  return updated
}

export async function renewAssignment(
  assignmentId: string,
  newExpiresAt: Date,
  actorUserId?: string,
  companyId?: string
): Promise<Assignment> {
  const a = await db.promotionAssignment.findUnique({ where: { id: assignmentId } })
  if (!a) throw new Error('Asignación no encontrada')
  if (!['ACTIVE', 'EXPIRED', 'BLOCKED'].includes(a.status)) {
    throw new Error('Solo se pueden renovar asignaciones activas, expiradas o bloqueadas')
  }

  const wasExpiredOrBlocked = a.status === 'EXPIRED' || a.status === 'BLOCKED'

  const updated = await db.promotionAssignment.update({
    where: { id: assignmentId },
    data: {
      expiresAt: newExpiresAt,
      ...(wasExpiredOrBlocked && { status: 'ACTIVE' }),
    },
    include: ASSIGNMENT_INCLUDE,
  })

  await writeAuditLog({
    companyId: companyId ?? a.companyId,
    userId: actorUserId,
    event: 'ASSIGNMENT_RENEWED',
    entityType: 'PromotionAssignment',
    entityId: assignmentId,
    payload: { newExpiresAt: newExpiresAt.toISOString(), previousStatus: a.status },
  })

  return updated
}

export async function expireAssignment(
  assignmentId: string,
  actorUserId?: string,
  companyId?: string
): Promise<Assignment> {
  const a = await db.promotionAssignment.findUnique({ where: { id: assignmentId } })
  if (!a) throw new Error('Asignación no encontrada')
  if (a.status !== 'ACTIVE') {
    throw new Error('Solo se pueden expirar asignaciones activas')
  }

  const updated = await db.promotionAssignment.update({
    where: { id: assignmentId },
    data: { status: 'EXPIRED' },
    include: ASSIGNMENT_INCLUDE,
  })

  await writeAuditLog({
    companyId: companyId ?? a.companyId,
    userId: actorUserId,
    event: 'ASSIGNMENT_EXPIRED',
    entityType: 'PromotionAssignment',
    entityId: assignmentId,
    payload: {},
  })

  return updated
}
