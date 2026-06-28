export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/auth/guards'
import { getCompanyById } from '@/modules/empresas/queries'
import { updateCompanyAction } from '@/modules/empresas/actions'
import { CompanyForm } from '@/components/companies/CompanyForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ActionResult } from '@/types/auth'
import type { Company } from '@/modules/empresas/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarEmpresaPage({ params }: Props) {
  await requireSuperAdmin()
  const { id } = await params
  const company = await getCompanyById(id)
  if (!company) notFound()

  async function action(_prev: ActionResult<Company>, formData: FormData) {
    'use server'
    const result = await updateCompanyAction(id, _prev, formData)
    if (result.success) {
      redirect(`/admin/empresas/${id}`)
    }
    return result
  }

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/empresas/${id}`}>← Volver</Link>
        </Button>
        <h1 className="text-2xl font-semibold">Editar: {company.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyForm action={action} defaultValues={company} submitLabel="Guardar cambios" />
        </CardContent>
      </Card>
    </div>
  )
}
