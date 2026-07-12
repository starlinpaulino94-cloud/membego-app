import Link from 'next/link'
import {
  Megaphone,
  CalendarDays,
  Newspaper,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NovedadInicio } from '@/modules/social/queries'

const TIPO_META: Record<string, { label: string; icon: LucideIcon; bg: string; fg: string }> = {
  PROMOCION: { label: 'Promoción', icon: Megaphone, bg: 'bg-blue-500/10 dark:bg-blue-500/15', fg: 'text-blue-600 dark:text-blue-400' },
  EVENTO: { label: 'Evento', icon: CalendarDays, bg: 'bg-violet-500/10 dark:bg-violet-500/15', fg: 'text-violet-600 dark:text-violet-400' },
  NOTICIA: { label: 'Noticia', icon: Newspaper, bg: 'bg-sky-500/10 dark:bg-sky-500/15', fg: 'text-sky-600 dark:text-sky-400' },
  BENEFICIO: { label: 'Beneficio', icon: BadgeCheck, bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', fg: 'text-emerald-600 dark:text-emerald-400' },
}

function fmtFecha(d: Date) {
  return new Intl.DateTimeFormat('es-DO', { timeZone: 'America/Santo_Domingo', dateStyle: 'medium' }).format(new Date(d))
}

export function FeedNovedades({ novedades }: { novedades: NovedadInicio[] }) {
  if (novedades.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Novedades de tus empresas
          </h2>
          <p className="text-sm text-muted-foreground">
            Lo último de las empresas que sigues.
          </p>
        </div>
        <Link
          href="/cliente/promociones"
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Ver todo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card shadow-sm">
        {novedades.map((n) => {
          const meta = TIPO_META[n.tipo] ?? TIPO_META.NOTICIA
          return (
            <Link
              key={`${n.tipo}-${n.id}`}
              href={n.href}
              className="group flex items-center gap-4 p-4 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-muted/50"
            >
              <div className={`rounded-xl p-2.5 ${meta.bg}`}>
                <meta.icon className={`h-5 w-5 ${meta.fg}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{n.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {n.companyName} · {meta.label}
                  {n.tipo === 'EVENTO' ? ` · ${fmtFecha(n.fecha)}` : ''}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
