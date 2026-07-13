import { getCampanaBySlug } from '@/modules/invitaciones/queries'
import { campanaOgResponse, genericOgResponse, OG_SIZE } from '@/modules/invitaciones/ogCard'

// Imagen dinámica de vista previa (Open Graph / Twitter) para el enlace de una
// campaña "Invita y Gana". Next la referencia sola como <ruta>/opengraph-image,
// así CADA enlace compartido (WhatsApp, Facebook, etc.) muestra una tarjeta de
// marca aunque la campaña no tenga banner subido. Diseño en ogCard.tsx
// (compartido con el enlace corto /invitar/[code]).
export const runtime = 'nodejs'
export const revalidate = 3600
export const alt = 'Invitación en MembeGo'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const campana = await getCampanaBySlug(slug).catch(() => null)
  if (!campana) return genericOgResponse()

  return campanaOgResponse(campana)
}
