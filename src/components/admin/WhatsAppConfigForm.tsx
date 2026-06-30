'use client'

import { useActionState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  guardarWhatsAppConfig,
  type WhatsAppConfigState,
} from '@/modules/admin/whatsappActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'

interface Existing {
  numero: string
  mensajePlantilla: string
  activo: boolean
}

const init: WhatsAppConfigState = {}

export function WhatsAppConfigForm({ existing }: { existing?: Existing }) {
  const [state, formAction, pending] = useActionState(guardarWhatsAppConfig, init)

  useEffect(() => {
    if (state.success) toast.success('Configuración de WhatsApp guardada.')
  }, [state.success])

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="numero">Número de WhatsApp *</Label>
        <Input
          id="numero"
          name="numero"
          defaultValue={existing?.numero ?? ''}
          placeholder="18095550000 (código de país + número)"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mensajePlantilla">Mensaje predeterminado</Label>
        <Textarea
          id="mensajePlantilla"
          name="mensajePlantilla"
          defaultValue={existing?.mensajePlantilla ?? ''}
          rows={3}
          placeholder="Hola, quisiera más información."
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="activo"
          name="activo"
          defaultChecked={existing?.activo ?? true}
          value="true"
          onCheckedChange={(checked) => {
            const el = document.querySelector<HTMLInputElement>('input[name="activo"]')
            if (el) el.value = String(checked)
          }}
        />
        <Label htmlFor="activo">Mostrar botón de WhatsApp a los clientes</Label>
      </div>

      <Button type="submit" disabled={pending} className="bg-green-600 hover:bg-green-500">
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar
      </Button>
    </form>
  )
}
