import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { PromocionForm } from '@/components/admin/PromocionForm'

export default async function EditarPromocionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireRole(['ADMIN_EMPRESA', 'SUPERADMIN'])
  const { id } = await params

  const promo = await prisma.promocion.findUnique({ where: { id } })
  if (!promo) notFound()
  if (
    user.metadata.role !== 'SUPERADMIN' &&
    promo.companyId !== user.metadata.companyId
  ) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Editar promoción</h1>
      </div>
      <PromocionForm existing={promo} />
    </div>
  )
}
