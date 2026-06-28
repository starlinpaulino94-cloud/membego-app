'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toggleBranchStatusAction } from '@/modules/empresas/actions'
import type { BranchStatus } from '@/modules/empresas/types'

interface Props {
  branchId: string
  currentStatus: BranchStatus
}

export function ToggleBranchButton({ branchId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      await toggleBranchStatusAction(branchId)
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={pending}
    >
      {pending ? '...' : currentStatus === 'ACTIVE' ? 'Desactivar' : 'Activar'}
    </Button>
  )
}
