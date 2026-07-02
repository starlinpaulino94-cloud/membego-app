import { requireRole } from '@/lib/auth/guards'
import { listEmpresas } from '@/modules/empresas/queries'
import { EmpresasCRM } from '@/components/superadmin/EmpresasCRM'

export const dynamic = 'force-dynamic'

export default async function SuperadminEmpresas() {
  await requireRole('SUPERADMIN')

  let raw: Awaited<ReturnType<typeof listEmpresas>> = []
  try {
    raw = await listEmpresas()
  } catch (e) {
    console.error('[superadmin-empresas]', e)
  }

  const empresas = raw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    type: c.type,
    description: c.description,
    logoUrl: c.logoUrl,
    email: c.email,
    telefono: c.telefono,
    direccion: c.direccion,
    ciudad: c.ciudad,
    categoria: c.categoria,
    website: c.website,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    clientes: c._count.clientes,
    users: c._count.users,
    sucursales: c._count.sucursales,
    plans: c._count.plans,
    promociones: c._count.promociones,
    membresiaActivas: c._membresiaActivas,
    ingresos: c._ingresos,
    ultimaActividad: c._ultimaActividad?.toISOString() ?? null,
  }))

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Empresas</h1>
        <p className="text-sm text-muted-foreground">
          CRM de empresas registradas en la plataforma
        </p>
      </div>
      <EmpresasCRM empresas={empresas} />
    </div>
  )
}
