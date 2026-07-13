import { prisma } from '@/lib/prisma'
import { crearNotificacion } from '@/modules/notificaciones/service'
import { otorgarBeneficioReferido } from '@/modules/growth/rewards'
import type { BenefitType } from '@prisma/client'

/**
 * Entrega REAL de los beneficios de una campaña de invitación.
 *
 * Vía principal — Motor de Beneficios Digitales (E8): si el beneficio de la
 * campaña referencia una Promoción de la empresa (`promocionId` en el JSON),
 * se entrega como ProductoCompra ACTIVO con QR único de un solo uso. Eso lo
 * hace aparecer automáticamente en la Wallet del cliente (Mis promociones),
 * canjeable en el escáner del empleado, con vigencia y trazabilidad.
 *
 * Vía de respaldo — Benefit Engine: si el admin no vinculó una promoción,
 * el beneficio queda registrado como Benefit + BenefitGrant del catálogo
 * (visible para métricas y auditoría, canje coordinado por el negocio).
 *
 * En ambos casos el beneficiario recibe una notificación in-app.
 *
 * IMPORTANTE: este módulo NO lleva 'use server' — son funciones internas que
 * solo deben invocarse desde código de servidor ya autorizado. Nunca lanzan:
 * un fallo en la entrega no rompe el flujo que la disparó (registro, meta).
 */

export interface BeneficioCampanaJson {
  tipo?: string
  valor?: string
  descripcion?: string
  vigenciaDias?: number
  /** Promoción (Beneficio Digital E8) que materializa esta recompensa. */
  promocionId?: string
}

const TIPO_A_BENEFIT: Record<string, BenefitType> = {
  SERVICIO_GRATIS: 'SERVICE_FREE',
  DESCUENTO: 'DISCOUNT',
  CREDITO: 'CREDIT',
  PRODUCTO: 'PRODUCT',
  UPGRADE: 'UPGRADE',
}

/** Busca el User dueño de la ficha de cliente (para notificación in-app). */
async function usuarioDeCliente(clienteId: string): Promise<string | null> {
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { supabaseId: true },
  })
  if (!cliente) return null
  const user = await prisma.user.findUnique({
    where: { supabaseId: cliente.supabaseId },
    select: { id: true },
  })
  return user?.id ?? null
}

export async function otorgarBeneficioCampana(opts: {
  campanaId: string
  clienteId: string
  rol: 'INVITANTE' | 'INVITADO'
}): Promise<void> {
  try {
    const campana = await prisma.campanaInvitacion.findUnique({
      where: { id: opts.campanaId },
      select: {
        id: true,
        companyId: true,
        nombre: true,
        beneficioInvitante: true,
        beneficioInvitado: true,
      },
    })
    if (!campana) return

    const beneficio = (
      opts.rol === 'INVITANTE' ? campana.beneficioInvitante : campana.beneficioInvitado
    ) as BeneficioCampanaJson | null
    if (!beneficio?.descripcion && !beneficio?.valor && !beneficio?.promocionId) return

    const vigenciaDias = Number(beneficio.vigenciaDias ?? 30)
    let enWallet = false

    // Vía principal: Beneficio Digital E8 → ProductoCompra + QR + Wallet.
    // (idempotente por cliente+promoción dentro del propio helper.)
    if (beneficio.promocionId) {
      const compraId = await otorgarBeneficioReferido({
        companyId: campana.companyId,
        clienteId: opts.clienteId,
        promocionId: beneficio.promocionId,
      })
      enWallet = compraId !== null
    }

    // Vía de respaldo (o registro de auditoría cuando no hay promoción E8).
    if (!enWallet) {
      const entregado = await otorgarComoBenefitGrant(campana, beneficio, opts)
      if (!entregado) return // ya lo tenía: no re-notificar
    }

    const userId = await usuarioDeCliente(opts.clienteId)
    if (userId) {
      await crearNotificacion({
        userId,
        tipo: 'RECOMPENSA_REFERIDO',
        titulo:
          opts.rol === 'INVITANTE' ? '🎉 ¡Tu premio está listo!' : '🎁 ¡Regalo de bienvenida!',
        mensaje: enWallet
          ? `${beneficio.descripcion ?? 'Tu beneficio'} ya está en tu wallet con su código QR. Preséntalo en el negocio para usarlo.`
          : `${beneficio.descripcion ?? 'Tu beneficio'}. Preséntalo en el negocio para usarlo${
              vigenciaDias > 0 ? ` (vence en ${vigenciaDias} días)` : ''
            }.`,
        href: enWallet ? '/cliente/mis-promociones' : '/cliente/invita-y-gana',
      })
    }
  } catch (e) {
    console.error('[invitaciones] otorgarBeneficioCampana error:', e)
  }
}

/** Respaldo: registra la entrega en el Benefit Engine. true si es nueva. */
async function otorgarComoBenefitGrant(
  campana: { id: string; companyId: string; nombre: string },
  beneficio: BeneficioCampanaJson,
  opts: { clienteId: string; rol: 'INVITANTE' | 'INVITADO' }
): Promise<boolean> {
  // Un Benefit del catálogo por campaña+rol, creado la primera vez que se
  // entrega. code determinista para que sea idempotente entre entregas.
  const code = `INV-${campana.id}-${opts.rol}`
  let benefit = await prisma.benefit.findFirst({
    where: { companyId: campana.companyId, code },
    select: { id: true },
  })
  if (!benefit) {
    benefit = await prisma.benefit.create({
      data: {
        companyId: campana.companyId,
        code,
        nombre:
          beneficio.descripcion ||
          `Premio campaña ${campana.nombre} (${opts.rol.toLowerCase()})`,
        descripcion: beneficio.descripcion ?? null,
        categoria: 'CAMPAIGN',
        tipo: TIPO_A_BENEFIT[beneficio.tipo ?? ''] ?? 'CUSTOM',
        status: 'PUBLISHED',
        config: {
          valor: beneficio.valor ?? '',
          vigenciaDias: beneficio.vigenciaDias ?? 30,
          campanaInvitacionId: campana.id,
          rol: opts.rol,
        },
      },
      select: { id: true },
    })
  }

  // Idempotencia: un mismo cliente no recibe dos grants del mismo beneficio
  // de campaña (p. ej. reintento del flujo de registro).
  const existente = await prisma.benefitGrant.findFirst({
    where: {
      companyId: campana.companyId,
      benefitId: benefit.id,
      subscriberId: opts.clienteId,
    },
    select: { id: true },
  })
  if (existente) return false

  const vigenciaDias = Number(beneficio.vigenciaDias ?? 30)
  await prisma.benefitGrant.create({
    data: {
      companyId: campana.companyId,
      benefitId: benefit.id,
      subscriberId: opts.clienteId,
      subscriberKind: 'CLIENT',
      sourceModule: 'campaign',
      expiresAt:
        vigenciaDias > 0 ? new Date(Date.now() + vigenciaDias * 86_400_000) : null,
      meta: { campanaInvitacionId: campana.id, rol: opts.rol },
    },
  })
  return true
}
