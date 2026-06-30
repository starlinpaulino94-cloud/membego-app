import { requireRole } from '@/lib/auth/guards'
import { PromocionForm } from '@/components/admin/PromocionForm'

export default async function NuevaPromocionPage() {
  await requireRole(['ADMIN_EMPRESA', 'SUPERADMIN'])
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nueva promoción</h1>
        <p className="text-slate-500">
          Se notificará automáticamente a todos tus clientes al publicarla.
        </p>
      </div>
      <PromocionForm />
    </div>
  )
}
