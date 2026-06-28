export const dynamic = 'force-dynamic'

import { requireSuperAdmin } from '@/lib/auth/guards'
import { getGlobalStats } from '@/modules/empresas/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ConfiguracionGlobalPage() {
  await requireSuperAdmin()
  const stats = await getGlobalStats()

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Configuración Global</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plataforma PASE</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versión</span>
            <Badge variant="outline">MVP 1.0</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entorno</span>
            <Badge variant="outline">{process.env.NODE_ENV}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado del sistema</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Empresas activas</span>
            <span>{stats.empresas.activas} / {stats.empresas.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Clientes activos</span>
            <span>{stats.clientes.activos} / {stats.clientes.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Promociones activas</span>
            <span>{stats.promociones.activas} / {stats.promociones.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Validaciones totales</span>
            <span>{stats.validaciones.total}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accesos rápidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/admin/reportes">Ver reportes completos</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/admin/auditoria">Ver registro de auditoría</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/admin/reportes/exportar">Exportar datos CSV</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
