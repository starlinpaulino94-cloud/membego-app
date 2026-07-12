import { createClient } from '@supabase/supabase-js'

/**
 * Admin client using the service role key. Server-only. Bypasses RLS and can
 * manage users (create, update app_metadata). Never import in client code.
 *
 * Uses an explicit `global.fetch` and disables realtime to avoid the
 * WebSocket/Realtime initialization error seen in some serverless environments.
 */
let cached: ReturnType<typeof createClient> | null = null

export function createAdminClient() {
  // Memoizado a nivel de módulo: es stateless (sin sesión) y se invocaba
  // desde 11 call sites creando un cliente nuevo por llamada.
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase admin env vars')

  cached = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: { fetch },
    realtime: { params: { eventsPerSecond: -1 } },
  })
  return cached
}
