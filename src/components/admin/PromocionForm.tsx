'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  crearPromocion,
  actualizarPromocion,
  type PromocionState,
} from '@/modules/admin/promocionActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'

interface Existing {
  id: string
  titulo: string
  descripcion: string
  imagenUrl: string | null
  vigenciaHasta: Date | null
  activo: boolean
}

const init: PromocionState = {}

function toDateInputValue(d: Date | null) {
  if (!d) return ''
  return new Date(d).toISOString().slice(0, 10)
}

export function PromocionForm({ existing }: { existing?: Existing }) {
  const router = useRouter()
  const action = existing ? actualizarPromocion : crearPromocion
  const [state, formAction, pending] = useActionState(action, init)

  useEffect(() => {
    if (state.success) {
      toast.success(existing ? 'Promoción actualizada.' : 'Promoción publicada.')
      router.push('/admin/promociones')
      router.refresh()
    }
  }, [state.success, existing, router])

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {existing && <input type="hidden" name="id" value={existing.id} />}

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          name="titulo"
          defaultValue={existing?.titulo}
          placeholder="Ej: 20% de descuento en tu primer mes"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción *</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          defaultValue={existing?.descripcion}
          rows={4}
          placeholder="Detalles de la promoción para el cliente"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imagenUrl">Imagen (URL)</Label>
        <Input
          id="imagenUrl"
          name="imagenUrl"
          defaultValue={existing?.imagenUrl ?? ''}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vigenciaHasta">Vigente hasta</Label>
        <Input
          id="vigenciaHasta"
          name="vigenciaHasta"
          type="date"
          defaultValue={toDateInputValue(existing?.vigenciaHasta ?? null)}
        />
      </div>

      {existing && (
        <div className="flex items-center gap-3">
          <Switch
            id="activo"
            name="activo"
            defaultChecked={existing.activo}
            value="true"
            onCheckedChange={(checked) => {
              const el = document.querySelector<HTMLInputElement>('input[name="activo"]')
              if (el) el.value = String(checked)
            }}
          />
          <Label htmlFor="activo">Promoción visible para clientes</Label>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="bg-sky-500 hover:bg-sky-400">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {existing ? 'Guardar cambios' : 'Publicar promoción'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
