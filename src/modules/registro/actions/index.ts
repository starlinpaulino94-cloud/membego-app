'use server'

import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/modules/empresas/mutations'
import { setUserAppMetadata } from '@/lib/supabase/admin'
import type { ActionResult } from '@/types/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const PAID_TYPES = ['PLAN', 'MEMBERSHIP']

export async function registerSelectPromotionAction(params: {
  supabaseUserId: string
  companyId: string
  promotionId: string
  email: string
  firstName: string
  lastName: string
}): Promise<ActionResult> {
  const { supabaseUserId, companyId, promotionId, email, firstName, lastName } = params

  try {
    // Verify promotion before touching DB
    const promotion = await db.promotion.findFirst({
      where: { id: promotionId, companyId, status: 'ACTIVE' },
    })
    if (!promotion) return { success: false, error: 'Promoción no disponible' }

    const isPaid = PAID_TYPES.includes(promotion.type)
    const cfg = (promotion.config ?? {}) as Record<string, unknown>
    const durationDays = cfg.durationDays ? Number(cfg.durationDays) : null
    const expiresAt = !isPaid && durationDays
      ? new Date(Date.now() + durationDays * 86_400_000)
      : null

    // All DB writes in a single transaction
    const { user, customer, assignment } = await db.$transaction(async (tx: any) => {
      // Resolve or create User
      let user = await tx.user.findUnique({ where: { supabaseId: supabaseUserId } })
      if (!user) {
        user = await tx.user.create({
          data: { supabaseId: supabaseUserId, email, name: `${firstName} ${lastName}`, role: 'CLIENTE' },
        })
      }

      // Resolve or create Customer
      let customer = await tx.customer.findUnique({ where: { userId: user.id } })
      if (!customer) {
        customer = await tx.customer.create({
          data: { userId: user.id, firstName, lastName },
        })
      }

      // Create DigitalPass if none active
      const existingPass = await tx.digitalPass.findFirst({
        where: { customerId: customer.id, isActive: true },
      })
      if (!existingPass) {
        const { randomBytes } = await import('crypto')
        const token = randomBytes(16).toString('hex')
        await tx.digitalPass.create({
          data: { customerId: customer.id, token, isActive: true, activatedAt: new Date() },
        })
      }

      // Guard: no duplicate active/pending assignment
      const existing = await tx.promotionAssignment.findFirst({
        where: { customerId: customer.id, promotionId, status: { in: ['ACTIVE', 'PENDING_PAYMENT'] } },
      })
      if (existing) throw new Error('Ya tienes esta promoción activa o pendiente')

      // Create assignment
      const status = isPaid ? 'PENDING_PAYMENT' : 'ACTIVE'
      const now = new Date()
      const assignment = await tx.promotionAssignment.create({
        data: {
          customerId: customer.id,
          promotionId,
          companyId,
          status,
          usesConsumed: 0,
          progress: 0,
          paymentConfirmed: !isPaid,
          paymentConfirmedAt: isPaid ? null : now,
          paymentAmount: cfg.price ? Number(cfg.price) : null,
          startedAt: isPaid ? null : now,
          expiresAt,
        },
      })

      // Increment promotion usedCount
      await tx.promotion.update({
        where: { id: promotionId },
        data: { usedCount: { increment: 1 } },
      })

      // Link customer to company
      await tx.customerCompany.upsert({
        where: { customerId_companyId: { customerId: customer.id, companyId } },
        create: { customerId: customer.id, companyId, firstVisitAt: new Date() },
        update: {},
      })

      return { user, customer, assignment }
    })

    // Stamp app_metadata after successful transaction
    await setUserAppMetadata(supabaseUserId, {
      role: 'CLIENTE',
      dbUserId: user.id,
      customerId: customer.id,
    })

    await writeAuditLog({
      companyId,
      userId: user.id,
      event: 'CUSTOMER_SELF_ENROLLED',
      entityType: 'PromotionAssignment',
      entityId: assignment.id,
      payload: { promotionId, isPaid },
    })

    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error inesperado'
    if (msg === 'Ya tienes esta promoción activa o pendiente') {
      return { success: false, error: msg }
    }
    return { success: false, error: msg }
  }
}
