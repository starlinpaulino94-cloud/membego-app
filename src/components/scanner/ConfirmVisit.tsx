'use client'

import { useActionState, useEffect, useState } from 'react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  confirmarVisita,
  type ClienteLookup,
  type ConfirmState,
} from '@/modules/visitas/actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EstadoBadge } from '@/components/EstadoBadge'
import type { MembershipEstado } from '@/types'

const SERVICIOS_CARWASH = [
  'Lavado básico',
  'Lavado premium',
  'Aspirado completo',
  'Detallado',
  'Aromatizante',
]
const SERVICIOS_RESTAURANTE = [
  'Menú ejecutivo',
  'Comida premium',
  'Bebida premium',
  'Postre',
  'Consumo general',
]

const initial: ConfirmState = {}

export function ConfirmVisit({
  cliente,
  onDone,
}: {
  cliente: ClienteLookup
  onDone: () => void
}) {
  const [servicio, setServicio] = useState('')
  const [vehiculoId, setVehiculoId] = useState('')
  const [state, formAction, pending] = useActionState(confirmarVisita, initial)

  const isCarwash = cliente.vehiculos.length > 0
  const servicios = isCarwash ? SERVICIOS_CARWASH : SERVICIOS_RESTAURANTE

  useEffect(() => {
    if (state.success) {
      toast.success('Visita confirmada.')
    }
  }, [state.success])

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h3 className="text-xl font-bold">Visita confirmada</h3>
        {cliente.esIlimitado ? (
          <p className="text-slate-600">Plan ilimitado — sin descuento.</p>
        ) : (
          <p className="text-slate-600">
            Usos restantes: <strong>{state.restantes}</strong>
          </p>
        )}
        <Button onClick={onDone} className="bg-sky-500 hover:bg-sky-400">
          Escanear otro
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">{cliente.nombre}</p>
            <p className="text-sm text-slate-500">{cliente.empresa}</p>
          </div>
          {cliente.estado && (
            <EstadoBadge estado={cliente.estado as MembershipEstado} />
          )}
        </div>
        <div className="mt-3 text-sm text-slate-600">
          <p>Plan: {cliente.planNombre ?? '—'}</p>
          <p>
            {cliente.esIlimitado
              ? 'Usos ilimitados'
              : `Usos restantes: ${cliente.lavadosRestantes}`}
          </p>
        </div>
      </div>

      {!cliente.puedeUsar ? (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {cliente.mensaje ?? 'No se puede registrar la visita.'}
          </AlertDescription>
        </Alert>
      ) : (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="membershipId" value={cliente.membershipId ?? ''} />
          <input type="hidden" name="servicio" value={servicio} />
          <input type="hidden" name="vehiculoId" value={vehiculoId} />

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Servicio *</Label>
            <Select value={servicio} onValueChange={setServicio}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {servicios.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {cliente.vehiculos.length > 0 && (
            <div className="space-y-2">
              <Label>Vehículo</Label>
              <Select value={vehiculoId} onValueChange={setVehiculoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {cliente.vehiculos.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" name="notas" rows={2} />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={pending || !servicio}
              className="flex-1 bg-green-600 hover:bg-green-500"
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar visita
            </Button>
            <Button type="button" variant="outline" onClick={onDone}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {!cliente.puedeUsar && (
        <Button onClick={onDone} variant="outline" className="w-full">
          Escanear otro
        </Button>
      )}
    </div>
  )
}
