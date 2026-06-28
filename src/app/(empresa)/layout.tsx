import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) redirect('/login')

  const allowed = ['SUPERADMIN', 'ADMIN_EMPRESA', 'EMPLEADO'] as const
  if (!allowed.includes(session.role as (typeof allowed)[number])) {
    redirect('/profile')
  }

  const isAdmin = session.role === 'ADMIN_EMPRESA' || session.role === 'SUPERADMIN'

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6 text-sm overflow-x-auto">
          <Link href="/dashboard" className="font-semibold text-foreground shrink-0">Panel</Link>
          <Link href="/dashboard/promociones" className="text-muted-foreground hover:text-foreground shrink-0">Promociones</Link>
          <Link href="/dashboard/clientes" className="text-muted-foreground hover:text-foreground shrink-0">Clientes</Link>
          <Link href="/dashboard/validaciones" className="text-muted-foreground hover:text-foreground shrink-0">Validaciones</Link>
          <Link href="/dashboard/sucursales" className="text-muted-foreground hover:text-foreground shrink-0">Sucursales</Link>
          {isAdmin && (
            <>
              <Link href="/dashboard/empleados" className="text-muted-foreground hover:text-foreground shrink-0">Empleados</Link>
              <Link href="/dashboard/empresa" className="text-muted-foreground hover:text-foreground shrink-0">Configuración</Link>
            </>
          )}
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
