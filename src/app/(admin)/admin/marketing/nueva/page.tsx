import { requireRole } from '@/lib/auth/guards'
import { ADMIN_ROLES } from '@/types'
import { PageHeader } from '@/components/ui/page-header'
import { MarketingCampaignForm } from '@/components/engagement/MarketingCampaignForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Nueva campaña de marketing' }

export default async function NuevaCampanaMarketingPage() {
  await requireRole(ADMIN_ROLES)
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva campaña"
        description="Diseña una oferta con contador que aparecerá viva en el inicio de tus clientes."
      />
      <MarketingCampaignForm />
    </div>
  )
}
