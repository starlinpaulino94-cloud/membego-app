'use server'

import { revalidatePath } from 'next/cache'
import { requireRole, requireCompanyAccess } from '@/lib/auth/guards'
import type { ActionResult } from '@/types/auth'
import { createEmployeeSchema, updateEmployeeSchema } from '../validations'
import { createEmployee, updateEmployee, setEmployeeStatus } from '../mutations'
import { getEmployeeById, emailExistsAsUser } from '../queries'
import { listBranchesByCompany } from '@/modules/empresas/queries'
import type { Employee, EmployeeStatus } from '../types'

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createEmployeeAction(
  targetCompanyId: string,
  _prev: ActionResult<Employee>,
  formData: FormData
): Promise<ActionResult<Employee>> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')

    // Derive companyId from JWT for non-superadmin — never trust form input
    const companyId = user.role === 'SUPERADMIN' ? targetCompanyId : user.companyId!

    if (user.role !== 'SUPERADMIN') {
      await requireCompanyAccess(companyId)
    }

    const raw = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      branchId: formData.get('branchId'),
    }

    const parsed = createEmployeeSchema.safeParse(raw)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    // Guard: duplicate email
    const exists = await emailExistsAsUser(parsed.data.email)
    if (exists) {
      return { success: false, error: 'Ya existe un usuario con ese email.', fieldErrors: { email: ['Email ya registrado'] } }
    }

    // Guard: branchId must belong to this company
    if (parsed.data.branchId) {
      const branches = await listBranchesByCompany(companyId)
      const branchOk = branches.some((b) => b.id === parsed.data.branchId)
      if (!branchOk) {
        return { success: false, error: 'La sucursal no pertenece a esta empresa.' }
      }
    }

    const employee = await createEmployee(
      { companyId, ...parsed.data },
      user.dbUserId
    )

    revalidatePath('/dashboard/empleados')
    revalidatePath('/admin/empleados')
    return { success: true, data: employee }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error inesperado' }
  }
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateEmployeeAction(
  employeeId: string,
  _prev: ActionResult<Employee>,
  formData: FormData
): Promise<ActionResult<Employee>> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')

    const existing = await getEmployeeById(employeeId)
    if (!existing) return { success: false, error: 'Empleado no encontrado' }

    if (user.role !== 'SUPERADMIN') {
      await requireCompanyAccess(existing.companyId)
    }

    const raw = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      branchId: formData.get('branchId'),
    }

    const parsed = updateEmployeeSchema.safeParse(raw)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    // Guard: branchId must belong to employee's company
    if (parsed.data.branchId) {
      const branches = await listBranchesByCompany(existing.companyId)
      const branchOk = branches.some((b) => b.id === parsed.data.branchId)
      if (!branchOk) {
        return { success: false, error: 'La sucursal no pertenece a la empresa del empleado.' }
      }
    }

    const updated = await updateEmployee(
      employeeId,
      {
        name: parsed.data.name,
        phone: parsed.data.phone,
        role: parsed.data.role,
        branchId: parsed.data.branchId === '' ? null : parsed.data.branchId,
      },
      user.dbUserId,
      existing.companyId
    )

    revalidatePath('/dashboard/empleados')
    revalidatePath('/admin/empleados')
    return { success: true, data: updated }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error inesperado' }
  }
}

// ─── Status ───────────────────────────────────────────────────────────────────

export async function setEmployeeStatusAction(
  employeeId: string,
  status: EmployeeStatus
): Promise<ActionResult> {
  try {
    const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')

    const existing = await getEmployeeById(employeeId)
    if (!existing) return { success: false, error: 'Empleado no encontrado' }

    if (user.role !== 'SUPERADMIN') {
      await requireCompanyAccess(existing.companyId)
    }

    await setEmployeeStatus(employeeId, status, user.dbUserId, existing.companyId)

    revalidatePath('/dashboard/empleados')
    revalidatePath('/admin/empleados')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error inesperado' }
  }
}
