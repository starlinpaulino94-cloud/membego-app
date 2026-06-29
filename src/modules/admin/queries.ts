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

  const [totalClientes, activas, pendientes, visitasHoy] = await Promise.all([
    prisma.cliente.count({ where: clienteWhere }),
    prisma.membership.count({
      where: { ...membershipWhere, estado: 'ACTIVA' },
    }),
    prisma.membership.count({
      where: { ...membershipWhere, estado: 'PENDIENTE' },
    }),
    prisma.visit.count({
      where: {
        ...visitWhere,
        fechaVisita: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ])

  return { totalClientes, activas, pendientes, visitasHoy }
}
