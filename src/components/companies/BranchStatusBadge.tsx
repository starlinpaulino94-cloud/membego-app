import { Badge } from '@/components/ui/badge'
import type { BranchStatus } from '@/modules/empresas/types'

export function BranchStatusBadge({ status }: { status: BranchStatus }) {
  return status === 'ACTIVE'
    ? <Badge variant="default">Activa</Badge>
    : <Badge variant="outline">Inactiva</Badge>
}
