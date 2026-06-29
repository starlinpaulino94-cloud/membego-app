import { requireRole } from '@/lib/auth/guards'
import { AppNav } from '@/components/layout/AppNav'

export default async function EmpleadoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['EMPLEADO', 'ADMIN_EMPRESA', 'SUPERADMIN'])
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav
        title="PASE · Escáner"
        items={[{ href: '/scanner', label: 'Escanear QR' }]}
      />
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  )
}
