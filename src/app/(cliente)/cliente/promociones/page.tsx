import { Gift } from 'lucide-react'
import { requireRole } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium' }).format(d)
}

export default async function PromocionesDisponiblesPage() {
  const user = await requireRole('CLIENTE')

  const clientes = await prisma.cliente.findMany({
    where: { supabaseId: user.supabaseId },
    select: { companyId: true },
  })
  const companyIds = clientes.map((c) => c.companyId)

  const now = new Date()
  const promociones = companyIds.length
    ? await prisma.promocion.findMany({
        where: {
          companyId: { in: companyIds },
          activo: true,
          vigenciaDesde: { lte: now },
          OR: [{ vigenciaHasta: null }, { vigenciaHasta: { gte: now } }],
        },
        include: { company: true },
        orderBy: { publicadaEn: 'desc' },
      })
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Promociones disponibles
        </h1>
        <p className="text-slate-500">
          Ofertas vigentes en las empresas donde tienes cuenta.
        </p>
      </div>

      {promociones.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-500">
            <Gift className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium">No hay promociones activas por ahora</p>
            <p className="text-sm">Te notificaremos cuando se publique una nueva.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {promociones.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              {p.imagenUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imagenUrl}
                  alt={p.titulo}
                  className="h-40 w-full object-cover"
                />
              )}
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-slate-900">{p.titulo}</p>
                  <Badge variant="secondary">{p.company.name}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{p.descripcion}</p>
                {p.vigenciaHasta && (
                  <p className="mt-3 text-xs text-slate-400">
                    Vigente hasta {fmtDate(p.vigenciaHasta)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
