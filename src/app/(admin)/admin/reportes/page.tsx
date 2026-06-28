export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth/guards'
import { getGlobalStats } from '@/modules/empresas/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function ReportesPage() {
  await requireSuperAdmin()
  const stats = await getGlobalStats()

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reportes</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/reportes/exportar">Exportar CSV</Link>
        </Button>
      </div>

      {/* Empresas */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold border-b pb-1">Empresas</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total" value={stats.empresas.total} />
          <StatCard label="Activas" value={stats.empresas.activas} highlight />
          <StatCard label="Pendientes" value={stats.empresas.pendientes} />
        </div>
      </section>

      {/* Clientes */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold border-b pb-1">Clientes</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total" value={stats.clientes.total} />
          <StatCard label="Activos" value={stats.clientes.activos} highlight />
          <StatCard label="Bloqueados" value={stats.clientes.bloqueados} />
        </div>
      </section>

      {/* Promociones */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold border-b pb-1">Promociones</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.promociones.total} />
          <StatCard label="Activas" value={stats.promociones.activas} highlight />
          <StatCard label="Borradores" value={stats.promociones.borradores} />
          <StatCard label="Pausadas" value={stats.promociones.pausadas} />
        </div>
      </section>

      {/* Asignaciones */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold border-b pb-1">Asignaciones</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.asignaciones.total} />
          <StatCard label="Activas" value={stats.asignaciones.activas} highlight />
          <StatCard label="Completadas" value={stats.asignaciones.completadas} />
          <StatCard label="Canceladas" value={stats.asignaciones.canceladas} />
        </div>
      </section>

      {/* Validaciones */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold border-b pb-1">Validaciones QR</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.validaciones.total} />
          <StatCard label="Confirmadas" value={stats.validaciones.confirmadas} highlight />
          <StatCard label="Rechazadas" value={stats.validaciones.rechazadas} />
          <StatCard label="Pendientes" value={stats.validaciones.pendientes} />
        </div>
      </section>

      {/* Tasa de conversión */}
      {stats.validaciones.total > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold border-b pb-1">Indicadores de actividad</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Tasa de confirmación"
              value={`${Math.round((stats.validaciones.confirmadas / stats.validaciones.total) * 100)}%`}
              highlight
            />
            <StatCard
              label="Clientes por empresa"
              value={stats.empresas.activas > 0
                ? Math.round(stats.clientes.activos / stats.empresas.activas)
                : 0}
            />
            <StatCard
              label="Asignaciones por cliente"
              value={stats.clientes.total > 0
                ? Math.round(stats.asignaciones.total / stats.clientes.total)
                : 0}
            />
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: number | string
  highlight?: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
