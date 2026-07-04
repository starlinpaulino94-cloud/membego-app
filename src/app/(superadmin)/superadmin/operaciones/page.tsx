import { requireRole } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Megaphone, Gift, MessageCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OperacionesPage() {
  await requireRole('SUPERADMIN')

  let companies: { id: string; name: string; type: string }[] = []
  try {
    companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, type: true },
    })
  } catch (e) {
    console.error('[operaciones] companies', e)
  }

  const promoMap = new Map<string, { total: number; activas: number }>()
  const referidosMap = new Map<string, { completados: number; reglas: number }>()
  const whatsappMap = new Map<string, { numero: string; activo: boolean }>()

  for (const c of companies) {
    try {
      const [total, activas] = await Promise.all([
        prisma.promocion.count({ where: { companyId: c.id } }),
        prisma.promocion.count({ where: { companyId: c.id, activo: true } }),
      ])
      promoMap.set(c.id, { total, activas })
    } catch {}

    try {
      const [completados, reglas] = await Promise.all([
        prisma.referido.count({ where: { companyId: c.id, estado: 'COMPLETADO' } }),
        prisma.reglaRecompensa.count({ where: { companyId: c.id } }),
      ])
      referidosMap.set(c.id, { completados, reglas })
    } catch {}

    try {
      const config = await prisma.whatsAppConfig.findUnique({
        where: { companyId: c.id },
        select: { numero: true, activo: true },
      })
      if (config) whatsappMap.set(c.id, config)
    } catch {}
  }

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
        {companies.map((c) => {
          const promo = promoMap.get(c.id)
          const ref = referidosMap.get(c.id)
          const wa = whatsappMap.get(c.id)
          return (
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
                  <span className="font-semibold">
                    {promo ? `${promo.activas} / ${promo.total}` : '0'}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Gift className="h-4 w-4 text-amber-600" />
                    Referidos completados
                  </div>
                  <span className="font-semibold">
                    {ref ? `${ref.completados} (${ref.reglas} regla${ref.reglas !== 1 ? 's' : ''})` : '0'}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    WhatsApp
                  </div>
                  {wa ? (
                    <Badge
                      className={
                        wa.activo
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                      }
                    >
                      {wa.activo ? 'Activo' : 'Inactivo'} · {wa.numero}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Sin configurar
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
