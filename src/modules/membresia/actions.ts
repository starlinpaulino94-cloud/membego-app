'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export interface SeleccionState {
  error?: string
  success?: boolean
}

export async function seleccionarPlan(
  _prev: SeleccionState,
  formData: FormData
): Promise<SeleccionState> {
  const user = await getUser()
  if (!user || user.metadata.role !== 'CLIENTE' || !user.metadata.clienteId) {
    return { error: 'No autorizado.' }
  }

  const planId = String(formData.get('planId') ?? '')
  if (!planId) return { error: 'Selecciona un plan.' }

  const cliente = await prisma.cliente.findUnique({
    where: { id: user.metadata.clienteId },
    include: { memberships: true },
  })
  if (!cliente) return { error: 'Cliente no encontrado.' }

  const plan = await prisma.plan.findUnique({ where: { id: planId } })
  if (!plan || plan.companyId !== cliente.companyId || !plan.activo) {
    return { error: 'Plan no válido para tu empresa.' }
  }

  // Block if there's already an active membership
  const active = cliente.memberships.find((m) => m.estado === 'ACTIVA')
  if (active) {
    return {
      error: 'Ya tienes una membresía activa. Espera a que venza para cambiar.',
    }
  }

  // Reuse a pending membership if present, otherwise create one
  const pending = cliente.memberships.find((m) => m.estado === 'PENDIENTE')

  if (pending) {
    await prisma.membership.update({
      where: { id: pending.id },
      data: { planId: plan.id, montoPagado: null, pagoConfirmado: false },
    })
  } else {
    await prisma.membership.create({
      data: {
        clienteId: cliente.id,
        planId: plan.id,
        userId: user.metadata.dbUserId || null,
        estado: 'PENDIENTE',
      },
    })
  }

  revalidatePath('/membresia')
  revalidatePath('/dashboard')
  return { success: true }
}
