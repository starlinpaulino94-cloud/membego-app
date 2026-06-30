'use client'

import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  actualizarReglaRecompensa,
  eliminarReglaRecompensa,
  type ReglaRecompensaState,
} from '@/modules/admin/recompensaActions'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

const init: ReglaRecompensaState = {}

export function ReglaRecompensaToggle({ id, activo }: { id: string; activo: boolean }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [toggleState, toggleAction] = useActionState(actualizarReglaRecompensa, init)
  const [deleteState, deleteAction] = useActionState(eliminarReglaRecompensa, init)

  useEffect(() => {
    if (toggleState.error) toast.error(toggleState.error)
  }, [toggleState.error])
  useEffect(() => {
    if (deleteState.success) toast.success('Regla eliminada.')
    if (deleteState.error) toast.error(deleteState.error)
  }, [deleteState.success, deleteState.error])

  return (
    <div className="flex items-center gap-2">
      <form ref={formRef} action={toggleAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="activo" value={String(!activo)} />
        <Switch
          checked={activo}
          onCheckedChange={() => formRef.current?.requestSubmit()}
        />
      </form>
      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (!confirm('¿Eliminar esta regla?')) e.preventDefault()
        }}
      >
        <input type="hidden" name="id" value={id} />
        <Button size="icon" variant="ghost" type="submit">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </form>
    </div>
  )
}
