import Link from 'next/link'
import { Gift, AlertCircle } from 'lucide-react'
import { requireRole } from '@/lib/auth/guards'
import { getClientePromociones } from '@/modules/marketplace/queries'
import { PromotionCard } from '@/components/public/PromotionCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function PromocionesDisponiblesPage() {
  const user = await requireRole('CLIENTE')

  let promociones: Awaited<ReturnType<typeof getClientePromociones>> = []
  let loadError = false
  try {
    promociones = await getClientePromociones(user.supabaseId)
  } catch (e) {
    loadError = true
    console.error('[cliente-promociones]', e)
  }

  return (
    <div className="space-y-6">
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
      ) : promociones.length === 0 ? (
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promociones.map((p) => (
            <PromotionCard key={p.id} promotion={p} />
          ))}
        </div>
      )}
    </div>
  )
}
