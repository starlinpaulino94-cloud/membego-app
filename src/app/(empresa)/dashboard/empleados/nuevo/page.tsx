export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/guards'
import { listBranchesByCompany } from '@/modules/empresas/queries'
import { createEmployeeAction } from '@/modules/empleados/actions'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ActionResult } from '@/types/auth'
import type { Employee } from '@/modules/empleados/types'

export default async function NuevoEmpleadoPage() {
  const user = await requireRole('ADMIN_EMPRESA')
  if (!user.companyId) notFound()

  const companyId = user.companyId
  const branches = await listBranchesByCompany(companyId)

  async function action(_prev: ActionResult<Employee>, formData: FormData) {
    'use server'
    const result = await createEmployeeAction(companyId, _prev, formData)
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
        <h1 className="text-2xl font-semibold">Nuevo empleado</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos del empleado</CardTitle></CardHeader>
        <CardContent>
          <EmployeeForm action={action} branches={branches} isNew submitLabel="Crear empleado" />
        </CardContent>
      </Card>
    </div>
  )
}
