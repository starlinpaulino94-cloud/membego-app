import { requireRole } from '@/lib/auth/guards'
import { AppNav } from '@/components/layout/AppNav'
import { getUnreadCount } from '@/modules/notificaciones/actions'
import { getClienteCompanies } from '@/modules/cliente/actions'

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole('CLIENTE')
  const notifCount = await getUnreadCount()
  const clienteCompanies = await getClienteCompanies(user.supabaseId)
  const companies = clienteCompanies.map((c) => ({
    companyId: c.companyId,
    name: c.company.name,
    logoUrl: c.company.logoUrl,
    active: c.companyId === user.metadata.companyId,
  }))
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav
        title="PASE Digital"
        notifCount={notifCount}
        companies={companies}
        items={[
          { href: '/cliente/dashboard', label: 'Mi panel' },
          { href: '/cliente/planes', label: 'Oportunidades' },
          { href: '/cliente/membresia', label: 'Mi membresía' },
          { href: '/cliente/historial', label: 'Historial' },
          { href: '/cliente/pagos', label: 'Mis pagos' },
          { href: '/cliente/perfil', label: 'Perfil' },
        ]}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  )
}
