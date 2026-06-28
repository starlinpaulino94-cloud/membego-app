export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth/guards'
import { getAssignmentById } from '@/modules/asignaciones/queries'
import { AssignmentStatusBadge } from '@/components/assignments/AssignmentStatusBadge'
import { AssignmentActions } from '@/components/assignments/AssignmentActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

export default async function AdminAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string; assignmentId: string }>
}) {
  await requireSuperAdmin()
  const { id: customerId, assignmentId } = await params

  const assignment = await getAssignmentById(assignmentId)
  if (!assignment || assignment.customerId !== customerId) notFound()

  const progressPct = assignment.progressTarget
    ? Math.min(Math.round((assignment.usesConsumed / assignment.progressTarget) * 100), 100)
    : null

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold">{assignment.promotion?.name ?? 'Asignación'}</h1>
            <AssignmentStatusBadge status={assignment.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Cliente: {assignment.customer?.firstName} {assignment.customer?.lastName} ·{' '}
            {assignment.customer?.user.email}
          </p>
        </div>
      </div>

      <AssignmentActions assignment={assignment} />

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Usos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-2xl font-bold">{assignment.usesConsumed}</p>
              <p className="text-xs text-muted-foreground">
                de {assignment.usesAllowed != null ? assignment.usesAllowed : '∞'} permitidos
              </p>
            </div>
            {progressPct != null && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progreso</span>
                  <span>{assignment.usesConsumed}/{assignment.progressTarget}</span>
                </div>
                <Progress value={progressPct} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Pago</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Confirmado</span>
              <span>{assignment.paymentConfirmed ? 'Sí' : 'No'}</span>
            </div>
            {assignment.paymentAmount != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto</span>
                <span>${Number(assignment.paymentAmount).toFixed(2)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Fechas</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {([
              ['Inicio', assignment.startedAt],
              ['Expira', assignment.expiresAt],
              ['Completada', assignment.completedAt],
            ] as [string, string | Date | null | undefined][]).map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span>{val ? new Date(val).toLocaleDateString('es-DO') : '—'}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {assignment.notes && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Notas</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm">{assignment.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>Creado: {new Date(assignment.createdAt).toLocaleString('es-DO')}</p>
        <p>Actualizado: {new Date(assignment.updatedAt).toLocaleString('es-DO')}</p>
      </div>

      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/clientes/${customerId}`}>← Volver al cliente</Link>
      </Button>
    </div>
  )
}
