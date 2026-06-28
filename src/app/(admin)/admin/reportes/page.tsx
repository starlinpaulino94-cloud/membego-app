export const dynamic = 'force-dynamic'

import { requireSuperAdmin } from '@/lib/auth/guards'
import { listAllCompanies } from '@/modules/empresas/queries'
import { listAllPromotions } from '@/modules/promociones/queries'
import { listAllCustomers } from '@/modules/clientes/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ReportesPage() {
  await requireSuperAdmin()

  const [
    { total: totalEmpresas },
    { total: totalPromociones },
    { total: totalClientes },
    { total: totalActivas },
    { total: totalInactivas },
  ] = await Promise.all([
    listAllCompanies(),
    listAllPromotions(),
    listAllCustomers(),
    listAllCustomers({ status: 'ACTIVE' }),
    listAllCustomers({ status: 'INACTIVE' }),
  ])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Reportes</h1>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-muted-foreground">Resumen global</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Empresas registradas" value={totalEmpresas} />
          <Stat label="Promociones totales" value={totalPromociones} />
          <Stat label="Clientes totales" value={totalClientes} />
          <Stat label="Clientes activos" value={totalActivas} />
          <Stat label="Clientes inactivos" value={totalInactivas} />
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
