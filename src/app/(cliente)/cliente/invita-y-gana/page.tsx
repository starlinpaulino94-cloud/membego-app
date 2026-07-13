import Image from 'next/image'
import { Gift, Share2, Users, Clock, Trophy, Send, Ticket, CheckCircle2 } from 'lucide-react'
import { requireRole } from '@/lib/auth/guards'
import { absoluteUrl } from '@/lib/site'
import { ensureCodigoCorto } from '@/lib/referidos'
import {
  getCampanaActiva,
  getInvitadosPorCliente,
  getInvitaYGanaStats,
} from '@/modules/invitaciones/queries'
import { InvitaShareButton } from '@/components/invitaciones/InvitaShareButton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Invita y Gana',
}

/** "Hoy", "Ayer", "hace 2 días", "hace 3 meses" — para el historial. */
function tiempoRelativo(fecha: Date): string {
  const dias = Math.round((fecha.getTime() - Date.now()) / 86400000)
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  const texto =
    Math.abs(dias) < 30 ? rtf.format(dias, 'day') : rtf.format(Math.round(dias / 30), 'month')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/**
 * 🎁 Invita y Gana — ÚNICO módulo de invitaciones del cliente (unifica el
 * antiguo módulo Referidos). El cliente no ve el concepto técnico de
 * "referidos": solo invita amigos y obtiene beneficios.
 *
 * Contenido: campaña activa (imagen, título, beneficios), botón Compartir
 * ahora, Mi progreso e Historial. Las metas/niveles/gamificación llegan en
 * la fase Growth Engine; el backend ya registra toda la auditoría.
 */
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

  const [codigoCorto, invitados, stats] = await Promise.all([
    ensureCodigoCorto(clienteId),
    getInvitadosPorCliente(clienteId),
    getInvitaYGanaStats(clienteId, companyId),
  ])

  // Enlace corto personal: membego.com/invitar/CODIGO. El mensaje, la imagen
  // (OG) y el enlace los genera el sistema; el cliente no los modifica.
  const inviteUrl = absoluteUrl(`/invitar/${codigoCorto}`)

  const beneficioInvitado = campana.beneficioInvitado as { descripcion?: string } | null
  const beneficioInvitante = campana.beneficioInvitante as { descripcion?: string } | null
  const regalo = beneficioInvitado?.descripcion || 'un regalo de bienvenida'

  const mensajeCompartir = `🎉 Te regalan ${regalo} solo por crear tu cuenta gratis en MembeGo. ¡Aprovéchalo!`

  const statCards = [
    { label: 'Invitaciones enviadas', valor: stats.invitacionesEnviadas, icon: Send },
    { label: 'Personas registradas', valor: stats.personasRegistradas, icon: Users },
    { label: 'Recompensas obtenidas', valor: stats.recompensasObtenidas, icon: Trophy },
    { label: 'Beneficios activos', valor: stats.beneficiosActivos, icon: Ticket },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Gift className="h-6 w-6 text-emerald-500" />
          Invita y Gana
        </h1>
        <p className="text-muted-foreground text-sm">
          Comparte, tus amigos ganan y tú también.
        </p>
      </div>

      {/* Campaña activa */}
      <Card className="overflow-hidden border-emerald-200">
        {(campana.bannerUrl || campana.imagenUrl) && (
          <div className="relative h-40 w-full sm:h-52">
            <Image
              src={(campana.bannerUrl || campana.imagenUrl)!}
              alt={campana.titulo}
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
        )}
        <CardContent className="space-y-4 bg-gradient-to-br from-emerald-50 to-white py-6 text-center">
          <div className="space-y-1.5">
            <p className="text-xl font-bold text-foreground">{campana.titulo}</p>
            <p className="text-sm text-muted-foreground">{campana.descripcion}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-white p-3 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Tus amigos reciben
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{regalo}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-white p-3 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                Tú obtienes
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {beneficioInvitante?.descripcion || 'Recompensas por cada nuevo registro'}
              </p>
            </div>
          </div>

          <InvitaShareButton
            campanaId={campana.id}
            url={inviteUrl}
            titulo={campana.titulo}
            descripcion={mensajeCompartir}
          />
        </CardContent>
      </Card>

      {/* Mi progreso */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Trophy className="h-4.5 w-4.5 text-muted-foreground" />
          Mi progreso
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
                <s.icon className="h-5 w-5 text-emerald-600" />
                <p className="text-2xl font-bold text-foreground">{s.valor}</p>
                <p className="text-xs leading-tight text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Historial */}
      <Card>
        <CardContent className="py-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              Personas que se registraron gracias a ti
            </span>
            {invitados.length > 0 && (
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {invitados.length}
              </span>
            )}
          </div>

          {invitados.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Aún nadie se ha registrado con tu enlace. ¡Compártelo y aparecerán aquí!
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {invitados.map((inv) => (
                <li key={inv.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {(inv.referidoCliente.nombre || '?').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {inv.referidoCliente.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tiempoRelativo(inv.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant={inv.estado === 'COMPLETADO' ? 'default' : 'secondary'}>
                      {inv.estado === 'COMPLETADO' ? 'Cliente activo' : 'Registrado'}
                    </Badge>
                    {inv.recompensaAplicada && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Recompensa obtenida
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Vigencia */}
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
