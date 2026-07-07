import { AlertCircle } from 'lucide-react'
import { ADMIN_ROLES } from '@/types'
import { requireRole } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { contarSegmentos, type ConteoSegmentos } from '@/modules/admin/segmentos'
import { NotifSegmentForm } from '@/components/admin/NotifSegmentForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function NotificacionesEmpresaPage() {
  const user = await requireRole(ADMIN_ROLES)
  const companyId = user.metadata.companyId

  if (!companyId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Notificaciones</h1>
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            Esta vista es por empresa. Inicia sesión con una cuenta de empresa.
          </CardContent>
        </Card>
      </div>
    )
  }

  let conteos: ConteoSegmentos = {
    seguidores: 0,
    todos: 0,
    activos: 0,
    por_vencer: 0,
    nuevos: 0,
    inactivos: 0,
  }
  let planes: { id: string; nombre: string }[] = []
  try {
    ;[conteos, planes] = await Promise.all([
      contarSegmentos(companyId),
      prisma.plan.findMany({
        where: { companyId, activo: true },
        select: { id: true, nombre: true },
        orderBy: { orden: 'asc' },
      }),
    ])
  } catch (e) {
    console.error('[admin-notificaciones]', e)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notificaciones</h1>
        <p className="text-slate-500">
          Envía avisos dentro de MembeGo a segmentos específicos de tus
          clientes y seguidores.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva notificación segmentada</CardTitle>
        </CardHeader>
        <CardContent>
          <NotifSegmentForm conteos={conteos} planes={planes} />
        </CardContent>
      </Card>
    </div>
  )
}
