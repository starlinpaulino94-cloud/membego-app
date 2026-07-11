import Link from 'next/link'
import { ADMIN_ROLES } from '@/types'
import { requireRole } from '@/lib/auth/guards'
import {
  listPromoPlantillas,
  promoPlantillaCategorias,
  type PromoPlantillaCard,
} from '@/modules/admin/plantillas'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Sparkles, Target, Gauge, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

const DIFICULTAD_STYLE: Record<PromoPlantillaCard['dificultad'], string> = {
  baja: 'bg-emerald-50 text-emerald-700',
  media: 'bg-amber-50 text-amber-700',
  alta: 'bg-rose-50 text-rose-700',
}

function PlantillaCard({ p }: { p: PromoPlantillaCard }) {
  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900">{p.nombre}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-700">
                {p.categoria}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 font-medium capitalize ${DIFICULTAD_STYLE[p.dificultad]}`}
              >
                Dificultad {p.dificultad}
              </span>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {p.code}
          </Badge>
        </div>

        <p className="mt-3 text-sm text-slate-600">{p.descripcion}</p>

        <dl className="mt-3 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-start gap-1.5">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span>
              <span className="font-medium text-slate-700">Beneficio:</span> {p.beneficio}
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
            <span>
              <span className="font-medium text-slate-700">Recomendado para:</span>{' '}
              {p.recomendadoPara}
            </span>
          </div>
          {p.resultadoEsperado && (
            <div className="flex items-start gap-1.5">
              <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <span className="line-clamp-2">
                <span className="font-medium text-slate-700">Resultado esperado:</span>{' '}
                {p.resultadoEsperado}
              </span>
            </div>
          )}
          {p.duracionRecomendada && (
            <div className="flex items-start gap-1.5">
              <Gauge className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
              <span>
                <span className="font-medium text-slate-700">Duración sugerida:</span>{' '}
                {p.duracionRecomendada}
              </span>
            </div>
          )}
        </dl>

        <div className="mt-auto pt-4">
          <Link href={`/admin/promociones/nuevo?plantilla=${encodeURIComponent(p.key)}`}>
            <Button size="sm" className="w-full bg-sky-500 hover:bg-sky-400">
              Usar plantilla
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function PromoPlantillasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  await requireRole(ADMIN_ROLES)
  const { categoria } = await searchParams

  const categorias = promoPlantillaCategorias()
  const categoriaActiva = categoria && categorias.includes(categoria) ? categoria : null
  const plantillas = listPromoPlantillas(categoriaActiva ?? undefined)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plantillas de promoción</h1>
          <p className="text-slate-500">
            Estrategias listas para usar. Al elegir una se crea una copia editable:
            ajústala y publícala. La plantilla original no cambia.
          </p>
        </div>
        <Link href="/admin/promociones">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Mis promociones
          </Button>
        </Link>
      </div>

      {/* Filtro por categoría (objetivo comercial) */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/promociones/plantillas">
          <Badge
            variant={categoriaActiva ? 'secondary' : 'default'}
            className="cursor-pointer"
          >
            Todas ({listPromoPlantillas().length})
          </Badge>
        </Link>
        {categorias.map((c) => (
          <Link
            key={c}
            href={`/admin/promociones/plantillas?categoria=${encodeURIComponent(c)}`}
          >
            <Badge
              variant={categoriaActiva === c ? 'default' : 'secondary'}
              className="cursor-pointer"
            >
              {c}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plantillas.map((p) => (
          <PlantillaCard key={p.key} p={p} />
        ))}
      </div>
    </div>
  )
}
