'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

async function requireAdmin() {
  const user = await getUser()
  if (!user || !['ADMIN_EMPRESA', 'SUPERADMIN'].includes(user.metadata.role)) {
    return null
  }
  return user
}

/** Ensure the membership belongs to the admin's company (superadmin = any). */
async function assertOwnership(
  membershipId: string,
  user: NonNullable<Awaited<ReturnType<typeof requireAdmin>>>
) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { plan: true, cliente: true },
  })
  if (!membership) return null
  if (
    user.metadata.role !== 'SUPERADMIN' &&
    user.metadata.companyId &&
    membership.cliente.companyId !== user.metadata.companyId
  ) {
    return null
  }
  return membership
}

export interface AdminActionState {
  error?: string
  success?: boolean
}

function periodEnd(from: Date) {
  const d = new Date(from)
  d.setDate(d.getDate() + 30)
  return d
}

/** Confirm payment: PENDIENTE -> ACTIVA, set dates and lavadosRestantes. */
export async function confirmarPago(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireAdmin()
  if (!user) return { error: 'No autorizado.' }

  const membershipId = String(formData.get('membershipId') ?? '')
  const montoRaw = String(formData.get('monto') ?? '').trim()

  const membership = await assertOwnership(membershipId, user)
  if (!membership) return { error: 'Membresía no encontrada.' }
  if (membership.estado === 'ACTIVA') {
    return { error: 'La membresía ya está activa.' }
  }

  const now = new Date()
  const monto = montoRaw ? Number(montoRaw) : Number(membership.plan.precio)

  await prisma.membership.update({
    where: { id: membership.id },
    data: {
      estado: 'ACTIVA',
      fechaInicio: now,
      fechaVencimiento: periodEnd(now),
      lavadosRestantes: membership.plan.esIlimitado
        ? 0
        : membership.plan.lavadosIncluidos,
      montoPagado: Number.isNaN(monto) ? Number(membership.plan.precio) : monto,
      pagoConfirmado: true,
      userId: membership.userId,
    },
  })

  revalidatePath(`/admin/clientes/${membership.clienteId}`)
  revalidatePath('/admin/clientes')
  revalidatePath('/admin/dashboard')
  return { success: true }
}

/** Renew: new 30-day period, reset lavadosRestantes, keep same QR. */
export async function renovarMembresia(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireAdmin()
  if (!user) return { error: 'No autorizado.' }

  const membershipId = String(formData.get('membershipId') ?? '')
  const montoRaw = String(formData.get('monto') ?? '').trim()

  const membership = await assertOwnership(membershipId, user)
  if (!membership) return { error: 'Membresía no encontrada.' }

  const now = new Date()
  const monto = montoRaw ? Number(montoRaw) : Number(membership.plan.precio)

  await prisma.membership.update({
    where: { id: membership.id },
    data: {
      estado: 'ACTIVA',
      fechaInicio: now,
      fechaVencimiento: periodEnd(now),
      lavadosRestantes: membership.plan.esIlimitado
        ? 0
        : membership.plan.lavadosIncluidos,
      montoPagado: Number.isNaN(monto) ? Number(membership.plan.precio) : monto,
      pagoConfirmado: true,
    },
  })

  revalidatePath(`/admin/clientes/${membership.clienteId}`)
  revalidatePath('/admin/clientes')
  return { success: true }
}
