import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCampanaBySlug } from '@/modules/invitaciones/queries'
import { absoluteUrl } from '@/lib/site'
import { CampanaLandingScreen } from '@/components/invitaciones/CampanaLandingScreen'

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
  const url = absoluteUrl(`/invita/${slug}`)

  // La imagen de vista previa la genera opengraph-image.tsx de esta misma ruta
  // (tarjeta de marca dinámica). Next inyecta solo og:image y twitter:image, así
  // que NO se declaran aquí para evitar duplicados o una URL que el crawler no
  // pueda abrir.
  return {
    title: `${title} — ${campana.company.name}`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: campana.company.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function CampanaLandingPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const campana = await getCampanaBySlug(slug)

  if (!campana || campana.estado === 'BORRADOR') notFound()

  return <CampanaLandingScreen campana={campana} refCode={sp.ref ?? ''} />
}
