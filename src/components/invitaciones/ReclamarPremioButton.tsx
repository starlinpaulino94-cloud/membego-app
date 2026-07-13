'use client'

import { useTransition } from 'react'
import { Gift, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { reclamarPremio } from '@/modules/invitaciones/clienteActions'
import { Button } from '@/components/ui/button'

export function ReclamarPremioButton({ campanaId }: { campanaId: string }) {
  const [pending, startTransition] = useTransition()

  const handleClaim = () => {
    startTransition(async () => {
      const res = await reclamarPremio(campanaId)
      if (res.ok) {
        toast.success('Premio reclamado exitosamente')
      } else {
        toast.error(res.error || 'No se pudo reclamar el premio')
      }
    })
  }

  return (
    <Button
      onClick={handleClaim}
      disabled={pending}
      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
      {pending ? 'Reclamando...' : 'Reclamar mi premio'}
    </Button>
  )
}
