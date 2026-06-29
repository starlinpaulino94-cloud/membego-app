'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  confirmarPago,
  renovarMembresia,
  type AdminActionState,
} from '@/modules/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const initial: AdminActionState = {}

export function ConfirmPaymentForm({
  membershipId,
  precio,
}: {
  membershipId: string
  precio: string
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(confirmarPago, initial)

  useEffect(() => {
    if (state.success) {
      toast.success('Pago confirmado. Membresía activada.')
      router.refresh()
    }
  }, [state.success, router])

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="membershipId" value={membershipId} />
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="monto-c">Monto pagado (RD$)</Label>
        <Input id="monto-c" name="monto" type="number" step="0.01" defaultValue={precio} />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-green-600 hover:bg-green-500"
      >
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Confirmar pago y activar
      </Button>
    </form>
  )
}

export function RenewForm({
  membershipId,
  precio,
}: {
  membershipId: string
  precio: string
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(renovarMembresia, initial)

  useEffect(() => {
    if (state.success) {
      toast.success('Membresía renovada por 30 días.')
      router.refresh()
    }
  }, [state.success, router])

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="membershipId" value={membershipId} />
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="monto-r">Monto pagado (RD$)</Label>
        <Input id="monto-r" name="monto" type="number" step="0.01" defaultValue={precio} />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Renovar 30 días
      </Button>
    </form>
  )
}
