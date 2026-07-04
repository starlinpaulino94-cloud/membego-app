import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types'

/** companyId filter: superadmin gets undefined (all), admin gets their company. */
export function companyFilter(user: SessionUser): string | undefined {
  if (user.metadata.role === 'SUPERADMIN') return undefined
  return user.metadata.companyId ?? '__none__'
}

export async function adminMetrics(user: SessionUser) {
  const companyId = companyFilter(user)
  const clienteWhere = companyId ? { companyId } : {}
  const membershipWhere = companyId
    ? { cliente: { companyId } }
    : {}
  const visitWhere = companyId ? { cliente: { companyId } } : {}

  const safeCount = (p: Promise<number>) => p.catch(() => 0)

  const [totalClientes, activas, pendientes, visitasHoy] = await Promise.all([
    safeCount(prisma.cliente.count({ where: clienteWhere })),
    safeCount(prisma.membership.count({
      where: { ...membershipWhere, estado: 'ACTIVA' },
    })),
    safeCount(prisma.membership.count({
      where: { ...membershipWhere, estado: 'PENDIENTE' },
    })),
    safeCount(prisma.visit.count({
      where: {
        ...visitWhere,
        fechaVisita: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    })),
  ])

  return { totalClientes, activas, pendientes, visitasHoy }
}

export interface ReportePorPlan {
  plan: string
  count: number
}

export interface ClienteFrecuente {
  clienteId: string
  nombre: string
  visitas: number
}

export interface MembresiaPorVencer {
  id: string
  cliente: string
  plan: string
  fechaVencimiento: Date | null
}

export interface ReportesData {
  ingresosMes: number
  activasPorPlan: ReportePorPlan[]
  lavadosMes: number
  clientesFrecuentes: ClienteFrecuente[]
  membresiasPorVencer: MembresiaPorVencer[]
}

/** All admin reports in one call. companyId undefined => all companies. */
export async function getReportesAdmin(
  companyId: string | undefined
): Promise<ReportesData> {
  const membershipWhere = companyId ? { cliente: { companyId } } : {}
  const visitWhere = companyId ? { cliente: { companyId } } : {}

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const in7Days = new Date(now)
  in7Days.setDate(in7Days.getDate() + 7)

  let ingresosMes = 0
  try {
    const ingresosAgg = await prisma.membership.aggregate({
      _sum: { montoPagado: true },
      where: {
        ...membershipWhere,
        pagoConfirmado: true,
        updatedAt: { gte: monthStart, lt: monthEnd },
      },
    })
    ingresosMes = Number(ingresosAgg._sum.montoPagado ?? 0)
  } catch {}

  let activasPorPlan: ReportePorPlan[] = []
  try {
    const activas = await prisma.membership.findMany({
      where: { ...membershipWhere, estado: 'ACTIVA' },
      include: { plan: { select: { nombre: true } } },
    })
    const planCounts = new Map<string, number>()
    for (const m of activas) {
      const nombre = m.plan.nombre
      planCounts.set(nombre, (planCounts.get(nombre) ?? 0) + 1)
    }
    activasPorPlan = Array.from(planCounts.entries())
      .map(([plan, count]) => ({ plan, count }))
      .sort((a, b) => b.count - a.count)
  } catch {}

  let lavadosMes = 0
  try {
    lavadosMes = await prisma.visit.count({
      where: {
        ...visitWhere,
        fechaVisita: { gte: monthStart, lt: monthEnd },
      },
    })
  } catch {}

  let clientesFrecuentes: ClienteFrecuente[] = []
  try {
    const visitasPorCliente = await prisma.visit.groupBy({
      by: ['clienteId'],
      where: visitWhere,
      _count: { _all: true },
      orderBy: { _count: { clienteId: 'desc' } },
      take: 5,
    })
    if (visitasPorCliente.length > 0) {
      const clientes = await prisma.cliente.findMany({
        where: { id: { in: visitasPorCliente.map((v) => v.clienteId) } },
        select: { id: true, nombre: true },
      })
      const nombreMap = new Map(clientes.map((c) => [c.id, c.nombre]))
      clientesFrecuentes = visitasPorCliente.map((v) => ({
        clienteId: v.clienteId,
        nombre: nombreMap.get(v.clienteId) ?? 'Cliente',
        visitas: v._count._all,
      }))
    }
  } catch {}

  let membresiasPorVencer: MembresiaPorVencer[] = []
  try {
    const porVencer = await prisma.membership.findMany({
      where: {
        ...membershipWhere,
        estado: 'ACTIVA',
        fechaVencimiento: { gte: now, lte: in7Days },
      },
      include: {
        plan: { select: { nombre: true } },
        cliente: { select: { nombre: true } },
      },
      orderBy: { fechaVencimiento: 'asc' },
    })
    membresiasPorVencer = porVencer.map((m) => ({
      id: m.id,
      cliente: m.cliente.nombre,
      plan: m.plan.nombre,
      fechaVencimiento: m.fechaVencimiento,
    }))
  } catch {}

  return {
    ingresosMes,
    activasPorPlan,
    lavadosMes,
    clientesFrecuentes,
    membresiasPorVencer,
  }
}

export interface ReportesGlobales {
  total: ReportesData
  empresas: { companyId: string; nombre: string; data: ReportesData }[]
}

/** Global reports (superadmin): overall plus per-company breakdown. */
export async function getReportesGlobales(): Promise<ReportesGlobales> {
  const [total, companies] = await Promise.all([
    getReportesAdmin(undefined),
    prisma.company.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  const empresas = await Promise.all(
    companies.map(async (c) => ({
      companyId: c.id,
      nombre: c.name,
      data: await getReportesAdmin(c.id),
    }))
  )

  return { total, empresas }
}
