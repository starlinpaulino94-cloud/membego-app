import Link from 'next/link'
import { CheckCircle2, ArrowRight, PartyPopper } from 'lucide-react'
import type { OnboardingCliente } from '@/modules/social/queries'
import { Button } from '@/components/ui/button'

/**
 * Asistente de bienvenida del cliente (Onboarding Fase 3C · B2C). Guía los
 * pasos (perfil → intereses → descubrir empresas → primera membresía) con un
 * "paso actual". NO es obligatorio: el cliente puede usar la app sin
 * completarlo. El progreso se deriva de datos reales (getOnboardingCliente),
 * así que se retoma solo.
 */
export function WizardCliente({
  onboarding,
  nombre,
}: {
  onboarding: OnboardingCliente
  nombre: string
}) {
  const pct = Math.round((onboarding.completados / onboarding.total) * 100)
  const currentIndex = onboarding.items.findIndex((i) => !i.done)
  const completo = onboarding.completados === onboarding.total

  if (completo) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <PartyPopper className="mx-auto h-10 w-10 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          ¡Todo listo, {nombre}!
        </h1>
        <p className="mt-2 text-slate-600">
          Completaste tu configuración. Explora empresas y aprovecha tus beneficios.
        </p>
        <Link href="/mis-membresias" className="mt-6 inline-block">
          <Button className="gap-1.5">
            Ir a mis membresías <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-sky-600">Bienvenida</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Hola, {nombre} 👋
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Personaliza tu experiencia en unos pasos. No es obligatorio: puedes
          hacerlo ahora o cuando quieras.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">
            {onboarding.completados} de {onboarding.total}
          </span>
          <span className="text-sm font-semibold text-sky-600">{pct}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ol className="space-y-3">
        {onboarding.items.map((item, i) => {
          const isCurrent = i === currentIndex
          return (
            <li
              key={item.key}
              className={`flex items-center justify-between gap-3 rounded-xl border p-4 transition ${
                isCurrent ? 'border-sky-300 bg-sky-50/50 shadow-sm' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isCurrent ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {i + 1}
                  </span>
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      item.done ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}
                  >
                    {item.label}
                  </p>
                  {isCurrent && <p className="text-xs text-sky-600">Siguiente paso</p>}
                </div>
              </div>
              {!item.done && item.cta && (
                <Link href={item.href}>
                  <Button
                    size="sm"
                    variant={isCurrent ? 'default' : 'outline'}
                    className="gap-1 text-xs"
                  >
                    {item.cta} <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </li>
          )
        })}
      </ol>

      <div className="text-center">
        <Link
          href="/mis-membresias"
          className="text-sm text-slate-500 underline hover:text-slate-700"
        >
          Saltar por ahora
        </Link>
      </div>
    </div>
  )
}
