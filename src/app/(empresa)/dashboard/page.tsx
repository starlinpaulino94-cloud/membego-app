export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { requireRole } from '@/lib/auth/guards'
import { adminMetrics } from '@/modules/admin/queries'
import { getVisitasPorDia, getMembresiasPorEstado } from '@/modules/reportes/queries'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, CheckCircle2, Clock, CalendarCheck } from 'lucide-react'
import { VisitasChart } from '@/components/charts/VisitasChart'
import { MembresiasPie } from '@/components/charts/MembresiasPie'

export default async function DashboardEmpresa() {
  const user = await requireRole(['ADMIN_EMPRESA', 'SUPERADMIN', 'EMPLEADO'])
  const companyId = user.metadata.companyId ?? undefined

  let metrics = { totalClientes: 0, activas: 0, pendientes: 0, visitasHoy: 0 }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let company: any = null
  let visitasPorDia: Awaited<ReturnType<typeof getVisitasPorDia>> = []
  let membresiasPorEstado: Awaited<ReturnType<typeof getMembresiasPorEstado>> = []

  try {
    metrics = await adminMetrics(user)
    company = companyId ? await prisma.company.findUnique({ where: { id: companyId }, select: { name: true } }) : null
    visitasPorDia = await getVisitasPorDia(companyId, 7).catch(() => [])
    membresiasPorEstado = await getMembresiasPorEstado(companyId).catch(() => [])
  } catch (e) {
    console.error('[empresa-dashboard]', e)
  }

  const canManage = user.metadata.role === 'ADMIN_EMPRESA' || user.metadata.role === 'SUPERADMIN'

  const cards = [
    { label: 'Clientes', value: metrics.totalClientes, icon: Users, color: 'text-sky-600' },
    { label: 'Membresías activas', value: metrics.activas, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Pagos pendientes', value: metrics.pendientes, icon: Clock, color: 'text-yellow-600' },
    { label: 'Visitas hoy', value: metrics.visitasHoy, icon: CalendarCheck, color: 'text-indigo-600' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resumen</h1>
          <p className="text-slate-500">{company ? company.name : 'Todas las empresas'}</p>
        </div>
        {canManage && metrics.pendientes > 0 && (
          <Link
            href="/admin/clientes"
            className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-100 transition-colors"
          >
            {metrics.pendientes} pago{metrics.pendientes !== 1 ? 's' : ''} pendiente{metrics.pendientes !== 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <VisitasChart data={visitasPorDia} titulo="Visitas — últimos 7 días" />
        <MembresiasPie data={membresiasPorEstado} />
      </div>

      {/* Quick actions */}
      {canManage && (
        <div className="flex flex-wrap gap-3">
          <Button size="sm" asChild>
            <Link href="/admin/clientes">Ver clientes</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/reportes">Ver reportes</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
