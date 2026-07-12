import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'
import { sessionCookieDomain } from '@/lib/site'

export function createClient() {
  // Etapa 6 · si NEXT_PUBLIC_COOKIE_DOMAIN está definido, las cookies de sesión
  // se fijan en el dominio padre (SSO entre subdominios). Por defecto undefined
  // → cookie host-only (comportamiento actual, sin cambios).
  const domain = sessionCookieDomain()
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    ...(domain ? { cookieOptions: { domain } } : {}),
  })
}
