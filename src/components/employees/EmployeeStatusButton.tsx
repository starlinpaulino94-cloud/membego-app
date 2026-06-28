'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { setEmployeeStatusAction } from '@/modules/empleados/actions'
import type { EmployeeStatus } from '@/modules/empleados/types'

interface Props {
  employeeId: string
  currentStatus: EmployeeStatus
}

export function EmployeeStatusButton({ employeeId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition()

  function handleSuspend() {
    startTransition(async () => {
      await setEmployeeStatusAction(employeeId, 'SUSPENDED')
    })
  }

  function handleActivate() {
    startTransition(async () => {
      await setEmployeeStatusAction(employeeId, 'ACTIVE')
    })
  }

  function handleArchive() {
    startTransition(async () => {
      await setEmployeeStatusAction(employeeId, 'INACTIVE')
    })
  }

  if (currentStatus === 'ACTIVE') {
    return (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={handleSuspend} disabled={pending}>
          {pending ? '...' : 'Suspender'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleArchive} disabled={pending}>
          {pending ? '...' : 'Archivar'}
        </Button>
      </div>
    )
  }

  if (currentStatus === 'SUSPENDED') {
    return (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={handleActivate} disabled={pending}>
          {pending ? '...' : 'Activar'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleArchive} disabled={pending}>
          {pending ? '...' : 'Archivar'}
        </Button>
      </div>
    )
  }

  // INACTIVE (archived)
  return (
    <Button variant="ghost" size="sm" onClick={handleActivate} disabled={pending}>
      {pending ? '...' : 'Restaurar'}
    </Button>
  )
}
