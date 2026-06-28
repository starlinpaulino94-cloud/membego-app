export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/auth/guards'
import { createCompanyAction } from '@/modules/empresas/actions'
import { CompanyForm } from '@/components/companies/CompanyForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NuevaEmpresaPage() {
  await requireSuperAdmin()

  async function action(_prev: Awaited<ReturnType<typeof createCompanyAction>>, formData: FormData) {
    'use server'
    const result = await createCompanyAction(_prev, formData)
    if (result.success && result.data) {
      redirect(`/admin/empresas/${result.data.id}`)
    }
    return result
  }

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/empresas">← Volver</Link>
        </Button>
        <h1 className="text-2xl font-semibold">Nueva empresa</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyForm action={action} submitLabel="Crear empresa" />
        </CardContent>
      </Card>
    </div>
  )
}
