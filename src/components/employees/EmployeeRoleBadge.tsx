import { Badge } from '@/components/ui/badge'
import type { EmployeeRole } from '@/modules/empleados/types'

const LABELS: Record<EmployeeRole, string> = {
  ADMIN_EMPRESA: 'Admin',
  EMPLEADO: 'Empleado',
}

export function EmployeeRoleBadge({ role }: { role: EmployeeRole }) {
  return (
    <Badge variant={role === 'ADMIN_EMPRESA' ? 'secondary' : 'outline'}>
      {LABELS[role] ?? role}
    </Badge>
  )
}
