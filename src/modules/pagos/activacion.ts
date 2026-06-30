'use server'

/**
 * Punto de activación único para membresías.
 * Tanto la aprobación manual del admin como futuras pasarelas de pago
 * deben invocar esta función para garantizar un flujo consistente.
 */

import { prisma } from '@/lib/prisma'

type Meta = { ipAddress: string | null; userAgent: string | null }

type ActivarResult =
  | { ok: true; clienteId: string; companyId: string; supabaseId: string; planNombre: string; esPrimera: boolean }
  | { ok: false; error: string }

function periodEnd(from: Date, dias: number) {
  const d = new Date(from)
  d.setDate(d.getDate() + dias)
  return d
}

export async function activarMembresia(
  membershipId: string,
  userId: string | null,
  meta: Meta
): Promise<ActivarResult> {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { plan: true, cliente: true },
  })
  if (!membership) return { ok: false, error: 'Membresía no encontrada.' }
  if (membership.estado === 'ACTIVA') return { ok: false, error: 'La membresía ya está activa.' }

  const previasConfirmadas = await prisma.membership.count({
    where: { clienteId: membership.clienteId, pagoConfirmado: true },
  })
  const esPrimera = previasConfirmadas === 0

  const now = new Date()
  const vigenciaDias = membership.plan.vigenciaDias ?? 30

  await prisma.$transaction(async (tx) => {
    await tx.membership.update({
      where: { id: membership.id },
      data: {
        estado: 'ACTIVA',
        fechaInicio: now,
        fechaVencimiento: periodEnd(now, vigenciaDias),
        lavadosRestantes: membership.plan.esIlimitado ? 0 : membership.plan.lavadosIncluidos,
        montoPagado: Number(membership.plan.precio),
        pagoConfirmado: true,
        rechazadoReason: null,
        adminNota: null,
      },
    })

    const existingQr = await tx.qrToken.findFirst({
      where: { clienteId: membership.clienteId, activo: true },
    })
    if (!existingQr) {
      const newQr = await tx.qrToken.create({
        data: { clienteId: membership.clienteId },
      })
      await tx.auditLog.create({
        data: {
          companyId: membership.cliente.companyId,
          userId,
          accion: 'QR_GENERADO',
          entidadTipo: 'QrToken',
          entidadId: newQr.id,
          payload: { clienteId: membership.clienteId, motivo: 'activacion_membresia' },
          ...meta,
        },
      })
    }

    await tx.auditLog.create({
      data: {
        companyId: membership.cliente.companyId,
        userId,
        accion: 'PAGO_APROBADO',
        entidadTipo: 'Membership',
        entidadId: membership.id,
        payload: { planId: membership.planId, clienteId: membership.clienteId, monto: Number(membership.plan.precio) },
        ...meta,
      },
    })
  })

  return {
    ok: true,
    clienteId: membership.clienteId,
    companyId: membership.cliente.companyId,
    supabaseId: membership.cliente.supabaseId,
    planNombre: membership.plan.nombre,
    esPrimera,
  }
}
