import Link from 'next/link'
import { requireRole } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Megaphone, Gift, MessageCircle, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OperacionesPage() {
  await requireRole('SUPERADMIN')

  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          promociones: true,
          reglasRecompensa: true,
          referidos: true,
        },
      },
      whatsappConfig: { select: { numero: true, activo: true } },
    },
  })

  const promocionesActivas = await prisma.promocion.groupBy({
    by: ['companyId'],
    where: { activo: true },
    _count: { _all: true },
  })
  const promoMap = new Map(promocionesActivas.map((p) => [p.companyId, p._count._all]))

  const referidosCompletados = await prisma.referido.groupBy({
    by: ['companyId'],
    where: { estado: 'COMPLETADO' },
    _count: { _all: true },
  })
  const referidosMap = new Map(referidosCompletados.map((r) => [r.companyId, r._count._all]))

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Superadmin</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Operaciones por empresa
        </h1>
        <p className="text-sm text-muted-foreground">
          Vista unificada de promociones, referidos y WhatsApp configurados por cada empresa.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {companies.map((c) => (
          <Card key={c.id} className="border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                {c.name}
                <Badge variant="secondary" className="text-xs capitalize">
                  {c.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Megaphone className="h-4 w-4 text-sky-600" />
                  Promociones activas
                </div>
                <span className="font-semibold">{promoMap.get(c.id) ?? 0} / {c._count.promociones}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Gift className="h-4 w-4 text-amber-600" />
                  Referidos completados
                </div>
                <span className="font-semibold">
                  {referidosMap.get(c.id) ?? 0} ({c._count.reglasRecompensa} regla
                  {c._count.reglasRecompensa !== 1 ? 's' : ''})
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  WhatsApp
                </div>
                {c.whatsappConfig ? (
                  <Badge
                    className={
                      c.whatsappConfig.activo
                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                    }
                  >
                    {c.whatsappConfig.activo ? 'Activo' : 'Inactivo'} · {c.whatsappConfig.numero}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Sin configurar
                  </Badge>
                )}
              </div>

              <Link
                href="/admin/promociones"
                className="flex items-center justify-end gap-1 text-xs text-sky-600 hover:underline"
              >
                Gestionar módulos <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
