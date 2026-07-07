import { requireRole } from '@/lib/auth/guards'
import { ADMIN_ROLES } from '@/types'
import { companyFilter } from '@/modules/admin/queries'
import { prisma } from '@/lib/prisma'
import { PromocionForm } from '@/components/admin/PromocionForm'

export const dynamic = 'force-dynamic'

export default async function NuevaPromocionPage() {
  const user = await requireRole(ADMIN_ROLES)
  const companyId = companyFilter(user)

  const campanas = companyId
    ? await prisma.campana.findMany({
        where: { companyId, activo: true },
        select: { id: true, nombre: true },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nueva promoción</h1>
        <p className="text-slate-500">
          Se notificará automáticamente a tus seguidores al publicarla.
        </p>
      </div>
      <PromocionForm campanas={campanas} />
    </div>
  )
}
