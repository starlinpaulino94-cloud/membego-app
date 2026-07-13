import { prisma } from '@/lib/prisma'

export async function getCampanaActiva(companyId: string) {
  return prisma.campanaInvitacion.findFirst({
    where: {
      companyId,
      estado: 'ACTIVA',
      fechaInicio: { lte: new Date() },
      fechaFin: { gte: new Date() },
    },
    orderBy: { orden: 'asc' },
  })
}

export async function getCampanaBySlug(slug: string) {
  return prisma.campanaInvitacion.findUnique({
    where: { slug },
    include: {
      company: {
        select: { id: true, name: true, slug: true, logoUrl: true, colorPrimario: true, type: true },
      },
    },
  })
}

export async function getProgresoCliente(campanaId: string, clienteId: string) {
  return prisma.invitacionProgreso.findUnique({
    where: { campanaId_clienteId: { campanaId, clienteId } },
  })
}

export async function getProgresoOCrear(campanaId: string, clienteId: string, companyId: string) {
  return prisma.invitacionProgreso.upsert({
    where: { campanaId_clienteId: { campanaId, clienteId } },
    update: {},
    create: { campanaId, clienteId, companyId },
  })
}

export async function getCampanasEmpresa(companyId: string) {
  return prisma.campanaInvitacion.findMany({
    where: { companyId },
    orderBy: [{ estado: 'asc' }, { orden: 'asc' }, { createdAt: 'desc' }],
    include: {
      _count: {
        select: {
          progresos: true,
          eventos: true,
          referidos: true,
        },
      },
    },
  })
}

export interface CampanaDashboard {
  campana: Awaited<ReturnType<typeof getCampanaBySlug>>
  embudoStats: {
    compartidas: number
    enlacesAbiertos: number
    landingVistas: number
    registrosIniciados: number
    registrosCompletados: number
    premiosReclamados: number
    membresiasAdquiridas: number
    primerCanje: number
    conversionFinal: number
  }
  participantes: number
  metasAlcanzadas: number
  premiosReclamados: number
  topCompartidores: { nombre: string; compartidas: number; registros: number }[]
}

export async function getCampanaDashboard(campanaId: string): Promise<CampanaDashboard | null> {
  const campana = await prisma.campanaInvitacion.findUnique({
    where: { id: campanaId },
    include: {
      company: {
        select: { id: true, name: true, slug: true, logoUrl: true, colorPrimario: true, type: true },
      },
    },
  })
  if (!campana) return null

  const [eventosTipo, progresoAgg, topRaw] = await Promise.all([
    prisma.invitacionEvento.groupBy({
      by: ['tipo'],
      where: { campanaId },
      _count: { id: true },
    }),
    prisma.invitacionProgreso.aggregate({
      where: { campanaId },
      _count: { _all: true },
      _sum: { registrosCompletados: true },
    }),
    prisma.invitacionEvento.groupBy({
      by: ['clienteId'],
      where: { campanaId, tipo: 'COMPARTIDA', clienteId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ])

  const countTipo = (t: string) =>
    eventosTipo.find((e) => e.tipo === t)?._count.id ?? 0

  const topIds = topRaw
    .map((t) => t.clienteId)
    .filter((id): id is string => id !== null)

  const [nombres, metasCount, premiosCount, registrosPorCliente] = await Promise.all([
    prisma.cliente.findMany({
      where: { id: { in: topIds } },
      select: { id: true, nombre: true },
    }),
    prisma.invitacionProgreso.count({ where: { campanaId, metaAlcanzada: true } }),
    prisma.invitacionProgreso.count({ where: { campanaId, premioReclamado: true } }),
    prisma.invitacionProgreso.findMany({
      where: { campanaId, clienteId: { in: topIds } },
      select: { clienteId: true, registrosCompletados: true },
    }),
  ])

  const nombreDe = new Map(nombres.map((n) => [n.id, n.nombre]))
  const regDe = new Map(registrosPorCliente.map((r) => [r.clienteId, r.registrosCompletados]))

  return {
    campana,
    embudoStats: {
      compartidas: countTipo('COMPARTIDA'),
      enlacesAbiertos: countTipo('ENLACE_ABIERTO'),
      landingVistas: countTipo('LANDING_VISTA'),
      registrosIniciados: countTipo('REGISTRO_INICIADO'),
      registrosCompletados: countTipo('REGISTRO_COMPLETADO'),
      premiosReclamados: countTipo('PREMIO_RECLAMADO'),
      membresiasAdquiridas: countTipo('MEMBRESIA_ADQUIRIDA'),
      primerCanje: countTipo('PRIMER_CANJE'),
      conversionFinal: countTipo('CONVERSION_FINAL'),
    },
    participantes: progresoAgg._count._all,
    metasAlcanzadas: metasCount,
    premiosReclamados: premiosCount,
    topCompartidores: topRaw.map((t) => ({
      nombre: nombreDe.get(t.clienteId!) ?? 'Cliente',
      compartidas: t._count.id,
      registros: regDe.get(t.clienteId!) ?? 0,
    })),
  }
}
