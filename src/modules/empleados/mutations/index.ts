import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import type { Employee, EmployeeStatus, CreateEmployeeInput, UpdateEmployeeInput, EmployeeRole } from '../types'
import { writeAuditLog } from '@/modules/empresas/mutations'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

function placeholderSupabaseId(): string {
  return `00000000-0000-0000-0000-${randomBytes(6).toString('hex')}`
}

export async function createEmployee(
  data: CreateEmployeeInput,
  createdByUserId?: string
): Promise<Employee> {
  const employee = await db.user.create({
    data: {
      supabaseId: placeholderSupabaseId(),
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      role: data.role,
      employee: {
        create: {
          companyId: data.companyId,
          branchId: data.branchId || null,
          role: data.role,
          status: 'ACTIVE',
        },
      },
    },
    include: {
      employee: {
        include: {
          user: {
            select: { id: true, email: true, name: true, phone: true, avatarUrl: true, isActive: true },
          },
          company: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (createdByUserId) {
    await writeAuditLog({
      companyId: data.companyId,
      userId: createdByUserId,
      event: 'EMPLOYEE_CREATED',
      entityType: 'Employee',
      entityId: employee.employee.id,
      payload: { email: data.email, role: data.role },
    })
  }

  return employee.employee
}

export async function updateEmployee(
  employeeId: string,
  data: UpdateEmployeeInput,
  actorUserId?: string,
  companyId?: string
): Promise<Employee> {
  const { branchId, role, name, phone } = data

  const updated = await db.$transaction(async (tx: typeof db) => {
    const emp = await tx.employee.update({
      where: { id: employeeId },
      data: {
        ...(branchId !== undefined && { branchId: branchId || null }),
        ...(role !== undefined && { role }),
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true, avatarUrl: true, isActive: true },
        },
        company: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
      },
    })

    if (name !== undefined || phone !== undefined) {
      await tx.user.update({
        where: { id: emp.userId },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone: phone || null }),
          ...(role !== undefined && { role }),
        },
      })
    }

    return emp
  })

  if (actorUserId) {
    const payload: Record<string, unknown> = {}
    if (role !== undefined) payload.role = role
    if (branchId !== undefined) payload.branchId = branchId

    const events: string[] = []
    if (role !== undefined) events.push('EMPLOYEE_ROLE_CHANGED')
    if (branchId !== undefined) events.push('EMPLOYEE_BRANCH_CHANGED')
    if (events.length === 0) events.push('EMPLOYEE_UPDATED')

    await writeAuditLog({
      companyId,
      userId: actorUserId,
      event: events[0],
      entityType: 'Employee',
      entityId: employeeId,
      payload,
    })
  }

  return updated
}

export async function setEmployeeStatus(
  employeeId: string,
  status: EmployeeStatus,
  actorUserId?: string,
  companyId?: string
): Promise<Employee> {
  const updated = await db.employee.update({
    where: { id: employeeId },
    data: { status },
    include: {
      user: {
        select: { id: true, email: true, name: true, phone: true, avatarUrl: true, isActive: true },
      },
      company: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true } },
    },
  })

  // Mirror isActive on User when suspending/archiving
  if (status === 'SUSPENDED' || status === 'INACTIVE') {
    await db.user.update({
      where: { id: updated.userId },
      data: { isActive: false },
    })
  } else if (status === 'ACTIVE') {
    await db.user.update({
      where: { id: updated.userId },
      data: { isActive: true },
    })
  }

  const eventMap: Record<EmployeeStatus, string> = {
    ACTIVE: 'EMPLOYEE_ACTIVATED',
    SUSPENDED: 'EMPLOYEE_SUSPENDED',
    INACTIVE: 'EMPLOYEE_ARCHIVED',
  }

  if (actorUserId) {
    await writeAuditLog({
      companyId,
      userId: actorUserId,
      event: eventMap[status],
      entityType: 'Employee',
      entityId: employeeId,
      payload: { newStatus: status },
    })
  }

  return updated
}

export async function changeBranch(
  employeeId: string,
  branchId: string | null,
  actorUserId?: string,
  companyId?: string
): Promise<Employee> {
  return updateEmployee(
    employeeId,
    { branchId },
    actorUserId,
    companyId
  )
}

export { writeAuditLog }
export type { EmployeeRole }
