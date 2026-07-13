import { requireRole } from '@/lib/auth/guards'
import { ADMIN_ROLES } from '@/types'
import { PageHeader } from '@/components/ui/page-header'
import { CampanaInvitacionForm } from '@/components/invitaciones/CampanaInvitacionForm'

export const metadata = { title: 'Nueva campaña de invitación' }

export default async function NuevaCampanaInvitacionPage() {
  await requireRole(ADMIN_ROLES)
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva campaña"
        description="Configura una campaña 'Invita y Gana' para que tus clientes traigan amigos."
      />
      <CampanaInvitacionForm />
    </div>
  )
}
