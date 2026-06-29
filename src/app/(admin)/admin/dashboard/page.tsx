import { Users, CheckCircle2, Clock, CalendarCheck } from 'lucide-react'
import { requireRole } from '@/lib/auth/guards'
import { adminMetrics } from '@/modules/admin/queries'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const user = await requireRole(['ADMIN_EMPRESA', 'SUPERADMIN'])
  const metrics = await adminMetrics(user)

  const company = user.metadata.companyId
    ? await prisma.company.findUnique({ where: { id: user.metadata.companyId } })
    : null

  const cards = [
    {
      label: 'Clientes',
      value: metrics.totalClientes,
      icon: Users,
      color: 'text-sky-600',
    },
    {
      label: 'Membresías activas',
      value: metrics.activas,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      label: 'Pagos pendientes',
      value: metrics.pendientes,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      label: 'Visitas hoy',
      value: metrics.visitasHoy,
      icon: CalendarCheck,
      color: 'text-indigo-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resumen</h1>
        <p className="text-slate-500">
          {company ? company.name : 'Todas las empresas'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {c.label}
              </CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
