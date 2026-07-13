/**
 * Configuración central de marca y dominio de MembeGo.
 * El dominio canónico se toma de NEXT_PUBLIC_APP_URL (configurable por entorno)
 * con fallback al dominio oficial de producción.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * FASE 2 · Preparación de la separación Landing / Aplicación.
 * Se AÑADEN `landingUrl()` y `appUrl()` como abstracción de dominios para el
 * futuro (membego.com vs app.membego.com). Hoy AMBAS devuelven el mismo valor
 * que `getAppUrl()`, por lo que en un único dominio el comportamiento es
 * IDÉNTICO al actual. Cuando se separen los proyectos, basta con definir
 * `NEXT_PUBLIC_LANDING_URL` y `NEXT_PUBLIC_APP_ORIGIN` — sin tocar el código
 * que ya use estas funciones. Ningún llamador se migra en esta fase (cero
 * cambio de comportamiento); ver docs/ARQUITECTURA_SEPARACION.md.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const SITE_NAME = 'MembeGo'
export const SITE_DESCRIPTION =
  'Plataforma inteligente para membresías digitales — gestiona planes, suscripciones, beneficios y promociones con validación por QR.'

/** URL base oficial de producción (dominio único actual). */
const DEFAULT_APP_URL = 'https://membego.com'

/** Quita barras finales para normalizar una URL base. */
function stripTrailing(raw: string): string {
  return raw.replace(/\/+$/, '')
}

/**
 * Devuelve la URL base de la app sin barra final.
 * Prioriza NEXT_PUBLIC_APP_URL; si no está, usa el dominio oficial.
 *
 * NOTA: se conserva sin cambios por retrocompatibilidad. Es el "dominio único"
 * de hoy y la base de la que derivan `landingUrl()` y `appUrl()` mientras no se
 * separen los proyectos.
 */
export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL
  return stripTrailing(raw)
}

/**
 * Dominio de la LANDING (marketing, SEO, blog): membego.com.
 * Hoy = `getAppUrl()` (mismo dominio). Cuando se separe, definir
 * `NEXT_PUBLIC_LANDING_URL`.
 */
export function landingUrl(): string {
  const raw = process.env.NEXT_PUBLIC_LANDING_URL
  return raw ? stripTrailing(raw) : getAppUrl()
}

/**
 * Dominio de la APLICACIÓN (login, paneles, cliente/admin): app.membego.com.
 * Hoy = `getAppUrl()` (mismo dominio). Cuando se separe, definir
 * `NEXT_PUBLIC_APP_ORIGIN`.
 */
export function appUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_ORIGIN
  return raw ? stripTrailing(raw) : getAppUrl()
}

/** Une una ruta relativa a una base ya normalizada. */
function joinUrl(base: string, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${base}${clean === '/' ? '' : clean}`
}

/** Construye una URL absoluta a partir de una ruta relativa (dominio actual). */
export function absoluteUrl(path = ''): string {
  return joinUrl(getAppUrl(), path)
}

/** URL absoluta en el dominio de la LANDING (para enlaces cross-dominio). */
export function landingUrlFor(path = ''): string {
  return joinUrl(landingUrl(), path)
}

/** URL absoluta en el dominio de la APLICACIÓN (para enlaces cross-dominio). */
export function appUrlFor(path = ''): string {
  return joinUrl(appUrl(), path)
}

/**
 * FASE separación · Etapa 6 · Dominio de la cookie de sesión.
 *
 * Devuelve el dominio con el que deben fijarse las cookies de sesión de
 * Supabase. Por defecto es `undefined` → cookie *host-only* (comportamiento
 * ACTUAL, idéntico: la cookie solo vale para el host exacto). Cuando se separen
 * `membego.com` y `app.membego.com`, definir `NEXT_PUBLIC_COOKIE_DOMAIN`
 * (p. ej. `.membego.com`) para habilitar SSO entre subdominios.
 *
 * IMPORTANTE: NO fijarlo en local ni en previews (host distinto) — un dominio
 * de cookie que no coincide con el host rompe la sesión. De ahí que el valor
 * por defecto sea `undefined` y solo se active vía env en producción separada.
 */
export function sessionCookieDomain(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim()
  return raw ? raw : undefined
}
