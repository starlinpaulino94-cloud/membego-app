/**
 * Configuración central de marca y dominio de MembeGo.
 * El dominio canónico se toma de NEXT_PUBLIC_APP_URL (configurable por entorno)
 * con fallback al dominio oficial de producción.
 */
export const SITE_NAME = 'MembeGo'
export const SITE_DESCRIPTION =
  'Plataforma inteligente para membresías digitales — gestiona planes, suscripciones, beneficios y promociones con validación por QR.'

/** URL base oficial de producción. */
const DEFAULT_APP_URL = 'https://membego.com'

/**
 * Devuelve la URL base de la app sin barra final.
 * Prioriza NEXT_PUBLIC_APP_URL; si no está, usa el dominio oficial.
 */
export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL
  return raw.replace(/\/+$/, '')
}

/** Construye una URL absoluta a partir de una ruta relativa. */
export function absoluteUrl(path = ''): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${getAppUrl()}${clean === '/' ? '' : clean}`
}
