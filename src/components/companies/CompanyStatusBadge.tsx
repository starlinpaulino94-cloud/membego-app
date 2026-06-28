import { Badge } from '@/components/ui/badge'
import type { CompanyStatus } from '@/modules/empresas/types'

const CONFIG: Record<CompanyStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE:    { label: 'Activa',     variant: 'default' },
  PENDING:   { label: 'Pendiente',  variant: 'secondary' },
  INACTIVE:  { label: 'Inactiva',   variant: 'outline' },
  SUSPENDED: { label: 'Suspendida', variant: 'destructive' },
}

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  const { label, variant } = CONFIG[status] ?? { label: status, variant: 'outline' }
  return <Badge variant={variant}>{label}</Badge>
}
