'use server'

import { prisma } from '@/lib/prisma'
import { createAssignment } from '@/modules/asignaciones/mutations'
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
    // Resolve or create User record (Supabase webhook may not have fired yet)
    let user = await db.user.findUnique({ where: { supabaseId: supabaseUserId } })

    if (!user) {
      user = await db.user.create({
        data: {
          supabaseId: supabaseUserId,
          email,
          name: `${firstName} ${lastName}`,
          role: 'CLIENTE',
        },
      })
    }

    // Resolve or create Customer profile
    let customer = await db.customer.findUnique({ where: { userId: user.id } })

    if (!customer) {
      customer = await db.customer.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
        },
      })
    }

    // Stamp app_metadata so the middleware can resolve role + dbUserId on login
    await setUserAppMetadata(supabaseUserId, {
      role: 'CLIENTE',
      dbUserId: user.id,
    })

    // Create DigitalPass if none active
    const existingPass = await db.digitalPass.findFirst({
      where: { customerId: customer.id, isActive: true },
    })

    if (!existingPass) {
      const { randomBytes } = await import('crypto')
      const token = randomBytes(16).toString('hex')
      await db.digitalPass.create({
        data: {
          customerId: customer.id,
          token,
          isActive: true,
          activatedAt: new Date(),
        },
      })
    }

    // Verify promotion is active and belongs to company
    const promotion = await db.promotion.findFirst({
      where: { id: promotionId, companyId, status: 'ACTIVE' },
    })
    if (!promotion) return { success: false, error: 'Promoción no disponible' }

    // Check if customer already has this promotion active
    const existing = await db.promotionAssignment.findFirst({
      where: {
        customerId: customer.id,
        promotionId,
        status: { in: ['ACTIVE', 'PENDING_PAYMENT'] },
      },
    })
    if (existing) return { success: false, error: 'Ya tienes esta promoción activa o pendiente' }

    const isPaid = PAID_TYPES.includes(promotion.type)
    const cfg = (promotion.config ?? {}) as Record<string, unknown>
    const durationDays = cfg.durationDays ? Number(cfg.durationDays) : null

    const expiresAt = !isPaid && durationDays
      ? new Date(Date.now() + durationDays * 86_400_000)
      : null

    await createAssignment({
      customerId: customer.id,
      promotionId,
      companyId,
      requiresPayment: isPaid,
      paymentAmount: cfg.price ? Number(cfg.price) : null,
      expiresAt,
      actorUserId: user.id,
    })

    // Link customer to company
    await db.customerCompany.upsert({
      where: { customerId_companyId: { customerId: customer.id, companyId } },
      create: { customerId: customer.id, companyId, firstVisitAt: new Date() },
      update: {},
    })

    await writeAuditLog({
      companyId,
      userId: user.id,
      event: 'CUSTOMER_SELF_ENROLLED',
      entityType: 'PromotionAssignment',
      entityId: promotionId,
      payload: { promotionId, isPaid },
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error inesperado' }
  }
}
