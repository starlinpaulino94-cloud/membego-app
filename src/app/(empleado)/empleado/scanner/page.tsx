import { requireRole } from '@/lib/auth/guards'
import { ScannerClient } from '@/components/scanner/ScannerClient'

export const dynamic = 'force-dynamic'

export default async function ScannerPage() {
  await requireRole(['EMPLEADO', 'ADMIN_EMPRESA', 'SUPERADMIN'])
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Escáner de visitas</h1>
        <p className="text-slate-500">
          Escanea el QR del cliente para registrar su visita.
        </p>
      </div>
      <ScannerClient />
    </div>
  )
}
