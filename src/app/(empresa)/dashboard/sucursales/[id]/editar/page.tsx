export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireRole, requireCompanyAccess } from '@/lib/auth/guards'
import { getBranchById } from '@/modules/empresas/queries'
import { updateBranchAction } from '@/modules/empresas/actions'
import { BranchForm } from '@/components/companies/BranchForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ActionResult } from '@/types/auth'
import type { Branch } from '@/modules/empresas/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarSucursalPage({ params }: Props) {
  const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')
  const { id } = await params

  const branch = await getBranchById(id)
  if (!branch) notFound()

  // Verify the admin owns this branch's company
  if (user.role !== 'SUPERADMIN') {
    await requireCompanyAccess(branch.companyId)
  }

  async function action(_prev: ActionResult<Branch>, formData: FormData) {
    'use server'
    const result = await updateBranchAction(id, _prev, formData)
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
        <h1 className="text-2xl font-semibold">Editar: {branch.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la sucursal</CardTitle>
        </CardHeader>
        <CardContent>
          <BranchForm action={action} defaultValues={branch} submitLabel="Guardar cambios" />
        </CardContent>
      </Card>
    </div>
  )
}
