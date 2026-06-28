'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      setStatus(error ? 'error' : 'sent')
    })
  }

  if (status === 'sent') {
    return (
      <div className="rounded-lg border border-border bg-muted/50 px-4 py-5 text-sm text-muted-foreground">
        Si existe una cuenta asociada a <span className="font-medium text-foreground">{email}</span>,
        recibirás un enlace para restablecer tu contraseña.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="tu@email.com"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-destructive">Ocurrió un error. Intenta de nuevo.</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Enviando...' : 'Enviar enlace'}
      </Button>
    </form>
  )
}
