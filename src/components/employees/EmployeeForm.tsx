'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ActionResult } from '@/types/auth'
import type { Employee } from '@/modules/empleados/types'

interface Branch {
  id: string
  name: string
}

interface EmployeeFormProps {
  action: (prev: ActionResult<Employee>, formData: FormData) => Promise<ActionResult<Employee>>
  defaultValues?: Partial<Employee & { user: { name: string; email: string; phone?: string | null } }>
  branches: Branch[]
  isNew?: boolean
  submitLabel?: string
}

const initialState: ActionResult<Employee> = { success: false }

export function EmployeeForm({
  action,
  defaultValues,
  branches,
  isNew = false,
  submitLabel = 'Guardar',
}: EmployeeFormProps) {
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
          <Label htmlFor="name">Nombre completo *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={defaultValues?.user?.name ?? ''}
            placeholder="Ej: Juan Pérez"
            required
          />
          {state.fieldErrors?.name && (
            <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultValues?.user?.email ?? ''}
            placeholder="empleado@empresa.com"
            required
            disabled={!isNew}
          />
          {state.fieldErrors?.email && (
            <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
          )}
          {!isNew && (
            <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={defaultValues?.user?.phone ?? ''}
            placeholder="809-555-0000"
          />
          {state.fieldErrors?.phone && (
            <p className="text-sm text-destructive">{state.fieldErrors.phone[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role">Rol *</Label>
          <Select name="role" defaultValue={defaultValues?.role ?? 'EMPLEADO'}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EMPLEADO">Empleado</SelectItem>
              <SelectItem value="ADMIN_EMPRESA">Admin de empresa</SelectItem>
            </SelectContent>
          </Select>
          {state.fieldErrors?.role && (
            <p className="text-sm text-destructive">{state.fieldErrors.role[0]}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="branchId">Sucursal</Label>
          <Select name="branchId" defaultValue={defaultValues?.branchId ?? ''}>
            <SelectTrigger id="branchId">
              <SelectValue placeholder="Sin sucursal asignada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin sucursal</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
