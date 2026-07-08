/**
 * Distingue fallos transitorios de Supabase Auth (rate limit 429, errores
 * 5xx del servicio, fallos de red con status 0/undefined) de un rechazo
 * real de la sesión (400/401/403). Tratar un 429 como "sin sesión" expulsa
 * al usuario a /login con una sesión válida; ante un fallo transitorio el
 * llamador debe conservar la sesión de la cookie en su lugar.
 *
 * Módulo sin dependencias: se importa tanto desde el middleware (edge)
 * como desde código de servidor.
 */
export function isTransientAuthError(
  error: { status?: number } | null | undefined
): boolean {
  if (!error) return false
  const status = error.status
  return !status || status === 429 || status >= 500
}
