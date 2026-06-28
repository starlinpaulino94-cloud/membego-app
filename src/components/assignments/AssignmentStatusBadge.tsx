import { Badge } from '@/components/ui/badge'
import type { AssignmentStatus } from '@/modules/asignaciones/types'

const CONFIG: Record<AssignmentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING_PAYMENT: { label: 'Pago pendiente', variant: 'outline' },
  ACTIVE:          { label: 'Activa',         variant: 'default' },
  COMPLETED:       { label: 'Completada',     variant: 'secondary' },
  USED:            { label: 'Usada',          variant: 'secondary' },
  EXPIRED:         { label: 'Expirada',       variant: 'outline' },
  CANCELLED:       { label: 'Cancelada',      variant: 'destructive' },
  BLOCKED:         { label: 'Bloqueada',      variant: 'destructive' },
}

export function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  const { label, variant } = CONFIG[status] ?? { label: status, variant: 'outline' }
  return <Badge variant={variant}>{label}</Badge>
}
