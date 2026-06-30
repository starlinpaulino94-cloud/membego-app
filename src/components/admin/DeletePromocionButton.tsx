'use client'

import { useActionState, useEffect } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { eliminarPromocion, type PromocionState } from '@/modules/admin/promocionActions'
import { Button } from '@/components/ui/button'

const init: PromocionState = {}

export function DeletePromocionButton({
  id,
  titulo,
}: {
  id: string
  titulo: string
}) {
  const [state, formAction, pending] = useActionState(eliminarPromocion, init)

  useEffect(() => {
    if (state.success) toast.success(`"${titulo}" eliminada.`)
    if (state.error) toast.error(state.error)
  }, [state.success, state.error, titulo])

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`¿Eliminar la promoción "${titulo}"?`)) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button size="icon" variant="ghost" type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 text-red-500" />
        )}
      </Button>
    </form>
  )
}
