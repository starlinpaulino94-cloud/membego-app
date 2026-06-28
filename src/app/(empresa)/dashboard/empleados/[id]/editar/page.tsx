export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireRole, requireCompanyAccess } from '@/lib/auth/guards'
import { getEmployeeById } from '@/modules/empleados/queries'
import { listBranchesByCompany } from '@/modules/empresas/queries'
import { updateEmployeeAction } from '@/modules/empleados/actions'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { EmployeeStatusBadge } from '@/components/employees/EmployeeStatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ActionResult } from '@/types/auth'
import type { Employee } from '@/modules/empleados/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarEmpleadoPage({ params }: Props) {
  const user = await requireRole('ADMIN_EMPRESA')
  const { id } = await params

  const employee = await getEmployeeById(id)
  if (!employee) notFound()

  // Prevent editing employees from other companies
  await requireCompanyAccess(employee.companyId)

  const branches = await listBranchesByCompany(user.companyId!)

  async function action(_prev: ActionResult<Employee>, formData: FormData) {
    'use server'
    const result = await updateEmployeeAction(id, _prev, formData)
    if (result.success) {
      redirect('/dashboard/empleados')
    }
    return result
  }

  return (
    <div className="p-6 max-w-xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/empleados">← Volver</Link>
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{employee.user.name}</h1>
          <EmployeeStatusBadge status={employee.status} />
        </div>
      </div>
      {employee.branch && (
        <p className="text-sm text-muted-foreground">{employee.branch.name}</p>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Editar empleado</CardTitle></CardHeader>
        <CardContent>
          <EmployeeForm
            action={action}
            defaultValues={employee}
            branches={branches}
            submitLabel="Guardar cambios"
          />
        </CardContent>
      </Card>
    </div>
  )
}
