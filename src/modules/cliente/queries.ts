import { prisma } from '@/lib/prisma'

export async function getClienteFull(clienteId: string) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: {
      id: true,
      nombre: true,
      email: true,
      telefono: true,
      companyId: true,
      createdAt: true,
      supabaseId: true,
      company: {
        select: { id: true, name: true, slug: true, type: true, description: true, logoUrl: true, isActive: true },
      },
      qrTokens: {
        where: { activo: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, token: true, activo: true, createdAt: true },
      },
      vehiculos: true,
      memberships: {
        select: {
          id: true,
          estado: true,
          lavadosRestantes: true,
          fechaInicio: true,
          fechaVencimiento: true,
          createdAt: true,
          clienteId: true,
          planId: true,
          plan: {
            select: { id: true, nombre: true, precio: true, lavadosIncluidos: true, esIlimitado: true, beneficios: true, descripcion: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      visits: {
        select: {
          id: true,
          servicio: true,
          fechaVisita: true,
          descontado: true,
          clienteId: true,
          vehiculoId: true,
          vehiculo: true,
        },
        orderBy: { fechaVisita: 'desc' },
        take: 10,
      },
    },
  })

  if (!cliente) return null

  // Add optional fields that may not exist in DB yet
  const enriched = {
    ...cliente,
    memberships: cliente.memberships.map((m) => ({
      ...m,
      pagoConfirmado: (m as Record<string, unknown>).pagoConfirmado as boolean ?? false,
      montoPagado: (m as Record<string, unknown>).montoPagado as number | null ?? null,
      comprobanteUrl: (m as Record<string, unknown>).comprobanteUrl as string | null ?? null,
      comprobanteNota: (m as Record<string, unknown>).comprobanteNota as string | null ?? null,
      rechazadoReason: (m as Record<string, unknown>).rechazadoReason as string | null ?? null,
      metodoPago: null as { id: string; nombre: string } | null,
    })),
    visits: cliente.visits.map((v) => ({
      ...v,
      sucursal: null as { id: string; nombre: string } | null,
    })),
  }

  // Try to load extra membership fields
  try {
    const fullMemberships = await prisma.membership.findMany({
      where: { clienteId },
      include: { plan: true, metodoPago: true },
      orderBy: { createdAt: 'desc' },
    })
    enriched.memberships = fullMemberships.map((m) => ({
      ...m,
      pagoConfirmado: (m as Record<string, unknown>).pagoConfirmado as boolean ?? false,
      montoPagado: (m as Record<string, unknown>).montoPagado ?? null,
      comprobanteUrl: (m as Record<string, unknown>).comprobanteUrl as string | null ?? null,
      comprobanteNota: (m as Record<string, unknown>).comprobanteNota as string | null ?? null,
      rechazadoReason: (m as Record<string, unknown>).rechazadoReason as string | null ?? null,
      metodoPago: (m as Record<string, unknown>).metodoPago ?? null,
    })) as typeof enriched.memberships
  } catch {}

  // Try to load sucursal info on visits
  try {
    const fullVisits = await prisma.visit.findMany({
      where: { clienteId },
      include: { vehiculo: true, sucursal: true },
      orderBy: { fechaVisita: 'desc' },
      take: 10,
    })
    enriched.visits = fullVisits.map((v) => ({
      ...v,
      sucursal: (v as Record<string, unknown>).sucursal as { id: string; nombre: string } | null ?? null,
    })) as typeof enriched.visits
  } catch {}

  return enriched
}

export async function getClienteVisitas(
  clienteId: string,
  page = 1,
  pageSize = 20
) {
  const skip = (page - 1) * pageSize
  const [total, visitas] = await Promise.all([
    prisma.visit.count({ where: { clienteId } }),
    prisma.visit.findMany({
      where: { clienteId },
      select: {
        id: true,
        servicio: true,
        fechaVisita: true,
        descontado: true,
        clienteId: true,
        vehiculoId: true,
        vehiculo: true,
        membership: { select: { id: true, plan: { select: { nombre: true } } } },
      },
      orderBy: { fechaVisita: 'desc' },
      skip,
      take: pageSize,
    }),
  ])

  const enrichedVisitas = visitas.map((v) => ({
    ...v,
    sucursal: null as { id: string; nombre: string } | null,
  }))

  return { total, visitas: enrichedVisitas, pages: Math.ceil(total / pageSize) }
}

export async function getClienteMembresias(clienteId: string) {
  try {
    return await prisma.membership.findMany({
      where: { clienteId },
      include: { plan: true, metodoPago: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return prisma.membership.findMany({
      where: { clienteId },
      select: {
        id: true, estado: true, lavadosRestantes: true,
        fechaInicio: true, fechaVencimiento: true, createdAt: true,
        clienteId: true, planId: true,
        plan: { select: { id: true, nombre: true, precio: true, lavadosIncluidos: true, esIlimitado: true, beneficios: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}

export function activeMembership<
  T extends { estado: string; fechaVencimiento: Date | null }
>(memberships: T[]): T | undefined {
  return memberships.find(
    (m) =>
      m.estado === 'ACTIVA' &&
      (!m.fechaVencimiento || m.fechaVencimiento > new Date())
  )
}
