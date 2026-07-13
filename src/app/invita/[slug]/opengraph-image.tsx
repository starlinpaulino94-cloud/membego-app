import { ImageResponse } from 'next/og'
import { getCampanaBySlug } from '@/modules/invitaciones/queries'
import { SITE_NAME } from '@/lib/site'

// Imagen dinámica de vista previa (Open Graph / Twitter) para el enlace de una
// campaña "Invita y Gana". Next la referencia sola como <ruta>/opengraph-image,
// así CADA enlace compartido (WhatsApp, Facebook, etc.) muestra una tarjeta de
// marca aunque la campaña no tenga banner subido.
export const runtime = 'nodejs'
export const revalidate = 3600
export const alt = 'Invitación en MembeGo'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function MembeGoMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <svg width="48" height="48" viewBox="0 0 512 512">
        <defs>
          <linearGradient id="l" x1="104" y1="148" x2="104" y2="424" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="r" x1="408" y1="148" x2="408" y2="424" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="v" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <path d="M104 148 L104 424" stroke="url(#l)" strokeWidth="88" strokeLinecap="round" fill="none" />
        <path d="M408 148 L408 424" stroke="url(#r)" strokeWidth="88" strokeLinecap="round" fill="none" />
        <path d="M104 148 L256 308 L408 148" stroke="url(#v)" strokeWidth="88" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span style={{ fontSize: 36, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1 }}>
        {SITE_NAME}
      </span>
    </div>
  )
}

function GenericCard() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6D28D9 0%, #3B82F6 50%, #0D9488 100%)',
          color: 'white',
        }}
      >
        <span style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>{SITE_NAME}</span>
        <span style={{ fontSize: 34, marginTop: 12, opacity: 0.92 }}>
          Has recibido una invitación exclusiva
        </span>
      </div>
    ),
    size
  )
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let campana: Awaited<ReturnType<typeof getCampanaBySlug>> = null
  try {
    campana = await getCampanaBySlug(slug)
  } catch {
    campana = null
  }
  if (!campana) return GenericCard()

  const primary = campana.colorPrimario || '#10b981'
  const secondary = campana.colorSecundario || '#059669'
  const empresa = campana.company?.name ?? SITE_NAME
  const titulo = (campana.titulo || '').slice(0, 90)

  const beneficio = campana.beneficioInvitado as {
    valor?: string
    descripcion?: string
  } | null
  const regalo = (beneficio?.descripcion || beneficio?.valor || '').slice(0, 80)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <MembeGoMark />
          <span
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: '#FFFFFF',
              background: 'rgba(255,255,255,0.18)',
              padding: '10px 22px',
              borderRadius: 999,
            }}
          >
            {empresa}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span style={{ fontSize: 30, fontWeight: 600, opacity: 0.95 }}>
            Has recibido una invitación exclusiva
          </span>
          <span style={{ fontSize: 68, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05 }}>
            {titulo}
          </span>
          {regalo ? (
            <span
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                fontSize: 34,
                fontWeight: 700,
                color: primary,
                background: '#FFFFFF',
                padding: '14px 30px',
                borderRadius: 18,
                marginTop: 6,
              }}
            >
              {regalo}
            </span>
          ) : null}
        </div>

        <span style={{ fontSize: 30, fontWeight: 600, opacity: 0.95 }}>
          Regístrate gratis y reclama tu regalo
        </span>
      </div>
    ),
    size
  )
}
