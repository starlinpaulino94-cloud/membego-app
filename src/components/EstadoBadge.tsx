import { Badge } from '@/components/ui/badge'
import type { MembershipEstado } from '@/types'

const MAP: Record<MembershipEstado, { label: string; className: string }> = {
  ACTIVA: { label: 'Activa', className: 'bg-green-100 text-green-700' },
  PENDIENTE: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  VENCIDA: { label: 'Vencida', className: 'bg-red-100 text-red-700' },
  CANCELADA: { label: 'Cancelada', className: 'bg-slate-200 text-slate-600' },
}

export function EstadoBadge({ estado }: { estado: MembershipEstado }) {
  const cfg = MAP[estado]
  return (
    <Badge variant="secondary" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}
