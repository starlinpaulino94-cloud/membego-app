import { prisma } from '@/lib/prisma'
import type { Company, Branch, CompanyStatus } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export async function listAllCompanies(params?: {
  status?: CompanyStatus
  search?: string
  page?: number
  pageSize?: number
}): Promise<{ items: Company[]; total: number }> {
  const { status, search, page = 1, pageSize = 20 } = params ?? {}

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { legalName: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    db.company.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { branches: true, employees: true } },
        settings: true,
      },
    }),
    db.company.count({ where }),
  ])

  return { items, total }
}

export async function getCompanyById(id: string): Promise<Company | null> {
  return db.company.findUnique({
    where: { id },
    include: {
      settings: true,
      _count: { select: { branches: true, employees: true } },
    },
  })
}

export async function listBranchesByCompany(companyId: string): Promise<Branch[]> {
  return db.branch.findMany({
    where: { companyId },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { employees: true } },
    },
  })
}

export async function getBranchById(id: string): Promise<Branch | null> {
  return db.branch.findUnique({
    where: { id },
    include: { company: { select: { name: true } } },
  })
}

export async function getGlobalStats(): Promise<{
  empresas: { total: number; activas: number; pendientes: number }
  clientes: { total: number; activos: number; bloqueados: number }
  promociones: { total: number; activas: number; borradores: number; pausadas: number }
  asignaciones: { total: number; activas: number; completadas: number; canceladas: number }
  validaciones: { total: number; confirmadas: number; rechazadas: number; pendientes: number }
}> {
  const [
    totalEmpresas,
    activasEmpresas,
    pendientesEmpresas,
    totalClientes,
    activosClientes,
    bloqueadosClientes,
    totalPromociones,
    activasPromociones,
    borradoresPromociones,
    pausadasPromociones,
    totalAsignaciones,
    activasAsignaciones,
    completadasAsignaciones,
    canceladasAsignaciones,
    totalValidaciones,
    confirmadasValidaciones,
    rechazadasValidaciones,
    pendientesValidaciones,
  ] = await Promise.all([
    db.company.count(),
    db.company.count({ where: { status: 'ACTIVE' } }),
    db.company.count({ where: { status: 'PENDING' } }),
    db.customer.count(),
    db.customer.count({ where: { status: 'ACTIVE' } }),
    db.customer.count({ where: { status: 'BLOCKED' } }),
    db.promotion.count(),
    db.promotion.count({ where: { status: 'ACTIVE' } }),
    db.promotion.count({ where: { status: 'DRAFT' } }),
    db.promotion.count({ where: { status: 'PAUSED' } }),
    db.promotionAssignment.count(),
    db.promotionAssignment.count({ where: { status: 'ACTIVE' } }),
    db.promotionAssignment.count({ where: { status: 'COMPLETED' } }),
    db.promotionAssignment.count({ where: { status: 'CANCELLED' } }),
    db.validation.count(),
    db.validation.count({ where: { status: 'CONFIRMED' } }),
    db.validation.count({ where: { status: 'REJECTED' } }),
    db.validation.count({ where: { status: { in: ['SCANNED', 'EVALUATED'] } } }),
  ])

  return {
    empresas: { total: totalEmpresas, activas: activasEmpresas, pendientes: pendientesEmpresas },
    clientes: { total: totalClientes, activos: activosClientes, bloqueados: bloqueadosClientes },
    promociones: {
      total: totalPromociones,
      activas: activasPromociones,
      borradores: borradoresPromociones,
      pausadas: pausadasPromociones,
    },
    asignaciones: {
      total: totalAsignaciones,
      activas: activasAsignaciones,
      completadas: completadasAsignaciones,
      canceladas: canceladasAsignaciones,
    },
    validaciones: {
      total: totalValidaciones,
      confirmadas: confirmadasValidaciones,
      rechazadas: rechazadasValidaciones,
      pendientes: pendientesValidaciones,
    },
  }
}

export async function listAuditLogs(params?: {
  companyId?: string
  event?: string
  page?: number
  pageSize?: number
}): Promise<{ items: Record<string, unknown>[]; total: number }> {
  const { companyId, event, page = 1, pageSize = 50 } = params ?? {}

  const where: Record<string, unknown> = {}
  if (companyId) where.companyId = companyId
  if (event) where.event = { contains: event, mode: 'insensitive' }

  const [items, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { email: true, name: true } },
        company: { select: { name: true } },
      },
    }),
    db.auditLog.count({ where }),
  ])

  return { items, total }
}
