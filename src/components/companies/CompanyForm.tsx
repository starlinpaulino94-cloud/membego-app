'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ActionResult } from '@/types/auth'
import type { Company } from '@/modules/empresas/types'

interface CompanyFormProps {
  action: (prev: ActionResult<Company>, formData: FormData) => Promise<ActionResult<Company>>
  defaultValues?: Partial<Company>
  submitLabel?: string
}

const initialState: ActionResult<Company> = { success: false }

export function CompanyForm({ action, defaultValues, submitLabel = 'Guardar' }: CompanyFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre comercial *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={defaultValues?.name ?? ''}
            placeholder="Ej: AutoSpa Premium"
            required
          />
          {state.fieldErrors?.name && (
            <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="legalName">Razón social</Label>
          <Input
            id="legalName"
            name="legalName"
            defaultValue={defaultValues?.legalName ?? ''}
            placeholder="Ej: AutoSpa Premium SRL"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="industry">Industria *</Label>
          <Input
            id="industry"
            name="industry"
            defaultValue={defaultValues?.industry ?? ''}
            placeholder="Ej: carwash, restaurante, farmacia"
            required
          />
          {state.fieldErrors?.industry && (
            <p className="text-sm text-destructive">{state.fieldErrors.industry[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultValues?.email ?? ''}
            placeholder="info@empresa.com"
          />
          {state.fieldErrors?.email && (
            <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
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

        <div className="space-y-1.5">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            name="city"
            defaultValue={defaultValues?.city ?? ''}
            placeholder="Ej: Santo Domingo"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            name="address"
            defaultValue={defaultValues?.address ?? ''}
            placeholder="Av. Winston Churchill 1234"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={defaultValues?.description ?? ''}
            placeholder="Descripción breve de la empresa"
            rows={3}
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
