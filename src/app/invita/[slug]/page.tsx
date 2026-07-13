import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCampanaBySlug } from '@/modules/invitaciones/queries'
import { registrarEventoCampana } from '@/modules/invitaciones/clienteActions'
import { absoluteUrl } from '@/lib/site'
import { CampanaLanding } from '@/components/invitaciones/CampanaLanding'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const campana = await getCampanaBySlug(slug)
  if (!campana) return {}

  const title = campana.titulo
  const description = campana.descripcion
  const image = campana.bannerUrl || campana.imagenUrl
  const url = absoluteUrl(`/invita/${slug}`)

  return {
    title: `${title} — ${campana.company.name}`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: campana.company.name,
      type: 'website',
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function CampanaLandingPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const campana = await getCampanaBySlug(slug)

  if (!campana || campana.estado === 'BORRADOR') notFound()

  const refCode = sp.ref ?? ''
  const expirada = campana.estado === 'FINALIZADA' || new Date(campana.fechaFin) < new Date()
  const abierta = campana.estado === 'ACTIVA' && !expirada

  // Personalización: "Juan quiere regalarte..." — nombre del invitante a
  // partir del código de referido (corto o largo). Nunca bloquea la landing.
  let invitanteNombre: string | null = null
  if (refCode) {
    const invitante = await prisma.cliente
      .findFirst({
        where: {
          OR: [{ codigoCorto: refCode.toUpperCase() }, { codigoReferido: refCode }],
        },
        select: { nombre: true },
      })
      .catch(() => null)
    // Solo el primer nombre: suficiente para personalizar sin exponer datos.
    invitanteNombre = invitante?.nombre?.split(' ')[0] ?? null
  }

  // Contexto de auditoría de eventos: origen y dispositivo (spec Growth Engine).
  const hdrs = await headers()
  const userAgent = hdrs.get('user-agent') ?? ''
  const contexto = {
    slug,
    ...(refCode ? { refCode } : {}),
    origen: hdrs.get('referer') ?? 'directo',
    dispositivo: /mobile|android|iphone|ipad/i.test(userAgent) ? 'movil' : 'escritorio',
    userAgent: userAgent.slice(0, 150),
  }

  // Embudo: la llegada con ?ref es el clic sobre un enlace compartido;
  // la vista de landing se registra siempre (con o sin atribución).
  if (refCode) {
    await registrarEventoCampana(campana.id, 'ENLACE_ABIERTO', contexto)
  }
  await registrarEventoCampana(campana.id, 'LANDING_VISTA', contexto)

  const beneficioInvitado = campana.beneficioInvitado as {
    tipo?: string
    valor?: string
    descripcion?: string
    vigenciaDias?: number
  } | null

  return (
    <CampanaLanding
      campana={{
        id: campana.id,
        slug: campana.slug,
        titulo: campana.titulo,
        descripcion: campana.descripcion,
        textoLanding: campana.textoLanding,
        imagenUrl: campana.imagenUrl,
        bannerUrl: campana.bannerUrl,
        fechaFin: campana.fechaFin.toISOString(),
        colorPrimario: campana.colorPrimario,
        colorSecundario: campana.colorSecundario,
        abierta,
        expirada,
        beneficioInvitado: beneficioInvitado ?? null,
        empresa: {
          name: campana.company.name,
          slug: campana.company.slug,
          logoUrl: campana.company.logoUrl,
        },
      }}
      refCode={refCode}
      invitanteNombre={invitanteNombre}
    />
  )
}
