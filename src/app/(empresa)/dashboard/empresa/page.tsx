export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/guards'
import { getCompanyById } from '@/modules/empresas/queries'
import { updateCompanyAction, updateCompanySettingsAction } from '@/modules/empresas/actions'
import { CompanyForm } from '@/components/companies/CompanyForm'
import { CompanySettingsForm } from '@/components/companies/CompanySettingsForm'
import { CompanyStatusBadge } from '@/components/companies/CompanyStatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ActionResult } from '@/types/auth'
import type { Company } from '@/modules/empresas/types'

export default async function MiEmpresaPage() {
  const user = await requireRole('ADMIN_EMPRESA')

  if (!user.companyId) notFound()

  const company = await getCompanyById(user.companyId)
  if (!company) notFound()

  async function action(_prev: ActionResult<Company>, formData: FormData) {
    'use server'
    const result = await updateCompanyAction(company!.id, _prev, formData)
    if (result.success) {
      redirect('/dashboard/empresa')
    }
    return result
  }

  async function settingsAction(_prev: ActionResult, formData: FormData) {
    'use server'
    return updateCompanySettingsAction(company!.id, _prev, formData)
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mi empresa</h1>
          <p className="text-sm text-muted-foreground">{company.name}</p>
        </div>
        <CompanyStatusBadge status={company.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyForm action={action} defaultValues={company} submitLabel="Guardar cambios" />
        </CardContent>
      </Card>

      {company.settings && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <CompanySettingsForm action={settingsAction} defaultValues={company.settings} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
