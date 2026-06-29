export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { requireRole } from '@/lib/auth/guards'
import { listCompanyAssignments } from '@/modules/asignaciones/queries'
import { AssignmentStatusBadge } from '@/components/assignments/AssignmentStatusBadge'
import { Button } from '@/components/ui/button'

export default async function AsignacionesPendientesPage() {
  const user = await requireRole('SUPERADMIN', 'ADMIN_EMPRESA', 'EMPLEADO')
  const companyId = user.companyId!

  const { items: assignments } = await listCompanyAssignments(companyId, { status: 'PENDING_PAYMENT' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Pagos pendientes</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {assignments.length === 0
              ? 'No hay asignaciones pendientes de pago'
              : `${assignments.length} asignación${assignments.length !== 1 ? 'es' : ''} por confirmar`}
          </p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Todo al dia. No hay pagos pendientes.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Promoción</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Monto</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Registrado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignments.map((a) => (
                <tr key={a.id} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {a.customer?.firstName} {a.customer?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.customer?.user?.email ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground">{a.promotion?.name ?? ''}</td>
                  <td className="px-4 py-3 text-foreground">
                    {a.paymentAmount != null
                      ? `${a.paymentAmount} DOP`
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <AssignmentStatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString('es-DO')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/clientes/${a.customerId}/asignaciones/${a.id}`}>
                        Ver
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
