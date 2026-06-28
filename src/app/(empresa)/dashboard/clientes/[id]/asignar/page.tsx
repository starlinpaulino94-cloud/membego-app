export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireRole } from '@/lib/auth/guards'
import { getCustomerById, customerLinkedToCompany } from '@/modules/clientes/queries'
import { getActiveCompanyPromotions } from '@/modules/promociones/queries'
import { createAssignmentAction } from '@/modules/asignaciones/actions'
import { AssignmentForm } from '@/components/assignments/AssignmentForm'
import { Button } from '@/components/ui/button'

export default async function AsignarPromocionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA')
  const { id: customerId } = await params
  const companyId = user.companyId!

  const [customer, promotions] = await Promise.all([
    getCustomerById(customerId),
    getActiveCompanyPromotions(companyId),
  ])

  if (!customer) notFound()

  if (user.role !== 'SUPERADMIN') {
    const linked = await customerLinkedToCompany(customerId, companyId)
    if (!linked) notFound()
  }

  const boundAction = createAssignmentAction.bind(null, customerId, companyId)

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/clientes/${customerId}`}>←</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Asignar Promoción</h1>
          <p className="text-sm text-muted-foreground">
            Cliente: {customer.firstName} {customer.lastName}
          </p>
        </div>
      </div>

      {promotions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay promociones activas. {' '}
          <Link href="/dashboard/promociones/nueva" className="underline">Crear una promoción</Link>.
        </p>
      ) : (
        <AssignmentForm action={boundAction} promotions={promotions} />
      )}
    </div>
  )
}
