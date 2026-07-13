import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCampanaActiva } from '@/modules/invitaciones/queries'

export const dynamic = 'force-dynamic'

/**
 * MVP "Invita y Gana" · Enlace corto personal: membego.com/invitar/XXXXXX.
 *
 * Cada cliente comparte SU código (no un slug de campaña). La ruta resuelve
 * el código → la campaña ACTIVA de su empresa → redirige a la landing
 * canónica /invita/[slug]?ref=code, que ya trae vista previa OG, embudo de
 * eventos y el flujo landing → registro → celebración → premio.
 *
 * Mantener una sola landing evita duplicar lógica; cuando existan campañas
 * múltiples por cliente, solo cambia la resolución de este archivo.
 */
export default async function InvitarCodePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const clean = decodeURIComponent(code).trim()

  if (clean) {
    const cliente = await prisma.cliente
      .findFirst({
        where: {
          OR: [{ codigoCorto: clean.toUpperCase() }, { codigoReferido: clean }],
        },
        select: { companyId: true, codigoCorto: true, codigoReferido: true },
      })
      .catch(() => null)

    if (cliente) {
      const campana = await getCampanaActiva(cliente.companyId).catch(() => null)
      if (campana) {
        const ref = cliente.codigoCorto ?? cliente.codigoReferido
        redirect(`/invita/${campana.slug}?ref=${encodeURIComponent(ref)}`)
      }
    }
  }

  // Código desconocido o sin campaña activa: a la portada (nunca un 404 feo
  // para un enlace que alguien recibió por WhatsApp).
  redirect('/')
}
