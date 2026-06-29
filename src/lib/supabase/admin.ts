import { createClient } from '@supabase/supabase-js'

/**
 * Admin client using the service role key. Server-only. Bypasses RLS and can
 * manage users (create, update app_metadata). Never import in client code.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
