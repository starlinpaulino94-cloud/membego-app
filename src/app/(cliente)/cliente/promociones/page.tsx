import Link from 'next/link'
import { Gift, AlertCircle, Heart } from 'lucide-react'
import { requireRole } from '@/lib/auth/guards'
import { getClientePromociones } from '@/modules/marketplace/queries'
import {
  getPromocionesGuardadas,
  getGuardadasIds,
} from '@/modules/social/queries'
import { PromotionCard } from '@/components/public/PromotionCard'
import { SavePromoButton } from '@/components/cliente/SavePromoButton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { PromotionPublic } from '@/modules/marketplace/types'

export const dynamic = 'force-dynamic'

function PromoGridConGuardar({
  promociones,
  guardadasIds,
}: {
  promociones: PromotionPublic[]
  guardadasIds: Set<string>
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {promociones.map((p) => (
        <div key={p.id} className="relative">
          <PromotionCard promotion={p} />
          <SavePromoButton promocionId={p.id} guardada={guardadasIds.has(p.id)} />
        </div>
      ))}
    </div>
  )
}

export default async function PromocionesDisponiblesPage() {
  const user = await requireRole('CLIENTE')

  let promociones: PromotionPublic[] = []
  let guardadas: PromotionPublic[] = []
  let guardadasIds = new Set<string>()
  let loadError = false
  try {
    ;[promociones, guardadas, guardadasIds] = await Promise.all([
      getClientePromociones(user.supabaseId),
      getPromocionesGuardadas(user.metadata.dbUserId),
      getGuardadasIds(user.metadata.dbUserId),
    ])
  } catch (e) {
    loadError = true
    console.error('[cliente-promociones]', e)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Promociones disponibles</h1>
        <p className="text-slate-500">
          Ofertas vigentes en las empresas donde tienes cuenta.
        </p>
      </div>

      {loadError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="font-medium text-foreground">No pudimos cargar las promociones.</p>
            <Button asChild variant="outline">
              <Link href="/cliente/promociones">Reintentar</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Guardadas */}
          {guardadas.length > 0 && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
                Mis promociones guardadas
              </h2>
              <PromoGridConGuardar
                promociones={guardadas}
                guardadasIds={guardadasIds}
              />
            </section>
          )}

          {/* Disponibles */}
          {promociones.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-slate-500">
                <Gift className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="font-medium">No hay promociones activas por ahora</p>
                <p className="text-sm">Te notificaremos cuando se publique una nueva.</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/empresas">Explorar empresas</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <section className="space-y-4">
              {guardadas.length > 0 && (
                <h2 className="text-lg font-semibold text-slate-900">
                  Todas las promociones
                </h2>
              )}
              <PromoGridConGuardar
                promociones={promociones}
                guardadasIds={guardadasIds}
              />
            </section>
          )}
        </>
      )}
    </div>
  )
}
