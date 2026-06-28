import { prisma } from '@/lib/prisma'
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

export async function getAssignmentById(id: string): Promise<Assignment | null> {
  return db.promotionAssignment.findUnique({
    where: { id },
    include: ASSIGNMENT_INCLUDE,
  })
}

export async function listCustomerAssignments(
  customerId: string,
  params?: { status?: AssignmentStatus; companyId?: string }
): Promise<Assignment[]> {
  const where: Record<string, unknown> = { customerId }
  if (params?.status) where.status = params.status
  if (params?.companyId) where.companyId = params.companyId

  return db.promotionAssignment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: ASSIGNMENT_INCLUDE,
  })
}

export async function listCompanyAssignments(
  companyId: string,
  params?: {
    status?: AssignmentStatus
    customerId?: string
    promotionId?: string
    page?: number
    pageSize?: number
  }
): Promise<{ items: Assignment[]; total: number }> {
  const { status, customerId, promotionId, page = 1, pageSize = 30 } = params ?? {}

  const where: Record<string, unknown> = { companyId }
  if (status) where.status = status
  if (customerId) where.customerId = customerId
  if (promotionId) where.promotionId = promotionId

  const [items, total] = await Promise.all([
    db.promotionAssignment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: ASSIGNMENT_INCLUDE,
    }),
    db.promotionAssignment.count({ where }),
  ])

  return { items, total }
}

export async function getActiveAssignmentForPromotion(
  customerId: string,
  promotionId: string
): Promise<Assignment | null> {
  return db.promotionAssignment.findFirst({
    where: {
      customerId,
      promotionId,
      status: { in: ['PENDING_PAYMENT', 'ACTIVE'] },
    },
    include: ASSIGNMENT_INCLUDE,
  })
}

export async function assignmentBelongsToCompany(
  assignmentId: string,
  companyId: string
): Promise<boolean> {
  const a = await db.promotionAssignment.findFirst({
    where: { id: assignmentId, companyId },
    select: { id: true },
  })
  return !!a
}
