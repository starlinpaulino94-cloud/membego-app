import { Flame, Heart, Sparkles, Clock, Compass, Store } from 'lucide-react'
import type { PromoFeed } from '@/modules/social/queries'
import { PromotionCard } from '@/components/public/PromotionCard'
import { CompanyCard } from '@/components/public/CompanyCard'
import { Carrusel, CarruselItem } from '@/components/engagement/Carrusel'
import type { PromotionPublic, CompanyPublic } from '@/modules/marketplace/types'

/**
 * Engagement Engine · Fase 3 — carruseles del Home (tipo Netflix).
 *
 * Todo horizontal, con datos REALES del feed inteligente del cliente. Cada
 * promoción/empresa se muestra una sola vez (el feed ya deduplica por
 * prioridad). Enlaza a las rutas del cliente (misma navegación existente).
 */

function FilaPromos({
  icon,
  iconClass,
  titulo,
  subtitulo,
  promos,
  verTodoHref,
}: {
  icon: React.ComponentProps<typeof Carrusel>['icon']
  iconClass?: string
  titulo: string
  subtitulo?: string
  promos: PromotionPublic[]
  verTodoHref?: string
}) {
  if (promos.length === 0) return null
  return (
    <Carrusel icon={icon} iconClass={iconClass} titulo={titulo} subtitulo={subtitulo} verTodoHref={verTodoHref}>
      {promos.map((p) => (
        <CarruselItem key={p.id}>
          <PromotionCard promotion={p} hrefBase="/cliente/promociones" />
        </CarruselItem>
      ))}
    </Carrusel>
  )
}

export function CarrouselesHome({ feed }: { feed: PromoFeed }) {
  const empresas: CompanyPublic[] = feed.empresasRecomendadas

  const hayAlgo =
    feed.seguidas.length +
      feed.expiranPronto.length +
      feed.destacadas.length +
      feed.nuevas.length +
      feed.recomendadas.length +
      empresas.length >
    0
  if (!hayAlgo) return null

  return (
    <div className="space-y-8">
      {/* ⏰ Urgencia primero: lo que vence pronto. */}
      <FilaPromos
        icon={Clock}
        iconClass="text-destructive"
        titulo="Aprovecha antes de que venzan"
        subtitulo="Vencen en los próximos días"
        promos={feed.expiranPronto}
        verTodoHref="/cliente/promociones"
      />

      {/* ❤️ De empresas que sigues. */}
      <FilaPromos
        icon={Heart}
        iconClass="fill-rose-500 text-destructive"
        titulo="De empresas que sigues"
        promos={feed.seguidas}
        verTodoHref="/cliente/promociones"
      />

      {/* 🔥 Destacadas del marketplace. */}
      <FilaPromos
        icon={Flame}
        iconClass="text-warning-foreground"
        titulo="Ofertas destacadas"
        promos={feed.destacadas}
        verTodoHref="/cliente/promociones"
      />

      {/* ✨ Nuevas. */}
      <FilaPromos
        icon={Sparkles}
        iconClass="text-primary"
        titulo="Recién llegadas"
        subtitulo="Publicadas hace poco"
        promos={feed.nuevas}
        verTodoHref="/cliente/promociones"
      />

      {/* ⭐ Recomendadas para ti. */}
      <FilaPromos
        icon={Compass}
        iconClass="text-info"
        titulo="Recomendadas para ti"
        promos={feed.recomendadas}
        verTodoHref="/cliente/promociones"
      />

      {/* 🏢 Descubre empresas. */}
      {empresas.length > 0 && (
        <Carrusel
          icon={Store}
          iconClass="text-primary"
          titulo="Descubre empresas"
          subtitulo="Podrían interesarte"
          verTodoHref="/cliente/explorar"
        >
          {empresas.map((c) => (
            <CarruselItem key={c.id}>
              <CompanyCard company={c} hrefBase="/cliente/empresas" />
            </CarruselItem>
          ))}
        </Carrusel>
      )}
    </div>
  )
}
