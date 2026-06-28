import { prisma } from '@/lib/prisma'
import type { Employee, EmployeeStatus } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const EMPLOYEE_INCLUDE = {
  user: {
    select: { id: true, email: true, name: true, phone: true, avatarUrl: true, isActive: true },
  },
  company: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true } },
}

export async function listAllEmployees(params?: {
  companyId?: string
  status?: EmployeeStatus
  search?: string
  page?: number
  pageSize?: number
}): Promise<{ items: Employee[]; total: number }> {
  const { companyId, status, search, page = 1, pageSize = 30 } = params ?? {}

  const where: Record<string, unknown> = {}
  if (companyId) where.companyId = companyId
  if (status) where.status = status
  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }
  }

  const [items, total] = await Promise.all([
    db.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: EMPLOYEE_INCLUDE,
    }),
    db.employee.count({ where }),
  ])

  return { items, total }
}

export async function listEmployeesByCompany(companyId: string): Promise<Employee[]> {
  return db.employee.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    include: EMPLOYEE_INCLUDE,
  })
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  return db.employee.findUnique({
    where: { id },
    include: EMPLOYEE_INCLUDE,
  })
}

export async function getEmployeeByUserId(userId: string): Promise<Employee | null> {
  return db.employee.findUnique({
    where: { userId },
    include: EMPLOYEE_INCLUDE,
  })
}

export async function emailExistsAsUser(email: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { email } })
  return !!user
}
