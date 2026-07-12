import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, Compass, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { getClienteAllMemberships } from '@/modules/cliente/queries'
import { getNovedadesInicio, getOnboardingCliente } from '@/modules/social/queries'
import { MembershipCard } from '@/components/cliente/MembershipCard'
import { FeedNovedades } from '@/components/cliente/FeedNovedades'
import { OnboardingClienteFirstVisit } from '@/components/cliente/OnboardingClienteFirstVisit'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Mis Membresías',
  description: 'Administra todas tus membresías en un solo lugar',
}

export default async function MisMembresias() {
  const user = await getUser()
  if (!user || !user.supabaseId) {
    redirect('/login')
  }

  let memberships: Awaited<ReturnType<typeof getClienteAllMemberships>> = []
  let loadError = false
  try {
    memberships = await getClienteAllMemberships(user.supabaseId, user.metadata.clienteId)
  } catch (error) {
    loadError = true
    console.error(
      '[mis-membresias] Error loading memberships:',
      error instanceof Error ? error.message : String(error)
    )
  }

  const cookieStore = await cookies()
  const onboardingSeen = cookieStore.has('membego_onboarding_seen')

  const [novedades, onboarding] = user.metadata.dbUserId
    ? await Promise.all([
        getNovedadesInicio(user.metadata.dbUserId),
        onboardingSeen
          ? Promise.resolve(null)
          : getOnboardingCliente(user.metadata.dbUserId, user.supabaseId).catch(
              () => null
            ),
      ])
    : [[], null]

  return (
    <main className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Mis membresías
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tus membresías digitales y códigos QR en un solo lugar.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href="/cliente/explorar">
            <Compass className="mr-2 h-4 w-4" />
            Explorar empresas
          </Link>
        </Button>
      </div>

      {/* Onboarding B2C: solo la primera visita */}
      {onboarding && (
        <div className="mb-6">
          <OnboardingClienteFirstVisit onboarding={onboarding} />
        </div>
      )}

      {loadError ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              No pudimos cargar tus membresías
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hubo un problema al conectar con el servidor. Intenta de nuevo en unos
              momentos.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/mis-membresias">Reintentar</Link>
          </Button>
        </div>
      ) : memberships.length === 0 ? (
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border/80 bg-muted/30 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="max-w-sm">
              <p className="text-lg font-semibold text-foreground">Aún no tienes membresías</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Explora las empresas disponibles y activa tu primera membresía para
                empezar a disfrutar beneficios exclusivos.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/cliente/explorar">Explorar Empresas</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/cliente/promociones">Ver Promociones</Link>
              </Button>
            </div>
          </div>
          <FeedNovedades novedades={novedades} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Membresías activas primero, luego inactivas */}
          <div className="grid gap-4 sm:grid-cols-2">
            {memberships.map((membership) => (
              <MembershipCard key={membership.id} membership={membership} />
            ))}
          </div>

          {/* Feed de novedades */}
          <FeedNovedades novedades={novedades} />

          {/* CTA explorar */}
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-sky-50 p-8 text-center dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-sky-950/30 dark:border-blue-900/30">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl dark:bg-blue-500/10" />
            <div className="relative">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Descubre más beneficios
              </h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                Explora otras empresas y sus promociones exclusivas.
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/cliente/explorar">
                  Explorar empresas <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
