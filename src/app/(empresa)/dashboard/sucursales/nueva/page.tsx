export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/guards'
import { createBranchAction } from '@/modules/empresas/actions'
import { BranchForm } from '@/components/companies/BranchForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ActionResult } from '@/types/auth'
import type { Branch } from '@/modules/empresas/types'

export default async function NuevaSucursalPage() {
  const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')
  if (!user.companyId) notFound()

  const companyId = user.companyId

  async function action(_prev: ActionResult<Branch>, formData: FormData) {
    'use server'
    const result = await createBranchAction(companyId, _prev, formData)
    if (result.success) {
      redirect('/dashboard/sucursales')
    }
    return result
  }

  return (
    <div className="p-6 max-w-xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/sucursales">← Volver</Link>
        </Button>
        <h1 className="text-2xl font-semibold">Nueva sucursal</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la sucursal</CardTitle>
        </CardHeader>
        <CardContent>
          <BranchForm action={action} submitLabel="Crear sucursal" />
        </CardContent>
      </Card>
    </div>
  )
}
