'use client'

import { useActionState, useEffect } from 'react'
import { Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import {
  ejecutarAutomatizaciones,
  type AutomatizacionState,
} from '@/modules/admin/automatizacionActions'
import { Button } from '@/components/ui/button'

const init: AutomatizacionState = {}

export function EjecutarAutomatizaciones() {
  const [state, action, pending] = useActionState(ejecutarAutomatizaciones, init)

  useEffect(() => {
    if (state.success && state.resultado) {
      const { cumpleanos, porVencer, inactivos } = state.resultado
      const total = cumpleanos + porVencer + inactivos
      toast.success(
        total === 0
          ? 'Todo al día: no había avisos nuevos que enviar.'
          : `Enviados: ${cumpleanos} de cumpleaños, ${porVencer} por vencer y ${inactivos} de inactividad.`
      )
    }
    if (state.error) toast.error(state.error)
  }, [state.success, state.resultado, state.error])

  return (
    <form action={action}>
      <Button type="submit" disabled={pending} className="bg-sky-500 hover:bg-sky-400">
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Zap className="mr-2 h-4 w-4" />
        )}
        Ejecutar ahora
      </Button>
    </form>
  )
}
