'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ActionResult } from '@/types/auth'
import type { Assignment } from '@/modules/asignaciones/types'

interface Promotion {
  id: string
  name: string
  type: string
}

interface AssignmentFormProps {
  action: (prev: ActionResult<Assignment>, formData: FormData) => Promise<ActionResult<Assignment>>
  promotions: Promotion[]
  submitLabel?: string
}

const initialState: ActionResult<Assignment> = { success: false }

function toDatetimeLocal(value?: Date | string | null): string {
  if (!value) return ''
  const d = typeof value === 'string' ? new Date(value) : value
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 16)
}

// Default expiry 1 year from now
function defaultExpiry(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return toDatetimeLocal(d)
}

export function AssignmentForm({ action, promotions, submitLabel = 'Asignar' }: AssignmentFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="promotionId">Promoción *</Label>
        <Select name="promotionId" required>
          <SelectTrigger id="promotionId">
            <SelectValue placeholder="Seleccionar promoción" />
          </SelectTrigger>
          <SelectContent>
            {promotions.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.promotionId && (
          <p className="text-sm text-destructive">{state.fieldErrors.promotionId[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="usesAllowed">Usos permitidos</Label>
          <Input
            id="usesAllowed"
            name="usesAllowed"
            type="number"
            min={1}
            placeholder="Sin límite"
          />
          <p className="text-xs text-muted-foreground">Vacío = ilimitado</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="progressTarget">Meta de visitas</Label>
          <Input
            id="progressTarget"
            name="progressTarget"
            type="number"
            min={1}
            placeholder="Para promociones por visitas"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="paymentAmount">Monto de pago</Label>
          <Input
            id="paymentAmount"
            name="paymentAmount"
            type="number"
            min={0}
            step={0.01}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expiresAt">Expira</Label>
          <Input
            id="expiresAt"
            name="expiresAt"
            type="datetime-local"
            defaultValue={defaultExpiry()}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="requiresPayment" name="requiresPayment" />
        <Label htmlFor="requiresPayment" className="font-normal">
          Requiere confirmación de pago antes de activar
        </Label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas internas</Label>
        <Textarea id="notes" name="notes" rows={2} placeholder="Observaciones..." />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
