import { Car, UtensilsCrossed } from 'lucide-react'
import { requireRole } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function SuperadminEmpresas() {
  await requireRole('SUPERADMIN')

  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { clientes: true, plans: true, users: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Empresas</h1>
        <p className="text-slate-500">Gestión de empresas registradas.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {companies.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                    {c.type === 'carwash' ? (
                      <Car className="h-5 w-5 text-sky-600" />
                    ) : (
                      <UtensilsCrossed className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <CardTitle>{c.name}</CardTitle>
                </div>
                <Badge
                  className={
                    c.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-200 text-slate-600'
                  }
                >
                  {c.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-slate-500">{c.description}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <Stat label="Clientes" value={c._count.clientes} />
                <Stat label="Planes" value={c._count.plans} />
                <Stat label="Usuarios" value={c._count.users} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
