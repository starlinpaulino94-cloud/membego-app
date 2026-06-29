'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { registrarCliente, type RegistroState } from '@/modules/registro/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const initial: RegistroState = {}

export function RegisterForm({
  companySlug,
  companyName,
  isCarwash,
}: {
  companySlug: string
  companyName: string
  isCarwash: boolean
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    registrarCliente,
    initial
  )

  useEffect(() => {
    if (state.success) {
      toast.success('Cuenta creada. Ya puedes iniciar sesión.')
      router.replace('/login')
    }
  }, [state.success, router])

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader>
        <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        <CardDescription className="text-slate-400">
          Regístrate en {companyName}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="companySlug" value={companySlug} />
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              name="nombre"
              required
              className="bg-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="bg-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="bg-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              className="bg-white/10 text-white"
            />
          </div>

          {isCarwash && (
            <div className="space-y-4 rounded-lg border border-white/10 p-4">
              <p className="text-sm font-medium text-slate-300">
                Tu vehículo (opcional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    name="marca"
                    className="bg-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    name="modelo"
                    className="bg-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anio">Año</Label>
                  <Input
                    id="anio"
                    name="anio"
                    type="number"
                    className="bg-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    name="color"
                    className="bg-white/10 text-white"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="placa">Placa</Label>
                  <Input
                    id="placa"
                    name="placa"
                    className="bg-white/10 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-sky-500 hover:bg-sky-400"
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear cuenta
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-sky-400 hover:underline">
            Inicia sesión
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
