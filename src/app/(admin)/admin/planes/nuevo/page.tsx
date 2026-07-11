import Link from 'next/link'
import { ADMIN_ROLES } from '@/types'
import { requireRole } from '@/lib/auth/guards'
import { planPrefill } from '@/modules/admin/plantillas'
import { NuevoPlanForm } from '@/components/admin/NuevoPlanForm'
import { LayoutTemplate } from 'lucide-react'

export default async function NuevoPlanEmpresaPage({
  searchParams,
}: {
  searchParams: Promise<{ plantilla?: string }>
}) {
  await requireRole(ADMIN_ROLES)
  const { plantilla } = await searchParams

  // Fase E3: al llegar desde la galería, se copia la configuración de la
  // plantilla como valores iniciales. El plan creado es independiente.
  const prefill = plantilla ? planPrefill(plantilla) : null

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nuevo plan</h1>
        <p className="text-slate-500">
          Define un plan de membresía para tus clientes (ej. Silver, Gold,
          Premium, VIP).
        </p>
      </div>

      {prefill && (
        <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm">
          <LayoutTemplate className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          <div>
            <p className="font-medium text-sky-900">
              Basado en la plantilla &laquo;{prefill.plantillaNombre}&raquo;
            </p>
            <p className="text-sky-700">
              Es una copia tuya: ajusta precio, beneficios y condiciones antes de
              guardar. La plantilla original no se modifica.{' '}
              <Link href="/admin/planes/plantillas" className="underline">
                Elegir otra plantilla
              </Link>
            </p>
          </div>
        </div>
      )}

      <NuevoPlanForm redirectTo="/admin/planes" prefill={prefill ?? undefined} />
    </div>
  )
}
