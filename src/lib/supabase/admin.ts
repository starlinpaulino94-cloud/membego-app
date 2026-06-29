import { createClient } from '@supabase/supabase-js'

/**
 * Admin client using the service role key. Server-only. Bypasses RLS and can
 * manage users (create, update app_metadata). Never import in client code.
 *
 * Uses an explicit `global.fetch` and disables realtime to avoid the
 * WebSocket/Realtime initialization error seen in some serverless environments.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase admin env vars')

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: { fetch },
    realtime: { params: { eventsPerSecond: -1 } },
  })
}
