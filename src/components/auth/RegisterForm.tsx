'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value
    const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error: sbError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { firstName, lastName },
        },
      })

      if (sbError) {
        setError(sbError.message)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    })
  }

  if (success) {
    return (
      <div className="text-center space-y-2 py-4">
        <p className="font-medium">¡Cuenta creada!</p>
        <p className="text-sm text-muted-foreground">
          Revisa tu email para confirmar tu cuenta. Redirigiendo...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" name="firstName" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" name="lastName" required />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
