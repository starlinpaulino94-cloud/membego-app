export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCompanyById } from '@/modules/empresas/queries'
import { getActiveCompanyPromotions } from '@/modules/promociones/queries'
import { PromotionTypeBadge } from '@/components/promotions/PromotionTypeBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const company = await getCompanyById(id)
  if (!company) return { title: 'Empresa no encontrada — PASE Digital' }
  return {
    title: `${company.name} — PASE Digital`,
    description: company.description ?? `Descubre las promociones de ${company.name} en PASE Digital.`,
  }
}

export default async function EmpresaPublicaPage({ params }: Props) {
  const { id } = await params

  const [company, promotions] = await Promise.all([
    getCompanyById(id),
    getActiveCompanyPromotions(id),
  ])

  if (!company || company.status !== 'ACTIVE') notFound()

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-8 w-full">
        {/* Company header */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{company.industry}</Badge>
                {company.city && (
                  <span className="text-sm text-muted-foreground">{company.city}</span>
                )}
              </div>
            </div>
          </div>

          {company.description && (
            <p className="text-muted-foreground max-w-2xl">{company.description}</p>
          )}

          {(company.phone || company.email) && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              {company.phone && <span>Tel: {company.phone}</span>}
              {company.email && <span>{company.email}</span>}
            </div>
          )}
        </div>

        {/* Promotions */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Promociones disponibles</h2>

          {promotions.length === 0 ? (
            <p className="text-muted-foreground">
              Esta empresa no tiene promociones activas en este momento.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {promotions.map((promo) => (
                <Card key={promo.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{promo.name}</CardTitle>
                      <PromotionTypeBadge type={promo.type} />
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-1">
                    {promo.description && <p>{promo.description}</p>}
                    {promo.expiresAt && (
                      <p className="text-xs">
                        Vence: {new Date(promo.expiresAt).toLocaleDateString('es-DO')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-3">
            ¿Quieres acceder a estas promociones?
          </p>
          <Button asChild>
            <Link href="/registro">Crear cuenta gratis</Link>
          </Button>
        </div>
    </main>
  )
}
