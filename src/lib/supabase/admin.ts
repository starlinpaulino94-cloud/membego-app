import { createClient } from '@supabase/supabase-js'

// Admin client — uses service_role key, bypasses RLS.
// Only for server-side operations that need elevated privileges (e.g. updating app_metadata).
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) throw new Error('Missing Supabase admin environment variables')

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function setUserAppMetadata(
  supabaseUserId: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const admin = getAdminClient()
  const { error } = await admin.auth.admin.updateUserById(supabaseUserId, {
    app_metadata: metadata,
  })
  if (error) throw new Error(`Failed to update app_metadata: ${error.message}`)
}
