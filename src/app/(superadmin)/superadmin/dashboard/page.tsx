import { Building2, Users, CheckCircle2 } from 'lucide-react'
import { requireRole } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function SuperadminDashboard() {
  await requireRole('SUPERADMIN')

  const fetchData = async () => {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { clientes: true, plans: true } },
      },
    })

    return Promise.all(
      companies.map(async (c) => {
        const activas = await prisma.membership.count({
          where: { estado: 'ACTIVA', cliente: { companyId: c.id } },
        })
        return { ...c, activas }
      })
    )
  }

  let perCompany: Awaited<ReturnType<typeof fetchData>> = []
  try {
    perCompany = await fetchData()
  } catch (e) {
    console.error('[superadmin-dashboard]', e)
  }

  const companies = perCompany

  const totalClientes = perCompany.reduce(
    (s, c) => s + c._count.clientes,
    0
  )
  const totalActivas = perCompany.reduce((s, c) => s + c.activas, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Resumen general
        </h1>
        <p className="text-slate-500">Todas las empresas de la plataforma.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Empresas" value={companies.length} icon={Building2} />
        <Metric label="Clientes totales" value={totalClientes} icon={Users} />
        <Metric
          label="Membresías activas"
          value={totalActivas}
          icon={CheckCircle2}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {perCompany.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
              <Stat label="Clientes" value={c._count.clientes} />
              <Stat label="Planes" value={c._count.plans} />
              <Stat label="Activas" value={c.activas} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {label}
        </CardTitle>
        <Icon className="h-5 w-5 text-sky-600" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
