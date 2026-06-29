import { requireRole } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { getClienteFull } from '@/modules/cliente/queries'
import { PlanSelector } from '@/components/membresia/PlanSelector'
import { EstadoBadge } from '@/components/EstadoBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { MembershipEstado } from '@/types'

export const dynamic = 'force-dynamic'

export default async function MembresiaPage() {
  const user = await requireRole('CLIENTE')
  const cliente = user.metadata.clienteId
    ? await getClienteFull(user.metadata.clienteId)
    : null

  if (!cliente) {
    return <p className="text-slate-600">No se encontró tu información.</p>
  }

  const current = cliente.memberships[0]
  const hasActive = current?.estado === 'ACTIVA'

  const planes = await prisma.plan.findMany({
    where: { companyId: cliente.companyId, activo: true },
    orderBy: { precio: 'asc' },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi membresía</h1>
        <p className="text-slate-500">{cliente.company.name}</p>
      </div>

      {current && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Plan actual: {current.plan.nombre}</CardTitle>
            <EstadoBadge estado={current.estado as MembershipEstado} />
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {current.plan.esIlimitado ? (
              <p>Consumos ilimitados.</p>
            ) : (
              <p>Restantes este periodo: {current.lavadosRestantes}</p>
            )}
            {current.estado === 'PENDIENTE' && (
              <Alert>
                <AlertDescription>
                  Tu pago está pendiente de confirmación por la empresa.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {current ? 'Planes disponibles' : 'Elige tu plan'}
        </h2>
        {hasActive ? (
          <Alert>
            <AlertDescription>
              Ya tienes una membresía activa. Podrás cambiar de plan cuando
              venza el periodo actual.
            </AlertDescription>
          </Alert>
        ) : (
          <PlanSelector
            disabled={hasActive}
            planes={planes.map((p) => ({
              id: p.id,
              nombre: p.nombre,
              precio: new Intl.NumberFormat('es-DO').format(Number(p.precio)),
              esIlimitado: p.esIlimitado,
              descripcion: p.descripcion,
              beneficios: p.beneficios,
            }))}
          />
        )}
      </div>
    </div>
  )
}
