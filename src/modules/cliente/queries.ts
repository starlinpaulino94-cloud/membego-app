import { prisma } from '@/lib/prisma'

/**
 * Load all memberships for a user across all companies.
 * Used for the new "Mis Membresías" dashboard.
 */
export async function getClienteAllMemberships(supabaseId: string) {
  if (!supabaseId) {
    console.warn('[getClienteAllMemberships] Missing supabaseId')
    return []
  }

  try {
    const clientes = await prisma.cliente.findMany({
      where: { supabaseId },
      include: {
        memberships: {
          include: {
            plan: true,
            company: { select: { id: true, name: true, logoUrl: true, type: true } },
            qrTokens: {
              where: { activo: true },
              take: 1,
              select: { id: true, token: true },
            },
          },
          orderBy: [{ estado: 'asc' }, { fechaVencimiento: 'desc' }],
        },
      },
    })

    return clientes
      .flatMap((c) =>
        c.memberships.map((m) => ({
          id: m.id,
          clienteId: c.id,
          companyId: m.companyId,
          company: m.company,
          plan: m.plan,
          estado: m.estado,
          fechaVencimiento: m.fechaVencimiento,
          fechaInicio: m.fechaInicio,
          lavadosRestantes: m.lavadosRestantes,
          qrToken: m.qrTokens[0] || null,
        }))
      )
      .sort((a, b) => {
        const orden = {
          ACTIVA: 0,
          PENDIENTE_PAGO: 1,
          PENDIENTE: 2,
          VENCIDA: 3,
          CANCELADA: 4,
          RECHAZADA: 5,
        }
        const aOrd = orden[a.estado as keyof typeof orden] ?? 99
        const bOrd = orden[b.estado as keyof typeof orden] ?? 99
        if (aOrd !== bOrd) return aOrd - bOrd
        if (a.fechaVencimiento && b.fechaVencimiento) {
          return a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime()
        }
        return 0
      })
  } catch (error) {
    console.error('[getClienteAllMemberships] Error:', error)
    throw error
  }
}

/**
 * Datos del cliente para la página de perfil: básicos + empresa + vehículos.
 * Una sola query (antes hacía 3 consultas redundantes cargando membresías y
 * visitas que el perfil ni siquiera usa).
 */
export async function getClientePerfil(clienteId: string) {
  if (!clienteId) {
    console.warn('[getClientePerfil] Missing clienteId')
    return null
  }

  try {
    return await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        avatarUrl: true,
        companyId: true,
        company: {
          select: { id: true, name: true, slug: true, type: true, logoUrl: true },
        },
        vehiculos: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  } catch (error) {
    console.error('[getClientePerfil] Error loading cliente:', error)
    throw error
  }
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
