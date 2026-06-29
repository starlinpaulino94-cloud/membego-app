'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ActionResult } from '@/types/auth'

interface Settings {
  allowMultipleActiveAssignments: boolean
  requirePaymentConfirmation: boolean
  defaultAssignmentDurationDays?: number | null
  maxAssignmentsPerCustomer?: number | null
  validationCooldownHours?: number | null
  notificationsEmail?: string | null
  webhookUrl?: string | null
}

interface Props {
  action: (_prev: ActionResult, formData: FormData) => Promise<ActionResult>
  defaultValues: Settings
}

const initial: ActionResult = { success: false }

export function CompanySettingsForm({ action, defaultValues }: Props) {
  const [state, formAction, pending] = useActionState(action, initial)

  return (
    <form action={formAction} className="space-y-4">
      {state.success && (
        <p className="text-sm text-green-600">Configuración guardada.</p>
      )}
      {!state.success && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="allowMultipleActiveAssignments"
          name="allowMultipleActiveAssignments"
          defaultChecked={defaultValues.allowMultipleActiveAssignments}
          className="h-4 w-4"
        />
        <Label htmlFor="allowMultipleActiveAssignments">
          Permitir múltiples asignaciones activas por cliente
        </Label>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="requirePaymentConfirmation"
          name="requirePaymentConfirmation"
          defaultChecked={defaultValues.requirePaymentConfirmation}
          className="h-4 w-4"
        />
        <Label htmlFor="requirePaymentConfirmation">
          Requerir confirmación de pago antes de activar
        </Label>
      </div>

      <div className="space-y-1">
        <Label htmlFor="defaultAssignmentDurationDays">Duración de asignación (días)</Label>
        <Input
          id="defaultAssignmentDurationDays"
          name="defaultAssignmentDurationDays"
          type="number"
          min={1}
          defaultValue={defaultValues.defaultAssignmentDurationDays ?? ''}
          placeholder="Sin límite"
          className="max-w-xs"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="maxAssignmentsPerCustomer">Máx. asignaciones por cliente</Label>
        <Input
          id="maxAssignmentsPerCustomer"
          name="maxAssignmentsPerCustomer"
          type="number"
          min={1}
          defaultValue={defaultValues.maxAssignmentsPerCustomer ?? ''}
          placeholder="Sin límite"
          className="max-w-xs"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="validationCooldownHours">Cooldown entre usos del QR (horas)</Label>
        <Input
          id="validationCooldownHours"
          name="validationCooldownHours"
          type="number"
          min={0}
          defaultValue={defaultValues.validationCooldownHours ?? ''}
          placeholder="Sin cooldown"
          className="max-w-xs"
        />
        <p className="text-xs text-muted-foreground">
          El cliente no podrá usar la misma promoción más de una vez en este período. Ej: 8 = cada 8 horas.
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="notificationsEmail">Email de notificaciones</Label>
        <Input
          id="notificationsEmail"
          name="notificationsEmail"
          type="email"
          defaultValue={defaultValues.notificationsEmail ?? ''}
          placeholder="notificaciones@empresa.com"
          className="max-w-sm"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="webhookUrl">URL de Webhook</Label>
        <Input
          id="webhookUrl"
          name="webhookUrl"
          type="url"
          defaultValue={defaultValues.webhookUrl ?? ''}
          placeholder="https://..."
          className="max-w-sm"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando...' : 'Guardar configuración'}
      </Button>
    </form>
  )
}
