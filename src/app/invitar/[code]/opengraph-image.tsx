import { getCampanaPorCodigoInvitacion } from '@/modules/invitaciones/queries'
import { campanaOgResponse, genericOgResponse, OG_SIZE } from '@/modules/invitaciones/ogCard'

// Vista previa (Open Graph) del enlace corto personal /invitar/[code]: misma
// tarjeta grande de marca que /invita/[slug] (diseño en ogCard.tsx). Es lo que
// WhatsApp/Facebook muestran al compartir el enlace de un cliente.
export const runtime = 'nodejs'
export const revalidate = 3600
export const alt = 'Invitación en MembeGo'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  const res = await getCampanaPorCodigoInvitacion(code).catch(() => null)
  if (!res) return genericOgResponse()

  return campanaOgResponse(res.campana)
}
