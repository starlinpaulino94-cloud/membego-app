import { requireRole } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { ADMIN_ROLES } from '@/types'
import { ScannerClient } from '@/components/scanner/ScannerClient'
import { ScannerErrorBoundary } from '@/components/scanner/ScannerErrorBoundary'

export const dynamic = 'force-dynamic'

export default async function AdminScannerPage() {
  const user = await requireRole(ADMIN_ROLES)

  const companyId = user.metadata.companyId ?? undefined
  let sucursales: { id: string; nombre: string }[] = []
  try {
    if (companyId) {
      const rows = await prisma.sucursal.findMany({
        where: { companyId, activa: true },
        orderBy: { nombre: 'asc' },
        select: { id: true, nombre: true },
      })
      sucursales = rows
    }
  } catch (e) {
    console.error('[admin-scanner] sucursales error:', e)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Escáner de visitas</h1>
        <p className="text-sm text-muted-foreground">
          Escanea el QR del cliente para registrar su visita.
        </p>
      </div>
      <ScannerErrorBoundary>
        <ScannerClient sucursales={sucursales} />
      </ScannerErrorBoundary>
    </div>
  )
}
