'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { PromotionTypeBadge } from '@/components/promotions/PromotionTypeBadge'
import { registerSelectPromotionAction } from '@/modules/registro/actions'

interface Company {
  id: string
  name: string
  industry: string
  city?: string | null
  description?: string | null
}

interface Promotion {
  id: string
  name: string
  description?: string | null
  type: string
  config: Record<string, unknown>
  expiresAt?: string | null
}

interface Props {
  companies: Company[]
}

type Step = 'account' | 'company' | 'promotion' | 'done'

export function RegisterWizard({ companies }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('account')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Step 1 state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2 state
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loadingPromotions, setLoadingPromotions] = useState(false)

  // Step 3 state
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)

  // ── Step 1: create account ────────────────────────────────────────────────
  function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { data, error: sbError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { firstName, lastName } },
      })

      if (sbError) { setError(sbError.message); return }
      setSupabaseUserId(data.user?.id ?? null)
      setStep('company')
    })
  }

  // ── Step 2: pick company ──────────────────────────────────────────────────
  async function handleSelectCompany(company: Company) {
    setSelectedCompany(company)
    setLoadingPromotions(true)
    try {
      const res = await fetch(`/api/public/empresas/${company.id}/promociones`)
      const data = await res.json()
      setPromotions(data.promotions ?? [])
    } catch {
      setPromotions([])
    } finally {
      setLoadingPromotions(false)
      setStep('promotion')
    }
  }

  // ── Step 3: pick promotion ────────────────────────────────────────────────
  function handleSelectPromotion(promo: Promotion) {
    setSelectedPromotion(promo)
    setError(null)

    startTransition(async () => {
      const result = await registerSelectPromotionAction({
        supabaseUserId: supabaseUserId!,
        companyId: selectedCompany!.id,
        promotionId: promo.id,
        email,
        firstName,
        lastName,
      })

      if (!result.success) { setError(result.error ?? 'Error al procesar'); return }
      setStep('done')
      setTimeout(() => router.push('/login'), 3500)
    })
  }

  // ── Renders ────────────────────────────────────────────────────────────────

  if (step === 'done') {
    const isPlan = selectedPromotion && ['PLAN', 'MEMBERSHIP'].includes(selectedPromotion.type)
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-2xl">
          {isPlan ? '⏳' : '✅'}
        </div>
        <div>
          <p className="font-semibold text-foreground">¡Cuenta creada!</p>
          <p className="text-sm text-muted-foreground mt-1">
            {isPlan
              ? 'Tu solicitud está pendiente de confirmación de pago por el administrador. Te notificaremos cuando esté activa.'
              : 'Revisa tu email para confirmar tu cuenta y accede a tus promociones.'}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Redirigiendo al login...</p>
      </div>
    )
  }

  if (step === 'account') {
    return (
      <form onSubmit={handleAccountSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="firstName">Nombre</Label>
            <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Apellido</Label>
            <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Creando cuenta...' : 'Continuar'}
        </Button>
        <p className="text-xs text-center text-muted-foreground">Paso 1 de 3 · Datos de cuenta</p>
      </form>
    )
  }

  if (step === 'company') {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">¿Qué empresa te interesa?</p>
          <p className="text-xs text-muted-foreground mt-0.5">Elige la empresa cuyos beneficios quieres activar</p>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {companies.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelectCompany(c)}
              className="w-full text-left p-3.5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 font-bold text-sm text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.industry}{c.city ? ` · ${c.city}` : ''}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-muted-foreground">Paso 2 de 3 · Seleccionar empresa</p>
      </div>
    )
  }

  // step === 'promotion'
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setStep('company')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Cambiar empresa
        </button>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs font-medium text-foreground">{selectedCompany?.name}</span>
      </div>

      {loadingPromotions ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Cargando promociones...</p>
      ) : promotions.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">Esta empresa no tiene promociones activas.</p>
          <button type="button" onClick={() => setStep('company')} className="mt-3 text-sm font-medium text-foreground underline underline-offset-4">
            Elegir otra empresa
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {promotions.map((p) => {
            const cfg = p.config as Record<string, unknown>
            const isPlan = ['PLAN', 'MEMBERSHIP'].includes(p.type)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPromotion(p)}
                disabled={isPending}
                className="w-full text-left p-3.5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    {p.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.description}</p>}
                    {isPlan && !!cfg.price && (
                      <p className="text-xs font-semibold text-primary mt-1">
                        {String(cfg.price)} {cfg.currency ? String(cfg.currency) : 'DOP'} / {cfg.durationDays ? `${cfg.durationDays} días` : 'mes'}
                      </p>
                    )}
                    {isPlan && (
                      <p className="text-xs text-amber-600 mt-1">Requiere confirmación de pago</p>
                    )}
                  </div>
                  <PromotionTypeBadge type={p.type as never} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-center text-muted-foreground">Paso 3 de 3 · Seleccionar promoción</p>
    </div>
  )
}
