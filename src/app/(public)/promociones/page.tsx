import Link from 'next/link'
import { Tag } from 'lucide-react'
import { SearchBar } from '@/components/public/SearchBar'
import { PromotionGrid } from '@/components/public/PromotionGrid'
import { getPromotionsPublic } from '@/modules/marketplace/queries'

interface PromotionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const revalidate = 3600

export default async function PromotionsPage({
  searchParams,
}: PromotionsPageProps) {
  const params = await searchParams

  const filters = {
    search: typeof params.search === 'string' ? params.search : undefined,
    company: typeof params.company === 'string' ? params.company : undefined,
    type: typeof params.type === 'string' ? params.type : undefined,
    tag: typeof params.tag === 'string' ? params.tag : undefined,
    limit: 50,
    offset: 0,
  }

  const promotions = await getPromotionsPublic(filters)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-sky-600 to-indigo-800 py-14">
        <div className="absolute -top-16 right-10 h-56 w-56 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-sky-100 ring-1 ring-inset ring-white/20">
              <Tag className="h-4 w-4" /> Ofertas vigentes
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Promociones
            </h1>
            <p className="mt-2 max-w-xl text-lg text-sky-100">
              Descubre descuentos, regalos y beneficios exclusivos de las
              empresas afiliadas a MembeGo.
            </p>
          </div>
          <SearchBar placeholder="Buscar promociones..." />
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-neutral-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2">
          <span className="text-sm text-neutral-600 flex items-center">
            Filtrar por tipo:
          </span>
          <Link
            href="/promociones"
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              !filters.type
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Todas
          </Link>
          {['descuento', 'promocion', 'regalo', 'evento'].map((type) => (
            <Link
              key={type}
              href={`/promociones?type=${type}`}
              className={`px-3 py-1 rounded-full text-sm transition-colors capitalize ${
                filters.type === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {type}
            </Link>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PromotionGrid
            promotions={promotions}
            isLoading={false}
            variant="default"
            emptyMessage={
              filters.search || filters.type || filters.tag
                ? 'No se encontraron promociones con esos criterios'
                : 'No hay promociones disponibles en este momento'
            }
          />
        </div>
      </section>
    </div>
  )
}
