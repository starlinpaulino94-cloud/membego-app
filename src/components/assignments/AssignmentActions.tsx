'use client'

import { useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  activateAssignmentAction,
  cancelAssignmentAction,
  blockAssignmentAction,
  expireAssignmentAction,
  renewAssignmentAction,
  confirmPaymentAction,
} from '@/modules/asignaciones/actions'
import type { ActionResult } from '@/types/auth'
import type { Assignment, AssignmentStatus } from '@/modules/asignaciones/types'

interface AssignmentActionsProps {
  assignment: Assignment
}

const initialState: ActionResult<Assignment> = { success: false }

export function AssignmentActions({ assignment }: AssignmentActionsProps) {
  const { id: assignmentId, status } = assignment
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const boundRenew = renewAssignmentAction.bind(null, assignmentId)
  const boundConfirmPayment = confirmPaymentAction.bind(null, assignmentId)

  const [renewState, renewAction, renewPending] = useActionState(
    async (prev: ActionResult<Assignment>, fd: FormData) => {
      const res = await boundRenew(prev, fd)
      if (res.success) router.refresh()
      return res
    },
    initialState
  )

  const [paymentState, paymentAction, paymentPending] = useActionState(
    async (prev: ActionResult<Assignment>, fd: FormData) => {
      const res = await boundConfirmPayment(prev, fd)
      if (res.success) router.refresh()
      return res
    },
    initialState
  )

  function handleActivate() {
    startTransition(async () => {
      const res = await activateAssignmentAction(assignmentId)
      if (res.success) router.refresh()
      else alert(res.error)
    })
  }

  function handleCancel(reason: string) {
    startTransition(async () => {
      const res = await cancelAssignmentAction(assignmentId, reason)
      if (res.success) router.refresh()
      else alert(res.error)
    })
  }

  function handleBlock(reason: string) {
    startTransition(async () => {
      const res = await blockAssignmentAction(assignmentId, reason)
      if (res.success) router.refresh()
      else alert(res.error)
    })
  }

  function handleExpire() {
    startTransition(async () => {
      const res = await expireAssignmentAction(assignmentId)
      if (res.success) router.refresh()
      else alert(res.error)
    })
  }

  const isFinal: (s: AssignmentStatus) => boolean = (s) =>
    ['COMPLETED', 'USED', 'CANCELLED'].includes(s)

  if (isFinal(status)) return null

  return (
    <div className="flex flex-wrap gap-2">
      {status === 'PENDING_PAYMENT' && (
        <>
          <Button size="sm" onClick={handleActivate} disabled={isPending}>
            Activar
          </Button>

          {/* Confirm Payment Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={isPending}>
                Confirmar pago
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar pago</DialogTitle>
              </DialogHeader>
              <form action={paymentAction} className="space-y-4">
                {paymentState.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{paymentState.error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="paymentAmount">Monto recibido</Label>
                  <Input
                    id="paymentAmount"
                    name="paymentAmount"
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue={String(assignment.paymentAmount ?? 0)}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={paymentPending}>
                    {paymentPending ? 'Confirmando...' : 'Confirmar pago'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      {(status === 'ACTIVE' || status === 'EXPIRED' || status === 'BLOCKED') && (
        /* Renew Dialog */
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" disabled={isPending || renewPending}>
              Renovar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renovar asignación</DialogTitle>
            </DialogHeader>
            <form action={renewAction} className="space-y-4">
              {renewState.error && (
                <Alert variant="destructive">
                  <AlertDescription>{renewState.error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="expiresAt">Nueva fecha de expiración</Label>
                <Input id="expiresAt" name="expiresAt" type="datetime-local" required />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={renewPending}>
                  {renewPending ? 'Renovando...' : 'Renovar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {status === 'ACTIVE' && (
        <>
          {/* Block */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={isPending}>Bloquear</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Bloquear asignación?</AlertDialogTitle>
                <AlertDialogDescription>
                  El cliente no podrá usar esta promoción mientras esté bloqueada.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleBlock('Bloqueado manualmente')}>
                  Bloquear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Expire */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={isPending}>Expirar</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Marcar como expirada?</AlertDialogTitle>
                <AlertDialogDescription>
                  La asignación pasará a estado Expirada. Podrá renovarse después.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleExpire}>Expirar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {/* Cancel — available in most non-final states */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive" disabled={isPending}>Cancelar</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar asignación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es definitiva. La asignación quedará cancelada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleCancel('Cancelado manualmente')}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancelar asignación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
