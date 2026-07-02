import { prisma } from '@/lib/prisma'

export interface EmpresaListItem {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  logoUrl: string | null
  email: string | null
  telefono: string | null
  direccion: string | null
  ciudad: string | null
  categoria: string | null
  website: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    clientes: number
    users: number
    sucursales: number
    plans: number
    promociones: number
  }
  _membresiaActivas: number
  _ingresos: number
  _ultimaActividad: Date | null
}

export async function listEmpresas(): Promise<EmpresaListItem[]> {
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          clientes: true,
          users: true,
          sucursales: true,
          plans: true,
          promociones: true,
        },
      },
    },
  })

  const enriched = await Promise.all(
    companies.map(async (c) => {
      const [activas, ingresos, ultimaActividad] = await Promise.all([
        prisma.membership.count({
          where: { estado: 'ACTIVA', cliente: { companyId: c.id } },
        }),
        prisma.membership.aggregate({
          where: {
            cliente: { companyId: c.id },
            montoPagado: { not: null },
          },
          _sum: { montoPagado: true },
        }),
        prisma.auditLog.findFirst({
          where: { companyId: c.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
      ])

      return {
        ...c,
        _membresiaActivas: activas,
        _ingresos: Number(ingresos._sum.montoPagado ?? 0),
        _ultimaActividad: ultimaActividad?.createdAt ?? null,
      }
    })
  )

  return enriched
}

export interface EmpresaDashboard {
  company: {
    id: string
    name: string
    slug: string
    type: string
    description: string | null
    logoUrl: string | null
    email: string | null
    telefono: string | null
    direccion: string | null
    ciudad: string | null
    categoria: string | null
    website: string | null
    isActive: boolean
    createdAt: Date
  }
  stats: {
    totalClientes: number
    totalUsuarios: number
    totalSucursales: number
    totalPlanes: number
    planesActivos: number
    totalPromociones: number
    promocionesActivas: number
    totalReferidos: number
    membresiasActivas: number
    membresiasPendientes: number
    membresiasTotal: number
    pagosConfirmados: number
    ingresosTotales: number
    ingresosEsteMes: number
  }
  actividadReciente: {
    id: string
    accion: string
    detalle: string | null
    createdAt: Date
    userName: string | null
  }[]
  topPlanes: {
    id: string
    nombre: string
    precio: number
    membresiaCount: number
  }[]
  membresiasPorEstado: { estado: string; count: number }[]
}

export async function getEmpresaDashboard(companyId: string): Promise<EmpresaDashboard | null> {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) return null

  const now = new Date()
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalClientes,
    totalUsuarios,
    totalSucursales,
    totalPlanes,
    planesActivos,
    totalPromociones,
    promocionesActivas,
    totalReferidos,
    membresiasActivas,
    membresiasPendientes,
    membresiasTotal,
    pagosConfirmados,
    ingresosTotales,
    ingresosEsteMes,
    actividadReciente,
    topPlanes,
    membresiasPorEstado,
  ] = await Promise.all([
    prisma.cliente.count({ where: { companyId } }),
    prisma.user.count({ where: { companyId } }),
    prisma.sucursal.count({ where: { companyId } }),
    prisma.plan.count({ where: { companyId } }),
    prisma.plan.count({ where: { companyId, activo: true } }),
    prisma.promocion.count({ where: { companyId } }),
    prisma.promocion.count({ where: { companyId, activo: true } }),
    prisma.referido.count({ where: { companyId } }),
    prisma.membership.count({ where: { estado: 'ACTIVA', cliente: { companyId } } }),
    prisma.membership.count({ where: { estado: 'PENDIENTE_PAGO', cliente: { companyId } } }),
    prisma.membership.count({ where: { cliente: { companyId } } }),
    prisma.membership.count({ where: { pagoConfirmado: true, cliente: { companyId } } }),
    prisma.membership.aggregate({
      where: { cliente: { companyId }, montoPagado: { not: null } },
      _sum: { montoPagado: true },
    }),
    prisma.membership.aggregate({
      where: {
        cliente: { companyId },
        montoPagado: { not: null },
        updatedAt: { gte: inicioMes },
      },
      _sum: { montoPagado: true },
    }),
    prisma.auditLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: { user: { select: { name: true } } },
    }) as Promise<{ id: string; accion: string; entidadTipo: string; payload: unknown; createdAt: Date; user: { name: string } | null }[]>,
    prisma.plan.findMany({
      where: { companyId, activo: true },
      include: { _count: { select: { memberships: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.membership.groupBy({
      by: ['estado'],
      where: { cliente: { companyId } },
      _count: { _all: true },
    }),
  ])

  return {
    company,
    stats: {
      totalClientes,
      totalUsuarios,
      totalSucursales,
      totalPlanes,
      planesActivos,
      totalPromociones,
      promocionesActivas,
      totalReferidos,
      membresiasActivas,
      membresiasPendientes,
      membresiasTotal,
      pagosConfirmados,
      ingresosTotales: Number(ingresosTotales._sum.montoPagado ?? 0),
      ingresosEsteMes: Number(ingresosEsteMes._sum.montoPagado ?? 0),
    },
    actividadReciente: actividadReciente.map((a) => ({
      id: a.id,
      accion: String(a.accion),
      detalle: a.entidadTipo,
      createdAt: a.createdAt,
      userName: a.user?.name ?? null,
    })),
    topPlanes: topPlanes.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precio: Number(p.precio),
      membresiaCount: p._count.memberships,
    })),
    membresiasPorEstado: membresiasPorEstado.map((m) => ({
      estado: m.estado,
      count: m._count._all,
    })),
  }
}
