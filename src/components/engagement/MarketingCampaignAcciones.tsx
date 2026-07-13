'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Pause, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  cambiarEstadoCampanaMarketing,
  eliminarCampanaMarketing,
} from '@/modules/admin/marketingActions'
import { Button } from '@/components/ui/button'
import type { MarketingCampaignEstado } from '@prisma/client'

/** Pausar / reanudar una campaña de marketing desde la lista del admin. */
export function MarketingEstadoButton({
  id,
  estado,
}: {
  id: string
  estado: MarketingCampaignEstado
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (estado === 'FINALIZADA') return null

  const activa = estado === 'ACTIVA'
  const next: MarketingCampaignEstado = activa ? 'PAUSADA' : 'ACTIVA'
  const Icon = activa ? Pause : Play

  const onClick = () => {
    startTransition(async () => {
      const res = await cambiarEstadoCampanaMarketing(id, next)
      if (res.ok) {
        toast.success(activa ? 'Campaña pausada.' : 'Campaña activada.')
        router.refresh()
      } else {
        toast.error('No se pudo cambiar el estado.')
      }
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={pending} className="gap-1">
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {activa ? 'Pausar' : 'Activar'}
    </Button>
  )
}

/** Eliminar una campaña de marketing (con confirmación). */
export function MarketingEliminarButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const onClick = () => {
    if (!confirm('¿Eliminar esta campaña? Esta acción no se puede deshacer.')) return
    startTransition(async () => {
      const res = await eliminarCampanaMarketing(id)
      if (res.ok) {
        toast.success('Campaña eliminada.')
        router.refresh()
      } else {
        toast.error('No se pudo eliminar.')
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={pending}
      className="gap-1 text-destructive hover:text-destructive"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      Eliminar
    </Button>
  )
}
