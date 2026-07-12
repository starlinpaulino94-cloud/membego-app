import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'
import { sessionCookieDomain } from '@/lib/site'

type CookieToSet = { name: string; value: string; options?: CookieOptions }

export async function createClient() {
  const cookieStore = await cookies()
  // Etapa 6 · dominio de cookie (SSO cross-subdominio). undefined = host-only.
  const domain = sessionCookieDomain()

  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, domain ? { ...options, domain } : options)
            )
          } catch {
            // Called from a Server Component; safe to ignore when middleware refreshes sessions.
          }
        },
      },
    }
  )
}
