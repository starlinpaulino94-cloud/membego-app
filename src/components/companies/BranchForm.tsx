'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ActionResult } from '@/types/auth'
import type { Branch } from '@/modules/empresas/types'

interface BranchFormProps {
  action: (prev: ActionResult<Branch>, formData: FormData) => Promise<ActionResult<Branch>>
  defaultValues?: Partial<Branch>
  submitLabel?: string
}

const initialState: ActionResult<Branch> = { success: false }

export function BranchForm({ action, defaultValues, submitLabel = 'Guardar' }: BranchFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">Nombre de la sucursal *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={defaultValues?.name ?? ''}
            placeholder="Ej: Sucursal Churchill"
            required
          />
          {state.fieldErrors?.name && (
            <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={defaultValues?.phone ?? ''}
            placeholder="809-555-0000"
          />
          {state.fieldErrors?.phone && (
            <p className="text-sm text-destructive">{state.fieldErrors.phone[0]}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            name="address"
            defaultValue={defaultValues?.address ?? ''}
            placeholder="Av. Winston Churchill 1234, Santo Domingo"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
