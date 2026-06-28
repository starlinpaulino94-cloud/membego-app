export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth/guards'
import { getCustomerById } from '@/modules/clientes/queries'
import { listAllPromotions } from '@/modules/promociones/queries'
import { createAssignmentAction } from '@/modules/asignaciones/actions'
import { AssignmentForm } from '@/components/assignments/AssignmentForm'
import { Button } from '@/components/ui/button'

export default async function AdminAsignarPromocionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ companyId?: string }>
}) {
  await requireSuperAdmin()
  const { id: customerId } = await params
  const { companyId } = await searchParams

  const customer = await getCustomerById(customerId)
  if (!customer) notFound()

  // Superadmin needs to pick or have a companyId
  const targetCompanyId =
    companyId ??
    (customer.customerCompanies?.[0]?.company?.id)

  const { items: allPromotions } = await listAllPromotions({
    status: 'ACTIVE',
    ...(targetCompanyId ? {} : {}),
  })

  const filteredPromotions = targetCompanyId
    ? allPromotions.filter((p) => p.companyId === targetCompanyId)
    : allPromotions

  const boundAction = createAssignmentAction.bind(null, customerId, targetCompanyId ?? '')

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/clientes/${customerId}`}>←</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Asignar Promoción</h1>
          <p className="text-sm text-muted-foreground">
            Cliente: {customer.firstName} {customer.lastName}
          </p>
        </div>
      </div>

      {filteredPromotions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay promociones activas disponibles.{' '}
          <Link href="/admin/promociones/nueva" className="underline">Crear una promoción</Link>.
        </p>
      ) : (
        <AssignmentForm action={boundAction} promotions={filteredPromotions} />
      )}
    </div>
  )
}
