export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/auth/guards'
import { listAllCompanies } from '@/modules/empresas/queries'
import { listAllPromotions } from '@/modules/promociones/queries'
import { listAllCustomers } from '@/modules/clientes/queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminPage() {
  await requireSuperAdmin()

  const [
    { total: totalCompanies },
    { total: totalEmpresasActivas },
    { total: totalPromotions },
    { total: totalPromotionsActivas },
    { total: totalClientes },
    { total: totalClientesActivos },
  ] = await Promise.all([
    listAllCompanies(),
    listAllCompanies({ status: 'ACTIVE' }),
    listAllPromotions(),
    listAllPromotions({ status: 'ACTIVE' }),
    listAllCustomers(),
    listAllCustomers({ status: 'ACTIVE' }),
  ])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Panel PASE — Superadmin</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-normal">Empresas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-3xl font-bold">{totalCompanies}</p>
            <p className="text-xs text-muted-foreground">{totalEmpresasActivas} activas</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/admin/empresas">Gestionar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-normal">Promociones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-3xl font-bold">{totalPromotions}</p>
            <p className="text-xs text-muted-foreground">{totalPromotionsActivas} activas</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/admin/promociones">Gestionar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-normal">Clientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-3xl font-bold">{totalClientes}</p>
            <p className="text-xs text-muted-foreground">{totalClientesActivos} activos</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/admin/clientes">Ver clientes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-normal">Empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/empleados">Ver empleados</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-normal">Validaciones QR</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/validaciones">Ver validaciones</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-normal">Auditoría</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/auditoria">Ver registros</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
