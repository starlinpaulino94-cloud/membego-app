import Link from 'next/link'
import { CheckCircle2, Circle, Rocket, ArrowRight } from 'lucide-react'
import type { OnboardingEmpresa } from '@/modules/empresas/onboarding'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PublicarEmpresaButton } from './PublicarEmpresaButton'

/**
 * F5.1: checklist de onboarding en el dashboard. Guía a la empresa hacia
 * los módulos existentes hasta que su perfil esté listo para publicarse.
 */
export function OnboardingChecklist({ onboarding }: { onboarding: OnboardingEmpresa }) {
  // Publicada y completa: no molestar.
  if (onboarding.publicado && onboarding.listoParaPublicar) return null

  const pct = Math.round((onboarding.completados / onboarding.total) * 100)

  return (
    <Card className="border-indigo-200 bg-indigo-50/40">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base text-indigo-900">
            <Rocket className="h-5 w-5 text-indigo-600" />
            {onboarding.publicado
              ? 'Completa tu perfil'
              : 'Prepara tu empresa para el marketplace'}
          </CardTitle>
          <span className="text-sm font-semibold text-indigo-700">
            {onboarding.completados}/{onboarding.total} completado
          </span>
        </div>
        {/* Barra de progreso */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {onboarding.items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-3 rounded-lg bg-white p-2.5 text-sm shadow-sm"
          >
            <span className="flex items-center gap-2">
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-slate-300" />
              )}
              <span className={item.done ? 'text-slate-400 line-through' : 'text-slate-700'}>
                {item.label}
              </span>
            </span>
            {!item.done && (
              <Link href={item.href}>
                <Button size="sm" variant="outline" className="gap-1 text-xs">
                  {item.cta} <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
          </div>
        ))}

        {!onboarding.publicado && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-indigo-700">
              Tu empresa aún <strong>no es visible</strong> en el marketplace.
              {onboarding.listoParaPublicar
                ? ' ¡Todo listo para publicar!'
                : ' Completa la lista para poder publicarla.'}
            </p>
            <PublicarEmpresaButton habilitado={onboarding.listoParaPublicar} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
