import { ADMIN_ROLES } from '@/types'
import { requireRole } from '@/lib/auth/guards'
import { getAudienciaEmpresa, type AudienciaStats } from '@/modules/social/queries'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  UserPlus,
  Star,
  Eye,
  Share2,
  Heart,
  Percent,
  Handshake,
  AlertCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  chip,
}: {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
  chip: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-xl p-2.5 ${chip}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
          {sub && <p className="text-xs text-slate-400">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

const fmt = (n: number) => new Intl.NumberFormat('es-DO').format(n)

export default async function AudienciaPage() {
  const user = await requireRole(ADMIN_ROLES)
  const companyId = user.metadata.companyId

  if (!companyId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Audiencia</h1>
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            Esta vista es por empresa. Inicia sesión con una cuenta de empresa.
          </CardContent>
        </Card>
      </div>
    )
  }

  let stats: AudienciaStats | null = null
  try {
    stats = await getAudienciaEmpresa(companyId)
  } catch (e) {
    console.error('[admin-audiencia]', e)
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Audiencia</h1>
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
            No pudimos cargar las métricas. Intenta de nuevo.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audiencia</h1>
        <p className="text-slate-500">
          Tus seguidores y el rendimiento de tus promociones en el marketplace.
        </p>
      </div>

      {/* Seguidores */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          chip="bg-blue-100 text-blue-700"
          label="Seguidores"
          value={fmt(stats.seguidores)}
        />
        <StatCard
          icon={UserPlus}
          chip="bg-emerald-100 text-emerald-700"
          label="Nuevos seguidores"
          sub="Últimos 30 días"
          value={fmt(stats.nuevosSeguidores30d)}
        />
        <StatCard
          icon={Star}
          chip="bg-amber-100 text-amber-700"
          label="Te marcaron favorita"
          value={fmt(stats.favoritos)}
        />
        <StatCard
          icon={Handshake}
          chip="bg-violet-100 text-violet-700"
          label="Clientes obtenidos"
          sub="Últimos 30 días"
          value={fmt(stats.clientesNuevos30d)}
        />
      </div>

      {/* Engagement de promociones */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Eye}
          chip="bg-sky-100 text-sky-700"
          label="Vistas de promociones"
          value={fmt(stats.vistasTotales)}
        />
        <StatCard
          icon={Share2}
          chip="bg-indigo-100 text-indigo-700"
          label="Compartidas"
          value={fmt(stats.compartidasTotales)}
        />
        <StatCard
          icon={Heart}
          chip="bg-rose-100 text-rose-700"
          label="Guardadas"
          value={fmt(stats.guardadasTotales)}
        />
        <StatCard
          icon={Percent}
          chip="bg-slate-100 text-slate-700"
          label="Interacción (CTR)"
          sub="Compartidas + guardadas / vistas"
          value={`${stats.ctr.toFixed(1)}%`}
        />
      </div>

      {/* Detalle por promoción */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-semibold text-slate-900">
              Rendimiento por promoción
            </h2>
          </div>
          {stats.promos.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              Aún no has publicado promociones.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                    <th className="px-5 py-3 font-medium">Promoción</th>
                    <th className="px-5 py-3 text-right font-medium">Vistas</th>
                    <th className="px-5 py-3 text-right font-medium">Compartidas</th>
                    <th className="px-5 py-3 text-right font-medium">Guardadas</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.promos.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50">
                      <td className="px-5 py-3">
                        <span className="font-medium text-slate-900">{p.titulo}</span>{' '}
                        {!p.activo && (
                          <Badge variant="secondary" className="ml-1">
                            Inactiva
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{fmt(p.vistas)}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{fmt(p.compartidas)}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{fmt(p.guardadas)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
