export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/auth/guards'
import { listAllCompanies } from '@/modules/empresas/queries'
import { listBranchesByCompany } from '@/modules/empresas/queries'
import { createEmployeeAction } from '@/modules/empleados/actions'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ActionResult } from '@/types/auth'
import type { Employee } from '@/modules/empleados/types'

interface Props {
  searchParams: Promise<{ companyId?: string }>
}

export default async function NuevoEmpleadoAdminPage({ searchParams }: Props) {
  await requireSuperAdmin()
  const { companyId } = await searchParams

  const { items: companies } = await listAllCompanies()
  const branches = companyId ? await listBranchesByCompany(companyId) : []

  async function action(_prev: ActionResult<Employee>, formData: FormData) {
    'use server'
    const result = await createEmployeeAction(companyId ?? '', _prev, formData)
    if (result.success) {
      redirect('/admin/empleados')
    }
    return result
  }

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/empleados">← Volver</Link>
        </Button>
        <h1 className="text-2xl font-semibold">Nuevo empleado</h1>
      </div>

      {/* Company selector */}
      <Card>
        <CardHeader><CardTitle className="text-base">Seleccionar empresa</CardTitle></CardHeader>
        <CardContent>
          <form method="get" className="space-y-2">
            <Label htmlFor="companyId">Empresa *</Label>
            <Select name="companyId" defaultValue={companyId ?? ''}>
              <SelectTrigger id="companyId">
                <SelectValue placeholder="Seleccionar empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" variant="outline" size="sm">Seleccionar</Button>
          </form>
        </CardContent>
      </Card>

      {companyId && (
        <Card>
          <CardHeader><CardTitle className="text-base">Datos del empleado</CardTitle></CardHeader>
          <CardContent>
            <EmployeeForm action={action} branches={branches} isNew submitLabel="Crear empleado" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
