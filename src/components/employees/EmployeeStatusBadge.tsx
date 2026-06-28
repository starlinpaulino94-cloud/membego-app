import { Badge } from '@/components/ui/badge'
import type { EmployeeStatus } from '@/modules/empleados/types'

const CONFIG: Record<EmployeeStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE:    { label: 'Activo',     variant: 'default' },
  INACTIVE:  { label: 'Archivado',  variant: 'outline' },
  SUSPENDED: { label: 'Suspendido', variant: 'destructive' },
}

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const { label, variant } = CONFIG[status] ?? { label: status, variant: 'outline' }
  return <Badge variant={variant}>{label}</Badge>
}
