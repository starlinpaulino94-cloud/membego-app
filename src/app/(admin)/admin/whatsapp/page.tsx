import { requireRole } from '@/lib/auth/guards'
import { companyFilter } from '@/modules/admin/queries'
import { prisma } from '@/lib/prisma'
import { WhatsAppConfigForm } from '@/components/admin/WhatsAppConfigForm'

export const dynamic = 'force-dynamic'

export default async function WhatsAppConfigPage() {
  const user = await requireRole(['ADMIN_EMPRESA', 'SUPERADMIN'])
  const companyId = companyFilter(user)

  const config = companyId
    ? await prisma.whatsAppConfig.findUnique({ where: { companyId } })
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">WhatsApp</h1>
        <p className="text-slate-500">
          Configura el número y mensaje predeterminado que verán tus clientes
          para contactarte por WhatsApp.
        </p>
      </div>
      <WhatsAppConfigForm
        existing={
          config
            ? {
                numero: config.numero,
                mensajePlantilla: config.mensajePlantilla,
                activo: config.activo,
              }
            : undefined
        }
      />
    </div>
  )
}
