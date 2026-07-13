import { Gift, Share2, Users, Trophy, CheckCircle2, Clock } from 'lucide-react'
import { requireRole } from '@/lib/auth/guards'
import { absoluteUrl } from '@/lib/site'
import { ensureCodigoCorto } from '@/lib/referidos'
import { getCampanaActiva } from '@/modules/invitaciones/queries'
import { getProgresoOCrear } from '@/modules/invitaciones/queries'
import { InvitaShareButton } from '@/components/invitaciones/InvitaShareButton'
import { ReclamarPremioButton } from '@/components/invitaciones/ReclamarPremioButton'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Invita y Gana',
}

export default async function InvitaYGanaPage() {
  const user = await requireRole(['CLIENTE'])
  const clienteId = user.metadata.clienteId as string
  const companyId = user.metadata.companyId as string

  const campana = await getCampanaActiva(companyId)

  if (!campana) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <Gift className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h1 className="text-xl font-bold text-foreground">Sin campañas activas</h1>
        <p className="mt-2 text-muted-foreground max-w-sm">
          No hay campañas de invitación activas en este momento. Vuelve pronto.
        </p>
      </div>
    )
  }

  const codigoCorto = await ensureCodigoCorto(clienteId)
  const progreso = await getProgresoOCrear(campana.id, clienteId, companyId)

  const inviteUrl = absoluteUrl(`/i/${campana.slug}?ref=${codigoCorto}`)
  const pct = Math.min(100, Math.round((progreso.registrosCompletados / campana.metaRegistros) * 100))

  const beneficioInvitante = campana.beneficioInvitante as {
    tipo?: string
    valor?: string
    descripcion?: string
  } | null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Gift className="h-6 w-6 text-emerald-500" />
          Invita y Gana
        </h1>
        <p className="text-muted-foreground text-sm">{campana.titulo}</p>
      </div>

      {/* Prize card */}
      {beneficioInvitante?.descripcion && (
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="py-5 text-center space-y-2">
            <Trophy className="mx-auto h-10 w-10 text-emerald-600" />
            <p className="font-semibold text-foreground">Tu premio</p>
            <p className="text-sm text-muted-foreground">{beneficioInvitante.descripcion}</p>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <Card>
        <CardContent className="py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-foreground">Tu progreso</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {progreso.registrosCompletados} / {campana.metaRegistros} registros
            </span>
          </div>
          <Progress value={pct} className="h-3" />

          {progreso.metaAlcanzada ? (
            progreso.premioReclamado ? (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <CheckCircle2 className="h-5 w-5" />
                Premio reclamado
              </div>
            ) : (
              <ReclamarPremioButton campanaId={campana.id} />
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              Invita a {campana.metaRegistros - progreso.registrosCompletados} amigo
              {campana.metaRegistros - progreso.registrosCompletados !== 1 ? 's' : ''} más para
              ganar tu premio.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Share */}
      <Card>
        <CardContent className="py-5 space-y-4 text-center">
          <Share2 className="mx-auto h-8 w-8 text-primary" />
          <p className="font-semibold text-foreground">Comparte tu invitación</p>
          <p className="text-sm text-muted-foreground">
            Envía este enlace a tus amigos. Cuando se registren, sumas al progreso.
          </p>
          <InvitaShareButton
            campanaId={campana.id}
            url={inviteUrl}
            titulo={campana.titulo}
            descripcion={campana.descripcion}
          />
        </CardContent>
      </Card>

      {/* Campaign info */}
      <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        Vigente hasta{' '}
        {new Intl.DateTimeFormat('es-DO', {
          dateStyle: 'long',
          timeZone: 'America/Santo_Domingo',
        }).format(campana.fechaFin)}
      </div>
    </div>
  )
}
