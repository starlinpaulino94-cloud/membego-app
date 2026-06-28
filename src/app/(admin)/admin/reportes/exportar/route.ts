import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/guards'
import { getGlobalStats } from '@/modules/empresas/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireSuperAdmin()
    const stats = await getGlobalStats()

    const rows = [
      ['Sección', 'Indicador', 'Valor'],
      ['Empresas', 'Total', stats.empresas.total],
      ['Empresas', 'Activas', stats.empresas.activas],
      ['Empresas', 'Pendientes', stats.empresas.pendientes],
      ['Clientes', 'Total', stats.clientes.total],
      ['Clientes', 'Activos', stats.clientes.activos],
      ['Clientes', 'Bloqueados', stats.clientes.bloqueados],
      ['Promociones', 'Total', stats.promociones.total],
      ['Promociones', 'Activas', stats.promociones.activas],
      ['Promociones', 'Borradores', stats.promociones.borradores],
      ['Promociones', 'Pausadas', stats.promociones.pausadas],
      ['Asignaciones', 'Total', stats.asignaciones.total],
      ['Asignaciones', 'Activas', stats.asignaciones.activas],
      ['Asignaciones', 'Completadas', stats.asignaciones.completadas],
      ['Asignaciones', 'Canceladas', stats.asignaciones.canceladas],
      ['Validaciones', 'Total', stats.validaciones.total],
      ['Validaciones', 'Confirmadas', stats.validaciones.confirmadas],
      ['Validaciones', 'Rechazadas', stats.validaciones.rechazadas],
      ['Validaciones', 'Pendientes', stats.validaciones.pendientes],
    ]

    const csv = rows.map((row) => row.join(',')).join('\n')
    const date = new Date().toISOString().split('T')[0]

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pase-reporte-${date}.csv"`,
      },
    })
  } catch {
    return new NextResponse('No autorizado', { status: 401 })
  }
}
