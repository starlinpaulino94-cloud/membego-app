import { ADMIN_ROLES } from '@/types'
import { requireRole } from '@/lib/auth/guards'
import { NuevoPlanForm } from '@/components/admin/NuevoPlanForm'

export default async function NuevoPlanEmpresaPage() {
  await requireRole(ADMIN_ROLES)

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nuevo plan</h1>
        <p className="text-slate-500">
          Define un plan de membresía para tus clientes (ej. Silver, Gold,
          Premium, VIP).
        </p>
      </div>
      <NuevoPlanForm redirectTo="/admin/planes" />
    </div>
  )
}
