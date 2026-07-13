import { requireRole } from '@/lib/auth/guards'
import { ADMIN_ROLES } from '@/types'
import { prisma } from '@/lib/prisma'
import { companyFilter } from '@/modules/admin/queries'
import { PageHeader } from '@/components/ui/page-header'
import { CampanaInvitacionForm } from '@/components/invitaciones/CampanaInvitacionForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Nueva campaña de invitación' }

export default async function NuevaCampanaInvitacionPage() {
  const user = await requireRole(ADMIN_ROLES)
  const companyId = companyFilter(user)

  // Promociones vigentes de la empresa: candidatas a beneficio digital (E8).
  const promociones = companyId
    ? await prisma.promocion.findMany({
        where: { companyId, activo: true, archivada: false },
        select: { id: true, titulo: true },
        orderBy: { titulo: 'asc' },
      })
    : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva campaña"
        description="Configura una campaña 'Invita y Gana' para que tus clientes traigan amigos."
      />
      <CampanaInvitacionForm promociones={promociones} />
    </div>
  )
}
