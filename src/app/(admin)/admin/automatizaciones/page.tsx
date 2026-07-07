import { AlertCircle, Cake, Clock, UserX, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ADMIN_ROLES } from '@/types'
import { requireRole } from '@/lib/auth/guards'
import { EjecutarAutomatizaciones } from '@/components/admin/EjecutarAutomatizaciones'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

const REGLAS: {
  icon: LucideIcon
  chip: string
  titulo: string
  cuando: string
  accion: string
}[] = [
  {
    icon: Cake,
    chip: 'bg-pink-100 text-pink-700',
    titulo: 'Cumpleaños',
    cuando: 'El día del cumpleaños del cliente',
    accion: 'Le envía una felicitación invitándolo a revisar tus promociones (una vez al año).',
  },
  {
    icon: Clock,
    chip: 'bg-amber-100 text-amber-700',
    titulo: 'Membresía por vencer',
    cuando: 'Cuando faltan 7 días o menos para el vencimiento',
    accion: 'Le recuerda renovar para no perder sus beneficios (una vez por vencimiento).',
  },
  {
    icon: UserX,
    chip: 'bg-slate-100 text-slate-700',
    titulo: 'Cliente inactivo',
    cuando: 'Cuando un cliente con membresía activa lleva 30 días sin visitas',
    accion: 'Le envía un incentivo para volver (máximo una vez al mes).',
  },
]

export default async function AutomatizacionesPage() {
  const user = await requireRole(ADMIN_ROLES)
  const companyId = user.metadata.companyId

  if (!companyId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Automatizaciones</h1>
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            Esta vista es por empresa. Inicia sesión con una cuenta de empresa.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Automatizaciones</h1>
          <p className="text-slate-500">
            Avisos automáticos a tus clientes según su actividad. Son
            idempotentes: nunca se envían dos veces.
          </p>
        </div>
        <EjecutarAutomatizaciones />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {REGLAS.map((r) => (
          <Card key={r.titulo}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className={`rounded-lg p-2 ${r.chip}`}>
                  <r.icon className="h-4 w-4" />
                </span>
                {r.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-slate-500">
                <span className="font-medium text-slate-700">Cuándo:</span>{' '}
                {r.cuando}
              </p>
              <p className="text-slate-500">
                <span className="font-medium text-slate-700">Qué hace:</span>{' '}
                {r.accion}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex items-start gap-3 p-5 text-sm text-slate-600">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-medium text-slate-800">
              También pueden correr solas todos los días
            </p>
            <p className="mt-1">
              Además del botón &quot;Ejecutar ahora&quot;, existe el endpoint{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                /api/cron/automatizaciones
              </code>{' '}
              protegido con la variable <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">CRON_SECRET</code>.
              Prográmalo una vez al día (Vercel Cron o similar) y las reglas se
              ejecutarán automáticamente para toda la plataforma.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
