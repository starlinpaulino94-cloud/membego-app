import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ADMIN_ROLES, FULL_ADMIN_ROLES } from '@/types'
import {
  Users,
  UserPlus,
  CheckCircle2,
  Clock,
  CalendarCheck,
  Wallet,
  Gift,
  Heart,
  Lightbulb,
  Activity,
  ArrowRight,
  Eye,
  UserX,
  Share2,
} from 'lucide-react'
import { requireRole } from '@/lib/auth/guards'
import { adminMetrics } from '@/modules/admin/queries'
import { getDashboardEjecutivo, type DashboardEjecutivo } from '@/modules/admin/dashboardQueries'
import { getOnboardingEmpresa, type OnboardingEmpresa } from '@/modules/empresas/onboarding'
import { OnboardingChecklist } from '@/components/admin/OnboardingChecklist'
import { prisma } from '@/lib/prisma'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const fmt = (n: number) => new Intl.NumberFormat('es-DO').format(n)

const ACCION_LABEL: Record<string, string> = {
  VISITA_CONFIRMADA: 'Visita confirmada',
  PAGO_APROBADO: 'Pago aprobado',
  PAGO_RECHAZADO: 'Pago rechazado',
  MEMBRESIA_CANCELADA: 'Membresía cancelada',
  MEMBRESIA_RENOVADA: 'Membresía renovada',
  QR_GENERADO: 'QR generado',
  QR_USADO: 'QR usado',
  COMPROBANTE_IMPRESO: 'Comprobante impreso',
  REFERIDO_COMPLETADO: 'Referido completado',
  RECOMPENSA_OTORGADA: 'Recompensa otorgada',
  NOTA_INTERNA: 'Nota interna',
}

function fmtHora(d: Date) {
  return new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(d))
}

export default async function AdminDashboard() {
  const user = await requireRole(ADMIN_ROLES)
  const companyId = user.metadata.companyId

  // Superadmin sin empresa: mantiene la vista simple previa.
  if (!companyId) {
    const metrics = await adminMetrics(user).catch(() => ({
      totalClientes: 0,
      activas: 0,
      pendientes: 0,
      visitasHoy: 0,
    }))
    return (
      <div className="space-y-8 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Todas las empresas</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Clientes" value={metrics.totalClientes} icon={Users} accent="sky" />
          <StatCard label="Membresías activas" value={metrics.activas} icon={CheckCircle2} accent="green" />
          <StatCard label="Pagos pendientes" value={metrics.pendientes} icon={Clock} accent="amber" />
          <StatCard label="Visitas hoy" value={metrics.visitasHoy} icon={CalendarCheck} accent="indigo" />
        </div>
      </div>
    )
  }

  let d: DashboardEjecutivo | null = null
  let companyName = ''
  let onboarding: OnboardingEmpresa | null = null
  try {
    ;[d, companyName, onboarding] = await Promise.all([
      getDashboardEjecutivo(companyId),
      prisma.company
        .findUnique({ where: { id: companyId }, select: { name: true } })
        .then((c) => c?.name ?? ''),
      getOnboardingEmpresa(companyId).catch(() => null),
    ])
  } catch (e) {
    console.error('[admin-dashboard]', e)
  }

  // Onboarding: mientras la empresa no esté publicada, el asistente es su
  // "home" (evita caer al panel vacío). Los roles acotados (Marketing/
  // Supervisor) NO hacen onboarding: no se les redirige. Fuera del try para
  // no tragar el NEXT_REDIRECT.
  if (
    onboarding &&
    !onboarding.publicado &&
    FULL_ADMIN_ROLES.includes(user.metadata.role)
  ) {
    redirect('/onboarding')
  }

  if (!d) {
    return (
      <p className="text-slate-600">
        No pudimos cargar el panel en este momento. Intenta de nuevo.
      </p>
    )
  }

  const maxVisitas = Math.max(1, ...d.visitasPorDia.map((v) => v.total))

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Centro de control</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{companyName}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {new Intl.DateTimeFormat('es-DO', { dateStyle: 'long' }).format(new Date())}
        </p>
      </div>

      {/* Onboarding (F5.1): guía hasta publicar el perfil */}
      {onboarding && <OnboardingChecklist onboarding={onboarding} />}

      {/* Clientes y membresías */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Clientes activos"
          value={d.membresiasActivas}
          icon={CheckCircle2}
          accent="green"
          sub={`${fmt(d.clientesTotal)} clientes en total`}
        />
        <StatCard
          label="Clientes nuevos"
          value={d.clientesNuevos30d}
          icon={UserPlus}
          accent="sky"
          sub="Últimos 30 días"
        />
        <StatCard
          label="Por vencer"
          value={d.porVencer7d}
          icon={Clock}
          accent="amber"
          sub="Próximos 7 días"
        />
        <StatCard
          label="Ingresos estimados"
          value={`RD$${fmt(d.ingresosEstimadosMes)}`}
          icon={Wallet}
          accent="violet"
          sub="Membresías activas / mes"
        />
      </div>

      {/* Comunidad y actividad */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Seguidores"
          value={d.seguidores}
          icon={Heart}
          accent="red"
          sub={`+${d.nuevosSeguidores30d} este mes`}
        />
        <StatCard
          label="Promociones activas"
          value={d.promosActivas}
          icon={Gift}
          accent="amber"
        />
        <StatCard
          label="Referidos completados"
          value={d.referidosCompletados}
          icon={Share2}
          accent="indigo"
        />
        <StatCard
          label="Visitas"
          value={d.visitasHoy}
          icon={CalendarCheck}
          accent="sky"
          sub={`${fmt(d.visitasMes)} este mes`}
        />
      </div>

      {/* Recomendaciones (BI) */}
      {d.recomendaciones.length > 0 && (
        <Card className="border-sky-200 bg-sky-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-sky-900">
              <Lightbulb className="h-5 w-5 text-sky-600" />
              Recomendaciones para hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.recomendaciones.map((r) => (
              <div
                key={r.texto}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-3 text-sm shadow-sm"
              >
                <p className="text-slate-700">{r.texto}</p>
                <Link href={r.href}>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    {r.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Visitas últimos 14 días */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-slate-400" />
              Visitas — últimos 14 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-end gap-1.5">
              {d.visitasPorDia.map((v) => (
                <div
                  key={v.fecha}
                  className="group relative flex-1 rounded-t bg-sky-200 transition hover:bg-sky-400"
                  style={{ height: `${Math.max(4, (v.total / maxVisitas) * 100)}%` }}
                  title={`${v.fecha}: ${v.total} visita(s)`}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>{d.visitasPorDia[0]?.fecha.slice(5)}</span>
              <span>{d.visitasPorDia.at(-1)?.fecha.slice(5)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Top promociones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="h-4 w-4 text-slate-400" />
              Promociones más exitosas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {d.topPromos.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aún sin datos. Publica promociones y aparecerán aquí sus
                métricas.
              </p>
            ) : (
              <ul className="space-y-3">
                {d.topPromos.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {p.titulo}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Eye className="h-3.5 w-3.5" /> {fmt(p.vistas)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Heart className="h-3.5 w-3.5" /> {p.guardadas}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-slate-400" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3">
              <span className="flex items-center gap-2 text-amber-800">
                <Clock className="h-4 w-4" /> Pagos por validar
              </span>
              <span className="font-bold text-amber-900">{d.pagosPendientes}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
              <span className="flex items-center gap-2 text-red-800">
                <Clock className="h-4 w-4" /> Membresías por vencer (7 días)
              </span>
              <span className="font-bold text-red-900">{d.porVencer7d}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="flex items-center gap-2 text-slate-700">
                <UserX className="h-4 w-4" /> Clientes en riesgo (30 días sin visitas)
              </span>
              <span className="font-bold text-slate-900">{d.clientesEnRiesgo}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-slate-400" />
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {d.actividad.length === 0 ? (
              <p className="text-sm text-slate-500">Sin actividad registrada.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {d.actividad.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p className="font-medium text-slate-800">
                        {ACCION_LABEL[a.accion] ?? a.accion}
                      </p>
                      <p className="text-xs text-slate-400">
                        {a.autor ?? 'Sistema'} · {a.entidadTipo}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">{fmtHora(a.fecha)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
