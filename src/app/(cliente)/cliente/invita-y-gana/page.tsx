import { Gift, Share2, Users, Clock } from 'lucide-react'
import { requireRole } from '@/lib/auth/guards'
import { absoluteUrl } from '@/lib/site'
import { ensureCodigoCorto } from '@/lib/referidos'
import { getCampanaActiva, getInvitadosPorCliente } from '@/modules/invitaciones/queries'
import { InvitaShareButton } from '@/components/invitaciones/InvitaShareButton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Invita y Gana',
}

/** "Hoy", "Ayer", "hace 2 días", "hace 3 meses" — para la lista de invitados. */
function tiempoRelativo(fecha: Date): string {
  const dias = Math.round((fecha.getTime() - Date.now()) / 86400000)
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  const texto =
    Math.abs(dias) < 30 ? rtf.format(dias, 'day') : rtf.format(Math.round(dias / 30), 'month')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/**
 * MVP "Invita y Gana" (fase 1): módulo simple del cliente.
 * Solo dos cosas: compartir tu invitación y ver quiénes se registraron
 * gracias a ti. Sin metas, barras de progreso ni niveles — eso llega en la
 * fase Growth Engine; el backend ya registra todo (Referido/InvitacionEvento).
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

  const [codigoCorto, invitados] = await Promise.all([
    ensureCodigoCorto(clienteId),
    getInvitadosPorCliente(clienteId),
  ])

  // Enlace corto personal: membego.com/invitar/CODIGO.
  const inviteUrl = absoluteUrl(`/invitar/${codigoCorto}`)

  const beneficioInvitado = campana.beneficioInvitado as {
    descripcion?: string
  } | null
  const regalo = beneficioInvitado?.descripcion || 'un regalo de bienvenida'

  const mensajeCompartir = `🎉 Te regalan ${regalo} solo por crear tu cuenta gratis en MembeGo. ¡Aprovéchalo!`

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Gift className="h-6 w-6 text-emerald-500" />
          Invita y Gana
        </h1>
        <p className="text-muted-foreground text-sm">{campana.titulo}</p>
      </div>

      {/* Share hero */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="py-7 space-y-4 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <Share2 className="h-7 w-7 text-emerald-600" />
          </span>
          <div className="space-y-1.5">
            <p className="text-lg font-bold text-foreground">
              Comparte esta oportunidad con tus amigos
            </p>
            <p className="text-sm text-muted-foreground">
              Ellos recibirán <span className="font-semibold text-foreground">{regalo}</span>{' '}
              cuando creen su cuenta.
            </p>
          </div>
          <InvitaShareButton
            campanaId={campana.id}
            url={inviteUrl}
            titulo={campana.titulo}
            descripcion={mensajeCompartir}
          />
        </CardContent>
      </Card>

      {/* Personas registradas gracias a ti */}
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
                  <Badge variant={inv.estado === 'COMPLETADO' ? 'default' : 'secondary'}>
                    {inv.estado === 'COMPLETADO' ? 'Cliente activo' : 'Registrado'}
                  </Badge>
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
