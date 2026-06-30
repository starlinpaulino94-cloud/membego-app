'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  crearReglaRecompensa,
  type ReglaRecompensaState,
} from '@/modules/admin/recompensaActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

const init: ReglaRecompensaState = {}

export function ReglaRecompensaForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(crearReglaRecompensa, init)

  useEffect(() => {
    if (state.success) {
      toast.success('Regla de recompensa creada.')
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre de la regla *</Label>
          <Input id="nombre" name="nombre" placeholder="Ej: 3 referidos = 1 lavado gratis" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valorCondicion">Referidos completados necesarios *</Label>
          <Input id="valorCondicion" name="valorCondicion" type="number" min={1} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipoRecompensa">Tipo de recompensa *</Label>
          <Select name="tipoRecompensa" defaultValue="LAVADOS_GRATIS" required>
            <SelectTrigger id="tipoRecompensa">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LAVADOS_GRATIS">Usos/lavados gratis</SelectItem>
              <SelectItem value="DESCUENTO_PORCENTAJE">Descuento %</SelectItem>
              <SelectItem value="DESCUENTO_MONTO">Descuento monto fijo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="valorRecompensa">Valor de la recompensa *</Label>
          <Input id="valorRecompensa" name="valorRecompensa" type="number" min={0} step="0.01" required />
        </div>
      </div>

      <Button type="submit" disabled={pending} className="bg-sky-500 hover:bg-sky-400">
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        Agregar regla
      </Button>
    </form>
  )
}
